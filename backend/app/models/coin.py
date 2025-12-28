from sqlalchemy import Column, Integer, String, func, DateTime
from sqlalchemy.orm import relationship

from app.db.base import Base
from .news_coin import news_coin_association

class Coin(Base):
    __tablename__ = "coins"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)  # BTC, ETH
    name = Column(String)  # Bitcoin, Ethereum

    # Timestamps
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    news = relationship(
        "News",
        secondary=news_coin_association,
        back_populates="coins"
    )
