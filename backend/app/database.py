import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# connection engine
engine = create_engine(
    DATABASE_URL,
    echo=True,          # log SQL di terminal
    pool_pre_ping=True, # auto reconnect kalau idle
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class buat model
Base = declarative_base()

# Dependency (kalau pakai FastAPI misalnya)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
