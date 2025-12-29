"""
Seed coins from COIN_KEYWORDS defined in coin_matcher
This ensures DB coins match exactly with matcher logic
"""
from sqlalchemy.dialects.postgresql import insert
from app.db.database import SessionLocal
from app.models.coin import Coin

# Import COIN_KEYWORDS from matcher
from app.matcher.coin_matcher import COIN_KEYWORDS

# Manual mapping of symbol -> full name (since COIN_KEYWORDS only has aliases)
COIN_NAMES = {
    "BTC": "Bitcoin",
    "ETH": "Ethereum",
    "BNB": "BNB",
    "SOL": "Solana",
    "XRP": "XRP",
    "RENDER": "Render",
    "WLD": "Worldcoin",
    "ADA": "Cardano",
    "AVAX": "Avalanche",
    "HYPE": "Hyperliquid",
    "DOT": "Polkadot",
    "TON": "Toncoin",
    "TRX": "TRON",
    "MATIC": "Polygon",
    "NEAR": "NEAR Protocol",
    "ATOM": "Cosmos",
    "FTM": "Fantom",
    "ONDO": "Ondo",
    "DOGE": "Dogecoin",
    "SUI": "Sui",
    "SHIB": "Shiba Inu",
    "PEPE": "Pepe",
    "BOME": "BOOK OF MEME",
    "WIF": "dogwifhat",
    "FLOKI": "FLOKI",
    "BONK": "Bonk",
    "UNI": "Uniswap",
    "LINK": "Chainlink",
    "AAVE": "Aave",
    "LDO": "Lido DAO",
    "MKR": "Maker",
    "CRV": "Curve DAO",
    "SUSHI": "SushiSwap",
    "DYDX": "dYdX",
    "BITGET": "Bitget Token",
    "OP": "Optimism",
    "ARB": "Arbitrum",
    "IMX": "Immutable",
    "QNT": "Quant",
    "MANA": "Decentraland",
    "AXS": "Axie Infinity",
    "GALA": "Gala",
    "LTC": "Litecoin",
    "BCH": "Bitcoin Cash",
    "XLM": "Stellar",
    "XMR": "Monero",
    "ETC": "Ethereum Classic",
    "FIL": "Filecoin",
    "ICP": "Internet Computer",
    "VET": "VeChain",
    "HBAR": "Hedera",
    "USDT": "Tether",
    "USDC": "USD Coin",
    "DAI": "Dai",
    "PAXG": "PAX Gold",
    "TIA": "Celestia",
    "APT": "Aptos",
    "SEI": "Sei",
    "INJ": "Injective",
    "PENDLE": "Pendle",
    "RUNE": "THORChain",
    "GRT": "The Graph",
    "STETH": "Lido Staked Ether",
    "BLUR": "Blur",
    "SAND": "The Sandbox",
    "ENJ": "Enjin Coin",
    "CHZ": "Chiliz",
}


def seed_coins_from_matcher():
    """
    Seed coins from COIN_KEYWORDS dictionary
    This ensures perfect match between DB and matcher logic
    """
    print("🪙 Seeding coins from COIN_KEYWORDS...")

    with SessionLocal() as session:
        try:
            # Clear existing coins first (optional - comment out if you want to keep existing)
            print("⚠️  Clearing existing coins...")
            session.query(Coin).delete()

            # Insert coins from COIN_KEYWORDS
            inserted_count = 0
            for symbol in COIN_KEYWORDS.keys():
                name = COIN_NAMES.get(symbol, symbol)  # Fallback to symbol if no name mapping

                stmt = insert(Coin).values(
                    symbol=symbol,
                    name=name,
                ).on_conflict_do_nothing(
                    index_elements=["symbol"]
                )

                result = session.execute(stmt)
                if result.rowcount > 0:
                    inserted_count += 1

            session.commit()
            print(f"✅ Successfully seeded {inserted_count} coins from COIN_KEYWORDS")
            print(f"📊 Total coins in COIN_KEYWORDS: {len(COIN_KEYWORDS)}")

        except Exception as e:
            session.rollback()
            print(f"❌ Error seeding coins: {e}")
            raise


if __name__ == "__main__":
    seed_coins_from_matcher()
