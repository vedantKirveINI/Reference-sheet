/**
 * Load error icon on canvas
 * Uses the error icon URL to load and display the image
 * Falls back to placeholder if image fails to load
 * Pattern: Follows FileUploadRenderer's drawFileIcon.ts
 */

import {
	ERROR_ICON_WIDTH,
	ERROR_ICON_HEIGHT,
} from "./constants";
import { ERROR_ICON } from "@/constants/Icons/commonIcons";

// Cache for loaded error icon image
const errorIconCache = new Map<string, HTMLImageElement>();

// Callback registry for triggering re-renders when icon loads
let onIconLoadCallback: (() => void) | null = null;

/**
 * Set callback to be called when icon finishes loading
 * This allows the grid to re-render when icon becomes available
 */
export function setErrorIconLoadCallback(callback: (() => void) | null) {
	onIconLoadCallback = callback;
}

/**
 * Load error icon from URL and cache it
 * Triggers re-render callback when icon finishes loading
 */
function loadErrorIcon(iconUrl: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (!iconUrl) {
			resolve(null);
			return;
		}

		// Check cache first
		const cached = errorIconCache.get(iconUrl);
		if (cached && cached.complete) {
			resolve(cached);
			return;
		}

		// Create new image
		const img = new Image();
		img.crossOrigin = "anonymous"; // Allow CORS for external images

		img.onload = () => {
			errorIconCache.set(iconUrl, img);
			// Trigger re-render callback so grid updates when icon loads
			if (onIconLoadCallback) {
				// Use requestAnimationFrame to batch multiple icon loads
				requestAnimationFrame(() => {
					onIconLoadCallback?.();
				});
			}
			resolve(img);
		};

		img.onerror = () => {
			// If icon fails to load, return null (will draw placeholder)
			resolve(null);
		};

		img.src = iconUrl;
	});
}

/**
 * Draw error icon on canvas - draws placeholder if icon not loaded
 * For immediate rendering, we'll use this and let icon load in background
 * When icon finishes loading, it triggers a re-render via callback
 */
export function drawErrorIcon(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
): void {
	const iconUrl = ERROR_ICON;

	if (!iconUrl) {
		// Draw placeholder for missing URL
		drawErrorIconPlaceholder(ctx, x, y);
		return;
	}

	// Check if icon is already loaded in cache
	const cached = errorIconCache.get(iconUrl);
	if (cached && cached.complete) {
		// Icon is loaded, draw it immediately
		ctx.drawImage(cached, x, y, ERROR_ICON_WIDTH, ERROR_ICON_HEIGHT);
		return;
	}

	// Draw placeholder while icon loads
	drawErrorIconPlaceholder(ctx, x, y);

	// Start loading icon in background
	// When it finishes loading, the callback will trigger a grid re-render
	loadErrorIcon(iconUrl);
}

/**
 * Draw placeholder for error icon (gray box with border)
 */
function drawErrorIconPlaceholder(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
): void {
	// Draw placeholder (gray box)
	ctx.fillStyle = "#E0E0E0";
	ctx.fillRect(x, y, ERROR_ICON_WIDTH, ERROR_ICON_HEIGHT);
	ctx.strokeStyle = "#CCCCCC";
	ctx.lineWidth = 1;
	ctx.strokeRect(x, y, ERROR_ICON_WIDTH, ERROR_ICON_HEIGHT);
}

export { ERROR_ICON_WIDTH, ERROR_ICON_HEIGHT };
