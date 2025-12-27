# create_tables.py
from .base import Base
from .database import engine

from ..models.coin import Coin
print("Creating all tables...")
Base.metadata.create_all(bind=engine)
print("Done.")
