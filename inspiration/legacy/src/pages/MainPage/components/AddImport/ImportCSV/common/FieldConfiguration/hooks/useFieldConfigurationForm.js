import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import getFieldConfigNewControls from "../config/getFieldConfigNewControls";

function getDefautlValues(mutatedRowHeaders, firstRowAsHeader) {
	return mutatedRowHeaders.map((header, index) => ({
		field_select: firstRowAsHeader === "Yes" ? header : undefined,
		field_text: firstRowAsHeader === "No" ? `Field ${index + 1}` : "",
		type: { label: "Short Text", value: "SHORT_TEXT" },
	}));
}

export const useFieldConfigurationForm = ({ formData = {} }) => {
	const mutatedRowHeaders = useMemo(() => {
		const headers = formData?.parsedCSVData?.[0] || [];

		return headers.map((header, index) => {
			return {
				label: header,
				value: `${index}_${header}`,
			};
		});
	}, [formData.parsedCSVData]);

	const firstRowAsHeader = formData?.first_row_as_header || "Yes";
	const deafultValueFieldArray = getDefautlValues(
		mutatedRowHeaders,
		firstRowAsHeader,
	);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			fields: deafultValueFieldArray,
			first_row_as_header: firstRowAsHeader,
		},
	});

	const selectedFields = useWatch({
		control,
		name: "fields",
	});

	const firstRowAsHeaderWatcher = useWatch({
		control,
		name: "first_row_as_header",
	});

	useEffect(() => {
		// Reset form when firstRowAsHeader changes
		reset({
			fields: mutatedRowHeaders.map((header, index) => ({
				field_select:
					firstRowAsHeaderWatcher === "Yes" ? header : undefined,
				field_text:
					firstRowAsHeaderWatcher === "No"
						? `Field ${index + 1}`
						: "",
				type: { label: "Short Text", value: "SHORT_TEXT" },
			})),
			first_row_as_header: firstRowAsHeaderWatcher,
		});
	}, [firstRowAsHeaderWatcher, mutatedRowHeaders, reset]);

	const filteredCsvFieldOptions = () => {
		const selectedFieldsValues =
			selectedFields?.map(
				(selectedField) => selectedField?.field_select?.value,
			) || [];

		return (mutatedRowHeaders || []).filter(
			(header) => !selectedFieldsValues.includes(header.value),
		);
	};

	const controls = getFieldConfigNewControls({
		parsedCSVData: formData?.parsedCSVData,
		filteredCsvFieldOptions,
		firstRowAsHeader: firstRowAsHeaderWatcher,
	});

	return {
		control,
		handleSubmit,
		controls,
		errors,
		firstRowAsHeaderWatcher,
	};
};
