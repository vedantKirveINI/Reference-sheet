// Chips component for displaying selected MCQ options
// Inspired by sheets project's Chips component
import React from "react";

interface ChipsProps {
	options: string[];
	visibleChips: string[];
	limitValue: string;
	limitValueChipWidth: number;
	handleSelectOption: (options: string[]) => void;
	isWrapped: boolean;
}

// Simple color palette for chips
const CHIP_COLORS = [
	"#E3F2FD", // Light blue
	"#F3E5F5", // Light purple
	"#E8F5E9", // Light green
	"#FFF3E0", // Light orange
	"#FCE4EC", // Light pink
	"#E0F2F1", // Light teal
	"#FFF9C4", // Light yellow
	"#F1F8E9", // Light lime
];

const getChipColor = (index: number): string => {
	return CHIP_COLORS[index % CHIP_COLORS.length];
};

export const Chips: React.FC<ChipsProps> = ({
	options,
	visibleChips,
	limitValue,
	limitValueChipWidth,
	handleSelectOption,
	isWrapped,
}) => {
	const removeOption = (optionToRemove: string) => {
		const updatedOptions = options.filter((opt) => opt !== optionToRemove);
		handleSelectOption(updatedOptions);
	};

	const displayChips = !visibleChips.length ? options : visibleChips;

	return (
		<div
			className={`flex items-center gap-1 overflow-hidden flex-1 ${isWrapped ? "flex-wrap" : "flex-nowrap"}`}
			style={{
				maxWidth: limitValueChipWidth
					? `calc(100% - ${limitValueChipWidth + 28}px)`
					: "100%",
			}}
		>
			{displayChips.map((option, index) => {
				const bgColor = getChipColor(index);

				return (
					<div
						key={`${option}_${index}`}
						className="inline-flex items-center gap-2 px-2 py-1 rounded text-[13px] leading-5 whitespace-nowrap h-7 box-border"
						style={{
							backgroundColor: bgColor,
						}}
					>
						<span className="flex-1 overflow-hidden text-ellipsis">{option}</span>
						<button
							className="flex items-center justify-center bg-transparent border-none cursor-pointer p-0 w-4 h-4 text-[#607d8b] shrink-0 transition-colors hover:text-[#455a64] [&_svg]:w-3 [&_svg]:h-3"
							onClick={(e) => {
								e.stopPropagation();
								removeOption(option);
							}}
							type="button"
							aria-label={`Remove ${option}`}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				);
			})}

			{limitValue && visibleChips.length > 0 && (
				<span className="inline-flex items-center gap-2 px-2 py-1 rounded text-[13px] leading-5 whitespace-nowrap h-7 box-border !bg-[#f5f5f5] text-[#757575] cursor-default">
					{limitValue}
				</span>
			)}
		</div>
	);
};
