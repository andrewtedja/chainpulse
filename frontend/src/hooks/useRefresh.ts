import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refreshNews } from "@/lib/api";

export function useRefresh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshNews,
    onSuccess: () => {
      // Invalidate all caches to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["sentiment"] });
    },
  });
}
