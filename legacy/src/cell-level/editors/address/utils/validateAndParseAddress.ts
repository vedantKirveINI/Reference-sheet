/**
 * Validate and parse address data for editor
 * Handles JSON string input
 * Inspired by sheets project's validateAndParseAddress
 */
import { ADDRESS_KEY_MAPPING } from "./constants";

export interface AddressData {
	fullName?: string;
	addressLineOne?: string;
	addressLineTwo?: string;
	zipCode?: string;
	city?: string;
	state?: string;
	country?: string;
}

export function validateAndParsedAddress(value: string | null | undefined): {
	parsedValue: AddressData | null;
} {
	if (!value) {
		return { parsedValue: null };
	}

	try {
		const parsedValue = JSON.parse(value);

		if (
			parsedValue === null ||
			(typeof parsedValue === "object" &&
				!Array.isArray(parsedValue) &&
				Object.keys(parsedValue).every((key) =>
					ADDRESS_KEY_MAPPING.includes(key as any),
				))
		) {
			return { parsedValue };
		}

		return { parsedValue: null };
	} catch (error) {
		return { parsedValue: null };
	}
}




