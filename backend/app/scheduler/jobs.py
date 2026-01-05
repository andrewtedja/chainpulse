from app.db.database import SessionLocal
from app.core.redis import get_redis
import requests
import os

def refresh_news_job():
  print("Scheduled news refresh starting...")

  db = SessionLocal()
  redis = get_redis()
  try:
      # Call your refresh logic
      api_url = os.getenv("API_BASE_URL", "http://localhost:8000")
      response = requests.post(f"{api_url}/api/news/refresh")

      if response.status_code == 200:
          result = response.json()
          print(f"Scheduled refresh complete: {result}")
      else:
          print(f"Scheduled refresh failed: {response.status_code}")

  except Exception as e:
      print(f"Scheduled refresh error: {e}")

  finally:
      db.close()
      print("Scheduled news refresh finished")
