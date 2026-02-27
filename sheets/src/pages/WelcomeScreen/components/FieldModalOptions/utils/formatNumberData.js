const formatNumberData = ({ formData, activeTab }) => {
	const { description, ...rest } = formData || {};

	// const defaultData = {
	// 	defaultValue,
	// 	description,
	// 	activeTab,
	// };

	const formattingData = {
		...rest,
		description,
		// activeTab,
	};

	// return activeTab === "default" ? defaultData : formattingData; // revert to this once field config is being used
	return formattingData;
};

export default formatNumberData;
