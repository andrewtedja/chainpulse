from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, Text, func
from sqlalchemy.orm import relationship
from .news_coin import news_coin_association
from ..db.base import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=True)
    title = Column(String)
    content = Column(Text)  # Article description/summary from CryptoPanic
    published_at = Column(DateTime)

    # CryptoPanic source object: {title, region, domain, type}
    source = Column(JSON, nullable=False, default={})

    # Sentiment analysis results
    sentiment_score = Column(Float)  # e.g. 0.85 (positive) or -0.65 (negative)
    sentiment_label = Column(String)  # "positive", "neutral", "negative"

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    coins = relationship(
        "Coin",
        secondary=news_coin_association,
        back_populates="news"
    )

# models: coins, news, coin_news, {fgi later}
