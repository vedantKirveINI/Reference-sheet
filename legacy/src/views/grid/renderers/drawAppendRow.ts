import type { IGridTheme } from "@/types";
import { drawRect } from "@/utils/baseRenderer";
import { PLUS_ICON } from "@/constants/Icons/commonIcons";

const appendRowIcon = new Image();
appendRowIcon.src = PLUS_ICON;

interface IAppendRowRenderProps {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	width: number;
	height: number;
	rowHeaderWidth: number;
	theme: IGridTheme;
	isHover?: boolean;
}

export const drawAppendRow = ({
	ctx,
	x,
	y,
	width,
	height,
	rowHeaderWidth,
	theme,
	isHover = false,
}: IAppendRowRenderProps) => {
	const { cellBackgroundColor, cellHoverColor, cellBorderColor } = theme;

	const fillColor = isHover ? cellHoverColor ?? "#f1f5f9" : cellBackgroundColor;

	drawRect(ctx, {
		x,
		y,
		width,
		height,
		fill: fillColor,
	});

	// bottom divider
	drawRect(ctx, {
		x,
		y: y + height - 1,
		width,
		height: 1,
		fill: cellBorderColor,
	});

	// draw plus icon centered inside row header area
	const iconCenterX = rowHeaderWidth / 2;
	const iconCenterY = y + height / 2;
	const iconSize = Math.min(20, rowHeaderWidth * 0.5);

	if (appendRowIcon.complete) {
		ctx.drawImage(
			appendRowIcon,
			iconCenterX - iconSize / 2,
			iconCenterY - iconSize / 2,
			iconSize,
			iconSize,
		);
	} else {
		ctx.save();
		ctx.strokeStyle = cellBorderColor;
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(iconCenterX - iconSize / 2, iconCenterY);
		ctx.lineTo(iconCenterX + iconSize / 2, iconCenterY);
		ctx.moveTo(iconCenterX, iconCenterY - iconSize / 2);
		ctx.lineTo(iconCenterX, iconCenterY + iconSize / 2);
		ctx.stroke();
		ctx.restore();
	}
};

