/**
 * Chips component for displaying selected DropDown options
 * Adapted from MCQ's Chips component but handles both string and object options
 * Inspired by sheets project's Chips component
 */
import React from "react";
import type { DropDownOption } from "../utils/helper";
import { getDisplayValue, removeOption } from "../utils/helper";

interface ChipsProps {
	options: DropDownOption[];
	visibleChips: DropDownOption[];
	limitValue: string;
	limitValueChipWidth: number;
	handleSelectOption: (options: DropDownOption[]) => void;
	isWrapped: boolean;
}

const CHIP_COLORS = [
	"#E3F2FD",
	"#F3E5F5",
	"#E8F5E9",
	"#FFF3E0",
	"#FCE4EC",
	"#E0F2F1",
	"#FFF9C4",
	"#F1F8E9",
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
	const handleRemoveOption = (optionToRemove: DropDownOption) => {
		const updatedOptions = removeOption(optionToRemove, options);
		handleSelectOption(updatedOptions);
	};

	const displayChips = !visibleChips.length ? options : visibleChips;

	return (
		<div
			className={`flex items-center gap-1 overflow-hidden flex-1 min-w-0 ${isWrapped ? "flex-wrap items-start overflow-visible w-full" : "flex-nowrap"}`}
			style={{
				maxWidth:
					isWrapped || !limitValueChipWidth
						? "100%"
						: `calc(100% - ${limitValueChipWidth + 28}px)`,
			}}
		>
			{displayChips.map((option, index) => {
				const bgColor = getChipColor(index);
				const displayText = getDisplayValue(option);

				return (
					<div
						key={`${typeof option === "string" ? option : option.id}_${index}`}
						className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[13px] leading-5 whitespace-nowrap shrink-0 relative"
						style={{
							backgroundColor: bgColor,
						}}
					>
						<span className="text-[#333] font-normal">{displayText}</span>
						<button
							className="flex items-center justify-center w-4 h-4 border-none bg-transparent cursor-pointer p-0 text-[#666] transition-colors shrink-0 hover:text-[#333] [&_svg]:w-full [&_svg]:h-full"
							onClick={(e) => {
								e.stopPropagation();
								handleRemoveOption(option);
							}}
							type="button"
							aria-label={`Remove ${displayText}`}
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
				<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[13px] leading-5 whitespace-nowrap shrink-0 relative bg-[#f5f5f5] text-[#666] font-medium">
					{limitValue}
				</span>
			)}
		</div>
	);
};
