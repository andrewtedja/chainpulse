import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
	children: ReactNode;
	className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
	return (
		<div
			className={cn(
				"bg-[#0D0F12] backdrop-blur-xl border border-border rounded-lg p-6 shadow-xl",
				className
			)}
		>
			{children}
		</div>
	);
}
