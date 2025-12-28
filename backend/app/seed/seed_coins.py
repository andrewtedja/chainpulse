import requests
from sqlalchemy.dialects.postgresql import insert
from app.db.database import SessionLocal
from app.models.coin import Coin

def seed_coins():
    print("📡 Fetching data from CoinGecko...")
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {"vs_currency": "usd", "order": "market_cap_desc", "per_page": 200, "page": 1}
    resp = requests.get(url, params=params)
    data = resp.json()

    with SessionLocal() as session:
        try:
            for c in data:
                stmt = insert(Coin).values(
                    symbol=c["symbol"].upper(),
                    name=c["name"],
                ).on_conflict_do_nothing(
                    index_elements=["symbol"]
                )
                session.execute(stmt)

            session.commit()
            print("✅ Coins seeded (skip duplicates)")
        except Exception as e:
            session.rollback()
            print("❌ Error:", e)

if __name__ == "__main__":
    seed_coins()
