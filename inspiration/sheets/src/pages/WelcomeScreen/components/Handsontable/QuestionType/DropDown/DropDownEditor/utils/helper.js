const removeOption = ({ optionsList = [], optionToRemove }) => {
	// Handle both string and object options
	const updatedOptions = optionsList?.filter((option) => {
		if (typeof option === "object" && option?.label) {
			return option?.label !== optionToRemove;
		}

		return option !== optionToRemove;
	});

	return updatedOptions;
};

// Helper function to get display value and key
const getDisplayValue = (item) => {
	if (typeof item === "object" && item?.label) {
		return item.label;
	}
	return item;
};

const getItemKey = ({ item, index }) => {
	if (typeof item === "object" && item?.id) {
		return `${item.id}_${index}`;
	}
	return `${item}_${index}`;
};

// Helper function to check if option is selected
const isOptionSelected = ({ option, selectedOptions = [] }) => {
	if (typeof option === "object" && option?.label) {
		return (selectedOptions || []).some(
			(selected) => selected?.label === option.label,
		);
	}
	return (selectedOptions || []).includes(option);
};

export { removeOption, getDisplayValue, getItemKey, isOptionSelected };
