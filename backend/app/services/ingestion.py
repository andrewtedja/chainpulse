import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict
from datetime import datetime
from dotenv import load_dotenv

import os
from app.db.base import Base
from app.models.article import Article
from app.models.coin import Coin
from backend.app.models.news_coin import article_coin_association

# Pydantic serializer + validate
class ApiCurrency(BaseModel):
    code: str # ticker
    title: str # name


class ApiArticle(BaseModel):
    title: str
    url: HttpUrl
    published_at: datetime

    currencies: List[ApiCurrency] = [] # safe even if its empty i guess
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    sentiment_norm: Optional[float] = None
    coin_ids: List[int] = []
    

load_dotenv()
CRYPTO_PANIC_API_KEY = os.getenv("CRYPTO_PANIC_API_KEY")

# POPULATE COIN IDS (capture currencies -> primary key and coin rows)
async def attach_coin_ids(session: AsyncSession, article: ApiArticle) -> ApiArticle:
    # ticker codes -> ["BTC", "ETH", "USDT"]
    ticker_codes = [c.code for c in article.currencies]
    if not ticker_codes:
        return article
    
    # result -> [(1, "BTC"), (2, "ETH"), (3, "USDT")]
    result = await session.execute(
        select(Coin.id, Coin.symbol).where(Coin.symbol.i_(ticker_codes))
    )

    symbol_id_mapping = {symbol: coin_id for coin_id, symbol in result.all()}
    article.coin_ids = [symbol_id_mapping[ticker_codes] for code in ticker_codes if code in symbol_id_mapping]


    




# Kamu bisa membuat fungsi utama untuk menjalankan pipeline ini
async def run_ingestion(session: AsyncSession):
    news = await fetch_news_from_api()
    await save_news_to_db(session, news)