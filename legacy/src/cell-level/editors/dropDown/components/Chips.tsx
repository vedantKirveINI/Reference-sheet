/**
 * Chips component for displaying selected DropDown options
 * Adapted from MCQ's Chips component but handles both string and object options
 * Inspired by sheets project's Chips component
 */
import React from "react";
import type { DropDownOption } from "../utils/helper";
import { getDisplayValue, removeOption } from "../utils/helper";
import styles from "./Chips.module.css";

interface ChipsProps {
	options: DropDownOption[];
	visibleChips: DropDownOption[];
	limitValue: string;
	limitValueChipWidth: number;
	handleSelectOption: (options: DropDownOption[]) => void;
	isWrapped: boolean;
}

// Simple color palette for chips (matches renderer)
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
	const handleRemoveOption = (optionToRemove: DropDownOption) => {
		const updatedOptions = removeOption(optionToRemove, options);
		handleSelectOption(updatedOptions);
	};

	const displayChips = !visibleChips.length ? options : visibleChips;

	return (
		<div
			className={`${styles.chips_container} ${isWrapped ? styles.wrap : ""}`}
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
						className={styles.chip}
						style={{
							backgroundColor: bgColor,
						}}
					>
						<span className={styles.chip_text}>{displayText}</span>
						<button
							className={styles.chip_close}
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
				<span className={`${styles.chip} ${styles.limit_value_chip}`}>
					{limitValue}
				</span>
			)}
		</div>
	);
};

