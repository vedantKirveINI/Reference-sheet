import isEmpty from "lodash/isEmpty";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import getExistingTableFieldConfigurationControls from "../config/getExistingTableFieldConfigurationControls";
import EXCLUDED_FIELD_TYPES_FOR_IMPORT from "../constant/excludedFieldTypes";

const preFillDefaultValues = ({
	columnsInfo = [],
	tableFields = [],
	mutatedCsvFieldHeaders = [],
}) => {
	return columnsInfo.map((column) => {
		const name = column.mappedCsvName || column.unMappedCsvName;

		const matchingMutatedHeader = mutatedCsvFieldHeaders.find(
			(header) => header.label === name,
		);

		const matchedField = tableFields.find(
			(field) => field.id === column.field_id,
		);

		return {
			field: {
				label: column.mappedCsvName || column.unMappedCsvName,
				value: matchingMutatedHeader?.value || name,
			},
			type: {
				label: matchedField?.name || "Create new field",
				value: column.field_id || "ADD",
			},
		};
	});
};

const defaultMapFields = ({
	mutatedCsvFieldHeaders = [],
	tableFields = [],
}) => {
	return mutatedCsvFieldHeaders?.map((header, index) => {
		return {
			field: header,
			type: {
				label: tableFields?.[index]?.name || "Create new field",
				value: tableFields?.[index]?.id || "ADD",
			},
		};
	});
};

export const useFieldConfigurationExistingTableForm = ({
	formData = {},
	tableInfo = {},
}) => {
	const mutatedCsvFieldHeaders = useMemo(() => {
		const headers = formData?.parsedCSVData?.[0] || [];

		return headers.map((header, index) => {
			return {
				label: header,
				value: `${index}_${header}`,
			};
		});
	}, [formData.parsedCSVData]);

	// const mutatedRowHeaders =
	const { columnsInfo = [] } = formData || {};

	const { fields: tableFields = [] } = tableInfo || {};

	const filteredTableFields = tableFields.filter(
		(field) => !EXCLUDED_FIELD_TYPES_FOR_IMPORT.includes(field.type),
	);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			map_fields: isEmpty(columnsInfo)
				? defaultMapFields({
						mutatedCsvFieldHeaders,
						tableFields: filteredTableFields,
					})
				: preFillDefaultValues({
						columnsInfo,
						tableFields: filteredTableFields,
						mutatedCsvFieldHeaders,
					}),
			first_row_as_header: formData?.first_row_as_header || "Yes",
		},
	});

	const selectedFields = useWatch({
		control,
		name: "map_fields",
	});

	const filteredTableFieldsOptions = () => {
		const selectedTableFieldValues =
			selectedFields?.map(
				(selectedField) => selectedField?.type?.value,
			) || [];

		return filteredTableFields
			.map((field) => ({
				label: field.name,
				value: field.id,
			}))
			.filter((field) => !selectedTableFieldValues.includes(field.value))
			.concat([{ label: "Create new field", value: "ADD" }]);
	};

	const controls = getExistingTableFieldConfigurationControls({
		filteredTableFieldsOptions,
		mutatedCsvFieldHeaders,
		tableFields: filteredTableFields,
	});

	return {
		control,
		handleSubmit,
		controls,
		errors,
		filteredTableFields,
	};
};
