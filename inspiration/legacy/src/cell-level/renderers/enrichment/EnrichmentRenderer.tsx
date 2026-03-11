import { GRID_DEFAULT } from "@/config/grid";
import type {
	IEnrichmentCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { LoadingCell } from "../loading/LoadingCell";
import { PLAY_ICON } from "@/constants/Icons/commonIcons";

const { cellHorizontalPadding } = GRID_DEFAULT;

// Preload play icon image when module loads
let playIconImage: HTMLImageElement | null = null;
let playIconLoading = false;
let playIconLoadCallbacks: Array<() => void> = [];

// Preload the icon immediately when module loads
if (typeof window !== "undefined" && PLAY_ICON) {
	playIconLoading = true;
	const img = new Image();
	img.crossOrigin = "anonymous";
	img.onload = () => {
		playIconImage = img;
		playIconLoading = false;
		// Notify all callbacks that icon is loaded
		playIconLoadCallbacks.forEach((callback) => callback());
		playIconLoadCallbacks = [];
	};
	img.onerror = () => {
		playIconLoading = false;
		playIconLoadCallbacks = [];
	};
	img.src = PLAY_ICON;
}

/**
 * Register a callback to be called when icon finishes loading
 */
export function setIconLoadCallback(callback: (() => void) | null) {
	if (!callback) return;

	if (playIconImage && playIconImage.complete) {
		// Icon already loaded, call immediately
		callback();
	} else if (playIconLoading) {
		// Icon is loading, add to callbacks
		playIconLoadCallbacks.push(callback);
	}
}

/**
 * Draw play icon on canvas - only draws if icon is loaded
 */
function drawPlayIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
) {
	// Only draw if icon is loaded
	if (playIconImage && playIconImage.complete) {
		ctx.drawImage(playIconImage, x, y, size, size);
	}
	// If not loaded yet, don't draw anything (no placeholder)
}

export const enrichmentRenderer = {
	type: "Enrichment" as const,

	measure(
		cell: IEnrichmentCell,
		props: ICellMeasureProps,
	): ICellMeasureResult {
		const { width, height, theme, ctx } = props;

		ctx.save();
		ctx.font = `${theme.fontSize || 14}px ${theme.fontFamily || "Arial"}`;
		const textMetrics = ctx.measureText(cell.displayData || "");
		const textWidth = textMetrics.width;
		ctx.restore();

		// Add space for play icon (icon size + padding)
		const iconSize = theme.iconSizeSM || 20;
		const iconPadding = 8;
		const totalWidth =
			cellHorizontalPadding * 2 + textWidth + iconSize + iconPadding;

		return {
			width: Math.max(width, totalWidth),
			height,
			totalHeight: height,
		};
	},

	draw(cell: IEnrichmentCell, props: ICellRenderProps) {
		const { data, displayData } = cell;
		const { ctx, rect, theme, cellLoading, rowId, fieldId } = props;
		const { x, y, height, width } = rect;

		// Check if cell is loading
		// fieldId should be rawId (actual field ID), not column.id (dbFieldName)
		const isCellLoading =
			rowId && fieldId && cellLoading?.[rowId]?.[fieldId];

		if (isCellLoading) {
			// Render loading state
			LoadingCell.draw({
				ctx,
				rect,
				theme,
				shouldShowText: true,
				loadingText: "Enhancing data...",
			});
			return;
		}

		// Draw cell value
		const textColor = theme.cellTextColor || "#212121";
		const fontSize = theme.fontSize || 14;
		const iconSize = theme.iconSizeSM || 20;

		ctx.font = `${fontSize}px ${theme.fontFamily || "Arial"}`;
		ctx.fillStyle = textColor;
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";

		const textY = y + height / 2;
		const textX = x + cellHorizontalPadding;

		// Draw text (leave space for icon on the right)
		if (displayData) {
			const maxTextWidth = width - cellHorizontalPadding * 3 - iconSize;
			ctx.fillText(displayData, textX, textY, maxTextWidth);
		}

		// Draw play icon at the right side of the cell
		const iconX = x + width - cellHorizontalPadding - iconSize;
		const iconY = y + (height - iconSize) / 2;

		drawPlayIcon(ctx, iconX, iconY, iconSize);
	},
};
