"""
News refresh service - extracts business logic from API routes
so it can be called by both API endpoints and scheduled jobs
"""

import os
import requests
import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import func

from app.models.news import News
from app.models.coin import Coin
from app.models.fetch_metadata import FetchMetadata
from app.matcher.coin_matcher import CoinMatcher

# Initialize coin matcher
coin_matcher = CoinMatcher()


def execute_news_refresh(db: Session, redis=None, analyzer=None):
    """
    Execute news refresh logic -> can be called from API or scheduler
    """

    if analyzer is None:
        from app.ml.SentimentAnalyzer import SentimentAnalyzer
        analyzer = SentimentAnalyzer()
        analyzer.load_model()

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
        raise Exception(f"Failed to fetch news: {str(e)}")

    # Parse and insert articles (with batch processing)
    articles = data.get("results", [])
    new_count = 0

    texts_to_analyze = []
    articles_data = []

    for article in articles:
        published_at = None
        if article.get("published_at"):
            published_at = datetime.fromisoformat(article["published_at"].replace("Z", "+00:00"))

        news_data = {
            "title": article.get("title"),
            "content": article.get("description"),
            "published_at": published_at,
            "url": article.get("url"),
            "source": article.get("source", {}).get("title", "Unknown"),
        }

        text = news_data["content"] or news_data["title"]
        texts_to_analyze.append(text)
        articles_data.append(news_data)

    print(f"Analyzing {len(texts_to_analyze)} articles with BERT...")
    sentiment_results = analyzer.analyze(texts_to_analyze)
    print(f"BERT analysis complete!")

    for i, news_data in enumerate(articles_data):
        sentiment = sentiment_results[i]
        sentiment_score = sentiment["score"]
        sentiment_label = sentiment["label"]

        # Normalize score to -1 to 1
        if sentiment_label == "positive":
            normalized_score = sentiment_score
        elif sentiment_label == "negative":
            normalized_score = -sentiment_score
        else:
            normalized_score = 0

        news_data["sentiment_score"] = normalized_score
        news_data["sentiment_label"] = sentiment_label

        # COIN MATCHING: Identify coins mentioned in article
        full_text = f"{news_data['title']} {news_data['content'] or ''}"
        coin_symbols = coin_matcher.identify_coins(full_text)

        url = news_data.pop("url", None)
        source = news_data.pop("source", None)

        stmt = insert(News).values(**news_data)

        try:
            result = db.execute(
                stmt.on_conflict_do_nothing(
                    index_elements=["title", "published_at"]
                )
            )

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

            if coin_symbols:
                coins = db.query(Coin).filter(Coin.symbol.in_(coin_symbols)).all()
                for coin in coins:
                    if coin not in news_record.coins:
                        news_record.coins.append(coin)

        except Exception as e:
            print(f"Error inserting article: {e}")
            continue

    db.commit()

    metadata = FetchMetadata(
        source="cryptopanic",
        articles_fetched=len(articles),
        status="success",
    )
    db.add(metadata)
    db.commit()

    if redis:
        try:
            for page in range(1, 11):
                for limit in [12, 20, 50, 100, 500]:
                    # Clear with no period filter
                    redis.delete(f"news:page:{page}:limit:{limit}:period:None:sentiment:None:search:None")
                    # Clear with period filters
                    for period in ["24h", "7d", "30d", "all"]:
                        redis.delete(f"news:page:{page}:limit:{limit}:period:{period}:sentiment:None:search:None")

            # Clear sentiment caches
            for period in ["24h", "7d", "30d", "all"]:
                redis.delete(f"sentiment:period:{period}")
                redis.delete(f"coins:sentiment:period:{period}")
                redis.delete(f"coins:bubble:period:{period}")

            print(f"Cache invalidated after refresh")
        except Exception as e:
            print(f"Redis cache invalidation error: {e}")

    return {
        "total_fetched": len(articles),
        "new_articles": new_count,
        "duplicates_skipped": len(articles) - new_count,
        "message": f"Successfully refreshed {new_count} new articles"
    }
