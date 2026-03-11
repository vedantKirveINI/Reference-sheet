/**
 * Countries data for Phone Number rendering
 * Simplified version - contains common countries with their codes and dialing numbers
 * Inspired by @oute/oute-ds.core.constants countries
 */

export interface Country {
	countryCode: string; // ISO country code (e.g., "IN", "US")
	countryName: string; // Country name (e.g., "India", "United States")
	countryNumber: string; // Dialing code without + (e.g., "91", "1")
	pattern?: string; // Phone number pattern/mask (optional)
	currencyCode?: string;
	currencySymbol?: string;
}

// Common countries data - subset of most used countries
export const COUNTRIES: Record<string, Country> = {
	IN: {
		countryCode: "IN",
		countryName: "India",
		countryNumber: "91",
		currencyCode: "INR",
		currencySymbol: "₹",
	},
	US: {
		countryCode: "US",
		countryName: "United States",
		countryNumber: "1",
		pattern: "(999) 999-9999",
		currencyCode: "USD",
		currencySymbol: "$",
	},
	GB: {
		countryCode: "GB",
		countryName: "United Kingdom",
		countryNumber: "44",
		currencyCode: "GBP",
		currencySymbol: "£",
	},
	CA: {
		countryCode: "CA",
		countryName: "Canada",
		countryNumber: "1",
		pattern: "(999) 999-9999",
		currencyCode: "CAD",
		currencySymbol: "$",
	},
	AU: {
		countryCode: "AU",
		countryName: "Australia",
		countryNumber: "61",
		currencyCode: "AUD",
		currencySymbol: "$",
	},
	DE: {
		countryCode: "DE",
		countryName: "Germany",
		countryNumber: "49",
		currencyCode: "EUR",
		currencySymbol: "€",
	},
	FR: {
		countryCode: "FR",
		countryName: "France",
		countryNumber: "33",
		currencyCode: "EUR",
		currencySymbol: "€",
	},
	IT: {
		countryCode: "IT",
		countryName: "Italy",
		countryNumber: "39",
		currencyCode: "EUR",
		currencySymbol: "€",
	},
	ES: {
		countryCode: "ES",
		countryName: "Spain",
		countryNumber: "34",
		currencyCode: "EUR",
		currencySymbol: "€",
	},
	BR: {
		countryCode: "BR",
		countryName: "Brazil",
		countryNumber: "55",
		currencyCode: "BRL",
		currencySymbol: "R$",
	},
	CN: {
		countryCode: "CN",
		countryName: "China",
		countryNumber: "86",
		currencyCode: "CNY",
		currencySymbol: "¥",
	},
	JP: {
		countryCode: "JP",
		countryName: "Japan",
		countryNumber: "81",
		currencyCode: "JPY",
		currencySymbol: "¥",
	},
	KR: { countryCode: "KR", countryName: "South Korea", countryNumber: "82" },
	MX: {
		countryCode: "MX",
		countryName: "Mexico",
		countryNumber: "52",
		currencyCode: "MXN",
		currencySymbol: "$",
	},
	NL: {
		countryCode: "NL",
		countryName: "Netherlands",
		countryNumber: "31",
		currencyCode: "EUR",
		currencySymbol: "€",
	},
	SE: {
		countryCode: "SE",
		countryName: "Sweden",
		countryNumber: "46",
		currencyCode: "SEK",
		currencySymbol: "kr",
	},
	CH: {
		countryCode: "CH",
		countryName: "Switzerland",
		countryNumber: "41",
		currencyCode: "CHF",
		currencySymbol: "CHF",
	},
	SG: {
		countryCode: "SG",
		countryName: "Singapore",
		countryNumber: "65",
		currencyCode: "SGD",
		currencySymbol: "$",
	},
	AE: {
		countryCode: "AE",
		countryName: "United Arab Emirates",
		countryNumber: "971",
		currencyCode: "AED",
		currencySymbol: "د.إ",
	},
	SA: {
		countryCode: "SA",
		countryName: "Saudi Arabia",
		countryNumber: "966",
		currencyCode: "SAR",
		currencySymbol: "ر.س",
	},
	ZA: {
		countryCode: "ZA",
		countryName: "South Africa",
		countryNumber: "27",
		currencyCode: "ZAR",
		currencySymbol: "R",
	},
	NZ: { countryCode: "NZ", countryName: "New Zealand", countryNumber: "64" },
	NO: { countryCode: "NO", countryName: "Norway", countryNumber: "47" },
	DK: { countryCode: "DK", countryName: "Denmark", countryNumber: "45" },
	FI: { countryCode: "FI", countryName: "Finland", countryNumber: "358" },
	PL: { countryCode: "PL", countryName: "Poland", countryNumber: "48" },
	TR: { countryCode: "TR", countryName: "Turkey", countryNumber: "90" },
	AR: { countryCode: "AR", countryName: "Argentina", countryNumber: "54" },
	CL: { countryCode: "CL", countryName: "Chile", countryNumber: "56" },
	CO: { countryCode: "CO", countryName: "Colombia", countryNumber: "57" },
	PE: { countryCode: "PE", countryName: "Peru", countryNumber: "51" },
	PH: { countryCode: "PH", countryName: "Philippines", countryNumber: "63" },
	TH: { countryCode: "TH", countryName: "Thailand", countryNumber: "66" },
	VN: { countryCode: "VN", countryName: "Vietnam", countryNumber: "84" },
	ID: { countryCode: "ID", countryName: "Indonesia", countryNumber: "62" },
	MY: { countryCode: "MY", countryName: "Malaysia", countryNumber: "60" },
	PK: { countryCode: "PK", countryName: "Pakistan", countryNumber: "92" },
	BD: { countryCode: "BD", countryName: "Bangladesh", countryNumber: "880" },
	EG: { countryCode: "EG", countryName: "Egypt", countryNumber: "20" },
	NG: { countryCode: "NG", countryName: "Nigeria", countryNumber: "234" },
	KE: { countryCode: "KE", countryName: "Kenya", countryNumber: "254" },
	IL: { countryCode: "IL", countryName: "Israel", countryNumber: "972" },
	IE: { countryCode: "IE", countryName: "Ireland", countryNumber: "353" },
	PT: { countryCode: "PT", countryName: "Portugal", countryNumber: "351" },
	GR: { countryCode: "GR", countryName: "Greece", countryNumber: "30" },
	BE: { countryCode: "BE", countryName: "Belgium", countryNumber: "32" },
	AT: { countryCode: "AT", countryName: "Austria", countryNumber: "43" },
	CZ: {
		countryCode: "CZ",
		countryName: "Czech Republic",
		countryNumber: "420",
	},
	HU: { countryCode: "HU", countryName: "Hungary", countryNumber: "36" },
	RO: { countryCode: "RO", countryName: "Romania", countryNumber: "40" },
	AL: { countryCode: "AL", countryName: "Albania", countryNumber: "355" },
};

/**
 * Get country by country code
 */
export function getCountry(countryCode: string): Country | undefined {
	return COUNTRIES[countryCode?.toUpperCase()];
}

/**
 * Get all country codes
 */
export function getAllCountryCodes(): string[] {
	return Object.keys(COUNTRIES);
}

/**
 * Get flag image URL for a country code
 * Uses flagcdn.com (same as reference implementation)
 */
export function getFlagUrl(countryCode: string): string {
	if (!countryCode) return "";
	return `https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`;
}
