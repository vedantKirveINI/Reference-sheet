import isEmpty from "lodash/isEmpty";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

import getRankingControls from "../configuration/getRankingControls";
import transformedOptions from "../utils/transformRankingOptions";

const fieldDefaultValues = {
	description: "",
	options: [{ id: uuidv4(), label: "", rank: null }],
};

const getAppendValue = () => ({
	id: uuidv4(),
	rank: null,
	label: "",
});

function getDefaultValue({ value }) {
	const { description = "" } = value || {};

	const options = transformedOptions(value)?.map((option) => ({
		...option,
		rank: null,
	}));

	return {
		...fieldDefaultValues,
		options,
		description: description ?? "",
	};
}

function useRankingSettings({ value = {} }) {
	const controls = getRankingControls();
	const rankingDefaultValue = getDefaultValue({ value });

	const formHook = useForm({
		defaultValues: rankingDefaultValue,
	});

	const { watch } = formHook;
	const [fieldOptions] = watch(["options"]);

	const updatedControls = controls.map((control) => {
		if (control.name === "options" && !isEmpty(fieldOptions)) {
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

	return {
		formHook,
		updatedControls,
		getAppendValue,
	};
}

export default useRankingSettings;
