import type {
	IGridTheme,
	IColumn,
	IColumnStatistics,
	IScrollState,
} from "@/types";
import type { CoordinateManager } from "@/managers/coordinate-manager";
import {
	FOOTER_HEIGHT,
	FOOTER_PADDING_HORIZONTAL,
	FOOTER_LABEL_VALUE_GAP,
	FOOTER_RECORD_COUNT_GAP,
	FOOTER_RECORD_COUNT_PILL_PADDING_H,
	FOOTER_RECORD_COUNT_PILL_PADDING_V,
	FOOTER_RECORD_COUNT_PILL_RADIUS,
	FOOTER_STAT_CELL_PADDING_H,
	FOOTER_STAT_HOVER_RADIUS,
} from "@/config/grid";
import { CellType } from "@/types";
import {
	StatisticsFunction,
	getStatisticDisplayName,
} from "@/stores/statisticsStore";
import { formatStatisticForFooter } from "@/utils/columnStatistics";

export const drawFooterBackground = (
	ctx: CanvasRenderingContext2D,
	{
		x,
		y,
		width,
		height,
		theme,
	}: {
		x: number;
		y: number;
		width: number;
		height: number;
		theme: IGridTheme;
	},
) => {
	// Solid footer background for a clear, elevated bar
	ctx.fillStyle =
		theme.footerBg || theme.columnHeaderBg || theme.cellBackgroundColor;
	ctx.fillRect(x, y, width, height);

	// Subtle shadow band above footer for depth
	if (theme.footerShadowColor) {
		ctx.save();
		ctx.fillStyle = theme.footerShadowColor;
		ctx.globalAlpha = 0.7;
		ctx.fillRect(x, y - 2, width, 2);
		ctx.globalAlpha = 1;
		ctx.restore();
	}

	// Clear top border (2px for a polished edge)
	const borderColor =
		theme.footerBorderColor || theme.cellLineColor || theme.cellBorderColor;
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + width, y);
	ctx.stroke();
	ctx.strokeStyle = borderColor;
	ctx.globalAlpha = 0.6;
	ctx.beginPath();
	ctx.moveTo(x, y + 1);
	ctx.lineTo(x + width, y + 1);
	ctx.stroke();
	ctx.globalAlpha = 1;
};

export const drawStatisticText = (
	ctx: CanvasRenderingContext2D,
	{
		x,
		y,
		text,
		theme,
		textAlign = "right",
		fontWeight,
		isSecondary,
		fontSize,
	}: {
		x: number;
		y: number;
		text: string;
		theme: IGridTheme;
		textAlign?: "left" | "center" | "right";
		fontWeight?: number;
		isSecondary?: boolean;
		fontSize?: number;
	},
) => {
	ctx.save();
	ctx.fillStyle = isSecondary
		? theme.footerTextSecondary ||
			theme.rowHeaderTextColor ||
			theme.cellTextColor
		: theme.footerTextPrimary ||
			theme.rowHeaderTextColor ||
			theme.cellTextColor;
	const size = fontSize ?? theme.fontSizeXS ?? 11;
	ctx.font = `${fontWeight ?? 400} ${size}px ${theme.fontFamily}`;
	ctx.textAlign = textAlign;
	ctx.textBaseline = "middle";
	ctx.fillText(text, x, y);
	ctx.restore();
};

const CHEVRON_WIDTH = 8;
const CHEVRON_HEIGHT = 5;
const CHEVRON_RIGHT_PADDING = 8;

/** Draw a small dropdown chevron (downward-pointing triangle) at the right edge of the cell. */
const drawFooterChevron = (
	ctx: CanvasRenderingContext2D,
	centerX: number,
	footerY: number,
	theme: IGridTheme,
) => {
	const centerY = footerY + FOOTER_HEIGHT / 2;
	const top = centerY - CHEVRON_HEIGHT / 2;
	const bottom = centerY + CHEVRON_HEIGHT / 2;
	const left = centerX - CHEVRON_WIDTH / 2;
	const right = centerX + CHEVRON_WIDTH / 2;
	ctx.save();
	ctx.fillStyle =
		theme.footerTextSecondary ||
		theme.rowHeaderTextColor ||
		theme.cellTextColor;
	ctx.beginPath();
	ctx.moveTo(centerX, bottom);
	ctx.lineTo(left, top);
	ctx.lineTo(right, top);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
};

const FOOTER_VALUE_FONT_SIZE = 12;
const FOOTER_LABEL_FONT_SIZE = 11;

export const drawColumnStatisticCell = (
	ctx: CanvasRenderingContext2D,
	{
		x,
		y,
		width,
		label,
		value,
		theme,
		isHovered = false,
	}: {
		x: number;
		y: number;
		width: number;
		label: string;
		value: string;
		theme: IGridTheme;
		isHovered?: boolean;
	},
) => {
	// Rounded hover background for a softer, UI-friendly look
	if (isHovered) {
		ctx.save();
		ctx.fillStyle =
			theme.footerHoverBg ||
			theme.cellHoverColor ||
			theme.cellBackgroundColor;
		const radius = FOOTER_STAT_HOVER_RADIUS;
		const hx = x + 2;
		const hy = y + 2;
		const hw = width - 4;
		const hh = FOOTER_HEIGHT - 4;
		if (typeof ctx.roundRect === "function") {
			ctx.beginPath();
			ctx.roundRect(hx, hy, hw, hh, radius);
			ctx.fill();
		} else {
			ctx.fillRect(hx, hy, hw, hh);
		}
		ctx.restore();
	}

	const cellRight = x + width;
	const paddingRight =
		FOOTER_STAT_CELL_PADDING_H + CHEVRON_WIDTH + CHEVRON_RIGHT_PADDING;
	const contentRight = cellRight - paddingRight;
	const centerY = y + FOOTER_HEIGHT / 2;

	ctx.save();
	ctx.font = `${FOOTER_VALUE_FONT_SIZE}px ${theme.fontFamily}`;
	const valueWidth = ctx.measureText(value).width;
	ctx.font = `${FOOTER_LABEL_FONT_SIZE}px ${theme.fontFamily}`;
	const labelWidth = ctx.measureText(label).width;
	ctx.restore();

	const valueX = contentRight;
	const labelX = valueX - valueWidth - FOOTER_LABEL_VALUE_GAP - labelWidth;

	// Value: slightly larger, medium weight
	drawStatisticText(ctx, {
		x: valueX,
		y: centerY,
		text: value,
		theme,
		textAlign: "right",
		fontWeight: 600,
		fontSize: FOOTER_VALUE_FONT_SIZE,
	});
	// Label: secondary, smaller
	drawStatisticText(ctx, {
		x: labelX,
		y: centerY,
		text: label,
		theme,
		textAlign: "left",
		isSecondary: true,
		fontSize: FOOTER_LABEL_FONT_SIZE,
	});

	drawFooterChevron(
		ctx,
		cellRight - CHEVRON_RIGHT_PADDING - CHEVRON_WIDTH / 2,
		y,
		theme,
	);
};

const STATISTIC_VALUE_MAP: Record<
	StatisticsFunction,
	keyof IColumnStatistics[string]
> = {
	[StatisticsFunction.Sum]: "sum",
	[StatisticsFunction.Average]: "avg",
	[StatisticsFunction.Min]: "min",
	[StatisticsFunction.Max]: "max",
	[StatisticsFunction.None]: "sum",
};

const getStatisticValue = (
	stats: IColumnStatistics[string],
	func: StatisticsFunction,
): number | undefined => {
	const key = STATISTIC_VALUE_MAP[func];
	return stats[key as keyof typeof stats] as number | undefined;
};

const drawColumnStatisticsForRegion = (
	ctx: CanvasRenderingContext2D,
	{
		columnIndices,
		columns,
		columnStatistics,
		columnStatisticConfig,
		coordinateManager,
		scrollState,
		footerY,
		theme,
		hoveredFooterColumnIndex,
	}: {
		columnIndices: number[];
		columns: IColumn[];
		columnStatistics: IColumnStatistics;
		columnStatisticConfig: Record<string, StatisticsFunction>;
		coordinateManager: CoordinateManager;
		scrollState: IScrollState;
		footerY: number;
		theme: IGridTheme;
		hoveredFooterColumnIndex: number | null;
	},
) => {
	for (const columnIndex of columnIndices) {
		const column = columns[columnIndex];
		if (!column || column.type !== CellType.Number) continue;

		const columnId = column.id;
		const stats = columnStatistics[columnId];
		if (!stats) continue;

		const statisticFunc =
			columnStatisticConfig[columnId] || StatisticsFunction.Sum;
		if (statisticFunc === StatisticsFunction.None) continue;

		const rawValue = getStatisticValue(stats, statisticFunc);
		if (rawValue === undefined) continue;

		const columnX = coordinateManager.getColumnRelativeOffset(
			columnIndex,
			scrollState.scrollLeft,
		);
		const columnWidth = coordinateManager.getColumnWidth(columnIndex);
		const statisticName = getStatisticDisplayName(statisticFunc);
		const { label, formattedValue } = formatStatisticForFooter(
			statisticName,
			rawValue,
		);

		drawColumnStatisticCell(ctx, {
			x: columnX,
			y: footerY,
			width: columnWidth,
			label,
			value: formattedValue,
			theme,
			isHovered: columnIndex === hoveredFooterColumnIndex,
		});
	}
};

export const drawFooterRegion = (
	ctx: CanvasRenderingContext2D,
	{
		containerWidth,
		footerY,
		theme,
		recordCount = 0,
		selectedRecordCount,
		rowHeaderWidth = 0,
		columnStatistics,
		columns,
		visibleColumnIndices,
		coordinateManager,
		scrollState,
		columnStatisticConfig,
		groupCount = 0,
		hasGrouping = false,
		freezeColumnCount = 0,
		freezeRegionWidth = 0,
		hoveredFooterColumnIndex = null,
	}: {
		containerWidth: number;
		footerY: number;
		theme: IGridTheme;
		recordCount?: number;
		selectedRecordCount?: number;
		rowHeaderWidth?: number;
		columnStatistics?: IColumnStatistics;
		columns?: IColumn[];
		visibleColumnIndices?: number[];
		coordinateManager?: CoordinateManager;
		scrollState?: IScrollState;
		columnStatisticConfig?: Record<string, StatisticsFunction>;
		groupCount?: number;
		hasGrouping?: boolean;
		freezeColumnCount?: number;
		freezeRegionWidth?: number;
		hoveredFooterColumnIndex?: number | null;
	},
) => {
	drawFooterBackground(ctx, {
		x: 0,
		y: footerY,
		width: containerWidth,
		height: FOOTER_HEIGHT,
		theme,
	});

	// Record count or group count with pill/badge for a polished look
	const countText = hasGrouping
		? `${groupCount} ${groupCount === 1 ? "group" : "groups"}`
		: `${selectedRecordCount ?? recordCount} ${(selectedRecordCount ?? recordCount) === 1 ? "record" : "records"}`;

	ctx.save();
	ctx.font = `500 12px ${theme.fontFamily}`;
	const countTextWidth = ctx.measureText(countText).width;
	ctx.restore();

	const pillPaddingH = FOOTER_RECORD_COUNT_PILL_PADDING_H;
	const pillPaddingV = FOOTER_RECORD_COUNT_PILL_PADDING_V;
	const pillRadius = FOOTER_RECORD_COUNT_PILL_RADIUS;
	const pillX = rowHeaderWidth + FOOTER_PADDING_HORIZONTAL;
	const pillW = countTextWidth + pillPaddingH * 2;
	const pillH = FOOTER_HEIGHT - pillPaddingV * 2;
	const pillY = footerY + (FOOTER_HEIGHT - pillH) / 2;

	const pillBg =
		theme.footerRecordCountBg ||
		theme.footerHoverBg ||
		theme.cellHoverColor;
	ctx.save();
	ctx.fillStyle = pillBg;
	if (typeof ctx.roundRect === "function") {
		ctx.beginPath();
		ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
		ctx.fill();
	} else {
		ctx.fillRect(pillX, pillY, pillW, pillH);
	}
	ctx.restore();

	drawStatisticText(ctx, {
		x: pillX + pillPaddingH,
		y: footerY + FOOTER_HEIGHT / 2,
		text: countText,
		theme,
		textAlign: "left",
		fontWeight: 500,
		fontSize: 12,
		isSecondary: false,
	});

	// Draw column statistics - split into frozen and scrollable regions (like column headers)
	if (
		!columnStatistics ||
		!columns ||
		!visibleColumnIndices ||
		!coordinateManager ||
		!scrollState ||
		!columnStatisticConfig
	) {
		return;
	}

	const frozenColumnIndices = visibleColumnIndices.filter(
		(index) => index < freezeColumnCount,
	);
	const scrollableColumnIndices = visibleColumnIndices.filter(
		(index) => index >= freezeColumnCount,
	);

	const renderRegion = (
		indices: number[],
		clipX: number,
		clipWidth: number,
	) => {
		if (indices.length === 0) return;

		ctx.save();
		ctx.beginPath();
		ctx.rect(clipX, footerY, clipWidth, FOOTER_HEIGHT);
		ctx.clip();

		drawColumnStatisticsForRegion(ctx, {
			columnIndices: indices,
			columns,
			columnStatistics,
			columnStatisticConfig,
			coordinateManager,
			scrollState,
			footerY,
			theme,
			hoveredFooterColumnIndex: hoveredFooterColumnIndex ?? null,
		});

		ctx.restore();
	};

	if (
		freezeColumnCount > 0 &&
		freezeRegionWidth > 0 &&
		frozenColumnIndices.length > 0
	) {
		renderRegion(frozenColumnIndices, 0, freezeRegionWidth);
	}

	if (scrollableColumnIndices.length > 0) {
		const scrollableStartX = freezeRegionWidth || rowHeaderWidth;
		renderRegion(
			scrollableColumnIndices,
			scrollableStartX,
			containerWidth - scrollableStartX,
		);
	}
};
