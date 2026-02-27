/**
 * Extracts the file name from a given URL.
 * This function expects the file name to be at the end of the file URL.
 *
 * @param {string} url - The URL to extract the file name from.
 * @returns {string} The file name extracted from the URL.
 */
function getFileNameFromUrl(url = "") {
	const fileName = url?.split("/")?.splice(-1);
	return decodeURIComponent(fileName);
}

export default getFileNameFromUrl;
