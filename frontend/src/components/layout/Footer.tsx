import { Badge } from "@/components/ui/badge";

export function Footer() {
	return (
		<footer className="bg-[#060607] border-t border-white/10 py-12">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* Copyright */}
					<div>
						<p className="text-gray-400 text-sm">
							© 2025 Chainpulse. All rights reserved.
						</p>
						<Badge
							variant="outline"
							className="mt-2 border-[#02D5E9]/50 text-[#02D5E9] bg-[#02D5E9]/10"
						>
							Andrew Tedjapratama
						</Badge>
					</div>

					{/* Data Sources */}
					<div>
						<h4 className="text-white font-semibold mb-3">Data Sources</h4>
						<div className="flex flex-wrap gap-2">
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								CryptoPanic
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								CoinDesk
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								CoinMarketCap
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								CoinGecko
							</Badge>
						</div>
					</div>

					{/* Powered By */}
					<div>
						<h4 className="text-white font-semibold mb-3">Powered By</h4>
						<div className="flex flex-wrap gap-2">
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								FinBERT
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								HuggingFace Transformers
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								Upstash Redis
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								FastAPI
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								Next.js
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								NeonDB
							</Badge>
							<Badge
								variant="secondary"
								className="text-xs bg-white/10 border border-white/20 text-gray-300"
							>
								Recharts + D3.js
							</Badge>
						</div>
					</div>
				</div>

				<div className="mt-8 pt-8 border-t border-white/10 text-center space-y-2">
					<p className="text-gray-500 text-sm">
						Market sentiment analysis powered by finance-tuned language models
					</p>
					<p className="text-gray-600 text-xs">
						© 2025 Andrew Tedjapratama. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
