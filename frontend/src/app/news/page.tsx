"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/common/GlassCard";
import { NewsCard } from "@/components/news/NewsCard";
import { Pagination } from "@/components/news/Pagination";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useNews } from "@/hooks/useNews";

export default function NewsPage() {
	const [page, setPage] = useState(1);
	const limit = 12;
	const { data, isLoading } = useNews(page, limit);

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
