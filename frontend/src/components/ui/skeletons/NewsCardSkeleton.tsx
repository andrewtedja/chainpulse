import { Skeleton } from "@/components/ui/skeleton";

export function NewsCardSkeleton() {
	return (
		<div className="p-4 rounded-lg bg-[hsl(0,0%,14%)]/30 border border-[hsl(0,0%,18%)]/50">
			<div className="flex items-start gap-4">
				<Skeleton className="h-20 w-32 rounded-lg shrink-0" />
				<div className="flex-1 min-w-0">
					<Skeleton className="h-5 w-3/4 mb-2" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-16 rounded-full" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-20" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function NewsFeedSkeleton() {
	return (
		<div className="space-y-4">
			{[...Array(10)].map((_, i) => (
				<NewsCardSkeleton key={i} />
			))}
		</div>
	);
}
