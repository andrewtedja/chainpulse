import { useQuery } from "@tanstack/react-query";
import { fetchCoinSentiment } from "@/lib/api";

/**
 * Custom hook to fetch coin sentiment data
 * @param period - Time period filter ("48h", "7d", "30d", "all")
 * @returns { data, isLoading, error } - React Query result
 */
export function useCoinSentiment(period: string = "48h") {
	return useQuery({
		queryKey: ["coinSentiment", period], // Cache key (unique per period)
		queryFn: () => fetchCoinSentiment(period),
		staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes (matches backend Redis cache)
		refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
	});
}
