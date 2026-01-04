from sqlalchemy import Column, Integer, String, DateTime, Index, Float, Text, func, UniqueConstraint
from sqlalchemy.orm import relationship
from .news_coin import news_coin_association
from ..db.base import Base

class News(Base):
  __tablename__ = "news"

  id = Column(Integer, primary_key=True, index=True)
  title = Column(String)
  content = Column(Text)
  published_at = Column(DateTime)

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

  __table_args__ = (
      UniqueConstraint('title', 'published_at', name='uq_news_title_published'),
      Index('idx_news_published_at', 'published_at'),
      Index('idx_news_sentiment', 'sentiment_label')
  )

# models: coins, news, coin_news, {fgi later}
