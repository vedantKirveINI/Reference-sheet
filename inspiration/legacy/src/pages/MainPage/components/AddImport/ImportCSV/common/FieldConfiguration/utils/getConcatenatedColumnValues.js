function getConcatenatedColumnValues(parsedCSVData, index) {
	if (!Array.isArray(parsedCSVData)) return "";

	const values = [
		parsedCSVData[1]?.[index],
		parsedCSVData[2]?.[index],
		parsedCSVData[3]?.[index],
	];

	const nonEmptyValues = values.filter((val) => val != null && val !== "");

	return nonEmptyValues.join(", ");
}

export default getConcatenatedColumnValues;
