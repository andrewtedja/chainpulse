export interface CoinSentiment {
	ticker: string;
	name: string;
	sentiment_score: number;
	news_count: number;
}

export interface CoinSentimentResponse {
	bullish: CoinSentiment[];
	bearish: CoinSentiment[];
}
