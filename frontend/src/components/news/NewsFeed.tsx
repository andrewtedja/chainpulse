"use client";

import Link from "next/link";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { NewsCard } from "./NewsCard";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useNews } from "@/hooks/useNews";
import { ArrowRight } from "lucide-react";

export function NewsFeed() {
	const { data, isLoading } = useNews(1, 10);

	return (
		<GlassCard>
			<div className="flex items-center justify-between mb-6">
				<div>
					<h3 className="text-lg font-semibold text-white">
						Latest Crypto News
					</h3>
					<p className="text-sm text-gray-400">
						Aggregated from top sources with AI sentiment analysis
					</p>
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
