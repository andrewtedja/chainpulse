"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BarChart3, TrendingUp, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false);

	const links = [
		{ href: "/", label: "Dashboard", icon: TrendingUp },
		{ href: "/news", label: "News", icon: Newspaper },
		{ href: "#leaderboard", label: "Leaderboard", icon: BarChart3 },
	];

	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="flex items-center gap-2">
						<span className="font-bold text-xl text-foreground">
							Chain<span className="text-[#02D5E9]">pulse</span>
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-1">
						{links.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="flex items-center gap-2 px-5 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#13181c] transition-all duration-200"
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
						onClick={() => setIsOpen(!isOpen)}
					>
						{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
					</Button>
				</div>

				{/* Mobile Menu */}
				{isOpen && (
					<div className="md:hidden py-4 border-t border-border/30">
						<div className="flex flex-col gap-2">
							{links.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
									onClick={() => setIsOpen(false)}
								>
									<link.icon className="w-5 h-5" />
									<span className="font-medium">{link.label}</span>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
