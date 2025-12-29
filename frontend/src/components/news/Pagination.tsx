import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	const pages = [];
	const maxVisible = 5;

	let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
	const endPage = Math.min(totalPages, startPage + maxVisible - 1);

	if (endPage - startPage < maxVisible - 1) {
		startPage = Math.max(1, endPage - maxVisible + 1);
	}

	for (let i = startPage; i <= endPage; i++) {
		pages.push(i);
	}

	return (
		<div className="flex items-center justify-center gap-2 mt-8">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="border-white/20"
			>
				<ChevronLeft className="w-4 h-4" />
			</Button>

			{startPage > 1 && (
				<>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onPageChange(1)}
						className="w-10"
					>
						1
					</Button>
					{startPage > 2 && <span className="text-gray-500">...</span>}
				</>
			)}

			{pages.map((page) => (
				<Button
					key={page}
					variant="ghost"
					size="sm"
					onClick={() => onPageChange(page)}
					className={`w-10 ${
						page === currentPage
							? "bg-[#02D5E9] text-white hover:bg-[#02D5E9]/90"
							: "hover:bg-white/10"
					}`}
				>
					{page}
				</Button>
			))}

			{endPage < totalPages && (
				<>
					{endPage < totalPages - 1 && (
						<span className="text-gray-500">...</span>
					)}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onPageChange(totalPages)}
						className="w-10"
					>
						{totalPages}
					</Button>
				</>
			)}

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="border-white/20"
			>
				<ChevronRight className="w-4 h-4" />
			</Button>
		</div>
	);
}
