from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from datetime import datetime
import requests
import os

from ..db.database import get_db
from ..models import News, FetchMetadata

router = APIRouter()

@router.post("/api/news/refresh")
def refresh_news(db: Session = Depends(get_db)):
    """
    Fetch news from CryptoPanic API -> store in db.

    NOTES Flow:
    1. Call CryptoPanic API
    2. Parse response
    3. Insert news to DB (skip duplicates based on title+published_at)
    4. Track fetch metadata
    5. Return stats
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
        # parse datetime
        published_at = None
        if article.get("published_at"):
            published_at = datetime.fromisoformat(article["published_at"].replace("Z", "+00:00"))

        # Build news object
        news_data = {
            "title": article.get("title"),
            "content": article.get("description"),
            "published_at": published_at,
            "source": {},  # temp empty (soalnya API doesn't return by default)
        }

        # Insert with conflict handling (skip if duplicate title+published_at)
        stmt = insert(News).values(**news_data)

        try:
            result = db.execute(
                stmt.on_conflict_do_nothing(
                    index_elements=["url"]
                )
            )
            if result.rowcount > 0:
                new_count += 1
        except Exception as e:
            print(f"Failed to insert article: {e}")
            continue

    db.commit()

    # 3: Track fetch metadata
    metadata = FetchMetadata(
        source="cryptopanic",
        articles_fetched=new_count,
        status="success"
    )
    db.add(metadata)
    db.commit()

    return {
        "status": "success",
        "total_fetched": len(articles),
        "new_articles": new_count,
        "skipped": len(articles) - new_count
    }




'''
NOTES (endpoints)
- GET /api/news -> fetch news list (can use redis)
- POST /api/news/refresh -> fetch + store ke DB (+Redis)

di GET → untuk pagination (berapa item frontend mau lihat).
di POST → untuk kontrol banyaknya berita yang di-fetch dari API.
'''

