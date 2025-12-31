import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
	height?: number;
	showLegend?: boolean;
}

export function ChartSkeleton({ height = 600, showLegend = false }: ChartSkeletonProps) {
	return (
		<div className="w-full">
			{showLegend && (
				<div className="flex flex-wrap items-center justify-center gap-6 mb-4">
					{[...Array(4)].map((_, i) => (
						<div key={i} className="flex items-center gap-2">
							<Skeleton className="h-4 w-4 rounded-full" />
							<Skeleton className="h-4 w-16" />
						</div>
					))}
				</div>
			)}
			<Skeleton className="w-full rounded-lg" style={{ height: `${height}px` }} />
		</div>
	);
}
