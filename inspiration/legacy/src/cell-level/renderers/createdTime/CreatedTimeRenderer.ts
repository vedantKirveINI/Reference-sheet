/**
 * Created Time Cell Renderer
 * Renders formatted created-time string on canvas (read-only)
 * Inspired by sheets CreatedTimeRenderer and DateTimeRenderer pattern
 */
import { GRID_DEFAULT } from "@/config/grid";
import { drawMultiLineText } from "@/utils/baseRenderer";
import type {
	ICreatedTimeCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { formatDate } from "../dateTime/utils/formatDate";
import { getMergedDateOptions } from "../dateTime/utils/getMergedDateOptions";

const { cellHorizontalPadding, cellVerticalPaddingMD, cellTextLineHeight } =
	GRID_DEFAULT;

/** Default includeTime true to match sheets for Created Time */
const DEFAULT_INCLUDE_TIME = true;

export const createdTimeRenderer = {
	type: "CreatedTime" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Uses column options when present so height matches what draw() will show.
	 */
	measure(
		cell: ICreatedTimeCell,
		props: ICellMeasureProps,
	): ICellMeasureResult {
		const { ctx, theme, width, height } = props;
		const columnRawOptions = (props.column as { rawOptions?: Record<string, unknown> } | undefined)
			?.rawOptions;

		let textToMeasure: string | null = null;
		if (cell.data) {
			const { dateFormat, separator, includeTime, isTwentyFourHourFormat } =
				getMergedDateOptions(cell, columnRawOptions, DEFAULT_INCLUDE_TIME);
			textToMeasure = formatDate(
				cell.data,
				dateFormat as "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD",
				separator,
				includeTime,
				isTwentyFourHourFormat,
			);
		}
		if (!textToMeasure) {
			textToMeasure = cell.displayData || null;
		}
		if (!textToMeasure) {
			return { width, height, totalHeight: height };
		}

		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		const lineCount = drawMultiLineText(ctx, {
			text: textToMeasure,
			maxLines: Infinity,
			lineHeight: cellTextLineHeight,
			maxWidth: width - cellHorizontalPadding * 2,
			fill: theme.cellTextColor,
			fontSize: theme.fontSize,
			needRender: false,
		}).length;

		const totalHeight =
			cellVerticalPaddingMD + lineCount * cellTextLineHeight;
		const displayHeight = Math.max(
			height,
			cellVerticalPaddingMD + lineCount * cellTextLineHeight,
		);

		return {
			width,
			height: displayHeight,
			totalHeight,
		};
	},

	/**
	 * Draw cell content on canvas
	 * Uses column.rawOptions (current field config) when present so "Include Time" etc. drive the UI.
	 */
	draw(cell: ICreatedTimeCell, props: ICellRenderProps) {
		const { data } = cell;
		const { ctx, rect, theme, isActive } = props;
		const { x, y, width, height } = rect;

		if (!data) return;

		const columnRawOptions = (props.column as { rawOptions?: Record<string, unknown> } | undefined)
			?.rawOptions;
		const { dateFormat, separator, includeTime, isTwentyFourHourFormat } =
			getMergedDateOptions(cell, columnRawOptions, DEFAULT_INCLUDE_TIME);

		const formattedDate = formatDate(
			data,
			dateFormat as "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD",
			separator,
			includeTime,
			isTwentyFourHourFormat,
		);

		if (!formattedDate) return;

		const { cellTextColor, fontSize, fontFamily } = theme;

		ctx.font = `${fontSize}px ${fontFamily}`;

		const renderHeight = height - cellVerticalPaddingMD;
		const maxLines = isActive
			? Infinity
			: Math.max(Math.floor(renderHeight / cellTextLineHeight), 1);

		drawMultiLineText(ctx, {
			x: x + cellHorizontalPadding,
			y: y + cellVerticalPaddingMD,
			text: formattedDate,
			maxLines,
			lineHeight: cellTextLineHeight,
			maxWidth: width - cellHorizontalPadding * 2,
			fill: cellTextColor,
			fontSize,
			textAlign: "left",
			verticalAlign: "top",
			needRender: true,
		});
	},
};
