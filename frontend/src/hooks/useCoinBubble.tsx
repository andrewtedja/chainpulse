import { useQuery } from "@tanstack/react-query";
import { fetchCoinBubble } from "@/lib/api";

export function useCoinBubble(period: string = "24h") {
	return useQuery({
		queryKey: ["coinBubble", period],
		queryFn: () => fetchCoinBubble(period),
		staleTime: 5 * 60 * 1000,
		refetchInterval: 5 * 60 * 1000,
	});
}
