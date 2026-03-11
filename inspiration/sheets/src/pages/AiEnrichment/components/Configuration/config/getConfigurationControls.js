import { DOMAIN_REGEX } from "../../../../../constants/regex";
import AI_ENRICHMENT_OPTIONS from "../constant/aiEnrichmentOptions";

function getConfigurationControls() {
	const controls = [
		{
			name: "type",
			type: "select",
			label: "Select type of enrichment",
			textFieldProps: { placeholder: "Select a type of enrichment" },
			searchable: true,
			rules: {
				required: "Please select an enrichment type",
			},
			options: AI_ENRICHMENT_OPTIONS,
			isOptionEqualToValue: (option, selectedValue) =>
				option?.value === selectedValue?.value,
		},
		{
			name: "url",
			type: "text",
			label: "Enter company url",
			placeholder: "For eg- google.com",
			rules: {
				required: "Please enter a url",
				pattern: {
					value: DOMAIN_REGEX,
					message:
						"Please enter a valid domain (e.g., google.com, jio.com)",
				},
			},
		},
	];

	return controls;
}

export default getConfigurationControls;
