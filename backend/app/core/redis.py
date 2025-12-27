from upstash_redis import Redis
import os
import logging

logger = logging.getLogger(__name__)

# singleton redis client
try:
    redis_client = Redis(
        url=os.getenv("UPSTASH_REDIS_REST_URL"),
        token=os.getenv("UPSTASH_REDIS_REST_TOKEN")
    )
    logger.info("Redis client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize Redis: {e}")
    redis_client = None

# DI Redis
def get_redis():
    return redis_client
