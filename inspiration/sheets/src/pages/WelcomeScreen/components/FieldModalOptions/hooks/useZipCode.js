import { useForm } from "react-hook-form";

function useZipCode({ value = {} }) {
	const formHook = useForm({
		defaultValues: {
			allowOtherContry: false,
			...value?.options,
			description: value?.description || "",
		},
	});

	return {
		formHook,
	};
}

export default useZipCode;
