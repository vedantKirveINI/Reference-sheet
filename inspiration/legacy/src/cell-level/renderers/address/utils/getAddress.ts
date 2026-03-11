/**
 * Convert address object to comma-separated string
 * Filters out empty/null fields
 * Inspired by sheets project's getAddress
 */
import { ADDRESS_KEY_MAPPING } from "./constants";
import type { AddressData } from "./validateAndParseAddress";

export function getAddress(value: AddressData | null | undefined): string {
	if (!value) return "";

	try {
		const addressArray = ADDRESS_KEY_MAPPING.reduce(
			(acc: string[], curr: (typeof ADDRESS_KEY_MAPPING)[number]) => {
				const currentAddress = value[curr];

				if (Boolean(currentAddress)) {
					return [...acc, currentAddress as string];
				}
				return acc;
			},
			[],
		);

		return addressArray.join(", ");
	} catch (error) {
		return "";
	}
}

