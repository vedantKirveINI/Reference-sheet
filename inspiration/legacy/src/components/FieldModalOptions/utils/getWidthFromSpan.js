export function calculateWidth(span = 12) {
	const maxWidth = 12; // Maximum span value
	const percentageWidth = (span / maxWidth) * 100;
	return `${percentageWidth}%`;
}
