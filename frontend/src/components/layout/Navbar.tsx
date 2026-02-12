"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, BarChart3, TrendingUp, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	// Handle escape key to close drawer
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeDrawer();
			}
		};
		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [isOpen]);

	// Prevent body scroll when drawer is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	const closeDrawer = () => {
		setIsAnimating(true);
		setTimeout(() => {
			setIsOpen(false);
			setIsAnimating(false);
		}, 300); // Match animation duration
	};

	const openDrawer = () => {
		setIsOpen(true);
	};

	const links = [
		{ href: "/", label: "Dashboard", icon: TrendingUp },
		{ href: "/news", label: "News", icon: Newspaper },
		{ href: "/#leaderboard", label: "Leaderboard", icon: BarChart3 },
	];

	return (
		<>
			<nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Link href="/" className="flex items-center gap-2">
							<span className="font-bold text-xl text-foreground">
								Chain<span className="text-[#ffffff]">Pulse</span>
							</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-1">
							{links.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="flex items-center gap-2 px-5 py-3 rounded-lg text-muted-foreground  hover:bg-[#13181c] hover:text-[#02D5E9] hover:shadow-md transition-all duration-200"
								>
									<link.icon className="w-4 h-4" />
									<span className="text-sm font-medium">{link.label}</span>
								</Link>
							))}
						</div>

						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden text-muted-foreground"
							onClick={isOpen ? closeDrawer : openDrawer}
						>
							{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</Button>
					</div>
				</div>
			</nav>

			{/* Overlay */}
			{isOpen && (
				<div
					className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden ${
						isAnimating ? "overlay-exit" : "overlay-enter"
					}`}
					onClick={closeDrawer}
				/>
			)}

			{/* Mobile Drawer */}
			{isOpen && (
				<div
					className={`fixed top-0 right-0 h-screen w-72 max-w-[85vw] bg-background/98 backdrop-blur-xl border-l border-border/30 z-50 md:hidden ${
						isAnimating ? "drawer-exit" : "drawer-enter"
					}`}
				>
					{/* Drawer Header */}
					<div className="flex items-center justify-between h-16 px-6 border-b border-border/30">
						<Link
							href="/"
							className="flex items-center gap-2"
							onClick={closeDrawer}
						>
							<span className="font-bold text-xl text-foreground">
								Chain<span className="text-[#ffffff]">Pulse</span>
							</span>
						</Link>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground"
							onClick={closeDrawer}
						>
							<X className="w-5 h-5" />
						</Button>
					</div>

					{/* Drawer Content */}
					<div className="flex flex-col gap-2 p-4">
						{links.map((link, index) => (
							<Link
								key={link.href}
								href={link.href}
								className={`menu-item-enter menu-item-delay-${index + 1} flex items-center gap-3 px-4 py-4 rounded-xl text-muted-foreground hover:text-foreground hover:bg-[#13181c] transition-all duration-200`}
								onClick={closeDrawer}
							>
								<link.icon className="w-6 h-6" />
								<span className="text-lg font-medium">{link.label}</span>
							</Link>
						))}
					</div>

					{/* Drawer Footer */}
					<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30">
						<p className="text-xs text-center text-muted-foreground">
							Crypto Sentiment Intelligence
						</p>
					</div>
				</div>
			)}
		</>
	);
}
