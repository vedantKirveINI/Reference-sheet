import type { IGroupCollection, IGroupLinearRow } from "@/types/grouping";
import type { IGridTheme } from "@/types";
import { getCellRenderer } from "@/cell-level/renderers";
import { drawRect } from "@/utils/baseRenderer";
import { drawSingleLineText } from "@/utils/baseRenderer";
import { cellHorizontalPadding, cellVerticalPaddingSM } from "@/config/grid";
import {
	GROUP_HEADER_COLORS,
	GROUP_BORDER_COLOR,
	GROUP_HEADER_PADDING,
	GROUP_HEADER_FONT,
	GROUP_TEXT_COLOR,
} from "@/theme/grouping";

interface DrawGroupRowProps {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	width: number;
	height: number;
	linearRow: IGroupLinearRow;
	groupCollection: IGroupCollection;
	theme: IGridTheme;
	columnIndex: number;
	rowIndex?: number;
	imageManager?: any;
	spriteManager?: any;
}

export const drawGroupRow = (props: DrawGroupRowProps): void => {
	const {
		ctx,
		x,
		y,
		width,
		height,
		linearRow,
		groupCollection,
		theme,
		columnIndex,
		rowIndex,
		imageManager,
		spriteManager,
	} = props;

	const { groupColumns, getGroupCell } = groupCollection;
	const depth = linearRow.depth ?? 0;
	const bgList = [
		GROUP_HEADER_COLORS.depth2,
		GROUP_HEADER_COLORS.depth1,
		GROUP_HEADER_COLORS.depth0,
	].slice(-groupColumns.length);
	const bgColor = bgList[depth] || GROUP_HEADER_COLORS.depth0;

	drawRect(ctx, {
		x,
		y,
		width,
		height,
		fill: bgColor,
	});

	drawRect(ctx, {
		x,
		y,
		width,
		height: 1,
		fill: GROUP_BORDER_COLOR.primary,
	});

	if (columnIndex !== 0) {
		return;
	}

	const groupColumn = groupColumns[depth];

	ctx.save();

	const iconSize = 16;
	const iconSpacing = GROUP_HEADER_PADDING.iconSpacing;
	const textX =
		x +
		GROUP_HEADER_PADDING.horizontal +
		iconSize +
		iconSpacing +
		depth * 20;

	const totalTextHeight =
		GROUP_HEADER_FONT.size +
		GROUP_HEADER_FONT.fieldValueGap +
		GROUP_HEADER_FONT.sizeValue;
	const startY = y + (height - totalTextHeight) / 2;
	const fieldNameY = startY + GROUP_HEADER_FONT.size / 2;
	const valueY =
		startY +
		GROUP_HEADER_FONT.size +
		GROUP_HEADER_FONT.fieldValueGap +
		GROUP_HEADER_FONT.sizeValue / 2;

	const fieldName = groupColumn?.name || `Field ${depth}` || "Unknown Field";

	let valueText = "";

	const isValueEmpty =
		linearRow.value === null ||
		linearRow.value === undefined ||
		linearRow.value === "";

	const cell = getGroupCell(linearRow.value, depth);

	if (cell && cell.displayData !== undefined && cell.displayData !== null) {
		valueText = String(cell.displayData);
	} else if (!isValueEmpty) {
		valueText = String(linearRow.value);
	}

	valueText = valueText.trim();
	if (isValueEmpty || !valueText || valueText === "") {
		valueText = "(EMPTY)";
	}

	let itemCountWidth = 0;
	let countText = "";
	if (linearRow.itemCount !== undefined && linearRow.itemCount !== null) {
		ctx.font = `${GROUP_HEADER_FONT.weightCount} ${GROUP_HEADER_FONT.sizeCount}px ${GROUP_HEADER_FONT.family}`;
		countText = `${linearRow.itemCount} ${linearRow.itemCount === 1 ? "item" : "items"}`;
		itemCountWidth =
			ctx.measureText(countText).width +
			GROUP_HEADER_PADDING.horizontal * 2;
	}

	ctx.font = `${GROUP_HEADER_FONT.weightValue} ${GROUP_HEADER_FONT.sizeValue}px ${GROUP_HEADER_FONT.family}`;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";

	const displayValue = valueText;

	ctx.save();
	const clipX = x;
	const clipY = y;
	const clipWidth = width - itemCountWidth;
	const clipHeight = height;
	ctx.beginPath();
	ctx.rect(clipX, clipY, clipWidth, clipHeight);
	ctx.clip();

	ctx.font = `${GROUP_HEADER_FONT.weight} ${GROUP_HEADER_FONT.size}px ${GROUP_HEADER_FONT.family}`;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.fillStyle = GROUP_TEXT_COLOR.accent;
	ctx.fillText(fieldName, textX, fieldNameY);

	ctx.font = `${GROUP_HEADER_FONT.weightValue} ${GROUP_HEADER_FONT.sizeValue}px ${GROUP_HEADER_FONT.family}`;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.fillStyle = GROUP_TEXT_COLOR.primary;
	ctx.fillText(displayValue, textX, valueY);

	ctx.restore();

	if (linearRow.itemCount !== undefined && linearRow.itemCount !== null) {
		ctx.font = `${GROUP_HEADER_FONT.weightCount} ${GROUP_HEADER_FONT.sizeCount}px ${GROUP_HEADER_FONT.family}`;
		ctx.fillStyle = GROUP_TEXT_COLOR.secondary;
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		const countX = x + width - GROUP_HEADER_PADDING.horizontal;
		ctx.fillText(countText, countX, valueY);
	}

	ctx.restore();
};
