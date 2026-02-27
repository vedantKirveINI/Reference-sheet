import isEmpty from "lodash/isEmpty";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import { getFieldLabel } from "@/utils/stringHelpers";
import addFieldControls from "../configuration/getAddFieldContentControls";
import { CREATE_FIELD_MAPPING } from "../constant";

function useAddFieldContentHandler({ value = {} }) {
	const addFieldRef = useRef(null);
	const parentControlRef = useRef({});
	const controlErrorRef = useRef({});

	// Get field type from value, with proper fallback
	const fieldType = value?.type || "SHORT_TEXT";
	const fieldLabel = getFieldLabel(fieldType);
	
	// If label is empty, it means the type wasn't found in mapping, use default
	const typeValue = isEmpty(value)
		? { label: "Short Text", value: "SHORT_TEXT" }
		: fieldLabel
		? { label: fieldLabel, value: fieldType }
		: { label: "Short Text", value: "SHORT_TEXT" };

	const formHook = useForm({
		defaultValues: {
			...value,
			type: typeValue,
			description: value?.description || "",
		},
	});

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
	} = formHook;

	const controls = addFieldControls({ value });

	const { id: currentFieldId } = value || {};

	// Filter out DROP_DOWN type when field is in create mode (value is empty)
	const filteredControls = controls.map((control) => {
		if (control.name === "type" && isEmpty(value)) {
			return {
				...control,
				options: control.options.filter(
					(option) => option.value !== "DROP_DOWN",
				),
			};
		}
		return control;
	});

	const selectValue = watch("type");

	const RenderSelectedField =
		CREATE_FIELD_MAPPING[selectValue?.value || "SHORT_TEXT"];

	return {
		RenderSelectedField,
		addFieldRef,
		handleSubmit,
		errors,
		control,
		controls: filteredControls,
		parentControlRef,
		controlErrorRef,
		selectValue,
		currentFieldId,
	};
}

export default useAddFieldContentHandler;
