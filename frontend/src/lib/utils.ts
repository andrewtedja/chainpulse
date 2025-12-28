import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function getSentimentColor(
  label: "positive" | "neutral" | "negative" | null
): string {
  switch (label) {
    case "positive":
      return "text-green-400";
    case "negative":
      return "text-red-400";
    case "neutral":
      return "text-gray-400";
    default:
      return "text-gray-500";
  }
}

export function getSentimentBgColor(
  label: "positive" | "neutral" | "negative" | null
): string {
  switch (label) {
    case "positive":
      return "bg-green-500/10 border-green-500/30";
    case "negative":
      return "bg-red-500/10 border-red-500/30";
    case "neutral":
      return "bg-gray-500/10 border-gray-500/30";
    default:
      return "bg-gray-500/10 border-gray-500/30";
  }
}
