import { GRID_DEFAULT } from "@/config/grid";
import type {
	ICurrencyCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { drawFlagPlaceholder } from "../phoneNumber/utils/drawFlag";
import { validateAndParseCurrency } from "./utils/validateAndParseCurrency";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding = 8 } = GRID_DEFAULT;

const FLAG_WIDTH = 20;
const FLAG_HEIGHT = 15;
const FLAG_GAP = 6;
const TEXT_GAP = 6;
const ICON_WIDTH = 15;
const ICON_GAP = 6;
const VERTICAL_LINE_WIDTH = 1;
const VERTICAL_LINE_GAP = 8;

export const currencyRenderer = {
	type: "Currency" as const,
	measure(cell: ICurrencyCell, props: ICellMeasureProps): ICellMeasureResult {
		const { ctx, theme, width, height } = props;
		const { data, displayData } = cell;

		const { isValid, parsedValue: currencyData } = validateAndParseCurrency(
			data || displayData,
		);

		if (
			!currencyData ||
			(!currencyData.currencyCode &&
				!currencyData.currencySymbol &&
				!currencyData.currencyValue)
		) {
			return { width, height, totalHeight: height };
		}

		const { currencyCode, currencySymbol, currencyValue } = currencyData;
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		const codeWidth = ctx.measureText(currencyCode).width;
		const symbolWidth = ctx.measureText(currencySymbol).width;
		const valueWidth = ctx.measureText(currencyValue).width;

		const totalWidth =
			cellHorizontalPadding +
			FLAG_WIDTH +
			FLAG_GAP +
			codeWidth +
			TEXT_GAP +
			symbolWidth +
			TEXT_GAP +
			ICON_WIDTH +
			ICON_GAP +
			VERTICAL_LINE_WIDTH +
			VERTICAL_LINE_GAP +
			valueWidth +
			cellHorizontalPadding;

		return {
			width: Math.max(width, totalWidth),
			height,
			totalHeight: height,
		};
	},
	draw(cell: ICurrencyCell, props: ICellRenderProps) {
		const { ctx, rect, theme } = props;
		const { data, displayData } = cell;

		const { isValid, parsedValue: currencyData } = validateAndParseCurrency(
			data || displayData,
		);

		// Show error if invalid AND value is not empty/null
		const cellValue = data || displayData;
		if (
			!isValid &&
			cellValue !== null &&
			cellValue !== undefined &&
			cellValue !== ""
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value:
					typeof cellValue === "string"
						? cellValue
						: JSON.stringify(cellValue),
			});
			return;
		}

		if (
			!currencyData ||
			(!currencyData.currencyCode &&
				!currencyData.currencySymbol &&
				!currencyData.currencyValue)
		) {
			return;
		}

		const { x, y, height } = rect;
		const centerY = y + height / 2;
		let currentX = x + cellHorizontalPadding;

		ctx.save();
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
		ctx.fillStyle = theme.cellTextColor;
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";

		// Flag
		if (currencyData.countryCode) {
			drawFlagPlaceholder(
				ctx,
				currentX,
				centerY - FLAG_HEIGHT / 2,
				FLAG_WIDTH,
				FLAG_HEIGHT,
				currencyData.countryCode,
			);
		}
		currentX += FLAG_WIDTH + FLAG_GAP;

		// Currency code
		ctx.fillText(currencyData.currencyCode || "", currentX, centerY);
		currentX += ctx.measureText(currencyData.currencyCode || "").width;
		currentX += TEXT_GAP;

		// Currency symbol
		ctx.fillText(currencyData.currencySymbol || "", currentX, centerY);
		currentX += ctx.measureText(currencyData.currencySymbol || "").width;
		currentX += TEXT_GAP;

		// Chevron icon
		ctx.fillStyle = theme.cellTextColor;
		ctx.beginPath();
		ctx.moveTo(currentX, centerY - 4);
		ctx.lineTo(currentX + ICON_WIDTH, centerY - 4);
		ctx.lineTo(currentX + ICON_WIDTH / 2, centerY + 4);
		ctx.closePath();
		ctx.fill();
		currentX += ICON_WIDTH + ICON_GAP;

		// Divider
		ctx.strokeStyle = "#E0E0E0";
		ctx.lineWidth = VERTICAL_LINE_WIDTH;
		ctx.beginPath();
		ctx.moveTo(currentX, centerY - 12);
		ctx.lineTo(currentX, centerY + 12);
		ctx.stroke();
		currentX += VERTICAL_LINE_WIDTH + VERTICAL_LINE_GAP;

		// Currency value
		ctx.fillStyle = theme.cellTextColor;
		ctx.fillText(currencyData.currencyValue || "", currentX, centerY);

		ctx.restore();
	},
};
