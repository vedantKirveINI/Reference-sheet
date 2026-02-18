import { useForm } from "react-hook-form";

import getAddressControls from "../configuration/getAddressControls";

function useAddressSettings({ value = {} }) {
	const controls = getAddressControls();

	const formHook = useForm({
		defaultValues: {
			description: value?.description || "",
			...(value?.options || {}),
		},
	});

	return {
		formHook,
		controls,
	};
}

export default useAddressSettings;
