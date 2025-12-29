"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/common/GlassCard";
import { NewsCard } from "@/components/news/NewsCard";
import { Pagination } from "@/components/news/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { PeriodFilter } from "@/components/layout/PeriodFilter";
import { useNews } from "@/hooks/useNews";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";
import type { Period } from "@/types/sentiment";

export default function NewsPage() {
	const [page, setPage] = useState(1);
	const [period, setPeriod] = useState<Period>("all");
	const [sentiment, setSentiment] = useState<string | undefined>(undefined);
	const [searchInput, setSearchInput] = useState("");

	const limit = 12;
	const debouncedSearch = useDebounce(searchInput, 500);

	const { data, isLoading } = useNews(page, limit, period, sentiment, debouncedSearch || undefined);

	return (
		<div className="min-h-screen">
			<Navbar />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
				<div className="mb-8">
					<h1
						className="text-4xl font-bold bg-linear-to-r from-[#02D5E9] to-cyan-400 bg-clip-text text-transparent mb-2"
						style={{ filter: "drop-shadow(0 0 40px rgba(2, 213, 233, 0.4))" }}
					>
						Market News
					</h1>
					<p className="text-gray-400">
						All crypto news with AI-powered sentiment analysis
					</p>
				</div>

				<GlassCard>
					<div className="space-y-4 mb-6">
						<div className="flex items-center justify-between">
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

							<Pagination
								currentPage={page}
								totalPages={data.pagination.total_pages}
								onPageChange={setPage}
							/>
						</>
					) : (
						<p className="text-center text-gray-400 py-12">
							No news available at the moment
						</p>
					)}
				</GlassCard>
			</main>

			<Footer />
		</div>
	);
}
