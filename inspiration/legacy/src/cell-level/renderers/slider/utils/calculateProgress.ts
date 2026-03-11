/**
 * Calculate progress percentage for slider value
 * Returns a value between 0 and 1 representing the progress
 */

interface CalculateProgressParams {
	value: number;
	minValue: number;
	maxValue: number;
}

/**
 * Calculate progress percentage (0 to 1) for a slider value
 * @param value - Current slider value
 * @param minValue - Minimum slider value (0 or 1)
 * @param maxValue - Maximum slider value (5-10, default 10)
 * @returns Progress percentage between 0 and 1
 */
export function calculateProgress({
	value,
	minValue,
	maxValue,
}: CalculateProgressParams): number {
	// Handle edge cases
	if (maxValue === minValue) {
		return 1; // If range is 0, show full progress
	}

	// Clamp value to valid range
	const clampedValue = Math.max(minValue, Math.min(maxValue, value));

	// Calculate progress: (value - minValue) / (maxValue - minValue)
	const progress = (clampedValue - minValue) / (maxValue - minValue);

	// Ensure progress is between 0 and 1
	return Math.max(0, Math.min(1, progress));
}
