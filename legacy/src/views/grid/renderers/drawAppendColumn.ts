import type { IGridTheme, IMouseState, IScrollState } from "@/types";
import { RegionType } from "@/types";
import type { CoordinateManager } from "@/managers/coordinate-manager";
import { drawRect } from "@/utils/baseRenderer";
import { PLUS_ICON } from "@/constants/Icons/commonIcons";

const appendColumnIcon = new Image();
appendColumnIcon.src = PLUS_ICON;

interface IDrawAppendColumnProps {
	ctx: CanvasRenderingContext2D;
	theme: IGridTheme;
	coordInstance: CoordinateManager;
	scrollState: IScrollState;
	mouseState: IMouseState;
	appendColumnWidth: number;
	containerHeight: number;
	headerHeight: number;
	contentWidth: number;
}

export const drawAppendColumn = ({
	ctx,
	theme,
	coordInstance,
	scrollState,
	mouseState,
	appendColumnWidth,
	containerHeight,
	headerHeight,
	contentWidth,
}: IDrawAppendColumnProps) => {
	if (appendColumnWidth <= 0) return;

	const { scrollLeft } = scrollState;
	const isHover = mouseState.type === RegionType.AppendColumn;

	const {
		columnHeaderBg,
		columnHeaderBgHovered,
		cellHoverColor,
		iconSizeSM,
		cellBorderColor,
	} = theme;

	const x = contentWidth - scrollLeft;

	const baseFill = columnHeaderBg ?? theme.cellBackgroundColor;
	const hoverFill = columnHeaderBgHovered ?? cellHoverColor ?? baseFill;
	const strokeColor = cellBorderColor ?? "#d0d0d0";

	// Only draw rectangle in header area (remove white stripe)
	drawRect(ctx, {
		x,
		y: 0,
		width: appendColumnWidth,
		height: headerHeight,
		fill: isHover ? hoverFill : baseFill,
	});

	// Remove full-height vertical line - no longer needed
	// drawLine(ctx, {
	// 	x,
	// 	y: headerHeight,
	// 	points: [
	// 		0,
	// 		0,
	// 		0,
	// 		Math.max(
	// 			totalHeight - scrollTop - headerHeight,
	// 			containerHeight - headerHeight,
	// 		),
	// 	],
	// 	stroke: strokeColor,
	// });

	const iconBase = iconSizeSM ?? 16;
	const iconSize = Math.min(iconBase, appendColumnWidth * 0.5);
	const iconX = x + appendColumnWidth / 2 - iconSize / 2;
	const iconY = headerHeight / 2 - iconSize / 2;

	if (appendColumnIcon.complete) {
		ctx.drawImage(appendColumnIcon, iconX, iconY, iconSize, iconSize);
	} else {
		ctx.save();
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(iconX, iconY + iconSize / 2);
		ctx.lineTo(iconX + iconSize, iconY + iconSize / 2);
		ctx.moveTo(iconX + iconSize / 2, iconY);
		ctx.lineTo(iconX + iconSize / 2, iconY + iconSize);
		ctx.stroke();
		ctx.restore();
	}
};
