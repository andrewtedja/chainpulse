"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { GlassCard } from "@/components/common/GlassCard";
import { PeriodFilter } from "@/components/layout/PeriodFilter";
import type { Period } from "@/types/sentiment";
import { useCoinBubble } from "@/hooks/useCoinBubble";

interface CoinSentiment {
	ticker: string;
	name: string;
	sentiment_score: number;
	news_count: number;
}

interface BubbleNode extends CoinSentiment {
	radius: number;
	x?: number;
	y?: number;
}

// const dummyCoinData: CoinSentiment[] = [
// 	{ ticker: "BTC", name: "Bitcoin", sentiment_score: 0.65, news_count: 342 },
// 	{ ticker: "ETH", name: "Ethereum", sentiment_score: 0.42, news_count: 287 },
// 	{ ticker: "SOL", name: "Solana", sentiment_score: 0.78, news_count: 156 },
// 	{ ticker: "XRP", name: "Ripple", sentiment_score: -0.32, news_count: 134 },
// 	{ ticker: "DOGE", name: "Dogecoin", sentiment_score: 0.55, news_count: 89 },
// 	{ ticker: "DOT", name: "Polkadot", sentiment_score: -0.18, news_count: 67 },
// 	{ ticker: "SHIB", name: "Shiba Inu", sentiment_score: -0.15, news_count: 52 },
// 	{ ticker: "LINK", name: "Chainlink", sentiment_score: 0.52, news_count: 48 },
// 	{ ticker: "UNI", name: "Uniswap", sentiment_score: -0.45, news_count: 43 },
// 	{ ticker: "LTC", name: "Litecoin", sentiment_score: -0.08, news_count: 34 },
// 	{ ticker: "ADA", name: "Cardano", sentiment_score: 0.28, news_count: 78 },
// 	{ ticker: "AVAX", name: "Avalanche", sentiment_score: 0.35, news_count: 62 },
// 	{ ticker: "MATIC", name: "Polygon", sentiment_score: 0.18, news_count: 54 },
// 	{ ticker: "ATOM", name: "Cosmos", sentiment_score: 0.12, news_count: 41 },
// 	{ ticker: "APT", name: "Aptos", sentiment_score: 0.45, news_count: 38 },
// 	{ ticker: "ARB", name: "Arbitrum", sentiment_score: 0.22, news_count: 56 },
// 	{ ticker: "OP", name: "Optimism", sentiment_score: 0.31, news_count: 29 },
// 	{
// 		ticker: "NEAR",
// 		name: "NEAR Protocol",
// 		sentiment_score: -0.05,
// 		news_count: 27,
// 	},
// 	{ ticker: "SUI", name: "Sui", sentiment_score: 0.58, news_count: 44 },
// 	{ ticker: "TIA", name: "Celestia", sentiment_score: 0.33, news_count: 32 },
// ];

export function BubbleChart() {
	const [period, setPeriod] = useState<Period>("7d");
	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { data: coinData, isLoading: coinLoading } = useCoinBubble(period);

	useEffect(() => {
		if (!coinData) return;

		if (!svgRef.current || !containerRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		const width = containerRef.current.clientWidth;
		const height = 700;
		const padding = 50;

		svg.attr("width", width).attr("height", height);

		// Color scale: red → black → green
		const colorScale = d3
			.scaleLinear<string>()
			.domain([-1, 0, 1])
			.range(["#ff3333", "#121212", "#52d769"]);

		// Size scale based on news count
		const extent = d3.extent(coinData, (d) => d.news_count);
		const sizeScale = d3
			.scaleSqrt()
			.domain(extent as [number, number])
			.range([30, 80]);

		// Prepare nodes with better initial positioning
		const nodes: BubbleNode[] = coinData.map((d) => {
			const radius = sizeScale(d.news_count);
			return {
				...d,
				radius,
				x: padding + radius + Math.random() * (width - 2 * (padding + radius)),
				y: padding + radius + Math.random() * (height - 2 * (padding + radius)),
			};
		});

		// Force simulation with smoother movement
		const simulation = d3
			.forceSimulation<BubbleNode>(nodes)
			.velocityDecay(0.3)
			.alphaDecay(0.005)
			.force("charge", d3.forceManyBody().strength(30))
			.force("center", d3.forceCenter(width / 2, height / 2).strength(0.03))
			.force(
				"collision",
				d3
					.forceCollide()
					.radius((d) => (d as BubbleNode).radius + 8)
					.strength(0.8)
			)
			.force("x", d3.forceX(width / 2).strength(0.03))
			.force("y", d3.forceY(height / 2).strength(0.03));

		// Tooltip
		const tooltip = d3
			.select("body")
			.append("div")
			.attr("class", "bubble-tooltip")
			.style("position", "absolute")
			.style("background", "rgba(0, 0, 0, 0.8)")
			.style("color", "white")
			.style("padding", "12px")
			.style("border-radius", "8px")
			.style("font-size", "13px")
			.style("border", "1px solid #FFF")
			.style("pointer-events", "none")
			.style("opacity", 0)
			.style("z-index", 1000);

		// Bubble groups
		const bubbles = svg
			.selectAll(".bubble")
			.data(nodes)
			.enter()
			.append("g")
			.attr("class", "bubble")
			.style("cursor", "pointer");

		// Circles
		bubbles
			.append("circle")
			.attr("r", (d: BubbleNode) => d.radius)
			.attr("fill", (d: BubbleNode) => colorScale(d.sentiment_score))
			.attr("stroke", "#888")
			.attr("stroke-width", 1)
			.style("opacity", 0.9);

		// Ticker text
		bubbles
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.attr("fill", "white")
			.attr("font-weight", "bold")
			.attr("font-size", (d: BubbleNode) => Math.min(d.radius / 2.2, 14))
			.text((d: BubbleNode) => d.ticker)
			.style("pointer-events", "none");

		// Sentiment score text
		bubbles
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.attr("dy", (d: BubbleNode) => d.radius / 3.5)
			.attr("fill", "white")
			.attr("font-size", (d: BubbleNode) => Math.min(d.radius / 3.5, 10))
			.text((d: BubbleNode) =>
				d.sentiment_score > 0
					? `+${d.sentiment_score.toFixed(2)}`
					: d.sentiment_score.toFixed(2)
			)
			.style("pointer-events", "none");

		// Hover effects
		bubbles
			.on("mouseover", function (event: MouseEvent, d: BubbleNode) {
				d3.select(this)
					.select("circle")
					.transition()
					.duration(200)
					.attr("r", d.radius * 1.15)
					.style("opacity", 1);

				tooltip
					.style("opacity", 1)
					.html(
						`
            <strong>${d.name}</strong><br>
            Sentiment Score: ${d.sentiment_score.toFixed(3)}<br>
            News Articles: ${d.news_count}<br>
            Sentiment: ${
							d.sentiment_score > 0.1
								? "Bullish 🚀"
								: d.sentiment_score < -0.1
								? "Bearish 📉"
								: "Neutral ⚖️"
						}
          `
					)
					.style("left", event.pageX + 15 + "px")
					.style("top", event.pageY - 15 + "px");
			})
			.on("mouseout", function (_event: MouseEvent, d: BubbleNode) {
				d3.select(this)
					.select("circle")
					.transition()
					.duration(200)
					.attr("r", d.radius)
					.style("opacity", 0.9);

				tooltip.style("opacity", 0);
			})
			.on("click", function (_event: MouseEvent, d: BubbleNode) {
				d3.select(this)
					.select("circle")
					.transition()
					.duration(100)
					.attr("r", d.radius * 0.95)
					.transition()
					.duration(100)
					.attr("r", d.radius);
			});

		simulation.on("tick", () => {
			bubbles.attr("transform", (d: BubbleNode) => `translate(${d.x}, ${d.y})`);
		});

		return () => {
			tooltip.remove();
			simulation.stop();
		};
	}, [period, coinData]);

	return (
		<GlassCard>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h3 className="text-lg font-semibold text-white">
						News Sentiment Bubbles
					</h3>
					<p className="text-sm text-gray-400">
						Bubble size = news volume, color = sentiment
					</p>
				</div>

				<PeriodFilter
					activePeriod={period}
					onPeriodChange={setPeriod}
					periods={["24h", "7d"]}
				/>
			</div>

			<div className="w-full" ref={containerRef}>
				{coinLoading ? (
					<div className="flex items-center justify-center h-175">
						<div className="text-gray-400">Loading chart...</div>
					</div>
				) : !coinData || coinData.length === 0 ? (
					<div className="flex items-center justify-center h-175">
						<div className="text-gray-400">No data available</div>
					</div>
				) : (
					<svg ref={svgRef} className="w-full rounded-lg"></svg>
				)}

				{/* Legend */}
				<div className="flex flex-wrap items-center justify-center gap-6 mt-4">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-green-500 rounded-full"></div>
						<span className="text-sm text-gray-400">Bullish</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-black border border-white rounded-full"></div>
						<span className="text-sm text-gray-400">Neutral</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 bg-red-500 rounded-full"></div>
						<span className="text-sm text-gray-400">Bearish</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-6 h-6 border-2 border-white/80 rounded-full"></div>
						<span className="text-sm text-gray-400">Size = News Volume</span>
					</div>
				</div>
			</div>
		</GlassCard>
	);
}
