"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/layout/Footer";
import { SentimentGauge } from "@/components/sentiment/SentimentGauge";
import { SentimentHistory } from "@/components/sentiment/SentimentHistory";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { DatabaseStats } from "@/components/dashboard/DatabaseStats";
import { Leaderboards } from "@/components/dashboard/Leaderboards";
import { NewsFeed } from "@/components/news/NewsFeed";
import { useSentiment } from "@/hooks/useSentiment";
import { SentimentGaugeSkeleton } from "@/components/ui/skeletons/SentimentGaugeSkeleton";

export default function Home() {
	const { data: sentimentData } = useSentiment("all");

	return (
		<div className="min-h-screen">
			<Navbar />
			<div className="pt-16">
				<Hero />
			</div>

			<main
				className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12"
				id="dashboard"
			>
				{/* Sentiment Overview Section */}
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					<div className="lg:col-span-2">
						{sentimentData ? (
							<SentimentGauge
								score={sentimentData.avg_sentiment}
								period="all"
								totalArticles={sentimentData.total_articles}
							/>
						) : (
							<SentimentGaugeSkeleton />
						)}
					</div>
					<div className="lg:col-span-3">
						<SentimentHistory />
					</div>
				</div>
				<div id="leaderboard">
					<Leaderboards />
				</div>
				<div id="bubble-chart">
					<BubbleChart />
				</div>
				<div id="news-feed">
					<NewsFeed />
				</div>
				<DatabaseStats />
			</main>

			<Footer />
		</div>
	);
}
