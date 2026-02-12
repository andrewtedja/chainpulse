"use client";

import { useState } from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	ReferenceLine,
} from "recharts";
import { GlassCard } from "@/components/common/GlassCard";
import { PeriodFilter } from "@/components/layout/PeriodFilter";
import { useNews } from "@/hooks/useNews";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";
import type { Period } from "@/types/sentiment";

type ChartDataPoint = {
	time: string;
	sentiment: number;
	articleCount: number;
	articles: string[];
	dateKey: string;
};

type PayloadItem = {
	payload: ChartDataPoint;
};

export function SentimentHistory() {
	const [period, setPeriod] = useState<Period>("all");
	const { data, isLoading } = useNews(1, 500, period);

	// Aggregate sentiment scores by day
	const chartData = (() => {
		if (!data?.data) return [];

		const validNews = data.data.filter((news) => news.sentiment_score !== null);
		if (validNews.length === 0) return [];

		// Group by date
		const groupedByDate = validNews.reduce((acc, news) => {
			const date = new Date(news.published_at);
			const dateKey = date.toISOString().split("T")[0];

			if (!acc[dateKey]) {
				acc[dateKey] = {
					scores: [],
					date: date,
					articles: [],
				};
			}

			acc[dateKey].scores.push(news.sentiment_score!);
			acc[dateKey].articles.push(news.title);

			return acc;
		}, {} as Record<string, { scores: number[]; date: Date; articles: string[] }>);

		// Calculate average sentiment per day and format
		return Object.entries(groupedByDate)
			.map(([dateKey, value]) => ({
				time: new Date(dateKey).toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				sentiment:
					value.scores.reduce((sum, score) => sum + score, 0) /
					value.scores.length,
				articleCount: value.scores.length,
				articles: value.articles,
				dateKey: dateKey,
			}))
			.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
	})();

	const CustomTooltip = ({
		active,
		payload,
	}: {
		active?: boolean;
		payload?: PayloadItem[];
	}) => {
		if (!active || !payload || payload.length === 0) return null;

		const data = payload[0].payload;
		const sentiment = data.sentiment;

		return (
			<div className="bg-gray-900/95 backdrop-blur border border-white/20 rounded-lg p-3 shadow-xl min-w-50">
				<p className="text-sm text-gray-300 mb-2 font-medium">{data.time}</p>
				<div className="flex items-baseline gap-2 mb-2">
					<p
						className={`text-2xl font-bold ${
							sentiment > 0
								? "text-green-400"
								: sentiment < 0
								? "text-red-400"
								: "text-gray-400"
						}`}
					>
						{sentiment > 0 ? "+" : ""}
						{sentiment.toFixed(3)}
					</p>
					<span className="text-xs text-gray-500">avg</span>
				</div>
				<p className="text-xs text-gray-500">
					{data.articleCount} article{data.articleCount !== 1 ? "s" : ""}{" "}
					analyzed
				</p>
			</div>
		);
	};

	return (
		<GlassCard>
			<div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div className="text-center sm:text-left">
					<h3 className="text-lg font-semibold text-white">
						Sentiment History
					</h3>
					<p className="text-sm text-gray-400">Track market mood over time</p>
				</div>

				<PeriodFilter
					activePeriod={period}
					onPeriodChange={setPeriod}
					periods={["all", "30d", "7d", "48h"]}
				/>
			</div>

			{isLoading ? (
				<ChartSkeleton height={350} />
			) : chartData.length === 0 ? (
				<div className="h-75 sm:h-87.5 flex items-center justify-center">
					<p className="text-gray-400 text-sm">
						No sentiment data available for the selected period
					</p>
				</div>
			) : (
				<div className="h-75 sm:h-87.5 ">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart
							data={chartData}
							margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
						>
							<defs>
								<linearGradient
									id="sentimentGradient"
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop
										offset="5%"
										stopColor="hsl(185 100% 50%)"
										stopOpacity={0.3}
									/>
									<stop
										offset="95%"
										stopColor="hsl(185 100% 50%)"
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								stroke="hsl(222 20% 18%)"
								opacity={0.3}
							/>
							<XAxis
								dataKey="time"
								axisLine={false}
								tickLine={false}
								tick={{ fill: "hsl(222 10% 55%)", fontSize: 12 }}
								interval="preserveStartEnd"
							/>
							<YAxis
								domain={[-1, 1]}
								axisLine={false}
								tickLine={false}
								tick={{ fill: "hsl(222 10% 55%)", fontSize: 12 }}
								tickFormatter={(value) => value.toFixed(1)}
							/>
							<Tooltip content={<CustomTooltip />} />
							<ReferenceLine
								y={0}
								stroke="hsl(222 10% 55%)"
								strokeDasharray="3 3"
								opacity={0.5}
							/>
							<Area
								type="monotone"
								dataKey="sentiment"
								stroke="hsl(185 100% 50%)"
								strokeWidth={2}
								fillOpacity={1}
								fill="url(#sentimentGradient)"
								dot={{ fill: "hsl(185 100% 50%)", strokeWidth: 2, r: 3 }}
								activeDot={{ r: 5, strokeWidth: 0 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			)}
		</GlassCard>
	);
}
