import { isEmpty } from "lodash";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import getDropdownControls from "../configuration/getDropdownControls";

const fieldDefaultValues = {
	selectionType: "Unlimited",
	description: "",
	defaultValue: [],
	options: [{ id: uuidv4(), label: "" }],
};

const getAppendValue = () => ({
	id: uuidv4(),
	label: "",
});

const controls = getDropdownControls();

function useDropdownSettings({ value = {} }) {
	const formHook = useForm({
		defaultValues: {
			...fieldDefaultValues,
			...value?.options,
			description: value?.description || "",
		},
	});

	const { watch, setValue } = formHook;

	const [fieldOptions, optionDefault] = watch(["options", "defaultValue"]);

	const updatedControls = controls.map((control) => {
		if (control.name === "defaultValue" && !isEmpty(fieldOptions)) {
			const filteredOptions = fieldOptions.filter(
				(option) => option.label,
			);

			return {
				...control,
				options: filteredOptions,
			};
		}
		return control;
	});

	// useEffect(() => {
	// 	const subscription = watch((value, { name, type }) => {
	// 		if (
	// 			name.includes("options") &&
	// 			type === "change" &&
	// 			!isEmpty(optionDefault)
	// 		) {
	// 			const { options } = value || {};

	// 			const allowedValues = options.filter((fieldOpt) => {
	// 				return optionDefault.some(
	// 					(defaultOpt) => defaultOpt.id === fieldOpt.id,
	// 				);
	// 			});

	// 			setValue("defaultValue", allowedValues);
	// 		}
	// 	});

	// 	return () => subscription.unsubscribe();
	// }, [optionDefault, setValue, watch]);

	useEffect(() => {
		if (!isEmpty(optionDefault) && !isEmpty(fieldOptions)) {
			const allowedValues = fieldOptions.filter((fieldOpt) => {
				return optionDefault.some(
					(defaultOpt) => defaultOpt.id === fieldOpt.id,
				);
			});

			setValue("defaultValue", allowedValues);
		}
	}, [fieldOptions, optionDefault, setValue]);

	return {
		formHook,
		updatedControls,
		getAppendValue,
	};
}

export default useDropdownSettings;
