import { useForm } from "react-hook-form";

function useNumberSettings({ value = {} }) {
	const { activeTab: defaultActiveTab, ...restOptions } =
		value?.options || {};

	const formHook = useForm({
		defaultValues: {
			// presets: undefined,
			// decimalPlaces: "1 ($1.0)",
			// thousandsAndDecimalSeparator: "Local (1,000,000.00)",
			// largeNumberAbbreviation: "None",
			// showThousandsSeparators: false,
			// allowNegative: false,
			// allowFraction: false,
			description: value?.description || "",
			// defaultValue: "",
			...restOptions,
		},
	});

	return {
		formHook,
		defaultActiveTab,
	};
}

export default useNumberSettings;
