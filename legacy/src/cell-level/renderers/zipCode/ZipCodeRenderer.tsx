// Zip code cell renderer - inspired by PhoneNumberRenderer and sheets ZipCodeRenderer
import { GRID_DEFAULT } from "@/config/grid";
import type {
	IZipCodeCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { drawFlagPlaceholder } from "../phoneNumber/utils/drawFlag";
import { getCountry } from "../phoneNumber/utils/countries";
import { validateAndParseZipCode } from "./utils/zipCodeUtils";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding = 8 } = GRID_DEFAULT;

const FLAG_WIDTH = 20;
const FLAG_HEIGHT = 15;
const FLAG_GAP = 6;
const ICON_WIDTH = 15;
const ICON_GAP = 6;
const EXPAND_ICON_SIZE = 8;
const VERTICAL_LINE_WIDTH = 1;
const VERTICAL_LINE_GAP = 6;

export const zipCodeRenderer = {
	type: "ZipCode" as const,
	measure(cell: IZipCodeCell, props: ICellMeasureProps): ICellMeasureResult {
		const { ctx, theme, width, height } = props;
		const { data, displayData } = cell;

		const { parsedValue } = validateAndParseZipCode(data || displayData);
		if (!parsedValue || !parsedValue.zipCode) {
			return { width, height, totalHeight: height };
		}

		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
		const zipTextWidth = ctx.measureText(parsedValue.zipCode).width;

		const flagSectionWidth =
			FLAG_WIDTH + FLAG_GAP + ICON_WIDTH + ICON_GAP + VERTICAL_LINE_WIDTH;
		const totalWidth =
			cellHorizontalPadding +
			flagSectionWidth +
			VERTICAL_LINE_GAP +
			zipTextWidth +
			cellHorizontalPadding;

		return {
			width: Math.max(width, totalWidth),
			height,
			totalHeight: height,
		};
	},
	draw(cell: IZipCodeCell, props: ICellRenderProps) {
		const { ctx, rect, theme } = props;
		const { data, displayData } = cell;

		// Validate the value - prioritize data over displayData
		// This is important because displayData might be empty for invalid data
		const valueToValidate =
			data !== null && data !== undefined ? data : displayData;
		const { isValid, parsedValue } =
			validateAndParseZipCode(valueToValidate);

		// Show error if invalid AND we have a value to validate
		// Match sheets repo pattern: show error for invalid values that are not empty
		// Check if we have any value (data or displayData) that's not empty
		const hasAnyValue =
			(data !== null && data !== undefined) ||
			(displayData !== null &&
				displayData !== undefined &&
				displayData !== "");

		if (!isValid && hasAnyValue) {
			// Show error cell with the invalid value
			// Prefer displayData if it's a non-empty string (contains the raw invalid value)
			// Otherwise use data (stringified if object) or displayData
			let errorValue: string;
			if (typeof displayData === "string" && displayData !== "") {
				errorValue = displayData;
			} else if (data !== null && data !== undefined) {
				errorValue =
					typeof data === "string" ? data : JSON.stringify(data);
			} else {
				errorValue = String(valueToValidate || "");
			}

			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: errorValue,
			});
			return;
		}

		if (!parsedValue || !parsedValue.zipCode) {
			return;
		}

		const country = parsedValue.countryCode
			? getCountry(parsedValue.countryCode)
			: undefined;

		ctx.save();
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
		ctx.fillStyle = theme.cellTextColor;
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";

		const { x, y, height } = rect;
		const centerY = y + height / 2;
		let currentX = x + cellHorizontalPadding;

		if (country) {
			drawFlagPlaceholder(
				ctx,
				currentX,
				centerY - FLAG_HEIGHT / 2,
				FLAG_WIDTH,
				FLAG_HEIGHT,
				country.countryCode,
			);
			currentX += FLAG_WIDTH + FLAG_GAP;
		}

		// Draw expand icon (same shape as phone number renderer)
		ctx.fillStyle = theme.cellTextColor;
		ctx.beginPath();
		ctx.moveTo(currentX, centerY - EXPAND_ICON_SIZE / 2);
		ctx.lineTo(currentX + EXPAND_ICON_SIZE, centerY - EXPAND_ICON_SIZE / 2);
		ctx.lineTo(
			currentX + EXPAND_ICON_SIZE / 2,
			centerY + EXPAND_ICON_SIZE / 2,
		);
		ctx.closePath();
		ctx.fill();
		currentX += ICON_WIDTH + ICON_GAP;

		// Vertical separator
		ctx.beginPath();
		ctx.strokeStyle = "#E0E0E0";
		ctx.moveTo(currentX, centerY - 12);
		ctx.lineTo(currentX, centerY + 12);
		ctx.lineWidth = VERTICAL_LINE_WIDTH;
		ctx.stroke();
		currentX += VERTICAL_LINE_WIDTH + VERTICAL_LINE_GAP;

		// Zip code text
		ctx.fillStyle = theme.cellTextColor;
		ctx.fillText(parsedValue.zipCode, currentX, centerY);
		ctx.restore();
	},
};
