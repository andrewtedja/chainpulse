from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .db.database import get_db, Base, engine
from contextlib import asynccontextmanager
from .api.routes import router
from .scheduler.scheduler import start_scheduler, shutdown_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
  print("Preloading BERT model...")

  from .ml.SentimentAnalyzer import SentimentAnalyzer
  analyzer = SentimentAnalyzer()
  analyzer.load_model()

  # store once, reuse everywhere
  app.state.sentiment_analyzer = analyzer

  print("BERT model loaded!")

  # Scheduler
  start_scheduler()

  yield  # app is running

  # optional cleanup
  shutdown_scheduler()
  print("App shutting down...")


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# ============================= ROUTING =============================

app.include_router(router)

@app.get("/")
def root():
    return {"text" : "Hello World"}

# @app.on_event("startup")
# async def startup_event():
#     print("Preloading BERT model...")
#     from .ml.SentimentAnalyzer import SentimentAnalyzer
#     analyzer = SentimentAnalyzer()
#     analyzer.load_model()
#     print("BERT model loaded!")


# uvicorn app.main:app --reload
