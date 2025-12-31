import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard } from "@/components/common/GlassCard";

export function DatabaseStatsSkeleton() {
	return (
		<div id="db-statistics">
			<GlassCard>
				<h3 className="text-lg font-semibold text-white mb-6">
					Database Statistics
				</h3>
				<Skeleton className="h-6 w-48 mb-6" />
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{[...Array(4)].map((_, i) => (
						<div
							key={i}
							className="flex items-center gap-4 p-4 rounded-lg bg-[hsl(0,0%,14%)]/30 border border-[hsl(0,0%,18%)]/50"
						>
							<Skeleton className="h-12 w-12 rounded-lg" />
							<div className="flex-1">
								<Skeleton className="h-4 w-16 mb-2" />
								<Skeleton className="h-6 w-20" />
							</div>
						</div>
					))}
				</div>
			</GlassCard>
		</div>
	);
}
