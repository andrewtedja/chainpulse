import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/common/GlassCard";

export function SentimentGaugeSkeleton() {
	return (
		<GlassCard>
			<h3 className="text-lg font-semibold text-white mb-6">
				Global Market Sentiment
			</h3>
			<div>
				<Skeleton className="h-6 w-56 mb-2" />
			</div>
			<Skeleton className="h-24 w-full mb-4" />
			<Skeleton className="h-3 w-full rounded-full" />
		</GlassCard>
	);
}
