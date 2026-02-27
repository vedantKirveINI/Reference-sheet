import { useEffect, useRef, useState } from "react";

const useDateTimeEditor = ({
	initialValue,
	onChange,
	superClose,
	setIsPopperOpen,
}) => {
	const [dateTimeVal, setDateTimeVal] = useState(initialValue);
	const [popperState, setPopperState] = useState(false);

	const dateTimeInputRef = useRef(null);

	const onChangeHandler = (updatedDateTime) => {
		setDateTimeVal(updatedDateTime);
		if (typeof updatedDateTime === "object") {
			onChange(null);
			return;
		}

		onChange(updatedDateTime);
	};

	const onKeyDownHandler = (key) => {
		if (key?.code !== "Enter") return;

		if (typeof dateTimeVal === "object") {
			onChange(null);
			superClose();
			return;
		}

		onChange(dateTimeVal);
		superClose();
	};

	useEffect(() => {
		setIsPopperOpen(popperState);
	}, [popperState, setIsPopperOpen]);

	useEffect(() => {
		if (dateTimeInputRef.current?.input) {
			dateTimeInputRef.current.input.focus();
		}
	}, []);

	return {
		dateTimeVal,
		onChangeHandler,
		onKeyDownHandler,
		setPopperState,
		dateTimeInputRef,
	};
};

export default useDateTimeEditor;
