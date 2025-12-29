import { ExternalLink } from "lucide-react";
import { SentimentBadge } from "@/components/common/SentimentBadge";
import { formatRelativeTime } from "@/lib/utils";
import type { News } from "@/types/news";

interface NewsCardProps {
	news: News;
}

export function NewsCard({ news }: NewsCardProps) {
	// Determine color based on sentiment_label (not score)
	const getScoreColor = () => {
		if (news.sentiment_label === "positive") return "text-green-400";
		if (news.sentiment_label === "negative") return "text-red-400";
		return "text-gray-400"; // neutral
	};

	return (
		<div className="p-4 rounded-xl bg-[#111418] hover:bg-[#161a20] border border-transparent hover:border-[#02D5E9] cursor-pointer transition-all duration-200 group">
			<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-white group-hover:text-[#02D5E9] transition-colors line-clamp-2 mb-2">
						{news.title}
						{news.url && (
							<ExternalLink className="inline-block w-3.5 h-3.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
						)}
					</h4>

					{news.content && (
						<p className="text-sm text-gray-400 line-clamp-2 mb-3">
							{news.content}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-3 text-sm">
						<span className="text-gray-500">
							{formatRelativeTime(news.published_at)}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-3 shrink-0">
					<SentimentBadge label={news.sentiment_label} />
					{news.sentiment_score !== null && (
						<span className={`font-bold text-lg ${getScoreColor()}`}>
							{(news.sentiment_score * 100).toFixed(0)}%
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
