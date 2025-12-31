import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				"relative bg-white/5 rounded-md overflow-hidden",
				className
			)}
			{...props}
		>
			<div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/10 to-transparent" />
		</div>
	);
}

export { Skeleton };
