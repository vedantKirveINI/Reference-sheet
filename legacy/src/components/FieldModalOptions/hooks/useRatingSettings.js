import { useForm } from "react-hook-form";

import getRatingControls from "../configuration/getRatingControls";

function useRatingSettings({ value = {} }) {
	const {
		formState: { errors },
		handleSubmit,
		control,
	} = useForm({
		defaultValues: {
			description: value?.description || "",
			...value?.options,
		},
	});

	const controls = getRatingControls();

	return {
		controls,
		errors,
		handleSubmit,
		control,
	};
}

export default useRatingSettings;
