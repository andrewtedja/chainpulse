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
				<link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
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
