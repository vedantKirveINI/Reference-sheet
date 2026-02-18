import { GRID_DEFAULT } from "@/config/grid";
import { DEFAULT_COLOUR, YES_NO_COLOUR_MAPPING } from "@/constants/colours";
import { drawScqChip } from "@/cell-level/renderers/scq/utils/drawScqChip";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";
import { validateYesNo } from "./utils/validateYesNo";
import type {
	IYesNoCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";

const { cellHorizontalPadding, cellVerticalPaddingSM } = GRID_DEFAULT;
const CHIP_HEIGHT = 20;

const normalizeYesNoValue = (cell: IYesNoCell): "Yes" | "No" | "Other" | "" => {
	if (cell.data) {
		return cell.data as "Yes" | "No" | "Other" | "";
	}
	if (cell.displayData) {
		if (/^yes$/i.test(cell.displayData)) return "Yes";
		if (/^no$/i.test(cell.displayData)) return "No";
		if (/^other$/i.test(cell.displayData)) return "Other";
	}
	return "";
};

export const yesNoRenderer = {
	type: "YesNo" as const,

	measure(cell: IYesNoCell, props: ICellMeasureProps): ICellMeasureResult {
		const { width, height } = props;
		const normalized = normalizeYesNoValue(cell);

		if (!normalized) {
			return { width, height, totalHeight: height };
		}

		return { width, height, totalHeight: height };
	},

	draw(cell: IYesNoCell, props: ICellRenderProps) {
		const { ctx, rect, theme } = props;
		const { x, y, width, height } = rect;

		// Get the original value - keep it intact, don't manipulate
		const cellValue = cell.data || cell.displayData || "";

		// Get 'other' option - it's a boolean property, not checking if "Other" is in array
		const other = cell.other || false;

		// Validate the original value
		const { isValid, newValue } = validateYesNo({
			value:
				typeof cellValue === "string" ? cellValue : String(cellValue),
			other,
		});

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		if (
			!isValid &&
			cellValue !== null &&
			cellValue !== undefined &&
			cellValue !== ""
		) {
			// Show error cell with the original invalid value (don't manipulate it)
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: String(cellValue),
			});
			return;
		}

		// Use the validated value (which keeps original if valid) or original value if empty
		// The validation returns the original value if valid, so we use that
		const displayValue = newValue || "";

		if (!displayValue) {
			return;
		}

		const color = YES_NO_COLOUR_MAPPING[displayValue] ?? DEFAULT_COLOUR;

		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		const chipX = x + cellHorizontalPadding;
		const chipY = y + cellVerticalPaddingSM;

		drawScqChip({
			ctx,
			x: chipX,
			y: chipY,
			text: displayValue,
			backgroundColor: color,
			textColor: theme.cellTextColor,
			fontSize: theme.fontSize,
			fontFamily: theme.fontFamily,
			borderRadius: displayValue === "Other" ? 4 : 16,
		});
	},
};
