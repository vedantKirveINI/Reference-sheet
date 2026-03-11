import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import getEnrichmentControls from "../configuration/getEnrichmentControls";
import ENHANCEMENT_OPTIONS from "../constants/enhancementOptions";

function useEnrichmentSettings({ value = {}, fields = [] }) {
	const {
		requiredInputControls = [],
		commonControls = [],
		runConfigurationControls = [],
	} = getEnrichmentControls({ value });

	const { options = {} } = value || {};
	const {
		config = {},
		entityType: prefilledEntityType = "",
		autoUpdate,
	} = options || {};

	const { identifier = [], fieldsToEnrich = [] } = config || {};

	const prefilledEnrichmentTypeOption = ENHANCEMENT_OPTIONS.find(
		(option) => option.key === prefilledEntityType,
	);

	// Transform identifier array to the correct format for form default values
	const transformedIdentifierDefaults = {};

	if (prefilledEntityType && identifier.length > 0) {
		identifier.forEach((identifierItem) => {
			const controlName = `identifier_${prefilledEntityType}_${identifierItem.key}`;

			// Find the actual field object from fields array that matches the field_id
			const matchingField = fields.find(
				(field) => field.id === identifierItem.field_id,
			);

			// Use the matching field if found, otherwise fallback to identifier item
			transformedIdentifierDefaults[controlName] = matchingField;
		});
	}

	// Transform fieldsToEnrich to configuration control defaults
	const transformedConfigurationDefaults = {};

	// First, get the prefilled enrichment type to know what output fields are available
	if (prefilledEnrichmentTypeOption) {
		const { outputFields = [] } = prefilledEnrichmentTypeOption;

		// Set all output fields to false by default
		outputFields.forEach((outputField) => {
			transformedConfigurationDefaults[outputField.key] = false;
		});

		// Override with true for fields that are in fieldsToEnrich
		if (fieldsToEnrich.length > 0) {
			fieldsToEnrich.forEach((fieldToEnrich) => {
				transformedConfigurationDefaults[fieldToEnrich.key] = {
					...fieldToEnrich,
				};
			});
		}
	}

	const formHook = useForm({
		defaultValues: {
			fieldDescription: value?.description || "",
			entityType: prefilledEnrichmentTypeOption,
			...transformedIdentifierDefaults,
			...transformedConfigurationDefaults,
			autoUpdate: autoUpdate,
		},
	});

	const {
		formState: { errors },
		control,
		handleSubmit,
		watch,
		setValue,
	} = formHook;

	const entityType = watch("entityType");

	const {
		inputFields = [],
		outputFields = [],
		description = "",
	} = entityType || {};

	const configurationControls = outputFields.map((field) => ({
		name: field.key,
		label: field.name,
		type: "switch",
		defaultValue: true,
		size: "small",
	}));

	const identifierControls =
		isEmpty(entityType) && isEmpty(inputFields)
			? []
			: inputFields.map((inputField) => ({
					name: `identifier_${entityType.key}_${inputField.key}`,
					type: "select",
					searchable: true,
					label: inputField.label,
					options: fields?.filter(
						(field) => field?.type !== "ENRICHMENT",
					),
					getOptionLabel: (option) => option.name || "",
					isOptionEqualToValue: (option, selectedValue) => {
						return option?.id === selectedValue?.id;
					},
					textFieldProps: {
						placeholder: "Select identifier",
					},
					rules: {
						required: inputField.required
							? `${inputField.label} is required`
							: false,
					},
					disableClearable: false,
					inputFieldDescription: inputField.description,
				}));

	// Combine controls
	const updatedRequiredInputControls = [
		...requiredInputControls,
		...identifierControls,
	];

	// Update fieldDescription when entityType changes during creation (when value is empty)
	useEffect(() => {
		if (isEmpty(value) && entityType && description) {
			// Only update if we're in creation mode and have a valid entity type with description
			setValue("fieldDescription", description);
		}
	}, [entityType, description, setValue]);

	return {
		errors,
		control,
		handleSubmit,
		updatedRequiredInputControls,
		commonControls,
		configurationControls,
		outputFields,
		entityType,
		runConfigurationControls,
		fieldsToEnrich,
	};
}

export default useEnrichmentSettings;
