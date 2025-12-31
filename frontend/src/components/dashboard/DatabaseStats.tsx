"use client";

import { GlassCard } from "@/components/common/GlassCard";
import { useSentiment } from "@/hooks/useSentiment";
import { FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DatabaseStatsSkeleton } from "@/components/ui/skeletons/DatabaseStatsSkeleton";

export function DatabaseStats() {
	const { data, isLoading } = useSentiment("all");

	if (isLoading) return <DatabaseStatsSkeleton />;
	if (!data) return null;

	const stats = [
		{
			icon: FileText,
			label: "Total Articles",
			value: data.total_articles,
			color: "text-[#02D5E9]",
			bgColor: "bg-[#02D5E9]/10",
		},
		{
			icon: TrendingUp,
			label: "Positive",
			value: `${Math.round(data.distribution.positive)}%`,
			color: "text-green-400",
			bgColor: "bg-green-500/10",
		},
		{
			icon: Minus,
			label: "Neutral",
			value: `${Math.round(data.distribution.neutral)}%`,
			color: "text-gray-400",
			bgColor: "bg-gray-500/10",
		},
		{
			icon: TrendingDown,
			label: "Negative",
			value: `${Math.round(data.distribution.negative)}%`,
			color: "text-red-400",
			bgColor: "bg-red-500/10",
		},
	];

	return (
		<div id="db-statistics">
			<GlassCard>
				<h3 className="text-lg font-semibold text-white mb-6">
					Database Statistics
				</h3>
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
					{stats.map((stat) => {
						const Icon = stat.icon;
						return (
							<div
								key={stat.label}
								className="text-center p-4 bg-[#111418] rounded-xl"
							>
								<div
									className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-2`}
								>
									<Icon className={`w-6 h-6 ${stat.color}`} />
								</div>
								<div className={`text-2xl font-bold ${stat.color}`}>
									{stat.value}
								</div>
								<div className="text-sm text-gray-400 mt-1">{stat.label}</div>
							</div>
						);
					})}
				</div>
			</GlassCard>
		</div>
	);
}
