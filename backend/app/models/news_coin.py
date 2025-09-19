from sqlalchemy import Column, Integer, Table, ForeignKey
from ..db.base import Base

news_coin_association = Table(
    "news_coins",
    Base.metadata,
    Column("news_id", Integer, ForeignKey("news.id"), primary_key=True),
    Column("coin_id", Integer, ForeignKey("coins.id"), primary_key=True),
)
