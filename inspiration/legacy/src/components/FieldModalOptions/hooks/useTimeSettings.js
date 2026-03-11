import { useForm } from "react-hook-form";

function useTimeSettings({ value = {} }) {
	const formHook = useForm({
		defaultValues: {
			description: value?.description || "",
			isTwentyFourHour: false,
			...value?.options,
		},
	});

	return {
		formHook,
	};
}

export default useTimeSettings;
