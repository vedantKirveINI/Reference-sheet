import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import calculateDateTime from "../utils/calculateDateTime";
dayjs.extend(utc);

const getDefaultValue = (value) => {
	const defaultDate = new Date();

	if (value) {
		const formattedDate = dayjs(value);

		return {
			date: formattedDate,
			time: {
				hours: formattedDate.format("hh"),
				minutes: formattedDate.format("mm"),
				meridiem: formattedDate.format("A"),
			},
		};
	}

	return {
		time: {
			hours: defaultDate.getHours() % 12 || 12,
			minutes: defaultDate.getMinutes(),
			meridiem: defaultDate.getHours() >= 12 ? "PM" : "AM",
		},
	};
};

export const useDateTimePicker = ({
	value,
	onSubmit = () => {},
	onPopperChange = () => {},
	onPopoverBlur = () => {},
	inputFocus = true,
}) => {
	const [dateTimeVal, setDateTimeVal] = useState(value ? dayjs(value) : null);

	const [isPickerOpen, setIsPickerOpen] = useState(false);

	const dateTimeInputRef = useRef(null);
	const popperRef = useRef(null);

	const formHook = useForm({
		defaultValues: getDefaultValue(value),
	});

	const { reset } = formHook;

	const onSubmitHandler = (data) => {
		const updateDateTime = calculateDateTime(data);

		setDateTimeVal(updateDateTime);
		onSubmit(updateDateTime.toISOString());

		setIsPickerOpen(false);
	};

	const currentMeridiem = dateTimeVal
		? dayjs(dateTimeVal).format("a")
		: dayjs().format("a");

	const onPopoverBlurHandler = useCallback(
		(event) => {
			if (
				popperRef.current &&
				!popperRef.current.contains(event.target)
			) {
				onPopoverBlur();
			}
		},
		[onPopoverBlur],
	);

	useEffect(() => {
		if (!value) {
			reset();
			setDateTimeVal(() => null);
		}
	}, [reset, value]);

	useEffect(() => {
		if (onPopperChange) {
			onPopperChange(isPickerOpen);
		}
	}, [isPickerOpen, onPopperChange]);

	useEffect(() => {
		if (!isPickerOpen && inputFocus && dateTimeInputRef.current.focus) {
			dateTimeInputRef.current.focus();
		}
	}, [isPickerOpen]);

	useEffect(() => {
		if (isPickerOpen) {
			document.addEventListener("mousedown", onPopoverBlurHandler);
		}

		return () => {
			document.removeEventListener("mousedown", onPopoverBlurHandler);
		};
	}, [isPickerOpen, onPopoverBlurHandler]);

	return {
		dateTimeVal,
		setDateTimeVal,
		formHook,
		onSubmitHandler,
		isPickerOpen,
		dateTimeInputRef,
		setIsPickerOpen,
		currentMeridiem,
		popperRef,
	};
};
