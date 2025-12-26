from fastapi import FastAPI

app = FastAPI()
'''
NOTES (endpoints)
- GET /api/news -> fetch news list (can use redis)
- POST /api/refresh-news -> fetch + store ke DB (+Redis)

di GET → untuk pagination (berapa item frontend mau lihat).
di POST → untuk kontrol banyaknya berita yang di-fetch dari API.
'''

