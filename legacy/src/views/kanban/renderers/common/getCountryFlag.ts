// Helper to get country flag emoji
// Simplified - you might want to use a proper library
export const getCountryFlag = (countryCode: string): string => {
	// Simple mapping for common countries
	const flagMap: Record<string, string> = {
		US: "🇺🇸",
		GB: "🇬🇧",
		AU: "🇦🇺",
		CA: "🇨🇦",
		IN: "🇮🇳",
		// Add more as needed
	};
	return flagMap[countryCode.toUpperCase()] || "🌐";
};
