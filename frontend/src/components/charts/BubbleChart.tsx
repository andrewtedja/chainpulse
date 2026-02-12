"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { X } from "lucide-react";
import { GlassCard } from "@/components/common/GlassCard";
import { PeriodFilter } from "@/components/layout/PeriodFilter";
import type { Period } from "@/types/sentiment";
import { useCoinBubble } from "@/hooks/useCoinBubble";
import { ChartSkeleton } from "@/components/ui/skeletons/ChartSkeleton";

interface CoinSentiment {
	ticker: string;
	name: string;
	sentiment_score: number;
	news_count: number;
}

interface BubbleNode extends CoinSentiment, d3.SimulationNodeDatum {
	radius: number;
}

export function BubbleChart() {
	const [period, setPeriod] = useState<Period>("all");
	const [selectedCoin, setSelectedCoin] = useState<CoinSentiment | null>(null);
	const [isMobile, setIsMobile] = useState(false);

	const svgRef = useRef<SVGSVGElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const { data: coinData, isLoading: coinLoading } = useCoinBubble(period);

	// Detect mobile
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		if (!coinData) return;
		if (!svgRef.current || !containerRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll("*").remove();

		const width = containerRef.current.clientWidth;
		const isMobileView = width < 768;
		const height = isMobileView ? 400 : 600;
		const padding = isMobileView ? 30 : 50;

		svg.attr("width", width).attr("height", height);

		// Color scale: red → black → green
		const colorScale = d3
			.scaleLinear<string>()
			.domain([-1, 0, 1])
			.range(["#ff3333", "#121212", "#52d769"]);

		// Size scale based on news count - smaller on mobile
		const extent = d3.extent(coinData, (d) => d.news_count);
		const sizeRange: [number, number] = isMobileView ? [20, 45] : [30, 80];
		const sizeScale = d3
			.scaleSqrt()
			.domain(extent as [number, number])
			.range(sizeRange);

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

		// Clear any existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Force simulation with smoother, gentler movement
		const simulation = d3
			.forceSimulation<BubbleNode>(nodes)
			.velocityDecay(0.5)
			.alphaDecay(0.02)
			.force("charge", d3.forceManyBody().strength(10))
			.force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
			.force(
				"collision",
				d3
					.forceCollide()
					.radius((d) => (d as BubbleNode).radius + 4)
					.strength(1)
					.iterations(2)
			)
			.force("x", d3.forceX(width / 2).strength(0.05))
			.force("y", d3.forceY(height / 2).strength(0.05));

		// Store simulation ref
		simulationRef.current = simulation;

		intervalRef.current = setInterval(() => {
			simulation.alpha(0.08).restart();
		}, 4000);

		// Tooltip for desktop only
		const tooltip = d3
			.select("body")
			.append("div")
			.attr("class", "bubble-tooltip")
			.style("position", "absolute")
			.style("background", "rgba(0, 0, 0, 0.9)")
			.style("color", "white")
			.style("padding", "12px 16px")
			.style("border-radius", "8px")
			.style("font-size", "13px")
			.style("border", "1px solid rgba(255, 255, 255, 0.2)")
			.style("pointer-events", "none")
			.style("opacity", 0)
			.style("z-index", 1000)
			.style("box-shadow", "0 4px 20px rgba(0, 0, 0, 0.5)");

		// Bubble groups
		const bubbles = svg
			.selectAll(".bubble")
			.data(nodes)
			.enter()
			.append("g")
			.attr("class", "bubble")
			.style("cursor", isMobileView ? "pointer" : "grab");

		const defs = svg.append("defs");
		nodes.forEach((node, i) => {
			const gradientId = `gradient-${i}`;
			const gradient = defs
				.append("radialGradient")
				.attr("id", gradientId)
				.attr("cx", "30%")
				.attr("cy", "30%");

			const baseColor = colorScale(node.sentiment_score);
			gradient
				.append("stop")
				.attr("offset", "0%")
				.attr("stop-color", baseColor)
				.attr("stop-opacity", 1);
			gradient
				.append("stop")
				.attr("offset", "100%")
				.attr("stop-color", baseColor)
				.attr("stop-opacity", 0.7);
		});

		bubbles
			.append("circle")
			.attr("r", (d: BubbleNode) => d.radius)
			.attr("fill", (_d: BubbleNode, i: number) => `url(#gradient-${i})`)
			.attr("stroke", "rgba(255, 255, 255, 0.2)")
			.attr("stroke-width", 1)
			.style("opacity", 0.95);

		// Ticker text
		bubbles
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.attr("fill", "white")
			.attr("font-weight", "bold")
			.attr("font-size", (d: BubbleNode) => Math.min(d.radius / 2.2, isMobileView ? 12 : 14))
			.text((d: BubbleNode) => d.ticker)
			.style("pointer-events", "none")
			.style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)");

		// Sentiment score text
		bubbles
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.attr("dy", (d: BubbleNode) => d.radius / 3.5)
			.attr("fill", "white")
			.attr("font-size", (d: BubbleNode) => Math.min(d.radius / 3.5, isMobileView ? 9 : 10))
			.text((d: BubbleNode) =>
				d.sentiment_score > 0
					? `+${d.sentiment_score.toFixed(2)}`
					: d.sentiment_score.toFixed(2)
			)
			.style("pointer-events", "none")
			.style("text-shadow", "0 1px 3px rgba(0,0,0,0.8)");

		if (!isMobileView) {
			const drag = d3
				.drag<SVGGElement, BubbleNode>()
				.on("start", function (event, d) {
					if (!event.active) simulation.alphaTarget(0.3).restart();
					d.fx = d.x;
					d.fy = d.y;
					d3.select(this).style("cursor", "grabbing");
				})
				.on("drag", function (event, d) {
					d.fx = event.x;
					d.fy = event.y;
				})
				.on("end", function (event, d) {
					if (!event.active) simulation.alphaTarget(0);
					d.fx = null;
					d.fy = null;
					d3.select(this).style("cursor", "grab");
				});

			bubbles.call(drag);
		}

		const getSentimentInfo = (score: number) => {
			if (score > 0.1) return { label: "Bullish", color: "#52d769", emoji: "🚀" };
			if (score < -0.1) return { label: "Bearish", color: "#ff3333", emoji: "📉" };
			return { label: "Neutral", color: "#ffffff", emoji: "⚖️" };
		};

		bubbles
			.on("mouseover", function (event: MouseEvent, d: BubbleNode) {
				if (isMobileView) return;

				d3.select(this)
					.select("circle")
					.transition()
					.duration(200)
					.attr("r", d.radius * 1.15)
					.style("opacity", 1)
					.attr("stroke", "rgba(255, 255, 255, 0.5)")
					.attr("stroke-width", 2);

				const sentiment = getSentimentInfo(d.sentiment_score);
				tooltip
					.style("opacity", 1)
					.html(
						`
						<div style="font-weight: 600; margin-bottom: 4px;">${d.name}</div>
						<div style="color: #aaa; font-size: 12px;">
							Sentiment: <span style="color: ${sentiment.color}">${sentiment.emoji} ${sentiment.label}</span>
						</div>
						<div style="color: #aaa; font-size: 12px;">Score: ${d.sentiment_score.toFixed(3)}</div>
						<div style="color: #aaa; font-size: 12px;">News: ${d.news_count} articles</div>
						`
					)
					.style("left", event.pageX + 15 + "px")
					.style("top", event.pageY - 15 + "px");
			})
			.on("mouseout", function (_event: MouseEvent, d: BubbleNode) {
				if (isMobileView) return;

				d3.select(this)
					.select("circle")
					.transition()
					.duration(200)
					.attr("r", d.radius)
					.style("opacity", 0.95)
					.attr("stroke", "rgba(255, 255, 255, 0.2)")
					.attr("stroke-width", 1);

				tooltip.style("opacity", 0);
			})
			.on("click", function (_event: MouseEvent, d: BubbleNode) {
				if (isMobileView) {
					setSelectedCoin(d);
				} else {
					const circle = d3.select(this).select("circle");
					const currentR = parseFloat(circle.attr("r"));
					circle
						.transition()
						.duration(100)
						.attr("r", currentR * 0.9)
						.transition()
						.duration(150)
						.attr("r", currentR * 1.1)
						.transition()
						.duration(100)
						.attr("r", currentR);
				}
			});

		simulation.on("tick", () => {
			bubbles.attr("transform", (d: BubbleNode) => {
				// Keep bubbles within bounds
				d.x = Math.max(d.radius, Math.min(width - d.radius, d.x!));
				d.y = Math.max(d.radius, Math.min(height - d.radius, d.y!));
				return `translate(${d.x}, ${d.y})`;
			});
		});

		return () => {
			tooltip.remove();
			simulation.stop();
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [period, coinData]);

	const getSentimentInfo = (score: number) => {
		if (score > 0.1) return { label: "Bullish", color: "#52d769", emoji: "🚀", bg: "bg-green-500/20" };
		if (score < -0.1) return { label: "Bearish", color: "#ff3333", emoji: "📉", bg: "bg-red-500/20" };
		return { label: "Neutral", color: "#ffffff", emoji: "⚖️", bg: "bg-gray-500/20" };
	};

	return (
		<>
			<GlassCard>
				<div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
					<div className="text-center sm:text-left">
						<h3 className="text-lg font-semibold text-white">
							News Sentiment Bubbles
						</h3>
						<p className="text-sm text-gray-400">
							{isMobile
								? "Tap bubbles for details"
								: "Bubble size = news volume, color = sentiment"}
						</p>
					</div>

					<PeriodFilter
						activePeriod={period}
						onPeriodChange={setPeriod}
						periods={["all", "30d", "7d", "48h"]}
					/>
				</div>

				{/* Legend */}
				<div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-4">
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
						<span className="text-sm text-gray-400">Size = Volume</span>
					</div>
				</div>

				<div className="w-full" ref={containerRef}>
					{coinLoading ? (
						<ChartSkeleton height={600} showLegend={false} />
					) : !coinData || coinData.length === 0 ? (
						<div className="flex items-center justify-center" style={{ height: '600px' }}>
							<div className="text-gray-400">No data available</div>
						</div>
					) : (
						<svg ref={svgRef} className="w-full rounded-lg"></svg>
					)}
				</div>
			</GlassCard>

			{/* Mobile Modal */}
			{selectedCoin && isMobile && (
				<div
					className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
					onClick={() => setSelectedCoin(null)}
				>
					<div
						className="bg-card/98 backdrop-blur-xl border-t sm:border border-border/30 rounded-t-3xl sm:rounded-2xl w-full max-w-sm mx-auto animate-in slide-in-from-bottom duration-300"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Handle bar for swipe indicator */}
						<div className="flex justify-center pt-3 pb-2">
							<div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
						</div>

						{/* Content */}
						<div className="p-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className={`w-12 h-12 rounded-full flex items-center justify-center ${getSentimentInfo(selectedCoin.sentiment_score).bg}`}>
										<span className="text-2xl">{getSentimentInfo(selectedCoin.sentiment_score).emoji}</span>
									</div>
									<div>
										<h3 className="text-xl font-bold text-white">{selectedCoin.name}</h3>
										<p className="text-sm text-gray-400">{selectedCoin.ticker}</p>
									</div>
								</div>
								<button
									onClick={() => setSelectedCoin(null)}
									className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
								>
									<X className="w-5 h-5 text-gray-400" />
								</button>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-2 gap-3 mb-4">
								<div className="bg-white/5 rounded-xl p-4 text-center">
									<p className="text-xs text-gray-400 mb-1">Sentiment</p>
									<p
										className="text-2xl font-bold"
										style={{ color: getSentimentInfo(selectedCoin.sentiment_score).color }}
									>
										{selectedCoin.sentiment_score > 0 ? "+" : ""}{selectedCoin.sentiment_score.toFixed(3)}
									</p>
								</div>
								<div className="bg-white/5 rounded-xl p-4 text-center">
									<p className="text-xs text-gray-400 mb-1">News Articles</p>
									<p className="text-2xl font-bold text-white">{selectedCoin.news_count}</p>
								</div>
							</div>

							{/* Sentiment bar */}
							<div className="bg-white/5 rounded-xl p-4">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm text-gray-400">Market Sentiment</p>
									<span
										className="text-sm font-medium px-2 py-1 rounded-md"
										style={{
											backgroundColor: getSentimentInfo(selectedCoin.sentiment_score).color + "30",
											color: getSentimentInfo(selectedCoin.sentiment_score).color
										}}
									>
										{getSentimentInfo(selectedCoin.sentiment_score).label}
									</span>
								</div>
								<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full transition-all duration-500"
										style={{
											width: `${Math.abs(selectedCoin.sentiment_score) * 100}%`,
											backgroundColor: getSentimentInfo(selectedCoin.sentiment_score).color
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
