import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const useTimePicker = ({ value, onChange = () => {} }) => {
	const [timeValues, setTimeValues] = useState({ ...value });

	const formHook = useForm({ defaultValues: value });

	useEffect(() => {
		if (onChange) {
			onChange(timeValues);
		}
	}, [onChange, timeValues]);

	return {
		formHook,
		setTimeValues,
		timeValues,
	};
};

export default useTimePicker;
