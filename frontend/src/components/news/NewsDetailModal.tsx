"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
	X,
	ExternalLink,
	Calendar,
	TrendingUp,
	TrendingDown,
	Minus,
} from "lucide-react";
import { SentimentBadge } from "@/components/common/SentimentBadge";
import { formatRelativeTime } from "@/lib/utils";
import type { News } from "@/types/news";

interface NewsDetailModalProps {
	news: News;
	isOpen: boolean;
	onClose: () => void;
}

export function NewsDetailModal({
	news,
	isOpen,
	onClose,
}: NewsDetailModalProps) {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			window.addEventListener("keydown", handleEsc);
			document.body.style.overflow = "hidden";
		}
		return () => {
			window.removeEventListener("keydown", handleEsc);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const getSentimentColor = () => {
		if (!news.sentiment_score) return "text-gray-400";
		return news.sentiment_score > 0.1
			? "text-green-400"
			: news.sentiment_score < -0.1
			? "text-red-400"
			: "text-gray-400";
	};

	const getSentimentIcon = () => {
		if (!news.sentiment_score) return Minus;
		return news.sentiment_score > 0.1
			? TrendingUp
			: news.sentiment_score < -0.1
			? TrendingDown
			: Minus;
	};

	const SentimentIcon = getSentimentIcon();

	const modalContent = (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/80 backdrop-blur-sm z-9999 animate-in fade-in duration-200"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-10000 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[hsl(0,0%,8%)] border border-[hsl(0,0%,18%)] rounded-xl shadow-2xl pointer-events-auto animate-in zoom-in-95 duration-200"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Close Button */}
					<button
						onClick={onClose}
						className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
					>
						<X className="w-5 h-5 text-white" />
					</button>

					<div className="p-6 sm:p-8">
						<h2 className="text-xl font-bold text-white mb-4 pr-10">
							{news.title}
						</h2>

						<div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4" />
								<span>{formatRelativeTime(news.published_at)}</span>
							</div>
							{news.source && (
								<div className="flex items-center gap-2">
									<span className="text-[#02D5E9]">{news.source}</span>
								</div>
							)}
						</div>

						{news.sentiment_score !== null && news.sentiment_label && (
							<div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
								<div className="flex items-center justify-between flex-wrap gap-4">
									<div>
										<p className="text-sm text-gray-400 mb-1">
											Sentiment Analysis
										</p>
										<div className="flex items-center gap-3">
											<SentimentBadge label={news.sentiment_label} />
											<div className="flex items-center gap-2">
												<SentimentIcon
													className={`w-5 h-5 ${getSentimentColor()}`}
												/>
												<span
													className={`text-2xl font-bold ${getSentimentColor()}`}
												>
													{news.sentiment_score > 0 ? "+" : ""}
													{news.sentiment_score.toFixed(3)}
												</span>
											</div>
										</div>
									</div>

									<div className="w-full sm:w-48">
										<div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
											<div
												className="absolute inset-y-0 left-0 bg-linear-to-r from-red-500 via-gray-600 to-green-500 rounded-full"
												style={{ width: "100%" }}
											/>
											<div
												className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-900 shadow-lg transition-all duration-500 z-10"
												style={{
													left: `calc(${
														((news.sentiment_score + 1) / 2) * 100
													}% - 6px)`,
												}}
											/>
										</div>
										<div className="flex justify-between mt-1 text-xs text-gray-500">
											<span>Bearish</span>
											<span>Bullish</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{news.coins && news.coins.length > 0 && (
							<div className="mb-6">
								<p className="text-sm text-gray-400 mb-3">Related Coins</p>
								<div className="flex flex-wrap gap-2">
									{news.coins.map((coin, index) => (
										<div
											key={`${coin.ticker}-${index}`}
											className="px-3 py-1.5 rounded-full bg-[#02D5E9]/10 border border-[#02D5E9]/30 text-[#02D5E9] text-sm font-medium"
										>
											{coin.ticker} ({coin.name})
										</div>
									))}
								</div>
							</div>
						)}

						<div className="mb-6">
							<h1 className="text-md font-bold text-slate-300/50">
								News Description:
							</h1>
							<p className="text-base sm:text-lg text-gray-300 leading-relaxed">
								{news.content || "No description available for this article."}
							</p>
						</div>

						{/* Read More Button */}
						{news.url && (
							<a
								href={news.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-6 py-3 bg-[#02D5E9] hover:bg-[#02D5E9]/90 text-black font-semibold rounded-lg transition-colors"
							>
								Read Full Article
								<ExternalLink className="w-4 h-4" />
							</a>
						)}
					</div>
				</div>
			</div>
		</>
	);

	return createPortal(modalContent, document.body);
}
