from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
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
from ..services.news_refresh import execute_news_refresh


# ================== ROUTES ==================

router = APIRouter()
analyzer = SentimentAnalyzer()
coin_matcher = CoinMatcher()

@router.get("/api/news")
def get_news(
    page: int = 1,
    limit: int = 12,
    period: str = None,
    sentiment: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    redis = Depends(get_redis)
):
  """
  GET paginated news with filters

  Query params:
  - page: Page number (default: 1)
  - limit: Items per page (default: 12, max: 500)
  - period: Time filter ("48h", "7d", "30d", "all")
  - sentiment: Filter by sentiment ("positive", "neutral", "negative")
  - search: Search query (searches title and content)
  """

  # Validation
  if page < 1:
    raise HTTPException(400, "Page must be >= 1!")
  if limit > 500:
    raise HTTPException(400, "Limit max 500!")

  # Check cache (include all filter params in cache key)
  cache_key = f"news:page:{page}:limit:{limit}:period:{period}:sentiment:{sentiment}:search:{search}"

  if redis:
      try:
          cached = redis.get(cache_key)
          if cached:
              return json.loads(cached)
      except Exception as e:
          print(f"Redis GET error: {e}")

  offset = (page - 1) * limit

  query = db.query(News)

  # Apply period filter
  if period:
      now = datetime.now(timezone.utc)
      if period == "48h":
          cutoff = now - timedelta(hours=48)
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
          raise HTTPException(400, "Invalid period. Use: 48h, 7d, 30d, or all")

  # Sentiment filter (p/n/neutral)
  if sentiment:
      if sentiment not in ["positive", "neutral", "negative"]:
          raise HTTPException(400, "Invalid sentiment. Use: positive, neutral, or negative")
      query = query.filter(News.sentiment_label == sentiment)

  # Nanti disini apply case insensitive + debouncing
  if search:
      search_term = f"%{search}%"
      query = query.filter(
          (News.title.ilike(search_term)) | (News.content.ilike(search_term))
      )

  news = query\
    .options(joinedload(News.coins))\
    .order_by(News.published_at.desc())\
    .offset(offset)\
    .limit(limit)\
    .all()

  total_query = db.query(News)
  if period and period != "all":
      if period == "48h":
          cutoff = now - timedelta(hours=48)
      elif period == "7d":
          cutoff = now - timedelta(days=7)
      elif period == "30d":
          cutoff = now - timedelta(days=30)
      total_query = total_query.filter(News.published_at >= cutoff)

  if sentiment:
      total_query = total_query.filter(News.sentiment_label == sentiment)

  if search:
      search_term = f"%{search}%"
      total_query = total_query.filter(
          (News.title.ilike(search_term)) | (News.content.ilike(search_term))
      )

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
              "created_at": n.created_at.isoformat(),
              "coins": [{"ticker": c.symbol, "name": c.name} for c in n.coins]
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

    try:
        result = execute_news_refresh(db, redis, analyzer)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/sentiment/aggregate")
def get_market_sentiment(
    period: str = "48h",  # "48h", "7d", "30d", "all"
    db: Session = Depends(get_db),
    redis = Depends(get_redis)
):
  """
  Get overall market sentiment for specified period.

  Query params:
  - period: "48h" (default), "7d", "30d", "all"

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

  if period == "48h":
      cutoff = now - timedelta(hours=48)
  elif period == "7d":
      cutoff = now - timedelta(days=7)
  elif period == "30d":
      cutoff = now - timedelta(days=30)
  elif period == "all":
      cutoff = None
  else:
      raise HTTPException(400, "Invalid period. Use: 48h, 7d, 30d, or all")

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


@router.get('/api/coins/sentiment')
def get_coins_sentiment(period:str = "48h",
                        db: Session = Depends(get_db),
                        redis = Depends(get_redis),
                        ):
  '''API buat ngereturn top 5 bullish dan bearish coins
    Params: period (48h and 7d)

    Response:
    - ticker
    - name
    - sentiment_score
    - news_count -> calculate by server controller function API yang bisa calculate total news by coin
  '''

  # Check cache first
  cache_key = f"coins:sentiment:period:{period}"
  if redis:
    try:
      cached = redis.get(cache_key)
      if cached:
        # HIT
        return json.loads(cached)
    except Exception as e:
      print(f"Redis GET error: {e}")

  # Cache MISS - query database
  # Calculate cutoff based on period
  now = datetime.now(timezone.utc)

  if period == "48h":
      cutoff = now - timedelta(hours=48)
  elif period == "7d":
      cutoff = now - timedelta(days=7)
  elif period == "30d":
      cutoff = now - timedelta(days=30)
  elif period == "all":
      cutoff = None
  else:
      raise HTTPException(400, "Invalid period. Use: 48h, 7d, 30d, or all")

  query = db.query(
    Coin.symbol,
    Coin.name,
    func.avg(News.sentiment_score).label('avg_sentiment'),
    func.count(News.id).label('news_count')
  )\
  .join(news_coin_association, Coin.id==news_coin_association.c.coin_id)\
  .join(News, news_coin_association.c.news_id == News.id)

  if cutoff:
    query = query.filter(News.published_at >= cutoff)

  query = query.group_by(Coin.symbol, Coin.name)\
                .order_by(func.avg(News.sentiment_score).desc())

  all_results = query.all()

  # pisah jadi bullish bearish row
  bullish = []
  bearish = []

  for row in all_results:
    coin_data = {
        "ticker": row.symbol,
        "name": row.name,
        "sentiment_score": float(row.avg_sentiment) if row.avg_sentiment else 0,
        "news_count": row.news_count
    }

    if row.avg_sentiment and row.avg_sentiment > 0:
        bullish.append(coin_data)
    elif row.avg_sentiment and row.avg_sentiment < 0:
        bearish.append(coin_data)

  # Get top 5 of each
  top_bullish = bullish[:5]

  bearish_sorted = sorted(bearish, key=lambda x: x['sentiment_score'])
  top_bearish = bearish_sorted[:5]

  response = {
      "bullish": top_bullish,
      "bearish": top_bearish
  }

  # Store in cache for next request (5 min TTL)
  if redis:
    try:
      redis.setex(cache_key, 300, json.dumps(response))
    except Exception as e:
      print(f"Redis SET error: {e}")

  return response


# for now gausah dibatesin dlu (buat buybblechart)
@router.get('/api/coins/bubble')
def get_coins_bubble(period: str = "all",
                      db: Session = Depends(get_db),
                      redis = Depends(get_redis)):
  '''API buat ngereturn informasi untuk bubble chart:
    - Articles count
    - Sentiment_score (avg dari seluruh sentiment per coin)
    - Gausah di limit dulu for now since its d3.js, 60+ coins is fine to display and gampang liat yg lebih gede
    - Bubble bakal diukur based on articles count dan diatur di FE, positive/negative tapi kayanya harus direturn dari server
  Response:
  - article_count per coin
  - sentiment score (avg) per coin
  - ticker, name
  '''

  # Check cache first
  cache_key = f"coins:bubble:period:{period}"
  if redis:
    try:
      cached = redis.get(cache_key)
      if cached:
        # HIT
        return json.loads(cached)
    except Exception as e:
      print(f"Redis GET error: {e}")

  # MISS -> query database
  # Calculate cutoff based on period
  now = datetime.now(timezone.utc)

  if period == "48h":
      cutoff = now - timedelta(hours=48)
  elif period == "7d":
      cutoff = now - timedelta(days=7)
  elif period == "30d":
      cutoff = now - timedelta(days=30)
  elif period == "all":
      cutoff = None
  else:
      raise HTTPException(400, "Invalid period. Use: 48h, 7d, 30d, or all")

  query = db.query(
    Coin.symbol,
    Coin.name,
    func.avg(News.sentiment_score).label('avg_sentiment'),
    func.count(News.id).label('news_count')
  )\
  .join(news_coin_association, Coin.id==news_coin_association.c.coin_id)\
  .join(News, news_coin_association.c.news_id == News.id)

  if cutoff:
    query = query.filter(News.published_at >= cutoff)

  query = query.group_by(Coin.symbol, Coin.name)\
                .order_by(func.avg(News.sentiment_score).desc())

  all_results = query.all()

  response = []
  for row in all_results:
    coin_data = {
      "ticker": row.symbol,
      "name": row.name,
      "sentiment_score": float(row.avg_sentiment) if row.avg_sentiment else 0,
      "news_count": row.news_count
    }
    response.append(coin_data)

  # Store in cache for next request (5 min TTL)
  if redis:
    try:
      redis.setex(cache_key, 300, json.dumps(response))
    except Exception as e:
      print(f"Redis SET error: {e}")

  return response

# testing

@router.get("/api/debug/bert-status")
def bert_status():
    from app.api.routes import analyzer
    return {
        "analyzer_exists": analyzer is not None,
        "model_loaded": analyzer._pipe is not None if analyzer else False,
    }


@router.post("/api/cron/refresh")
def cron_refresh(db: Session = Depends(get_db), redis = Depends(get_redis)):
    try:
        result = execute_news_refresh(db, redis, analyzer)
        return {
            "status": "success",
            "triggered_by": "railway_cron",
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


