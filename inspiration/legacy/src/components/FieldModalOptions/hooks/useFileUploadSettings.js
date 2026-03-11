import { useForm } from "react-hook-form";

import getFileUploadControls from "../configuration/getFileUploadControls";

const fieldDefaultValues = {
	description: "",
	allowedFileTypes: [],
	fileSize: 10,
};

function useFileUploadSettings({ value = {} }) {
	const controls = getFileUploadControls({
		...fieldDefaultValues,
		...value?.options,
	});

	const formHook = useForm({
		defaultValues: {
			...fieldDefaultValues,
			...value?.options,
			description: value?.description || "",
		},
	});

	return {
		formHook,
		controls,
	};
}

export default useFileUploadSettings;
