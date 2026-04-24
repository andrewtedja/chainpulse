"use client";

import { GlassCard } from "@/components/common/GlassCard";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MarketState } from "@/types/sentiment";

interface SentimentGaugeProps {
	score: number; // -1 to 1
	period: string;
	totalArticles: number;
}

export function SentimentGauge({
	score,
	period,
	totalArticles,
}: SentimentGaugeProps) {
	// Calculate  sentiment based on score
	const actualSentiment: MarketState =
		score > 0.1 ? "bullish" : score < -0.1 ? "bearish" : "neutral";

	const getSentimentStyles = () => {
		if (actualSentiment === "bullish")
			return {
				icon: TrendingUp,
				color: "text-green-400",
				bgColor: "bg-green-500/10",
				borderColor: "border-green-500/30",
			};
		if (actualSentiment === "bearish")
			return {
				icon: TrendingDown,
				color: "text-red-400",
				bgColor: "bg-red-500/10",
				borderColor: "border-red-500/30",
			};
		return {
			icon: Minus,
			color: "text-gray-400",
			bgColor: "bg-gray-500/10",
			borderColor: "border-gray-500/30",
		};
	};

	const sentiment = getSentimentStyles();
	const SentimentIcon = sentiment.icon;

	const gaugePercentage = ((score + 1) / 2) * 100;

	return (
		<GlassCard>
			<div className="flex items-start justify-between mb-6">
				<div>
					<h3 className="text-lg font-semibold text-white mb-1">
						Global Market Sentiment
					</h3>
					<p className="text-sm text-gray-400">
						Based on {totalArticles} articles ({period === "all" ? "all time" : `last ${period}`})
					</p>
				</div>

				<div
					className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${sentiment.bgColor} border ${sentiment.borderColor}`}
				>
					<SentimentIcon className={`w-4 h-4 ${sentiment.color}`} />
					<span className={`text-sm font-medium ${sentiment.color}`}>
						{actualSentiment.charAt(0).toUpperCase() + actualSentiment.slice(1)}
					</span>
				</div>
			</div>

			<div className="text-center mb-8">
				<div
					className={`text-6xl sm:text-7xl font-bold ${
						score > 0
							? "text-green-400"
							: score < 0
							? "text-red-400"
							: "text-gray-400"
					}`}
					style={{
						textShadow:
							score > 0
								? "0 0 40px rgba(74, 222, 128, 0.5), 0 0 80px rgba(74, 222, 128, 0.3)"
								: score < 0
								? "0 0 40px rgba(248, 113, 113, 0.5), 0 0 80px rgba(248, 113, 113, 0.3)"
								: "0 0 40px rgba(156, 163, 175, 0.3)",
					}}
				>
					{score > 0 ? "+" : ""}
					{score.toFixed(3)}
				</div>
				<p className="text-sm text-gray-400 mt-2">Sentiment Score (-1 to +1)</p>
			</div>

			{/* Bar */}
			<div className="relative">
				<div className="h-3 bg-gray-800 rounded-full overflow-hidden relative">
					<div
						className="absolute inset-y-0 left-0 bg-linear-to-r from-red-500 via-gray-600 to-green-500 rounded-full"
						style={{ width: "100%" }}
					/>
					<div
						className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-900 shadow-lg transition-all duration-500 z-10"
						style={{ left: `calc(${gaugePercentage}% - 8px)` }}
					/>
				</div>

				<div className="flex justify-between mt-2 text-xs text-gray-500">
					<span className="text-red-400">Bearish (-1)</span>
					<span className="text-gray-400">Neutral (0)</span>
					<span className="text-green-400">Bullish (+1)</span>
				</div>
			</div>
		</GlassCard>
	);
}
