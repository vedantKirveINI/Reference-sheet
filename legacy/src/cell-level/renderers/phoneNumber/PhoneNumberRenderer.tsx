// Cell renderer for Phone Number type - Inspired by sheets project's PhoneNumberRenderer
import { GRID_DEFAULT } from "@/config/grid";
import type {
	IPhoneNumberCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { getCountry } from "./utils/countries";
import { validateAndParsePhoneNumber } from "./utils/phoneUtils";
import { drawFlagPlaceholder } from "./utils/drawFlag";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingMD } = GRID_DEFAULT;

// Constants for phone number rendering layout
const FLAG_WIDTH = 20; // Flag image width
const FLAG_HEIGHT = 15; // Flag image height
const FLAG_GAP = 6; // Gap between flag and country code
const COUNTRY_CODE_GAP = 4; // Gap between country code and expand icon
const EXPAND_ICON_WIDTH = 15; // Expand icon width
const VERTICAL_LINE_WIDTH = 1; // Vertical separator line width
const VERTICAL_LINE_GAP = 8; // Gap after vertical line before phone number

export const phoneNumberRenderer = {
	type: "PhoneNumber" as const,

	/**
	 * Measure cell dimensions without rendering
	 */
	measure(
		cell: IPhoneNumberCell,
		props: ICellMeasureProps,
	): ICellMeasureResult {
		const { data, displayData } = cell;
		const { ctx, theme, width, height } = props;

		// Validate and parse input
		const { isValid, parsedValue } = validateAndParsePhoneNumber(
			data || displayData,
		);

		if (!isValid || !parsedValue) {
			return { width, height, totalHeight: height };
		}

		// Set font for accurate measurement
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		// Calculate text widths (handle optional fields)
		const { countryCode, countryNumber, phoneNumber } = parsedValue;
		const phoneNumberText = phoneNumber || "";
		const phoneNumberWidth = ctx.measureText(phoneNumberText).width;

		// Calculate width components (only if fields exist)
		let totalWidth = cellHorizontalPadding;

		if (countryCode) {
			totalWidth += FLAG_WIDTH + FLAG_GAP;
		}

		if (countryNumber) {
			const countryCodeText = `+${countryNumber}`;
			const countryCodeWidth = ctx.measureText(countryCodeText).width;
			totalWidth += countryCodeWidth + COUNTRY_CODE_GAP;
		}

		if (countryCode || countryNumber) {
			totalWidth +=
				EXPAND_ICON_WIDTH +
				VERTICAL_LINE_GAP +
				VERTICAL_LINE_WIDTH +
				VERTICAL_LINE_GAP;
		}

		totalWidth += phoneNumberWidth + cellHorizontalPadding;

		// Return standard height (phone numbers are single line)
		// Use calculated width if it exceeds cell width, otherwise use cell width
		return {
			width: Math.max(width, totalWidth),
			height,
			totalHeight: height,
		};
	},

	/**
	 * Draw cell content on canvas
	 * Renders: Flag | +CountryCode | Expand Icon | | Phone Number
	 */
	draw(cell: IPhoneNumberCell, props: ICellRenderProps) {
		const { data, displayData } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, height } = rect;

		// Validate and parse input
		const { isValid, parsedValue } = validateAndParsePhoneNumber(
			data || displayData,
		);

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
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

		// If empty or no valid parsed value, don't render
		if (!parsedValue) {
			return;
		}

		const { countryCode, countryNumber, phoneNumber } = parsedValue;

		// Note: countryCode and countryNumber are optional - validation only checks that keys are allowed

		// Set font for rendering
		const { cellTextColor, fontSize, fontFamily } = theme;
		ctx.font = `${fontSize}px ${fontFamily}`;
		ctx.fillStyle = cellTextColor;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";

		// Top-aligned Y position
		const topY = y + cellVerticalPaddingMD;

		// Starting X position
		let currentX = x + cellHorizontalPadding;

		// 1. Draw flag image (only if countryCode exists and is valid)
		if (countryCode) {
			const country = getCountry(countryCode);
			if (country) {
				const flagY = topY;
				drawFlagPlaceholder(
					ctx,
					currentX,
					flagY,
					FLAG_WIDTH,
					FLAG_HEIGHT,
					countryCode,
				);
				currentX += FLAG_WIDTH + FLAG_GAP;
			}
		}

		// 2. Draw country code (+countryNumber) (only if countryNumber exists)
		if (countryNumber) {
			const countryCodeText = `+${countryNumber}`;
			ctx.fillText(countryCodeText, currentX, topY);
			currentX +=
				ctx.measureText(countryCodeText).width + COUNTRY_CODE_GAP;
		}

		// 3. Draw expand icon (only if we have countryCode or countryNumber)
		// This matches sheets repo behavior - expand icon shows when there's country info
		if (countryCode || countryNumber) {
			const expandIconSize = 8;
			const expandIconY = topY + FLAG_HEIGHT / 2;
			ctx.fillStyle = cellTextColor;
			ctx.beginPath();
			ctx.moveTo(currentX, expandIconY - expandIconSize / 2);
			ctx.lineTo(
				currentX + expandIconSize,
				expandIconY - expandIconSize / 2,
			);
			ctx.lineTo(
				currentX + expandIconSize / 2,
				expandIconY + expandIconSize / 2,
			);
			ctx.closePath();
			ctx.fill();
			currentX += EXPAND_ICON_WIDTH + VERTICAL_LINE_GAP;

			// 4. Draw vertical line separator (only if we have country info)
			const lineTop = topY;
			const lineBottom = topY + FLAG_HEIGHT;
			ctx.strokeStyle = "#E0E0E0"; // Light gray separator
			ctx.lineWidth = VERTICAL_LINE_WIDTH;
			ctx.beginPath();
			ctx.moveTo(currentX, lineTop);
			ctx.lineTo(currentX, lineBottom);
			ctx.stroke();
			currentX += VERTICAL_LINE_WIDTH + VERTICAL_LINE_GAP;
		}

		// 5. Draw phone number (if present)
		if (phoneNumber) {
			ctx.fillStyle = cellTextColor;
			ctx.fillText(phoneNumber, currentX, topY);
		} else if (!countryCode && !countryNumber) {
			// If no phone number and no country info, don't render anything (empty cell)
			return;
		}
	},
};
