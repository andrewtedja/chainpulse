import { useQuery } from "@tanstack/react-query";
import { fetchNews } from "@/lib/api";

export function useNews(page: number = 1, limit: number = 12, period?: string) {
  return useQuery({
    queryKey: ["news", page, limit, period],
    queryFn: () => fetchNews(page, limit, period),
  });
}
