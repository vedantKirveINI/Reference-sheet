import isEmpty from "lodash/isEmpty";

function getTextWidth({ text }) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	context.font = "13px Inter"; // 0.8125rem = 13px
	context.letterSpacing = "0.25px";
	return +context.measureText(text).width.toFixed(3);
}
/**
 * Calculates the width of a chip based on the text width and additional padding.
 *
 * The width is calculated as:
 * textWidth + (0.5 + 1.25 + 0.25 + 1) * 13
 * where:
 * - 0.5(8px) is the gap between text and cross icon
 * - 1.25(20px) is the icon width
 * - 0.25(4px) is the gap between chip
 * - 1(16px) is the chip's padding
 * - 13 is rem to px conversion value
 */
function getChipWidth({ text = "", withDeleteIcon = true }) {
	const textWidth = getTextWidth({ text });
	const iconWidth = withDeleteIcon ? 20 + 8 : 0;

	return +(textWidth + iconWidth + 4 + 16).toFixed(3);
}

/**
 * Calculates the height of a chip element.
 *
 * The height is calculated as the sum of the line height (1.25rem/20px),
 * gap between chips(0.25rem/4px) and the padding (0.31rem/5px top and 0.31rem/5px bottom).
 */
function getChipHeight() {
	return +(20 + 4 + 10).toFixed(3);
}

function calculateLimitValue({
	selectionValues = [],
	accumulatedWidth = 0,
	availableWidth = 0,
	visibleChips = [],
	chipWidth = 0,
}) {
	const remainingChipCount = selectionValues?.length - visibleChips?.length;

	// didnt used getChipWidth fn because it calc width as sum of gap, icon width, padding
	const overflowTextWidth =
		getTextWidth({ text: `+${remainingChipCount}` }) + 28;

	const widthWithOverflowText =
		accumulatedWidth - chipWidth + overflowTextWidth;

	if (widthWithOverflowText >= availableWidth && visibleChips?.length > 1) {
		visibleChips.pop();
		return {
			limitValueChip: `+${remainingChipCount + 1}`,
			overflowTextWidth,
		};
	}

	return {
		limitValueChip: `+${remainingChipCount}`,
		overflowTextWidth,
	};
}

const chipHeight = getChipHeight();

const useChipWidths = ({
	selectionValues,
	availableWidth,
	availableHeight,
	withDeleteIcon = true,
	isWrapped = false,
}) => {
	if (isEmpty(selectionValues)) {
		return { limitValue: "", visibleChips: [] };
	}

	if (isWrapped) {
		return { limitValue: "", visibleChips: selectionValues };
	}

	const firstChipWidth = getChipWidth({
		text: selectionValues?.[0],
		withDeleteIcon,
	});

	let accumulatedWidth = firstChipWidth;
	let accumulatedHeight = chipHeight;

	let limitValue = "";
	let limitValueChipWidth = 0;
	const visibleChips = !isEmpty(selectionValues) ? [selectionValues[0]] : [];

	for (let i = 1; i < selectionValues.length; i++) {
		const chipWidth = getChipWidth({
			text: selectionValues[i],
			withDeleteIcon,
		});

		accumulatedWidth += chipWidth;

		if (accumulatedWidth >= availableWidth) {
			accumulatedHeight += chipHeight;

			if (!isWrapped || accumulatedHeight >= availableHeight) {
				const { limitValueChip, overflowTextWidth } =
					calculateLimitValue({
						selectionValues,
						visibleChips,
						accumulatedWidth,
						chipWidth,
						availableWidth,
					});

				limitValue = limitValueChip;
				limitValueChipWidth = overflowTextWidth;

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
};

export default useChipWidths;
