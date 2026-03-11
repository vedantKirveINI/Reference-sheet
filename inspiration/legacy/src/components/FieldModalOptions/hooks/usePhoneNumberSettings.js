import { useForm } from "react-hook-form";

function usePhoneNumberSettings({ value = {} }) {
	const formHook = useForm({
		defaultValues: {
			description: value?.description || "", //use it to set a pre-filled value if description is saved with some value and if not i will set as ("")
			// defaultValue: "",
			...value?.options,
		},
	});

	return {
		formHook,
	};
}

export default usePhoneNumberSettings;
