import { Badge } from "@/components/ui/badge";
import { getSentimentBgColor, getSentimentColor, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentBadgeProps {
  label: "positive" | "neutral" | "negative" | null;
  className?: string;
}

export function SentimentBadge({ label, className }: SentimentBadgeProps) {
  if (!label) return null;

  const Icon =
    label === "positive"
      ? TrendingUp
      : label === "negative"
      ? TrendingDown
      : Minus;

  const displayLabel =
    label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1",
        getSentimentBgColor(label),
        className
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", getSentimentColor(label))} />
      <span className={cn("text-xs font-medium", getSentimentColor(label))}>
        {displayLabel}
      </span>
    </Badge>
  );
}
