// Inspired by Teable's base renderer utilities
import { LRUCache } from "lru-cache";

const singleLineTextInfoCache: LRUCache<
	string,
	{ text: string; width: number }
> = new LRUCache({
	max: 1000,
});

const multiLineTextInfoCache: LRUCache<string, ITextInfo[]> = new LRUCache({
	max: 1000,
});

export interface ITextInfo {
	text: string;
	width: number;
}

export interface IMultiLineTextProps {
	x?: number;
	y?: number;
	text: string;
	maxWidth: number;
	maxLines: number;
	isUnderline?: boolean;
	fontSize?: number;
	lineHeight?: number;
	fill?: string;
	textAlign?: "left" | "center" | "right";
	verticalAlign?: "top" | "middle" | "bottom";
	needRender?: boolean;
}

export interface ISingleLineTextProps {
	x?: number;
	y?: number;
	text: string;
	fill?: string;
	fontSize?: number;
	textAlign?: "left" | "center" | "right";
	verticalAlign?: "top" | "middle" | "bottom";
	maxWidth?: number;
	needRender?: boolean;
	isUnderline?: boolean;
}

export interface IRectProps {
	x: number;
	y: number;
	width: number;
	height: number;
	fill?: string;
	stroke?: string;
	radius?: number | { tl: number; tr: number; br: number; bl: number };
	opacity?: number;
}

// Multi-line text rendering with caching
export const drawMultiLineText = (
	ctx: CanvasRenderingContext2D,
	props: IMultiLineTextProps,
) => {
	const {
		x = 0,
		y = 0,
		text,
		maxWidth,
		maxLines,
		isUnderline,
		fontSize = 13,
		lineHeight = 22,
		fill = "black",
		textAlign = "left",
		verticalAlign = "middle",
		needRender = true,
	} = props;

	let lines: ITextInfo[] = [];
	const ellipsis = "...";
	const ellipsisWidth = ctx.measureText(ellipsis).width;
	let currentLine = "";
	let currentLineWidth = 0;

	const cacheKey = `${text}-${fontSize}-${maxWidth}-${maxLines}`;
	const cachedLines = multiLineTextInfoCache.get(cacheKey);

	if (cachedLines) {
		lines = cachedLines;
	} else {
		for (let i = 0; i < text.length; i++) {
			const char = text[i];

			if (char === "\n") {
				if (lines.length + 1 === maxLines && i < text.length - 1) {
					lines.push({
						text: currentLine + ellipsis,
						width: currentLineWidth + ellipsisWidth,
					});
					currentLine = "";
					currentLineWidth = 0;
					break;
				}
				lines.push({ text: currentLine, width: currentLineWidth });
				currentLine = "";
				currentLineWidth = 0;
				continue;
			}

			const charWidth = ctx.measureText(char).width;

			if (currentLineWidth + charWidth > maxWidth) {
				if (lines.length < maxLines - 1) {
					lines.push({ text: currentLine, width: currentLineWidth });
					currentLine = char;
					currentLineWidth = charWidth;
				} else {
					if (currentLineWidth + ellipsisWidth > maxWidth) {
						let tempLine = currentLine;
						let tempLineWidth = currentLineWidth;
						while (tempLineWidth + ellipsisWidth > maxWidth) {
							tempLine = tempLine.substring(
								0,
								tempLine.length - 1,
							);
							tempLineWidth -= ctx.measureText(
								tempLine[tempLine.length - 1],
							).width;
						}
						currentLine = tempLine;
						currentLineWidth = tempLineWidth;
					}
					lines.push({
						text: currentLine + ellipsis,
						width: currentLineWidth + ellipsisWidth,
					});
					break;
				}
			} else {
				currentLine += char;
				currentLineWidth += charWidth;
			}
		}

		if (lines.length < maxLines && currentLine !== "") {
			lines.push({ text: currentLine, width: currentLineWidth });
		}

		multiLineTextInfoCache.set(cacheKey, lines);
	}

	const offsetY = verticalAlign === "middle" ? fontSize / 2 : 0;

	if (needRender) {
		if (fill) {
			ctx.fillStyle = fill;
			ctx.strokeStyle = fill;
		}
		ctx.textAlign = textAlign;
		ctx.textBaseline = verticalAlign;

		for (let j = 0; j < lines.length; j++) {
			ctx.fillText(lines[j].text, x, y + j * lineHeight + offsetY);
			if (isUnderline) {
				const textWidth = ctx.measureText(lines[j].text).width;
				ctx.beginPath();
				ctx.moveTo(x, y + j * lineHeight + fontSize - 1);
				ctx.lineTo(x + textWidth, y + j * lineHeight + fontSize - 1);
				ctx.stroke();
			}
		}
	}

	return lines;
};

// Single-line text rendering with caching
export const drawSingleLineText = (
	ctx: CanvasRenderingContext2D,
	props: ISingleLineTextProps,
) => {
	const {
		x = 0,
		y = 0,
		text,
		fill,
		fontSize = 13,
		textAlign = "left",
		verticalAlign = "middle",
		maxWidth = Infinity,
		needRender = true,
		isUnderline = false,
	} = props;

	let width = 0;
	let displayText = "";

	const cacheKey = `${text}-${fontSize}-${maxWidth}`;
	const cachedTextInfo = singleLineTextInfoCache.get(cacheKey);

	if (cachedTextInfo) {
		width = cachedTextInfo.width;
		displayText = cachedTextInfo.text;
	} else {
		const ellipsis = "...";
		const ellipsisWidth = ctx.measureText(ellipsis).width;

		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			const charWidth = ctx.measureText(char).width;

			if (width + charWidth > maxWidth) break;

			displayText += char;
			width += charWidth;
		}

		const isDisplayEllipsis = displayText.length < text.length;
		if (isDisplayEllipsis) {
			while (width + ellipsisWidth > maxWidth && displayText.length > 0) {
				displayText = displayText.slice(0, -1);
				width -= ctx.measureText(
					displayText[displayText.length - 1],
				).width;
			}
			displayText =
				ctx.direction === "rtl"
					? ellipsis + displayText
					: displayText + ellipsis;
			width = Math.min(width + ellipsisWidth, maxWidth);
		} else {
			displayText = text;
		}

		singleLineTextInfoCache.set(cacheKey, { text: displayText, width });
	}

	if (needRender) {
		// Map verticalAlign to canvas textBaseline
		// 'top' -> 'top', 'middle' -> 'middle', 'bottom' -> 'bottom'
		const textBaselineMap: Record<string, CanvasTextBaseline> = {
			top: "top",
			middle: "middle",
			bottom: "alphabetic", // 'alphabetic' is the default baseline
		};
		const canvasTextBaseline = textBaselineMap[verticalAlign] || "alphabetic";
		
		// For 'middle', we need to add fontSize/2 to center the text
		// For 'top', we use the Y position as-is
		const offsetY = verticalAlign === "middle" ? fontSize / 2 : 0;
		const finalX = textAlign === "right" ? x + maxWidth : x;
		if (fill) {
			ctx.fillStyle = fill;
			ctx.strokeStyle = fill;
		}
		ctx.textAlign = textAlign;
		ctx.textBaseline = canvasTextBaseline;
		ctx.fillText(displayText, finalX, y + offsetY);
		if (isUnderline) {
			ctx.beginPath();
			ctx.moveTo(finalX, y + offsetY + fontSize / 2 - 1);
			ctx.lineTo(finalX + width, y + offsetY + fontSize / 2 - 1);
			ctx.stroke();
		}
	}

	return {
		text: displayText,
		width,
	};
};

// Rectangle drawing utility
export const drawRect = (ctx: CanvasRenderingContext2D, props: IRectProps) => {
	const {
		x,
		y,
		width,
		height,
		fill,
		stroke,
		radius: _radius,
		opacity,
	} = props;

	ctx.beginPath();
	if (fill) ctx.fillStyle = fill;
	if (stroke) ctx.strokeStyle = stroke;
	if (opacity) ctx.globalAlpha = opacity;

	if (_radius == null) {
		ctx.rect(x, y, width, height);
	} else {
		const radius =
			typeof _radius === "number"
				? { tl: _radius, tr: _radius, br: _radius, bl: _radius }
				: {
						tl: Math.min(_radius.tl, height / 2, width / 2),
						tr: Math.min(_radius.tr, height / 2, width / 2),
						bl: Math.min(_radius.bl, height / 2, width / 2),
						br: Math.min(_radius.br, height / 2, width / 2),
					};

		ctx.moveTo(x + radius.tl, y);
		ctx.arcTo(x + width, y, x + width, y + radius.tr, radius.tr);
		ctx.arcTo(
			x + width,
			y + height,
			x + width - radius.br,
			y + height,
			radius.br,
		);
		ctx.arcTo(x, y + height, x, y + height - radius.bl, radius.bl);
		ctx.arcTo(x, y, x + radius.tl, y, radius.tl);
	}
	ctx.closePath();

	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
};



export interface ILineProps {
	x: number;
	y: number;
	points: number[]; // successive dx, dy
	stroke?: string;
	lineWidth?: number;
	opacity?: number;
}

export const drawLine = (ctx: CanvasRenderingContext2D, props: ILineProps) => {
	const { x, y, points, stroke, lineWidth = 1, opacity } = props;
	if (!points.length) return;
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(x, y);
	for (let i = 0; i < points.length; i += 2) {
		const dx = points[i];
		const dy = points[i + 1];
		ctx.lineTo(x + dx, y + dy);
	}
	if (stroke) ctx.strokeStyle = stroke;
	ctx.lineWidth = lineWidth;
	if (opacity != null) ctx.globalAlpha = opacity;
	ctx.stroke();
	ctx.restore();
};

// Checkbox drawing interface - Inspired by Teable
export interface ICheckboxProps {
	x: number;
	y: number;
	size: number;
	radius?: number;
	fill?: string;
	stroke?: string;
	isChecked?: boolean;
}

// Draw checkbox - Inspired by Teable's drawCheckbox (line 350-379)
export const drawCheckbox = (
	ctx: CanvasRenderingContext2D,
	props: ICheckboxProps,
) => {
	const { x, y, size, radius = 4, fill, stroke, isChecked = false } = props;
	const dynamicSize = isChecked ? size : size - 1;

	ctx.beginPath();
	drawRect(ctx, {
		x,
		y,
		width: dynamicSize,
		height: dynamicSize,
		radius,
		fill,
		stroke,
	});

	if (stroke) ctx.strokeStyle = stroke;
	if (isChecked) {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x + size / 4.23, y + size / 1.97);
		ctx.lineTo(x + size / 2.42, y + size / 1.44);
		ctx.lineTo(x + size / 1.29, y + size / 3.25);

		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.lineWidth = 1.9;
		ctx.stroke();
		ctx.restore();
	}
};
