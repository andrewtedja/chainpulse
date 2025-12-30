"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRefresh } from "@/hooks/useRefresh";

export function Hero() {
	const { mutate: refresh, isPending } = useRefresh();
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const handleRefresh = () => {
		refresh(undefined, {
			onSuccess: () => {
				setLastUpdated(new Date());
			},
		});
	};

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="border-b border-white/10 bg-linear-to-b from-white/3 to-transparent">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-15 ">
				<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
					{/* Title Section */}
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#02D5E9]/10 border border-[#02D5E9]/20">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#02D5E9] opacity-75" />
								<span className="relative inline-flex rounded-full h-2 w-2 bg-[#02D5E9]" />
							</span>
							<span className="text-xs font-semibold text-[#02D5E9] uppercase tracking-wider">
								Chainpulse
							</span>
						</div>

						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
							Read the Market.
							<br />
							<span
								className="text-[#02D5E9]"
								style={{
									textShadow:
										"0 0 40px rgba(2, 213, 233, 0.1), 0 0 80px rgba(2, 213, 233, 0.3)",
								}}
							>
								Crypto Sentiment Intelligence
							</span>
						</h1>

						<p className="text-neutral-400 text-lg max-w-xl leading-relaxed">
							Analyze how millions of news articles and social signals impact
							market mood using our finance-tuned LLMs.
						</p>

						<div className="flex flex-wrap gap-3 pt-4">
							<button
								onClick={() => scrollToSection("leaderboard")}
								className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#02D5E9]/10 border border-white/10 hover:border-[#02D5E9]/30 text-gray-300 hover:text-[#02D5E9] text-sm font-medium transition-all duration-300"
							>
								Leaderboard
							</button>
							<button
								onClick={() => scrollToSection("bubble-chart")}
								className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#02D5E9]/10 border border-white/10 hover:border-[#02D5E9]/30 text-gray-300 hover:text-[#02D5E9] text-sm font-medium transition-all duration-300"
							>
								Bubble Chart
							</button>
							<button
								onClick={() => scrollToSection("news-feed")}
								className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#02D5E9]/10 border border-white/10 hover:border-[#02D5E9]/30 text-gray-300 hover:text-[#02D5E9] text-sm font-medium transition-all duration-300"
							>
								News Feed
							</button>
							<button
								onClick={() => scrollToSection("db-statistics")}
								className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-[#02D5E9]/10 border border-white/10 hover:border-[#02D5E9]/30 text-gray-300 hover:text-[#02D5E9] text-sm font-medium transition-all duration-300"
							>
								Database Statistics
							</button>
						</div>
					</div>

					{/* Action Button */}
					<div className="flex flex-col items-end gap-2">
						<Button
							onClick={handleRefresh}
							disabled={isPending}
							size="lg"
							className="group relative overflow-hidden bg-gradient-to-r from-white/10 to-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white px-8 py-6 text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:scale-105"
						>
							<span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
							<RefreshCw
								className={`w-5 h-5 mr-2 transition-transform duration-500 ${
									isPending ? "animate-spin" : "group-hover:rotate-180"
								}`}
							/>
							{isPending ? "Refreshing..." : "Refresh Analysis"}
						</Button>
						{lastUpdated && (
							<p className="text-xs text-gray-400">
								Last updated: {lastUpdated.toLocaleTimeString()}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
