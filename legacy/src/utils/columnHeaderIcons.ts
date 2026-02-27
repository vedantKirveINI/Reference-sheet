/**
 * Column Header Icons Utility
 * Handles loading and caching of column header icons based on field types
 * Inspired by drawFileIcon.ts pattern
 */

import { CellType } from "@/types";
import QUESTION_TYPE_ICON_MAPPING from "@/constants/questionTypeIconMapping";
import { CHEVRON_DOWN_ICON, WARNING_ICON } from "@/constants/Icons/commonIcons";

// Cache for loaded column header icons
const columnHeaderIconCache = new Map<string, HTMLImageElement>();

// Callback registry for triggering re-renders when icons load
let onIconLoadCallback: (() => void) | null = null;

// Global flag to track if we've started preloading all icons
let allIconsPreloadStarted = false;

/**
 * Set callback to be called when icons finish loading
 * This allows the grid to re-render when icons become available
 */
export function setColumnHeaderIconLoadCallback(callback: (() => void) | null) {
	onIconLoadCallback = callback;
}

/**
 * Maps CellType enum values to QUESTION_TYPE_ICON_MAPPING keys
 */
function getIconMappingKey(cellType: CellType): string {
	const mapping: Record<CellType, string> = {
		[CellType.String]: "SHORT_TEXT",
		[CellType.Number]: "NUMBER",
		[CellType.MCQ]: "MCQ",
		[CellType.SCQ]: "SCQ",
		[CellType.YesNo]: "YES_NO",
		[CellType.PhoneNumber]: "PHONE_NUMBER",
		[CellType.ZipCode]: "ZIP_CODE",
		[CellType.Currency]: "CURRENCY",
		[CellType.DropDown]: "DROP_DOWN",
		[CellType.Address]: "ADDRESS",
		[CellType.DateTime]: "DATE",
		[CellType.CreatedTime]: "CREATED_TIME",
		[CellType.Signature]: "SIGNATURE",
		[CellType.FileUpload]: "FILE_PICKER",
		[CellType.Time]: "TIME",
		[CellType.Ranking]: "RANKING",
		[CellType.Rating]: "RATING",
		[CellType.Slider]: "SLIDER",
		[CellType.OpinionScale]: "OPINION_SCALE",
		[CellType.Enrichment]: "ENRICHMENT",
		[CellType.Formula]: "FORMULA",
	};

	return mapping[cellType] || "SHORT_TEXT"; // Default fallback
}

/**
 * Get icon URL for a given CellType
 * Returns the icon URL from QUESTION_TYPE_ICON_MAPPING
 * Falls back to SHORT_TEXT icon if type not found
 */
export function getColumnHeaderIconUrl(cellType: CellType): string {
	const mappingKey = getIconMappingKey(cellType);
	const iconUrl =
		QUESTION_TYPE_ICON_MAPPING[
			mappingKey as keyof typeof QUESTION_TYPE_ICON_MAPPING
		] || QUESTION_TYPE_ICON_MAPPING.SHORT_TEXT;

	return iconUrl;
}

/**
 * Load column header icon from URL and cache it
 * Triggers re-render callback when icon finishes loading
 */
function loadColumnHeaderIcon(
	iconUrl: string,
): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (!iconUrl) {
			resolve(null);
			return;
		}

		// Check cache first
		const cached = columnHeaderIconCache.get(iconUrl);
		if (cached && cached.complete) {
			resolve(cached);
			return;
		}

		// Create new image
		const img = new Image();
		img.crossOrigin = "anonymous"; // Allow CORS for external images

		img.onload = () => {
			columnHeaderIconCache.set(iconUrl, img);
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
			// If icon fails to load, return null
			resolve(null);
		};

		img.src = iconUrl;
	});
}

/**
 * Get column header icon (synchronous check)
 * Returns cached icon if available, otherwise starts loading in background
 */
export function getColumnHeaderIcon(iconUrl: string): HTMLImageElement | null {
	if (!iconUrl) {
		return null;
	}

	// Check if icon is already loaded in cache
	const cached = columnHeaderIconCache.get(iconUrl);
	if (cached && cached.complete) {
		return cached;
	}

	// Start loading icon in background (will trigger re-render when loaded)
	loadColumnHeaderIcon(iconUrl);

	return null;
}

/**
 * Preload all column header icons for given column types
 * Useful for preloading icons when grid mounts or columns change
 */
export function preloadColumnHeaderIcons(cellTypes: CellType[]): void {
	const uniqueUrls = new Set<string>();
	cellTypes.forEach((cellType) => {
		const iconUrl = getColumnHeaderIconUrl(cellType);
		uniqueUrls.add(iconUrl);
	});

	uniqueUrls.forEach((iconUrl) => {
		// Start loading each icon
		loadColumnHeaderIcon(iconUrl);
	});
}

/**
 * Preload ALL possible column header icons upfront
 * This ensures icons are ready before the grid renders
 * Only runs once globally to avoid duplicate loading
 */
export function preloadAllColumnHeaderIcons(): Promise<void> {
	// If we've already started preloading, return existing promise or resolved promise
	if (allIconsPreloadStarted) {
		// Check if all icons are already loaded
		const allCellTypes: CellType[] = [
			CellType.String,
			CellType.Number,
			CellType.MCQ,
			CellType.SCQ,
			CellType.YesNo,
			CellType.PhoneNumber,
			CellType.ZipCode,
			CellType.Currency,
			CellType.DropDown,
			CellType.Address,
			CellType.DateTime,
			CellType.CreatedTime,
			CellType.Signature,
			CellType.FileUpload,
			CellType.Time,
			CellType.Ranking,
			CellType.Rating,
			CellType.Slider,
			CellType.OpinionScale,
			CellType.Enrichment,
			CellType.Formula,
		];

		const uniqueUrls = new Set<string>();
		allCellTypes.forEach((cellType) => {
			const iconUrl = getColumnHeaderIconUrl(cellType);
			uniqueUrls.add(iconUrl);
		});

		// Check if all are loaded
		const allLoaded = Array.from(uniqueUrls).every((iconUrl) => {
			const cached = columnHeaderIconCache.get(iconUrl);
			return cached && cached.complete;
		});

		if (allLoaded) {
			return Promise.resolve();
		}
	}

	allIconsPreloadStarted = true;

	// Get all possible CellType values (MCQ, SCQ, Rating, etc. - all types with header icons)
	const allCellTypes: CellType[] = [
		CellType.String,
		CellType.Number,
		CellType.MCQ,
		CellType.SCQ,
		CellType.YesNo,
		CellType.PhoneNumber,
		CellType.ZipCode,
		CellType.Currency,
		CellType.DropDown,
		CellType.Address,
		CellType.DateTime,
		CellType.CreatedTime,
		CellType.Signature,
		CellType.FileUpload,
		CellType.Time,
		CellType.Ranking,
		CellType.Rating,
		CellType.Slider,
		CellType.OpinionScale,
		CellType.Enrichment,
		CellType.Formula,
	];

	// Get unique icon URLs
	const uniqueUrls = new Set<string>();
	allCellTypes.forEach((cellType) => {
		const iconUrl = getColumnHeaderIconUrl(cellType);
		uniqueUrls.add(iconUrl);
	});

	// Load all icons in parallel and wait for them
	// Use Promise.allSettled to continue even if some fail
	const loadPromises = Array.from(uniqueUrls).map(
		(iconUrl) => loadColumnHeaderIcon(iconUrl).catch(() => null), // Don't fail if one icon fails
	);

	// Return promise that resolves when all icons finish loading (success or failure)
	return Promise.all(loadPromises).then(() => {
		// All icons loaded (or failed, but we continue anyway)
	});
}

/**
 * Preload chevron dropdown icon and wait for it to load
 */
export function preloadChevronDownIcon(): Promise<void> {
	return new Promise((resolve) => {
		if (chevronDownIcon && chevronDownIcon.complete) {
			resolve();
			return;
		}

		// Create new image if not cached
		if (!chevronDownIcon) {
			chevronDownIcon = new Image();
			chevronDownIcon.crossOrigin = "anonymous";
			chevronDownIcon.src = CHEVRON_DOWN_ICON;

			chevronDownIcon.onload = () => {
				// Trigger re-render callback so grid updates when icon loads
				if (onIconLoadCallback) {
					requestAnimationFrame(() => {
						onIconLoadCallback?.();
					});
				}
				resolve();
			};

			chevronDownIcon.onerror = () => {
				// Even if it fails, resolve so we don't block rendering
				resolve();
			};
		} else {
			// Image exists but not loaded yet, wait for it
			chevronDownIcon.onload = () => {
				resolve();
			};
			chevronDownIcon.onerror = () => {
				resolve();
			};
		}
	});
}

// Cache for chevron down icon
let chevronDownIcon: HTMLImageElement | null = null;

/**
 * Load chevron down icon for column header dropdown
 * Returns cached icon if available, otherwise loads it
 */
export function getChevronDownIcon(): HTMLImageElement | null {
	if (chevronDownIcon && chevronDownIcon.complete) {
		return chevronDownIcon;
	}

	// Create new image if not cached
	if (!chevronDownIcon) {
		chevronDownIcon = new Image();
		chevronDownIcon.crossOrigin = "anonymous";
		chevronDownIcon.src = CHEVRON_DOWN_ICON;

		chevronDownIcon.onload = () => {
			// Trigger re-render callback so grid updates when icon loads
			if (onIconLoadCallback) {
				requestAnimationFrame(() => {
					onIconLoadCallback?.();
				});
			}
		};
	}

	return chevronDownIcon;
}

// Cache for warning icon
let warningIcon: HTMLImageElement | null = null;

/**
 * Preload warning icon for formula field error indicators
 */
export function preloadWarningIcon(): Promise<void> {
	return new Promise((resolve) => {
		if (warningIcon && warningIcon.complete) {
			resolve();
			return;
		}

		// Create new image if not cached
		if (!warningIcon) {
			warningIcon = new Image();
			warningIcon.crossOrigin = "anonymous";
			warningIcon.src = WARNING_ICON;

			warningIcon.onload = () => {
				// Trigger re-render callback so grid updates when icon loads
				if (onIconLoadCallback) {
					requestAnimationFrame(() => {
						onIconLoadCallback?.();
					});
				}
				resolve();
			};

			warningIcon.onerror = () => {
				// Even if it fails, resolve so we don't block rendering
				resolve();
			};
		} else {
			// Image exists but not loaded yet, wait for it
			warningIcon.onload = () => {
				resolve();
			};
			warningIcon.onerror = () => {
				resolve();
			};
		}
	});
}

/**
 * Get warning icon for formula field error indicators
 * Returns cached icon if available, otherwise loads it
 */
export function getWarningIcon(): HTMLImageElement | null {
	if (warningIcon && warningIcon.complete) {
		return warningIcon;
	}

	// Create new image if not cached
	if (!warningIcon) {
		warningIcon = new Image();
		warningIcon.crossOrigin = "anonymous";
		warningIcon.src = WARNING_ICON;

		warningIcon.onload = () => {
			// Trigger re-render callback so grid updates when icon loads
			if (onIconLoadCallback) {
				requestAnimationFrame(() => {
					onIconLoadCallback?.();
				});
			}
		};
	}

	return warningIcon;
}
