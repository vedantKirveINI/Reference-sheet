import { useForm } from "react-hook-form";

import getCreatedTimeControls from "../configuration/getCreatedTimeControls";
import getDefaultCreatedTimeValue from "../utils/getDefaultValue";

function useCreatedTimeSettings({ value = {} }) {
	const controls = getCreatedTimeControls();

	const formHook = useForm({
		defaultValues: getDefaultCreatedTimeValue({ value }),
	});

	const {
		formState: { errors },
		control,
		handleSubmit,
	} = formHook;

	return {
		errors,
		control,
		handleSubmit,
		controls,
	};
}

export default useCreatedTimeSettings;
