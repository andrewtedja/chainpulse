from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from .jobs import refresh_news_job

scheduler = BackgroundScheduler()

# Background scheduler called during app startup
def start_scheduler():
  scheduler.add_job(
    func=refresh_news_job,
    trigger=IntervalTrigger(days=1),
    id='refresh_news_job',
    name='Refresh crypto news',
    misfire_grace_time=3600,
    max_instances=1,
    replace_existing=True
  )

  scheduler.start()
  print("Scheduler started => News will refresh every WEEK for cost efficiency")


# Graceful shutdown
def shutdown_scheduler():
  scheduler.shutdown()
  print("Scheduler stopped (X)")
