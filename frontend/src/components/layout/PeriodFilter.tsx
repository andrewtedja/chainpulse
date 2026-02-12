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
		<div className="inline-flex items-center gap-1 p-1 bg-white/5 rounded-lg">
			{periods.map((period) => {
				const isActive = activePeriod === period;
				return (
					<button
						key={period}
						onClick={() => onPeriodChange(period)}
						className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
							isActive
								? "bg-[#02D5E9]/80 text-white shadow-lg shadow-[#02D5E9]/60"
								: "text-gray-400 hover:text-white hover:bg-white/5"
						}`}
					>
						{period.toUpperCase()}
					</button>
				);
			})}
		</div>
	);
}
