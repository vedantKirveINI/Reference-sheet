import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import getDateControls from "../configuration/getDateControls";

const getDefaultValue = ({ value = {} }) => {
	const { defaultValue } = value?.options || {};

	return {
		dateFormat: "DDMMYYYY",
		description: value?.description || "",
		separator: "/",
		includeTime: false,
		...value?.options,
		defaultValue,
	};
};

function useDateSettings({ value = {} }) {
	const [controls, setControls] = useState(getDateControls());

	const formHook = useForm({
		defaultValues: getDefaultValue({ value }),
	});

	const { watch, resetField } = formHook || {};
	const [dateFormat, includeTime] = watch(["dateFormat", "includeTime"]);

	useEffect(() => {
		if (dateFormat) {
			resetField("defaultValue");

			setControls((prev) => {
				return prev.map((config) => {
					const { name } = config || {};

					if (name !== "defaultValue") return config;

					return {
						...config,
						dateFormat,
						includeTime,
					};
				});
			});
		}
	}, [dateFormat, resetField, includeTime]);

	return {
		formHook,
		controls,
	};
}

export default useDateSettings;
