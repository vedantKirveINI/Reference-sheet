/**
 * Hook to calculate chip widths and visible chips for DropDown editor
 * Adapted from MCQ's useChipWidths but handles both string and object options
 * Inspired by sheets project's useChipWidths
 */
import { useMemo } from "react";
import type { DropDownOption } from "../utils/helper";
import { getDisplayValue } from "../utils/helper";

function getTextWidth(text: string): number {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	if (!context) return 0;
	context.font = "13px Inter";
	context.letterSpacing = "0.25px";
	return +context.measureText(text).width.toFixed(3);
}

function getChipWidth(text: string, withDeleteIcon: boolean = true): number {
	const textWidth = getTextWidth(text);
	const iconWidth = withDeleteIcon ? 20 + 8 : 0; // icon width + gap
	const padding = 16; // chip padding
	const gap = 4; // gap between chips

	return +(textWidth + iconWidth + padding + gap).toFixed(3);
}

function getChipHeight(): number {
	return +(20 + 4 + 10).toFixed(3); // line height + gap + padding
}

interface UseChipWidthsProps {
	selectionValues: DropDownOption[]; // Can be strings or objects
	availableWidth: number;
	availableHeight: number;
	isWrapped: boolean;
}

export const useChipWidths = ({
	selectionValues,
	availableWidth,
	availableHeight,
	isWrapped,
}: UseChipWidthsProps) => {
	return useMemo(() => {
		if (selectionValues.length === 0) {
			return { limitValue: "", visibleChips: [], limitValueChipWidth: 0 };
		}

		// Extract labels for width calculation
		const labels = selectionValues.map((val) => getDisplayValue(val));

		if (isWrapped) {
			return {
				limitValue: "",
				visibleChips: selectionValues,
				limitValueChipWidth: 0,
			};
		}

		const chipHeight = getChipHeight();
		const firstChipWidth = getChipWidth(labels[0]);

		let accumulatedWidth = firstChipWidth;
		let accumulatedHeight = chipHeight;
		let limitValue = "";
		let limitValueChipWidth = 0;
		const visibleChips: DropDownOption[] = [selectionValues[0]];

		for (let i = 1; i < selectionValues.length; i++) {
			const chipWidth = getChipWidth(labels[i]);
			accumulatedWidth += chipWidth;

			if (accumulatedWidth >= availableWidth) {
				accumulatedHeight += chipHeight;

				if (!isWrapped || accumulatedHeight >= availableHeight) {
					const remainingChipCount =
						selectionValues.length - visibleChips.length;
					const overflowTextWidth =
						getTextWidth(`+${remainingChipCount}`) + 28;

					if (visibleChips.length > 1) {
						visibleChips.pop();
						limitValue = `+${remainingChipCount + 1}`;
						limitValueChipWidth = overflowTextWidth;
					} else {
						limitValue = `+${remainingChipCount}`;
						limitValueChipWidth = overflowTextWidth;
					}

					break;
				} else {
					accumulatedWidth = chipWidth;
					visibleChips.push(selectionValues[i]);
				}
			} else {
				visibleChips.push(selectionValues[i]);
			}
		}

		return { limitValue, visibleChips, limitValueChipWidth };
	}, [selectionValues, availableWidth, availableHeight, isWrapped]);
};







