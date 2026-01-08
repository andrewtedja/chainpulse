from app.db.database import SessionLocal
from app.core.redis import get_redis
from app.services.news_refresh import execute_news_refresh

def refresh_news_job():
  print("Scheduled news refresh starting...")

  db = SessionLocal()
  redis = get_redis()

  try:
      # Call refresh logic directly (no HTTP)
      result = execute_news_refresh(db, redis)
      print(f"Scheduled refresh complete: {result}")

  except Exception as e:
      print(f"Scheduled refresh error: {e}")
      import traceback
      traceback.print_exc()

  finally:
      db.close()
      print("Scheduled news refresh finished")
