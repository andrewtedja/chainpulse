import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "@/lib/api";

export function useNews(
  page: number = 1,
  limit: number = 12,
  period?: string,
  sentiment?: string,
  search?: string
) {
  return useQuery({
    queryKey: ["news", page, limit, period, sentiment, search],
    queryFn: () => fetchNews(page, limit, period, sentiment, search),
  });
}
