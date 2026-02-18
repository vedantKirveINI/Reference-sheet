import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import getMcqControls from "../configuration/getMcqControls";
import transformOptions from "../utils/transformMcqScqOptions";

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

function getDefaultValue({ value }) {
	const { description = "", options: rawOptions = {} } = value || {};

	const options = transformOptions(value);

	const defaultValue =
		rawOptions.defaultValue?.map((defaultVal) =>
			options.find(({ label }) => label === defaultVal),
		) || [];

	return {
		...fieldDefaultValues,
		options,
		description: description ?? "",
		defaultValue,
	};
}

function useMcqSettings({ value = {} }) {
	const controls = getMcqControls();

	const mcqDefaultValue = getDefaultValue({ value });

	const formHook = useForm({
		defaultValues: mcqDefaultValue,
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
				textFieldProps: {
					...control.textFieldProps, // Ensure existing props are preserved
					placeholder: isEmpty(optionDefault)
						? control.textFieldProps?.placeholder || ""
						: "",
				},
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

export default useMcqSettings;
