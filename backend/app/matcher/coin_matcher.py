from .aho_corasick import AhoCorasick
from .fuzzy import FuzzyMatcher

COIN_KEYWORDS = {
    "BTC": ["bitcoin", "btc"],
    "ETH": ["ethereum", "eth", "ether"],
    "BNB": ["bnb", "binance coin"],
    "SOL": ["solana", "sol"],
    "XRP": ["ripple", "xrp"],
    "RENDER": ["render"],
    "WLD": ["worldcoin", "wld"],
    "ADA": ["cardano", "ada"],
    "AVAX": ["avalanche", "avax"],
    "HYPE": ["hyperliquid", "hype"],
    "DOT": ["polkadot", "dot"],
    "TON": ["toncoin", "ton"],
    "TRX": ["tron", "trx"],
    "MATIC": ["polygon", "matic"],
    "NEAR": ["near protocol", "near"],
    "ATOM": ["cosmos", "atom"],
    "FTM": ["fantom", "ftm"],
    "ONDO": ["ondo"],
    "DOGE": ["dogecoin", "doge"],
    "SUI": ["sui"],
    "SHIB": ["shiba inu", "shib"],
    "PEPE": ["pepe"],
    "BOME": ["bome"],
    "WIF": ["dogwifhat", "wif"],
    "FLOKI": ["floki"],
    "BONK": ["bonk"],
    "UNI": ["uniswap", "uni"],
    "LINK": ["chainlink", "link"],
    "AAVE": ["aave"],
    "LDO": ["lido", "ldo"],
    "MKR": ["maker", "mkr"],
    "CRV": ["curve dao", "crv"],
    "SUSHI": ["sushiswap", "sushi"],
    "DYDX": ["dydx"],
    "BITGET": ["bitget", "bgb"],
    "OP": ["optimism", "op"],
    "ARB": ["arbitrum", "arb"],
    "IMX": ["immutable x", "imx"],
    "QNT": ["quant", "qnt"],
    "MANA": ["decentraland", "mana"],
    "AXS": ["axie infinity", "axs"],
    "GALA": ["gala"],
    "LTC": ["litecoin", "ltc"],
    "BCH": ["bitcoin cash", "bch"],
    "XLM": ["stellar", "xlm"],
    "XMR": ["monero", "xmr"],
    "ETC": ["ethereum classic", "etc"],
    "FIL": ["filecoin", "fil"],
    "ICP": ["internet computer", "icp"],
    "VET": ["vechain", "vet"],
    "HBAR": ["hedera", "hbar"],
    "USDT": ["tether", "usdt"],
    "USDC": ["usd coin", "usdc"],
    "DAI": ["dai"],
    "PAXG": ["pax gold", "paxg"],
    "TIA": ["celestia", "tia"],
    "APT": ["aptos", "apt"],
    "SEI": ["sei"],
    "INJ": ["injective", "inj"],
    "PENDLE": ["pendle"],
    "RUNE": ["thorchain", "rune"],
    "GRT": ["the graph", "grt"],
    "STETH": ["lido staked ether", "steth"],
    "BLUR": ["blur"],
    "SAND": ["sandbox", "sand"],
    "ENJ": ["enjin", "enj"],
    "CHZ": ["chiliz", "chz"]
}


class CoinMatcher:
    """
    Hybrid coin matcher using Aho-Corasick (exact) + Fuzzy matching (fallback)
    """

    def __init__(self):
        # Build flat list of all keywords for Aho-Corasick
        all_keywords = []
        for keywords in COIN_KEYWORDS.values():
            all_keywords.extend(keywords)

        self.aho = AhoCorasick(all_keywords)
        self.fuzzy = FuzzyMatcher(threshold=0.85)

        # Reverse mapping: keyword -> ticker
        self.keyword_to_ticker = {}
        for ticker, keywords in COIN_KEYWORDS.items():
            for kw in keywords:
                self.keyword_to_ticker[kw.lower()] = ticker

    def identify_coins(self, text):
        """
        Identify coins mentioned in text using exact + fuzzy matching

        Args:
            text (str): News title/content to analyze

        Returns:
            list[str]: List of unique coin tickers found, e.g. ["BTC", "ETH"]
        """
        if not text:
            return []

        found_coins = set()
        text_lower = text.lower()

        # Exact match
        aho_results = self.aho.search_words(text_lower)

        for keyword in aho_results:
            if keyword in self.keyword_to_ticker:
                ticker = self.keyword_to_ticker[keyword]
                found_coins.add(ticker)

        # Fuzzy matching (only for coins not found yet)
        remaining_tickers = set(COIN_KEYWORDS.keys()) - found_coins

        for ticker in remaining_tickers:
            for keyword in COIN_KEYWORDS[ticker]:
                count, _ = self.fuzzy.fuzzy_search(keyword, text_lower)
                if count > 0:
                    found_coins.add(ticker)
                    break

        return sorted(list(found_coins))


def identify_coins_in_text(text):
    """
    Legacy function for backward compatibility
    """
    matcher = CoinMatcher()
    return matcher.identify_coins(text)


# TESTING
if __name__ == '__main__':
    print("Unit Test untuk identify_coins_in_text")

    test_cases = [
        ("Great news for bitcoin (BTC) investors!", ["BTC"]),
        ("Ethereum and Ripple are soaring, but Solana faces issues.", ["ETH", "XRP", "SOL"]),
        ("What is the future of dogecoin?", ["DOGE"]),
        ("This article is about general market trends.", []),
        ("ETH's new upgrade is live!", ["ETH"])
    ]

    for i, (text, expected) in enumerate(test_cases, 1):
        result = identify_coins_in_text(text)
        # Urutkan untuk perbandingan yang konsisten
        result.sort()
        expected.sort()

        status = "V PASS" if result == expected else "X FAIL"
        print(f"\nTest Case #{i}: {status}")
        print(f"  - Text: '{text}'")
        print(f"  - Expected: {expected}")
        print(f"  - Got: {result}")
