import { Button } from "@/components/ui/button";
import type { Period } from "@/types/sentiment";

interface PeriodFilterProps {
  activePeriod: Period;
  onPeriodChange: (period: Period) => void;
  periods?: Period[];
}

export function PeriodFilter({
  activePeriod,
  onPeriodChange,
  periods = ["24h", "7d", "30d", "all"],
}: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
      {periods.map((period) => (
        <Button
          key={period}
          variant={activePeriod === period ? "default" : "ghost"}
          size="sm"
          onClick={() => onPeriodChange(period)}
          className="px-4"
        >
          {period.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
