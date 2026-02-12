"use client";

import { useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { PeriodFilter } from "@/components/layout/PeriodFilter";
import { useNews } from "@/hooks/useNews";
import { useCoinSentiment } from "@/hooks/useCoinSentiment";
import { LeaderboardSkeleton } from "@/components/ui/skeletons/LeaderboardSkeleton";
import { formatRelativeTime } from "@/lib/utils";
import { Newspaper } from "lucide-react";
import type { Period } from "@/types/sentiment";
import type { CoinSentiment } from "@/types";

type TabType = "coins" | "news";

interface CoinLeaderboardItemProps {
	coin: CoinSentiment;
	index: number;
	type: "bullish" | "bearish";
}

function CoinLeaderboardItem({ coin, index, type }: CoinLeaderboardItemProps) {
	const isBullish = type === "bullish";
	const color = isBullish ? "hsl(142,76%,45%)" : "hsl(0,84%,60%)";

	return (
		<div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(0,0%,14%)]/30 hover:bg-[hsl(0,0%,14%)]/50 border border-[hsl(0,0%,18%)]/50 transition-colors duration-200">
			<div className="flex items-center gap-3">
				<span
					className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
					style={{
						backgroundColor: `${color}/20`,
						color: color,
					}}
				>
					{index + 1}
				</span>
				<div>
					<span className="font-bold text-[hsl(210,40%,98%)]">
						{coin.ticker}
					</span>
					<span className="text-sm text-[hsl(0,0%,55%)] ml-2">{coin.name}</span>
				</div>
			</div>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-1 text-[hsl(0,0%,55%)]">
					<Newspaper className="w-3.5 h-3.5" />
					<span className="text-xs">{coin.news_count}</span>
				</div>
				<span className="font-bold" style={{ color: color }}>
					{isBullish ? "+" : ""}
					{coin.sentiment_score.toFixed(2)}
				</span>
			</div>
		</div>
	);
}

interface NewsLeaderboardItemProps {
	news: {
		id: number | string;
		title: string;
		sentiment_score: number | null;
		published_at: string;
	};
	index: number;
	type: "bullish" | "bearish";
}

function NewsLeaderboardItem({ news, index, type }: NewsLeaderboardItemProps) {
	const isBullish = type === "bullish";
	const color = isBullish ? "hsl(142,76%,45%)" : "hsl(0,84%,60%)";

	return (
		<div className="p-3 rounded-lg bg-[hsl(0,0%,14%)]/30 hover:bg-[hsl(0,0%,14%)]/50 border border-[hsl(0,0%,18%)]/50 transition-colors duration-200">
			<div className="flex items-start gap-3">
				<div
					className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
					style={{
						backgroundColor: `${color}/20`,
						color: color,
					}}
				>
					{index + 1}
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm text-[hsl(210,40%,98%)] font-medium line-clamp-2 mb-2">
						{news.title}
					</p>
					<div className="flex items-center gap-2 text-xs text-[hsl(0,0%,55%)]">
						<span className="font-bold" style={{ color: color }}>
							{isBullish ? "+" : ""}
							{news.sentiment_score!.toFixed(3)}
						</span>
						<span>•</span>
						<span>{formatRelativeTime(news.published_at)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export function Leaderboards() {
	const [period, setPeriod] = useState<Period>("all");
	const [activeTab, setActiveTab] = useState<TabType>("coins");

	// Fetch news data for news leaderboard tab
	const { data: newsData, isLoading: newsLoading } = useNews(1, 50);

	// Call hook
	const { data: coinData, isLoading: coinLoading } = useCoinSentiment(period);

	const isLoading = activeTab === "coins" ? coinLoading : newsLoading;
	if (isLoading) return <LeaderboardSkeleton />;

	// Process news data for news tab
	const validNews =
		newsData?.data.filter(
			(news) => news.sentiment_score !== null && news.sentiment_label !== null
		) || [];

	const topBullishNews = [...validNews]
		.sort((a, b) => b.sentiment_score! - a.sentiment_score!)
		.slice(0, 5);

	const topBearishNews = [...validNews]
		.sort((a, b) => a.sentiment_score! - b.sentiment_score!)
		.slice(0, 5);

	const topBullishCoins = coinData?.bullish || [];
	const topBearishCoins = coinData?.bearish || [];

	return (
		<GlassCard>
			<div
				id="leaderboard"
				className="flex flex-col items-center gap-4 mb-6"
			>
				<div className="text-center">
					<h3 className="text-lg font-semibold text-[hsl(210,40%,98%)]">
						Leaderboards
					</h3>
					<p className="text-sm text-[hsl(0,0%,55%)]">
						{activeTab === "coins"
							? "Top performing coins"
							: "Top bullish & bearish news"}
					</p>
				</div>

				<PeriodFilter
					activePeriod={period}
					onPeriodChange={setPeriod}
					periods={["all", "30d", "7d", "24h"]}
				/>
			</div>

			{/* Tabs */}
			<div className="flex justify-center gap-2 mb-6">
				<button
					onClick={() => setActiveTab("coins")}
					className={`px-4 py-2 rounded-lg font-medium transition-all ${
						activeTab === "coins"
							? "bg-[hsl(0,0%,14%)] text-[hsl(210,40%,98%)]"
							: "bg-[hsl(0,0%,14%)]/30 text-[hsl(0,0%,55%)] hover:bg-[hsl(0,0%,14%)]/50"
					}`}
				>
					Coins
				</button>
				<button
					onClick={() => setActiveTab("news")}
					className={`px-4 py-2 rounded-lg font-medium transition-all ${
						activeTab === "news"
							? "bg-[hsl(0,0%,14%)] text-[hsl(210,40%,98%)]"
							: "bg-[hsl(0,0%,14%)]/30 text-[hsl(0,0%,55%)] hover:bg-[hsl(0,0%,14%)]/50"
					}`}
				>
					News
				</button>
			</div>

			{activeTab === "coins" ? (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Top Bullish Coins */}
					<div>
						<div className="flex items-center gap-3 mb-5">
							<div className="p-2 rounded-lg bg-[hsl(142,76%,45%)]/10">
								<svg
									className="w-5 h-5 text-[hsl(142,76%,45%)]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-[hsl(210,40%,98%)]">
								Top Positive Sentiment
							</h3>
						</div>
						<div className="space-y-3">
							{topBullishCoins.map((coin, index) => (
								<CoinLeaderboardItem
									key={coin.ticker}
									coin={coin}
									index={index}
									type="bullish"
								/>
							))}
						</div>
					</div>

					{/* Top Bearish Coins */}
					<div>
						<div className="flex items-center gap-3 mb-5">
							<div className="p-2 rounded-lg bg-[hsl(0,84%,60%)]/10">
								<svg
									className="w-5 h-5 text-[hsl(0,84%,60%)]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-[hsl(210,40%,98%)]">
								Top Negative Sentiment
							</h3>
						</div>
						<div className="space-y-3">
							{topBearishCoins.map((coin, index) => (
								<CoinLeaderboardItem
									key={coin.ticker}
									coin={coin}
									index={index}
									type="bearish"
								/>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Top Bullish News */}
					<div>
						<div className="flex items-center gap-3 mb-5">
							<div className="p-2 rounded-lg bg-[hsl(142,76%,45%)]/10">
								<svg
									className="w-5 h-5 text-[hsl(142,76%,45%)]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-[hsl(210,40%,98%)]">
								Top Positive Sentiment
							</h3>
						</div>
						<div className="space-y-3">
							{topBullishNews.map((news, index) => (
								<NewsLeaderboardItem
									key={news.id}
									news={news}
									index={index}
									type="bullish"
								/>
							))}
						</div>
					</div>

					{/* Top Bearish News */}
					<div>
						<div className="flex items-center gap-3 mb-5">
							<div className="p-2 rounded-lg bg-[hsl(0,84%,60%)]/10">
								<svg
									className="w-5 h-5 text-[hsl(0,84%,60%)]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-[hsl(210,40%,98%)]">
								Top Negative Sentiment
							</h3>
						</div>
						<div className="space-y-3">
							{topBearishNews.map((news, index) => (
								<NewsLeaderboardItem
									key={news.id}
									news={news}
									index={index}
									type="bearish"
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</GlassCard>
	);
}
