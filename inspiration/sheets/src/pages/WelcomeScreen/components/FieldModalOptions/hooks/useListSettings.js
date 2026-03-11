import { useForm } from "react-hook-form";

import getListControls from "../configuration/getListControls";

const fieldDefaultValues = {
	description: "",
};

function getDefaultValue({ value }) {
	const { description = "" } = value || {};

	return {
		...fieldDefaultValues,
		description: description ?? "",
	};
}

function useListSettings({ value = {} }) {
	const controls = getListControls();

	const listDefaultValue = getDefaultValue({ value });

	const formHook = useForm({
		defaultValues: listDefaultValue,
	});

	return {
		formHook,
		updatedControls: controls,
	};
}

export default useListSettings;
