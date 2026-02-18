import { isEmpty } from "lodash";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import getScqControls from "../configuration/getScqControls";
import transformOptions from "../utils/transformMcqScqOptions";

const getAppendValue = () => ({
	id: uuidv4(),
	label: "",
});

const controls = getScqControls();

function useScqSettings({ value = {} }) {
	const { defaultValue = "" } = value?.options || {};
	const updatedOptions = transformOptions(value);

	const formHook = useForm({
		defaultValues: {
			options: updatedOptions,
			description: value?.description || "",
			defaultValue: defaultValue || "",
		},
	});

	const { watch, setValue } = formHook;
	const [fieldOptions, optionDefault] = watch(["options", "defaultValue"]);

	const updatedControls = controls.map((control) => {
		if (control.name === "defaultValue" && !isEmpty(fieldOptions)) {
			const filteredOptions = fieldOptions
				.map((fieldOption) => fieldOption.label)
				.filter(Boolean);

			return {
				...control,
				disableClearable: isEmpty(optionDefault),
				options: filteredOptions,
			};
		}
		return control;
	});

	// useEffect(() => {
	// 	const subscription = watch((value, { name, type }) => {
	// 		if (name.includes("options") && type === "change") {
	// 			const { options } = value || {};

	// 			const optionLabels = options.map((option) => option.label);

	// 			if (!optionLabels.includes(optionDefault)) {
	// 				setValue("defaultValue", "");
	// 			}
	// 		}
	// 	});

	// 	return () => subscription.unsubscribe();
	// }, [optionDefault, setValue, watch]);

	useEffect(() => {
		if (!isEmpty(fieldOptions)) {
			const optionLabels = fieldOptions.map((option) => option.label);

			if (!optionLabels.includes(optionDefault)) {
				setValue("defaultValue", "");
			}
		} else {
			setValue("defaultValue", "");
		}
	}, [fieldOptions, optionDefault, setValue]);

	return {
		formHook,
		updatedControls,
		getAppendValue,
	};
}

export default useScqSettings;
