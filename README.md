# ChainPulse

> Cryptocurrency sentiment analysis dashboard powered by AI

ChainPulse aggregates crypto news, analyzes sentiment using FinBERT, and delivers actionable market insights through interactive visualizations. This platform is made for people that want to read the market fast.

> `Click the button below for the LIVE DEMO`

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://chainpulse-ai.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- **AI-Powered Sentiment Analysis** - FinBERT analyzes 100+ daily crypto articles with 85%+ accuracy
- **Market Sentiment Tracking** - Aggregated scores across 24h, 7d, 30d time periods
- **Interactive Visualizations** - D3.js bubble charts showing sentiment across 60+ coins
- **Smart Coin Matching** - Automatic extraction and tagging of mentioned cryptocurrencies
- **Performance Optimized** - Redis caching + batch processing for sub-400ms responses
- **Duplicate Prevention** - Intelligent deduplication ensures clean news feed

---

## Tech Stack & Tools Used

![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=flat-square&logo=d3.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-red?style=flat-square)
![Alembic](https://img.shields.io/badge/Alembic-6BA81E?style=flat-square)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat-square)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)
![HuggingFace](https://img.shields.io/badge/Transformers-FFD21E?style=flat-square&logo=huggingface&logoColor=black)
![FinBERT](https://img.shields.io/badge/FinBERT-blue?style=flat-square)

---

## System Design

### Architecture Diagram

![Mermaid Diagram](frontend/public/diagram/mermaid.png)

### Key Design Decisions and Assumptions

**1. Batch Processing for ML Inference**

- Processes 16 articles simultaneously instead of sequential analysis
- Reduces sentiment analysis time from 3 minutes to 15-20 seconds (~10x faster)

**2. Caching Strategy**

- 5-minute Redis TTL balances freshness with performance
- Query-level caching for news, sentiment, and coin aggregations
- TanStack Query for optimistic frontend updates

**3. Database Optimization**

- Indexed `published_at` and `sentiment_label` for fast filtering
- Eager loading (`joinedload`) eliminates N+1 query problem
- Unique constraint on `(title, published_at)` prevents duplicates

**4. Startup Model Preloading**

- BERT model loads during app startup (not first request)
- Singleton pattern prevents redundant model instances

### Performance Optimizations

| Optimization              | Before   | After | Impact      |
| ------------------------- | -------- | ----- | ----------- |
| **Batch BERT Processing** | 180s     | 20s   | 9x faster   |
| **Database Indexes**      | 2000ms   | 300ms | 6.7x faster |
| **N+1 Query Fix**         | 1500ms   | 150ms | 10x faster  |
| **Redis Caching**         | DB query | <50ms | 30x faster  |

---

## Screenshots

### Dashboard Overview

![Dashboard](frontend/public/screenshots/img1.png)

> \_Sentiment gauge, market trends

### Leaderboard and Interactive Bubble Chart

![Bubble Chart](frontend/public/screenshots/img2.png)

> _D3.js visualization showing sentiment distribution across 60+ cryptocurrencies_

### News Feed with Sentiment & Their Related Coins

![News Feed with Sentiment](frontend/public/screenshots/img3.png)

> _AI-analyzed crypto news with sentiment scores and coin tags_

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Redis (or Upstash account)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with API URL

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## 📚 API Documentation

### Endpoints

**News**

- `GET /api/news` - Paginated news with filters (period, sentiment, search)
- `POST /api/news/refresh` - Fetch latest news from CryptoPanic

**Sentiment**

- `GET /api/sentiment/aggregate` - Overall market sentiment by period
- `GET /api/coins/sentiment` - Top 5 bullish/bearish coins
- `GET /api/coins/bubble` - All coins data for bubble chart

Interactive API docs available at `/docs` when running locally.

---

## 🥽 Technology Deep Dive

### Natural Language Processing (NLP)

- **FinBERT**: Financial domain-specific BERT model fine-tuned on financial news
- **Batch Inference**: Processes multiple texts simultaneously for 10x speedup
- **Normalization**: Scores mapped to -1 (bearish) to +1 (bullish) scale

### Coin Matching Algorithm

- **Aho-Corasick**: Multi-pattern matching for efficient coin symbol detection
- **Levenshtein Distance**: Fuzzy matching for misspellings and variations
- **Coverage**: 70+ major and most popular cryptocurrencies (BTC, ETH, SOL, etc.)

### Data Pipeline

1. **Ingestion**: CryptoPanic API provides 20-30 articles per fetch
2. **Analysis**: FinBERT batch processing (16 articles/batch)
3. **Extraction**: Coin matcher identifies mentioned cryptocurrencies
4. **Storage**: PostgreSQL with deduplication and indexing
5. **Caching**: Redis stores aggregated results (5-min TTL)

---

## Acknowledgments & References

- [ProsusAI/finbert](https://huggingface.co/ProsusAI/finbert) - Financial sentiment analysis model
- [CryptoPanic](https://cryptopanic.com) - Crypto news aggregation API
- [Railway](https://railway.com/) - Backend deployment
- [Vercel](https://vercel.com) - Frontend deployment

---

**Made by [Andrew Tedjapratama](https://github.com/andrewtedja)**
