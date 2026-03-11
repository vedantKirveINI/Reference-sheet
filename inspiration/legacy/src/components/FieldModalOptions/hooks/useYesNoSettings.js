import { useForm } from "react-hook-form";

import getYesNoControls from "../configuration/getYesNoControls";

function useYesNoSettings({ value = {} }) {
	const controls = getYesNoControls();

	const formHook = useForm({
		defaultValues: {
			...value?.options,
			defaultChoice:
				value?.options?.defaultChoice === ""
					? undefined
					: value?.options?.defaultChoice,
			description: value?.description || "",
		},
	});

	// const { watch, setValue } = formHook;

	// const [defaultChoice, other] = watch(["defaultChoice", "other"]);

	// useEffect(() => {
	// 	let updatedOptions = [...options];

	// 	if (other && !updatedOptions.some((opt) => opt?.label === "Other")) {
	// 		updatedOptions.push({ id: 3, label: "Other" });
	// 	} else if (!other) {
	// 		updatedOptions = updatedOptions.filter(
	// 			(opt) => opt?.label !== "Other",
	// 		);
	// 	}

	// 	setOptions(updatedOptions);

	// 	setControls((prev) => {
	// 		return prev.map((config) => {
	// 			if (config.name !== "defaultChoice") return config;
	// 			return {
	// 				...config,
	// 				options: updatedOptions,
	// 			};
	// 		});
	// 	});

	// 	if (!other && defaultChoice?.label === "Other") {
	// 		setValue("defaultChoice", "");
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [other]);

	return {
		formHook,
		controls,
	};
}

export default useYesNoSettings;
