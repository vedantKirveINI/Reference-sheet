import { isEmpty } from "lodash";

interface FileUploadFile {
	url: string;
	size: number;
	mimeType: string;
}

interface ValidateFileUploadResult {
	isValid: boolean;
	processedValue: FileUploadFile[] | null;
}

export function validateFileUpload(newValue: any): ValidateFileUploadResult {
	try {
		// If it's already an array, validate it
		if (Array.isArray(newValue)) {
			// Check if all items have required properties (url)
			if (newValue.every((item) => item?.url)) {
				return {
					isValid: true,
					processedValue: newValue,
				};
			}
			return { isValid: false, processedValue: null };
		}

		// If it's a string, try to parse it
		if (typeof newValue === "string") {
			const parsedValue = JSON.parse(newValue);

			// Check if the value is a number (invalid)
			if (typeof parsedValue === "number") {
				return { isValid: false, processedValue: null };
			}

			if (
				isEmpty(parsedValue) ||
				(Array.isArray(parsedValue) &&
					parsedValue.every(({ url }) => url))
			) {
				return {
					isValid: true,
					processedValue: parsedValue,
				};
			}

			return { isValid: false, processedValue: null };
		}

		// If it's null or undefined, it's valid (empty)
		if (newValue === null || newValue === undefined) {
			return { isValid: true, processedValue: null };
		}

		return { isValid: false, processedValue: null };
	} catch (e) {
		return { isValid: false, processedValue: null };
	}
}
