"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
	variable: "--font-sora",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<title>ChainPulse - AI-Powered Crypto Market Sentiment</title>
				<meta
					name="description"
					content="Analyze how global news impacts crypto market mood swings using AI-powered sentiment analysis with FinBERT"
				/>
			</head>
			<body
				className={`${sora.variable} antialiased bg-[#080A0C] text-white min-h-screen font-sans`}
			>
				<QueryClientProvider client={queryClient}>
					{children}
				</QueryClientProvider>
			</body>
		</html>
	);
}
