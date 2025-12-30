"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useRefresh } from "@/hooks/useRefresh";

export function Hero() {
	const { mutate: refresh, isPending } = useRefresh();

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
					</div>

					{/* Action Button */}
					<Button
						onClick={() => refresh()}
						disabled={isPending}
						size="lg"
						className="bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 text-white px-6 py-5 text-sm font-medium transition-all"
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`}
						/>
						{isPending ? "Refreshing..." : "Refresh Analysis"}
					</Button>
				</div>
			</div>
		</div>
	);
}
