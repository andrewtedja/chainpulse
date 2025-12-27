export interface RefreshResponse {
  status: string;
  total_fetched: number;
  new_articles: number;
  skipped: number;
}

export interface ApiError {
  detail: string;
}
