/**
 * Utility to load and draw country flag on canvas
 * Inspired by sheets project's flag rendering
 */

// Cache for loaded flag images
const flagImageCache = new Map<string, HTMLImageElement>();

/**
 * Load flag image and cache it
 */
function loadFlagImage(countryCode: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		// Check cache first
		const cached = flagImageCache.get(countryCode);
		if (cached && cached.complete) {
			resolve(cached);
			return;
		}

		// Create new image
		const img = new Image();
		img.crossOrigin = "anonymous"; // Allow CORS for flagcdn.com

		img.onload = () => {
			flagImageCache.set(countryCode, img);
			resolve(img);
		};

		img.onerror = () => {
			// If image fails to load, return null (will draw placeholder)
			resolve(null);
		};

		img.src = `https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`;
	});
}

/**
 * Draw flag image on canvas
 * Falls back to a simple rectangle if image fails to load
 */
export async function drawFlag(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	countryCode: string,
): Promise<void> {
	if (!countryCode) return;

	const img = await loadFlagImage(countryCode);

	if (img) {
		// Draw the flag image
		ctx.drawImage(img, x, y, width, height);
	} else {
		// Fallback: Draw a simple rectangle placeholder
		ctx.fillStyle = "#E0E0E0";
		ctx.fillRect(x, y, width, height);
		// Draw a simple border
		ctx.strokeStyle = "#CCCCCC";
		ctx.lineWidth = 1;
		ctx.strokeRect(x, y, width, height);
	}
}

/**
 * Synchronous version - draws placeholder if image not loaded
 * For immediate rendering, we'll use this and let images load in background
 */
export function drawFlagPlaceholder(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	countryCode: string,
): void {
	if (!countryCode) return;

	// Check if image is already loaded in cache
	const cached = flagImageCache.get(countryCode);
	if (cached && cached.complete) {
		ctx.drawImage(cached, x, y, width, height);
		return;
	}

	// Draw placeholder while image loads
	ctx.fillStyle = "#E0E0E0";
	ctx.fillRect(x, y, width, height);
	ctx.strokeStyle = "#CCCCCC";
	ctx.lineWidth = 1;
	ctx.strokeRect(x, y, width, height);

	// Start loading image in background (will update on next render)
	loadFlagImage(countryCode);
}
