from sqlalchemy import Column, Integer, String, DateTime, func

from app.db.base import Base

class FetchMetadata(Base):
    __tablename__ = "fetch_metadata"

    id = Column(Integer, primary_key=True, index=True)

    # Which source was fetched (e.g. "cryptopanic")
    source = Column(String, nullable=False, index=True)

    # How many articles were fetched in this operation
    articles_fetched = Column(Integer, default=0)

    # "success" or "failed"
    status = Column(String, nullable=False, index=True)

    # Error message if fetch failed
    error_message = Column(String)

    # When this fetch happened
    fetch_timestamp = Column(DateTime, server_default=func.now(), nullable=False, index=True)
