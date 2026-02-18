function convertBytes({ bytes = 0 }) {
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

export default convertBytes;
