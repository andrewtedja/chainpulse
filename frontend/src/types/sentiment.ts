export type MarketState = "bullish" | "neutral" | "bearish";

export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentAggregate {
  market_state: MarketState;
  avg_sentiment: number;
  distribution: SentimentDistribution;
  total_articles: number;
  period: string;
}

export type Period = "48h" | "7d" | "30d" | "all";
