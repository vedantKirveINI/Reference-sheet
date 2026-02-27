/**
 * SCQ Color Utility
 * Maps options to SCQ_COLOURS array
 * Inspired by sheets project's getAssignedColours function
 */
import { SCQ_COLOURS } from "@/constants/colours";

/**
 * Get SCQ chip background color for an option
 * Maps option index to SCQ_COLOURS array (cycling through colors)
 */
export function getScqColor(option: string, options: string[]): string {
	if (!options || options.length === 0) {
		return SCQ_COLOURS[0]; // Default to first color
	}

	const optionIndex = options.indexOf(option);
	if (optionIndex === -1) {
		return SCQ_COLOURS[0]; // Default if option not found
	}

	// Cycle through SCQ_COLOURS array
	return SCQ_COLOURS[optionIndex % SCQ_COLOURS.length];
}

