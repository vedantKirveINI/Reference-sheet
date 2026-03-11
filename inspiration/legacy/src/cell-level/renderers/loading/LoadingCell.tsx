import { GRID_DEFAULT } from "@/config/grid";

const { cellHorizontalPadding } = GRID_DEFAULT;

interface LoadingCellProps {
	variant?: "rounded" | "rectangular";
	width?: string | number;
	height?: string | number;
	shouldShowText?: boolean;
	loadingText?: string;
	ctx: CanvasRenderingContext2D;
	rect: { x: number; y: number; width: number; height: number };
	theme: {
		fontSize?: number;
		fontFamily?: string;
		cellTextColor?: string;
	};
}

/**
 * Draw loading skeleton on canvas
 */
function drawLoadingSkeleton(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	variant: "rounded" | "rectangular" = "rounded",
) {
	// Create gradient for skeleton effect
	const gradient = ctx.createLinearGradient(x, y, x + width, y);
	gradient.addColorStop(0, "#F7F8F9");
	gradient.addColorStop(0.5, "#DDE5EA");
	gradient.addColorStop(1, "#F7F8F9");

	ctx.fillStyle = gradient;
	ctx.strokeStyle = "transparent";

	if (variant === "rounded") {
		const radius = 4;
		ctx.beginPath();
		// Use manual rounded rectangle drawing
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(
			x + width,
			y + height,
			x + width - radius,
			y + height,
		);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
		ctx.fill();
	} else {
		ctx.fillRect(x, y, width, height);
	}
}

/**
 * Draw loading text on canvas
 */
function drawLoadingText(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	text: string,
	theme: {
		fontSize?: number;
		fontFamily?: string;
		cellTextColor?: string;
	},
) {
	const fontSize = theme.fontSize || 14;
	const fontFamily = theme.fontFamily || "Arial";
	// Match sheets repo: color #607D8B for loading text
	const textColor = "#607D8B";

	ctx.font = `${fontSize}px ${fontFamily}`;
	ctx.fillStyle = textColor;
	ctx.textAlign = "center"; // Center align like sheets repo
	ctx.textBaseline = "middle";

	// Center the text in the cell
	const centerX = x + width / 2;
	ctx.fillText(text, centerX, y);
}

export const LoadingCell = {
	/**
	 * Draw loading state on canvas
	 */
	draw(props: LoadingCellProps) {
		const {
			variant = "rounded",
			width,
			height,
			shouldShowText = false,
			loadingText = "",
			ctx,
			rect,
			theme,
		} = props;

		const { x, y, width: rectWidth, height: rectHeight } = rect;

		if (shouldShowText && loadingText) {
			// Draw loading text (centered like sheets repo)
			const textY = y + rectHeight / 2;
			drawLoadingText(ctx, x, textY, rectWidth, loadingText, theme);
		} else {
			// Draw skeleton
			const skeletonWidth = width
				? typeof width === "string"
					? parseFloat(width)
					: width
				: rectWidth - cellHorizontalPadding * 2;
			const skeletonHeight = height
				? typeof height === "string"
					? parseFloat(height)
					: height
				: 20;

			const skeletonX = x + cellHorizontalPadding;
			const skeletonY = y + (rectHeight - skeletonHeight) / 2;

			drawLoadingSkeleton(
				ctx,
				skeletonX,
				skeletonY,
				skeletonWidth,
				skeletonHeight,
				variant,
			);
		}
	},
};
