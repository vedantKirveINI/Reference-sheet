/**
 * Utility to load and draw signature image on canvas
 * Inspired by phoneNumber renderer's drawFlag.ts pattern
 */

// Cache for loaded signature images
const signatureImageCache = new Map<string, HTMLImageElement>();

/**
 * Load signature image and cache it
 */
function loadSignatureImage(url: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (!url) {
			resolve(null);
			return;
		}

		// Check cache first
		const cached = signatureImageCache.get(url);
		if (cached && cached.complete) {
			resolve(cached);
			return;
		}

		// Create new image
		const img = new Image();
		img.crossOrigin = "anonymous"; // Allow CORS for external images

		img.onload = () => {
			signatureImageCache.set(url, img);
			resolve(img);
		};

		img.onerror = () => {
			// If image fails to load, return null (will draw placeholder)
			resolve(null);
		};

		img.src = url;
	});
}

/**
 * Draw signature image on canvas
 * Falls back to a simple rectangle if image fails to load
 */
export async function drawSignature(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	url: string,
): Promise<void> {
	if (!url) return;

	const img = await loadSignatureImage(url);

	if (img) {
		// Draw the signature image
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
export function drawSignaturePlaceholder(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	url: string,
): void {
	if (!url) return;

	// Check if image is already loaded in cache
	const cached = signatureImageCache.get(url);
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
	loadSignatureImage(url);
}
