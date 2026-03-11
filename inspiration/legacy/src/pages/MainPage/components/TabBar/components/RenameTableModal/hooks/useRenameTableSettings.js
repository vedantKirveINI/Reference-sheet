import { useForm } from "react-hook-form";

import getRenameTableControls from "../controls";

const fieldDefaultValues = {
	name: "",
};

function getDefaultValue({ value }) {
	return {
		...fieldDefaultValues,
		name: value?.name || "",
	};
}

function useRenameTableSettings({ value = {} }) {
	const controls = getRenameTableControls();

	const renameTableDefaultValue = getDefaultValue({ value });

	const formHook = useForm({
		defaultValues: renameTableDefaultValue,
	});

	return {
		formHook,
		controls,
	};
}

export default useRenameTableSettings;
