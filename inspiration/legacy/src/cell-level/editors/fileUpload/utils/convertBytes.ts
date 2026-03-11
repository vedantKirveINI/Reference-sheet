/**
 * Convert bytes to human-readable file size
 * Inspired by sheets project's sizeConversion utility
 */

interface ConvertBytesParams {
	bytes: number;
}

export function convertBytes({ bytes = 0 }: ConvertBytesParams): string {
	if (!bytes || isNaN(bytes)) {
		return "-";
	}

	const kilobytes = bytes / 1024;
	const megabytes = kilobytes / 1024;

	if (megabytes >= 1) {
		return `${megabytes.toFixed(2)}MB`;
	}
	return `${kilobytes.toFixed(2)}KB`;
}
