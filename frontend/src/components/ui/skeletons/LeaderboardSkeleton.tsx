import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/common/GlassCard";

export function LeaderboardSkeleton() {
	return (
		<GlassCard>
			<h3 className="text-lg font-semibold text-white mb-6">Leaderboards</h3>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div>
					<Skeleton className="h-6 w-48 mb-4" />
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-16 w-full rounded-lg" />
						))}
					</div>
				</div>

				<div>
					<Skeleton className="h-6 w-48 mb-4" />
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-16 w-full rounded-lg" />
						))}
					</div>
				</div>
			</div>
		</GlassCard>
	);
}
