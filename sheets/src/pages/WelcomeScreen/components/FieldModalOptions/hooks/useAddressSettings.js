import { useForm } from "react-hook-form";

import getAddressControls from "../configuration/getAddressControls";

function useAddressSettings({ value = {} }) {
	const controls = getAddressControls();

	const formHook = useForm({
		defaultValues: {
			...value?.options,
			description: value.description,
		},
	});

	return {
		formHook,
		controls,
	};
}

export default useAddressSettings;
