import { useForm } from "react-hook-form";

import getControls from "../utils/getControls";
import validateAndParsedAddress from "../utils/validateAndParseAddress";

function useAddressHandler({
	initialValue = "",
	cellProperties = {},
	onChange = () => {},
	setShow = () => {},
}) {
	const { parsedValue: newValue } = validateAndParsedAddress(initialValue);

	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const settings = fieldInfo?.options || {};

	const { controls } = getControls({
		settings,
	});

	const {
		register,
		formState: { errors },
		handleSubmit,
		reset,
	} = useForm({ defaultValues: newValue });

	const handleSave = (data) => {
		setShow(false);
		onChange(JSON.stringify(data));
	};

	const onSubmit = (data) => {
		handleSave(data);
	};

	const handleAllFieldsClear = () => {
		const emptyValues = controls.reduce((acc, config) => {
			acc[config.name] = "";
			return acc;
		}, {});
		reset(emptyValues);
	};

	return {
		errors,
		controls,
		register,
		onSubmit,
		handleSubmit,
		handleAllFieldsClear,
	};
}

export default useAddressHandler;
