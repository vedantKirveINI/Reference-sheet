import isEmpty from "lodash/isEmpty";
import { useRef } from "react";
import { useForm } from "react-hook-form";

import { getFieldLabel } from "../../../../../utils/stringHelpers";
import addFieldControls from "../configuration/getAddFieldContentControls";
import { CREATE_FIELD_MAPPING } from "../constant";

function useAddFieldContentHandler({ value = {} }) {
	const addFieldRef = useRef(null);
	const parentControlRef = useRef({});
	const controlErrorRef = useRef({});

	const formHook = useForm({
		defaultValues: {
			...value,
			type: isEmpty(value)
				? { label: "Short Text", value: "SHORT_TEXT" }
				: { label: getFieldLabel(value?.type), value: value?.type },
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
