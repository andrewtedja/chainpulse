from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from .news_coin import news_coin_association
from ..db.base import Base

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, index=True, nullable=False)
    title = Column(String)
    published_at = Column(DateTime)

    sentiment_score = Column(Float)
    sentiment_label = Column(String)
    sentiment_norm = Column(Float)

    coins = relationship(
        "Coin",
        secondary=news_coin_association,
        back_populates="news"
    )

# models: coins, news, coin_news, {fgi later}