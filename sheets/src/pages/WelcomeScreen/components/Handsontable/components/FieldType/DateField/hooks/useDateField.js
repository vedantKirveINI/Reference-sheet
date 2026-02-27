import { useRef, useState } from "react";

const useDateField = ({ value = "", onChange = () => {}, field = {} }) => {
	const [dateTimeVal, setDateTimeVal] = useState(value);
	const dateTimeInputRef = useRef(null);

	const onChangeHandler = (updatedDateTime) => {
		setDateTimeVal(updatedDateTime);
		if (typeof updatedDateTime === "object") {
			onChange(null);
			return;
		}

		onChange(updatedDateTime);
	};

	const {
		dateFormat = "DDMMYYYY",
		separator = "/",
		includeTime = false,
	} = field?.options || {};

	return {
		dateTimeVal,
		onChangeHandler,
		dateTimeInputRef,
		dateFormat,
		separator,
		includeTime,
	};
};

export default useDateField;
