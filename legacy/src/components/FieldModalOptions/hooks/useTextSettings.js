import { useForm } from "react-hook-form";

function useTextSettings({ value = {} }) {
	const formHook = useForm({
		defaultValues: {
			description: value?.description || "",
			// defaultValue: "",
			...value?.options,
		},
	});

	return {
		formHook,
	};
}

export default useTextSettings;
