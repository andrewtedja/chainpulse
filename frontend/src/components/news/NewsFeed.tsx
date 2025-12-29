"use client";

import { useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { NewsCard } from "./NewsCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useNews } from "@/hooks/useNews";
import { PeriodFilter } from "@/components/layout/PeriodFilter";
import { ArrowRight, Search } from "lucide-react";
import type { Period } from "@/types/sentiment";
import { useDebounce } from "@/hooks/useDebounce";

export function NewsFeed() {
	const [period, setPeriod] = useState<Period>("all");
	const [sentiment, setSentiment] = useState<string | undefined>(undefined);
	const [searchInput, setSearchInput] = useState("");

	const debouncedSearch = useDebounce(searchInput, 500);

	const { data, isLoading } = useNews(1, 50, period, sentiment, debouncedSearch || undefined);

	return (
		<GlassCard>
			<div className="space-y-4 mb-6">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-white">
							Latest Crypto News
						</h3>
						<p className="text-sm text-gray-400">
							Aggregated from top sources with AI sentiment analysis
						</p>
					</div>
					<PeriodFilter
						activePeriod={period}
						onPeriodChange={setPeriod}
						periods={["all", "24h", "7d"]}
					/>
				</div>

				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search news..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-[#02D5E9]/50"
						/>
					</div>

					<div className="flex gap-2">
						{["all", "positive", "neutral", "negative"].map((s) => (
							<button
								key={s}
								onClick={() => setSentiment(s === "all" ? undefined : s)}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									(s === "all" && !sentiment) || sentiment === s
										? "bg-[#02D5E9]/80 text-white"
										: "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
								}`}
							>
								{s.charAt(0).toUpperCase() + s.slice(1)}
							</button>
						))}
					</div>
				</div>
			</div>

			{isLoading ? (
				<LoadingSpinner />
			) : data?.data.length ? (
				<>
					<div className="space-y-4">
						{data.data.map((news) => (
							<NewsCard key={news.id} news={news} />
						))}
					</div>

					<div className="mt-6 text-center">
						<Link href="/news">
							<Button
								variant="ghost"
								className="text-[#46afe7] hover:text-[#1fdced]"
							>
								Load More Articles
								<ArrowRight className="w-4 h-4 ml-2" />
							</Button>
						</Link>
					</div>
				</>
			) : (
				<p className="text-center text-gray-400 py-8">No news available</p>
			)}
		</GlassCard>
	);
}
