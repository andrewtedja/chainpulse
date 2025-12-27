# ================== TESTS ==================

## Refresh news

curl -X POST http://localhost:8000/api/news/refresh

## Get news

curl "http://localhost:8000/api/news?page=1&limit=20"
curl "http://localhost:8000/api/news?page=2&limit=20"

## Get current sentiment

### Default 24h

curl "http://localhost:8000/api/sentiment/current"

### Last 7 days

curl "http://localhost:8000/api/sentiment/current?period=7d"

### Last 30 days

curl "http://localhost:8000/api/sentiment/current?period=30d"

### All time

curl "http://localhost:8000/api/sentiment/current?period=all"
