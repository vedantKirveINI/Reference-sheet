import { useForm } from "react-hook-form";

function useEmailSettings({ value = {} }) {
	const formHook = useForm({
		defaultValues: {
			// defaultValue: "",
			...value?.options,
			description: value?.description || "",
		},
	});

	return {
		formHook,
	};
}

export default useEmailSettings;
