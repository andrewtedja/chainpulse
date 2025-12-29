from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime, timedelta
from sqlalchemy import func, case
from datetime import datetime, timezone
import requests
import os
import json
from ..ml.SentimentAnalyzer import SentimentAnalyzer
from ..db.database import get_db
from ..models import News, FetchMetadata, Coin
from ..models.news_coin import news_coin_association
from ..core.redis import get_redis
from ..matcher.coin_matcher import CoinMatcher

'''
NOTES (endpoints)
- GET /api/news -> fetch news list (can use redis)
- POST /api/news/refresh -> fetch + store ke DB (+Redis)

di GET → untuk pagination (berapa item frontend mau lihat).
di POST → untuk kontrol banyaknya berita yang di-fetch dari API.
'''

# ================== ROUTES ==================

router = APIRouter()
analyzer = SentimentAnalyzer()
coin_matcher = CoinMatcher()

@router.get("/api/news")
def get_news(
    page: int = 1,
    limit: int = 12,
    period: str = None,  # Optional: "24h", "7d", "30d", "all"
    db: Session = Depends(get_db),
    redis = Depends(get_redis)
):
  """
  GET paginated news + sentimentnya

  Query params:
  - page: Page number (default: 1)
  - limit: Items per page (default: 12, max: 500)
  - period: Optional time filter ("24h", "7d", "30d", "all")

  CACHE KEY
  - Cache key: news:page:{page}:limit:{limit}:period:{period}
  """

  # Validation
  if page < 1:
    raise HTTPException(400, "Page must be >= 1!")
  if limit > 500:
    raise HTTPException(400, "Limit max 500!")

  # Check cache
  cache_key = f"news:page:{page}:limit:{limit}:period:{period}"

  if redis:
      try:
          cached = redis.get(cache_key)
          if cached:
              # HIT
              return json.loads(cached)
      except Exception as e:
          print(f"Redis GET error: {e}")

  # MISS -> fetch from DB
  offset = (page - 1) * limit

  query = db.query(News)

  if period:
      now = datetime.now(timezone.utc)
      if period == "24h":
          cutoff = now - timedelta(hours=24)
          query = query.filter(News.published_at >= cutoff)
      elif period == "7d":
          cutoff = now - timedelta(days=7)
          query = query.filter(News.published_at >= cutoff)
      elif period == "30d":
          cutoff = now - timedelta(days=30)
          query = query.filter(News.published_at >= cutoff)
      elif period == "all":
          # No filter for "all"
          pass
      else:
          raise HTTPException(400, "Invalid period. Use: 24h, 7d, 30d, or all")

  news = query\
    .order_by(News.published_at.desc())\
    .offset(offset)\
    .limit(limit)\
    .all()

  total_query = db.query(News)
  if period and period != "all":
      if period == "24h":
          cutoff = now - timedelta(hours=24)
      elif period == "7d":
          cutoff = now - timedelta(days=7)
      elif period == "30d":
          cutoff = now - timedelta(days=30)
      total_query = total_query.filter(News.published_at >= cutoff)

  total = total_query.count()

  response = {
      "data": [
          {
              "id": n.id,
              "title": n.title,
              "content": n.content,
              "published_at": n.published_at.isoformat() if n.published_at else None,
              "sentiment_score": n.sentiment_score,
              "sentiment_label": n.sentiment_label,
              "created_at": n.created_at.isoformat()
          }
          for n in news
      ],
      "pagination": {
          "page": page,
          "limit": limit,
          "total": total,
          "total_pages": (total + limit - 1) // limit
      }
  }

  # Store in cache for next request
  if redis:
      try:
          redis.set(
              cache_key,
              json.dumps(response),
              ex=300  # TTL: 5 minutes
          )
      except Exception as e:
          print(f"Redis SET error: {e}")

  return response

@router.post("/api/news/refresh")
def refresh_news(db: Session = Depends(get_db), redis = Depends(get_redis)):
    """
    Fetch news from CryptoPanic API -> store in db.

    NOTES Flow:
    1. Call CryptoPanic API
    2. Parse response -> Analyze sentiment biar dimasukin label+score
    3. Insert news to DB (skip duplicates based on title+published_at)
    4. Track fetch metadata
    5. Invalidate news + sentiment caches
    6. Return stats
    """


    # 1. Fetch from CryptoPanic
    api_url = os.getenv("CRYPTO_PANIC_BASE_URL")
    api_key = os.getenv("CRYPTO_PANIC_API_KEY")

    params = {
        "auth_token": api_key,
        "public": "true",
        "kind": "news",
    }

    try:
        response = requests.get(api_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        # Log fetch failure
        metadata = FetchMetadata(
            source="cryptopanic",
            articles_fetched=0,
            status="failed",
            error_message=str(e)
        )
        db.add(metadata)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to fetch news: {str(e)}")

    # 2. Parse and insert articles
    articles = data.get("results", [])
    new_count = 0

    for article in articles:
        published_at = None
        if article.get("published_at"):
            published_at = datetime.fromisoformat(article["published_at"].replace("Z", "+00:00"))

        news_data = {
            "title": article.get("title"),
            "content": article.get("description"),
            "published_at": published_at,
        }

        # FINBERT
        text = news_data["content"] or news_data["title"]
        sentiment_result = analyzer.analyze(text)

        sentiment = sentiment_result[0] if isinstance(sentiment_result, list) else sentiment_result

        news_data["sentiment_score"] = sentiment["score"]
        news_data["sentiment_label"] = sentiment["label"]

        # COIN MATCHING: Identify coins mentioned in article
        full_text = f"{news_data['title']} {news_data['content'] or ''}"
        coin_symbols = coin_matcher.identify_coins(full_text)

        stmt = insert(News).values(**news_data)

        try:
            result = db.execute(
                stmt.on_conflict_do_nothing(
                    index_elements=["title", "updated_at"]
                )
            )

            # Track if this was a new article for news_coins association
            is_new_article = result.rowcount > 0
            if is_new_article:
                new_count += 1

            news_record = db.query(News).filter(
                News.title == news_data["title"],
                News.updated_at >= func.now() - func.make_interval(0, 0, 0, 0, 0, 0, 1)  # Within last second
            ).first()

            if not news_record:
                print(f"[ERROR] News record not found for title: {news_data['title'][:50]}...")
                continue

            existing_assoc_count = db.query(news_coin_association).filter(
                news_coin_association.c.news_id == news_record.id
            ).count()

            # Syarat proses coin harusnya:
            # 1. Article belom ada existing associations and
            # 2. detected coins in the text
            if existing_assoc_count == 0 and coin_symbols:
                print(f"[COIN MATCH] Found coins: {coin_symbols} in '{news_data['title'][:50]}...'")

                # Map coin symbols to coin IDs
                coins = db.query(Coin).filter(Coin.symbol.in_(coin_symbols)).all()
                print(f"[DB COINS] Matched {len(coins)}/{len(coin_symbols)} coins in DB")

                # Bulk insert coin associations
                coin_assoc_count = 0
                for coin in coins:
                    try:
                        result_assoc = db.execute(
                            insert(news_coin_association).values(
                                news_id=news_record.id,
                                coin_id=coin.id
                            ).on_conflict_do_nothing()
                        )
                        print(f"[ASSOC INSERT] news_id={news_record.id}, coin_id={coin.id} ({coin.symbol}), rowcount={result_assoc.rowcount}")
                        coin_assoc_count += 1
                    except Exception as e:
                        print(f"[ERROR ASSOC] Failed to insert coin association for {coin.symbol}: {e}")
                        continue

                if coin_assoc_count > 0:
                    print(f"[SUCCESS] Inserted {coin_assoc_count} coin associations for news ID {news_record.id}")
                    db.flush()
                    print(f"[FLUSH] Flushed coin associations to DB")
            elif existing_assoc_count > 0:
                print(f"[SKIP] Article already has {existing_assoc_count} coin associations")
            elif not coin_symbols:
                print(f"[NO COINS] No coins detected in: {news_data['title'][:50]}...")

        except Exception as e:
            print(f"Failed to insert article: {e}")
            continue

    print(f"\nComitting with {new_count} new articles")
    db.commit()
    print(f"SUCCESS COMMIT")

    # TRACK FETCH METADATA
    metadata = FetchMetadata(
        source="cryptopanic",
        articles_fetched=new_count,
        status="success"
    )
    db.add(metadata)
    db.commit()

    # INVALIDATE CACHE
    if redis:
        try:
            # Clear all news pagination caches (pattern: news:page:*)
            # For prod: track active cache keys or use Redis SCAN if available

            # Clear first 10 pages with various limits and periods
            for page in range(1, 11):
                for limit in [12, 20, 50, 100, 500]:
                    # Clear with no period filter
                    redis.delete(f"news:page:{page}:limit:{limit}:period:None")
                    # Clear with period filters
                    for period in ["24h", "7d", "30d", "all"]:
                        redis.delete(f"news:page:{page}:limit:{limit}:period:{period}")

            # Clear sentiment caches
            for period in ["24h", "7d", "30d", "all"]:
                redis.delete(f"sentiment:period:{period}")

            print(f"Cache invalidated after refresh")
        except Exception as e:
            print(f"Redis cache invalidation error: {e}")

    return {
        "status": "success",
        "total_fetched": len(articles),
        "new_articles": new_count,
        "skipped": len(articles) - new_count
    }

@router.get("/api/sentiment/aggregate")
def get_market_sentiment(
    period: str = "24h",  # "24h", "7d", "30d", "all"
    db: Session = Depends(get_db),
    redis = Depends(get_redis)
):
  """
  Get overall market sentiment for specified period.

  Query params:
  - period: "24h" (default), "7d", "30d", "all"

  Returns:
  - Distribution: % positive/neutral/negative
  - Average sentiment score
  - Market state: Bullish/Neutral/Bearish
  """
  cache_key = f"sentiment:period:{period}"
  if redis:
    try:
      cached = redis.get(cache_key)
      if cached:
        # HIT
        return json.loads(cached)
    except Exception as e:
      print(f"Redis GET error: {e}")

  # MISS


  # Calculate cutoff based on period
  now = datetime.now(timezone.utc)

  if period == "24h":
      cutoff = now - timedelta(hours=24)
  elif period == "7d":
      cutoff = now - timedelta(days=7)
  elif period == "30d":
      cutoff = now - timedelta(days=30)
  elif period == "all":
      cutoff = None
  else:
      raise HTTPException(400, "Invalid period. Use: 24h, 7d, 30d, or all")

  # Query with optional date filter
  query = db.query(
      func.count(News.id).label("total"),
      func.avg(News.sentiment_score).label("avg_score"),
      func.sum(
          case((News.sentiment_label == "positive", 1), else_=0)
      ).label("positive_count"),
      func.sum(
          case((News.sentiment_label == "neutral", 1), else_=0)
      ).label("neutral_count"),
      func.sum(
          case((News.sentiment_label == "negative", 1), else_=0)
      ).label("negative_count"),
  )

  # Apply date filter if not "all"
  if cutoff:
      query = query.filter(News.published_at >= cutoff)

  result = query.first()

  total = result.total or 0

  if total == 0:
      return {
          "market_state": "insufficient_data",
          "avg_sentiment": 0,
          "distribution": {"positive": 0, "neutral": 0, "negative": 0},
          "total_articles": 0
      }

  # Calculate percentages
  positive_percentage = (result.positive_count / total) * 100
  neutral_percentage = (result.neutral_count / total) * 100
  negative_percentage = (result.negative_count / total) * 100

  # Determine bullish/bearish/neutral
  if positive_percentage > 50:
      market_state = "bullish"
  elif negative_percentage > 50:
      market_state = "bearish"
  else:
      market_state = "neutral"

  distribution = {
    "positive": round(positive_percentage, 2),
    "neutral": round(neutral_percentage, 2),
    "negative": round(negative_percentage, 2)
  }

  response = {
    "market_state": market_state,
    "avg_sentiment": round(float(result.avg_score), 4),
    "distribution": distribution,
    "total_articles": total,
    "period": period
  }

  # Store cache
  if redis:
    try:
      redis.set(
        cache_key,
        json.dumps(response),
        ex=300 # TTL : 5 minutes
      )
    except Exception as e:
      print(f"Redis SET error: {e}")
  return response


