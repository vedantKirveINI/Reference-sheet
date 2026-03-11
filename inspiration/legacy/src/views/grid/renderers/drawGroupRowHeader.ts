// Modern group row header renderer with eye-pleasing design
// Enhanced with better icons, colors, typography, and visual effects

import type { IGroupLinearRow, IGroupCollection } from "@/types/grouping";
import type { IGridTheme } from "@/types";
import { drawRect } from "@/utils/baseRenderer";
import {
	GROUP_HEADER_COLORS,
	GROUP_BORDER_COLOR,
	GROUP_HEADER_PADDING,
	GROUP_TEXT_COLOR,
	drawChevronIcon,
} from "@/theme/grouping";

interface DrawGroupRowHeaderProps {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	width: number;
	height: number;
	linearRow: IGroupLinearRow;
	theme: IGridTheme;
	groupCollection: IGroupCollection | null;
	depth: number;
	isCollapsed: boolean;
	spriteManager?: any;
}

export const drawGroupRowHeader = (props: DrawGroupRowHeaderProps): void => {
	const {
		ctx,
		x,
		y,
		width,
		height,
		theme,
		groupCollection,
		depth,
		isCollapsed,
	} = props;

	if (groupCollection == null) return;

	const { groupColumns } = groupCollection;

	if (!groupColumns.length) return;

	// Modern background colors with depth-based gradient
	const bgList = [
		GROUP_HEADER_COLORS.depth2,
		GROUP_HEADER_COLORS.depth1,
		GROUP_HEADER_COLORS.depth0,
	].slice(-groupColumns.length);
	const bgColor = bgList[depth] || GROUP_HEADER_COLORS.depth0;

	// Draw background (Airtable-exact: clean, minimal)
	drawRect(ctx, {
		x,
		y,
		width,
		height,
		fill: bgColor,
	});

	// Draw subtle top border (Airtable-exact: extremely subtle)
	drawRect(ctx, {
		x,
		y,
		width,
		height: 1,
		fill: GROUP_BORDER_COLOR.primary,
	});

	// Airtable-exact icon rendering (16px, precisely positioned)
	const iconSize = 16; // Airtable exact compact size
	const iconX = GROUP_HEADER_PADDING.horizontal + depth * 20; // Depth-based indentation (Airtable exact)
	const iconY = y + height / 2 - iconSize / 2; // Center vertically (Airtable exact)

	// Draw chevron icon (Airtable-exact)
	const iconColor = theme.rowHeaderTextColor || "#6b7280"; // Airtable exact medium gray
	drawChevronIcon(ctx, iconX, iconY, iconSize, isCollapsed, iconColor);
};
