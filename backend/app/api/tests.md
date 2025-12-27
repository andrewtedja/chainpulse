# ================== TESTS ==================

## Refresh news

curl -X POST http://localhost:8000/api/news/refresh

## Get news

curl "http://localhost:8000/api/news?page=1&limit=20"
curl "http://localhost:8000/api/news?page=2&limit=20"

## Get sentiment aggregate

### Default 24h

curl "http://localhost:8000/api/sentiment/aggregate"

### Last 7 days

curl "http://localhost:8000/api/sentiment/aggregate?period=7d"

### Last 30 days

curl "http://localhost:8000/api/sentiment/aggregate?period=30d"

### All time

curl "http://localhost:8000/api/sentiment/aggregate?period=all"
