import { useQuery } from "@tanstack/react-query";
import { fetchSentiment } from "@/lib/api";
import type { Period } from "@/types/sentiment";

export function useSentiment(period: Period = "24h") {
  return useQuery({
    queryKey: ["sentiment", period],
    queryFn: () => fetchSentiment(period),
  });
}
