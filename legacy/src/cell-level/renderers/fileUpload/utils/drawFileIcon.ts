/**
 * Draw file icon on canvas
 * - Image files: load URL as thumbnail; on error show generic image icon
 * - Non-image files: show file-type icon (PDF, CSV, Doc, etc.) from mimeType
 * - Missing mimeType: show DocIcon
 */

import { getFileIcon } from "./getFileIcon";
import {
	IMAGE_ICON,
	PDF_ICON,
	DOC_ICON,
	XLS_ICON,
	ZIP_ICON,
	AUDIO_ICON,
	VIDEO_ICON,
} from "@/constants/Icons/fileExtensionIcons";

const ICON_WIDTH = 24;
const ICON_HEIGHT = 24;

// Map getFileIcon() return value to fileExtensionIcons URL
const ICON_NAME_TO_URL: Record<string, string> = {
	ImageIcon: IMAGE_ICON,
	PdfIcon: PDF_ICON,
	DocIcon: DOC_ICON,
	XlsxIcon: XLS_ICON,
	ZipIcon: ZIP_ICON,
	AudioIcon: AUDIO_ICON,
	VideoIcon: VIDEO_ICON,
};

function getIconUrlByMime(mimeType: string): string {
	const iconName = getFileIcon(mimeType);
	return ICON_NAME_TO_URL[iconName] ?? DOC_ICON;
}

// Cache for loaded file images (thumbnails)
const fileImageCache = new Map<string, HTMLImageElement>();
// Cache for loaded file-type icons (SVG icons)
const iconUrlCache = new Map<string, HTMLImageElement>();
// Track file URLs that failed to load as image so we show IMAGE_ICON instead
const fileImageFailedCache = new Set<string>();

// Callback registry for triggering re-renders when images load
let onImageLoadCallback: (() => void) | null = null;

/**
 * Set callback to be called when images finish loading
 * This allows the grid to re-render when icons become available
 */
export function setImageLoadCallback(callback: (() => void) | null) {
	onImageLoadCallback = callback;
}

function triggerRerender() {
	if (onImageLoadCallback) {
		requestAnimationFrame(() => {
			onImageLoadCallback?.();
		});
	}
}

/**
 * Load image from URL and cache it (used for both thumbnails and icon SVGs)
 * Triggers re-render callback when load finishes
 */
function loadAndCacheImage(
	url: string,
	cache: Map<string, HTMLImageElement>,
): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (!url) {
			resolve(null);
			return;
		}

		const cached = cache.get(url);
		if (cached && cached.complete) {
			resolve(cached);
			return;
		}

		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () => {
			cache.set(url, img);
			triggerRerender();
			resolve(img);
		};

		img.onerror = () => {
			resolve(null);
		};

		img.src = url;
	});
}

/**
 * Load file thumbnail from URL and cache it
 * On error, marks URL as failed and triggers re-render so next draw shows IMAGE_ICON
 */
function loadFileImage(fileUrl: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (!fileUrl) {
			resolve(null);
			return;
		}

		const cached = fileImageCache.get(fileUrl);
		if (cached && cached.complete) {
			resolve(cached);
			return;
		}

		const img = new Image();
		img.crossOrigin = "anonymous";

		img.onload = () => {
			fileImageCache.set(fileUrl, img);
			triggerRerender();
			resolve(img);
		};

		img.onerror = () => {
			fileImageFailedCache.add(fileUrl);
			triggerRerender();
			resolve(null);
		};

		img.src = fileUrl;
	});
}

function drawGreyPlaceholder(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
): void {
	ctx.fillStyle = "#E0E0E0";
	ctx.fillRect(x, y, ICON_WIDTH, ICON_HEIGHT);
	ctx.strokeStyle = "#CCCCCC";
	ctx.lineWidth = 1;
	ctx.strokeRect(x, y, ICON_WIDTH, ICON_HEIGHT);
}

/**
 * Draw an icon from a URL (file-type icon SVG). Uses cache; draws placeholder while loading.
 */
function drawIconFromUrl(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	iconUrl: string,
): void {
	if (!iconUrl) {
		drawGreyPlaceholder(ctx, x, y);
		return;
	}

	const cached = iconUrlCache.get(iconUrl);
	if (cached && cached.complete) {
		ctx.drawImage(cached, x, y, ICON_WIDTH, ICON_HEIGHT);
		return;
	}

	drawGreyPlaceholder(ctx, x, y);
	loadAndCacheImage(iconUrl, iconUrlCache);
}

/**
 * Draw file icon on canvas.
 * - If mimeType is missing: show DocIcon.
 * - If mimeType is image/*: load fileUrl as thumbnail; on error show generic image icon.
 * - Otherwise: show file-type icon (PDF, XLS, Doc, etc.) from mimeType.
 */
export function drawFileIconPlaceholder(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	fileUrl: string,
	mimeType?: string,
): void {
	const isImageMime =
		typeof mimeType === "string" && mimeType.startsWith("image/");
	const hasMimeType = typeof mimeType === "string" && mimeType.length > 0;

	// Missing mimeType: always show DocIcon
	if (!hasMimeType) {
		const iconUrl = getIconUrlByMime("");
		drawIconFromUrl(ctx, x, y, iconUrl);
		return;
	}

	// Non-image: show file-type icon (PDF, CSV, Doc, etc.)
	if (!isImageMime) {
		const iconUrl = getIconUrlByMime(mimeType);
		drawIconFromUrl(ctx, x, y, iconUrl);
		return;
	}

	// Image: load fileUrl as thumbnail; on error show IMAGE_ICON
	if (!fileUrl) {
		drawIconFromUrl(ctx, x, y, IMAGE_ICON);
		return;
	}

	// Image load previously failed: show generic image icon
	if (fileImageFailedCache.has(fileUrl)) {
		drawIconFromUrl(ctx, x, y, IMAGE_ICON);
		return;
	}

	const cached = fileImageCache.get(fileUrl);
	if (cached && cached.complete) {
		ctx.drawImage(cached, x, y, ICON_WIDTH, ICON_HEIGHT);
		return;
	}

	drawGreyPlaceholder(ctx, x, y);
	loadFileImage(fileUrl);
}

export { ICON_WIDTH, ICON_HEIGHT };
