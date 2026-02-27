const formatFieldType = (fieldType = "") => {
	return fieldType
		.toLowerCase()
		.replace(/_/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

export default formatFieldType;
