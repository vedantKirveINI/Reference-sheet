/**
 * Encodes any serializable data to a base64 string
 * @param data - The data to encode (must be JSON serializable)
 * @returns Base64 encoded string
 */
export const encodeParams = <T = any>(data: T): string => {
	return btoa(JSON.stringify(data));
};

/**
 * Decodes a base64 string back to the original data
 * @param base64String - The base64 encoded string to decode
 * @returns The decoded data or empty object if decoding fails
 */
export const decodeParams = <T = any>(
	base64String: string = "",
): T | Record<string, never> => {
	try {
		return JSON.parse(atob(base64String)) as T;
	} catch {
		return {} as Record<string, never>;
	}
};
