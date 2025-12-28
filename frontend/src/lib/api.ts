import type { NewsResponse, SentimentAggregate, RefreshResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchNews(
  page: number = 1,
  limit: number = 12,
  period?: string
): Promise<NewsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (period) {
    params.append("period", period);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/news?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch news");
  }

  return response.json();
}

export async function fetchSentiment(
  period: string = "24h"
): Promise<SentimentAggregate> {
  const response = await fetch(
    `${API_BASE_URL}/api/sentiment/aggregate?period=${period}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sentiment");
  }

  return response.json();
}

export async function refreshNews(): Promise<RefreshResponse> {
  const response = await fetch(`${API_BASE_URL}/api/news/refresh`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to refresh news");
  }

  return response.json();
}
