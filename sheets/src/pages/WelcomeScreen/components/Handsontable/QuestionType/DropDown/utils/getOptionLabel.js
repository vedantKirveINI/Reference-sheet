const getOptionLabel = ({ optionsList = [] }) => {
	return (optionsList || []).map((item) => item?.label || "");
};

export { getOptionLabel };
