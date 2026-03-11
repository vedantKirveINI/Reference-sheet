import { useState } from "react";

import { formatDate } from "../../../../../../../utils/dateHelpers";

function useDateEditor({
	initialValue = "",
	cellProperties = {},
	onChange = () => {},
	superClose = () => {},
}) {
	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const {
		dateFormat = "DDMMYYYY",
		separator = "/",
		useDatePicker = true,
	} = fieldInfo?.options || {};

	const newDateValue = JSON.parse(initialValue);

	const formattedDate = formatDate(newDateValue, dateFormat, separator);

	const [dateValue, setDateValue] = useState({
		value: formattedDate || "",
		ISOValue: initialValue || "",
	});

	const handleDateSave = (updatedDate = {}) => {
		const { ISOValue = "" } = updatedDate;

		if (!ISOValue) return;

		onChange(JSON.stringify(ISOValue));
	};

	const handleKeyDown = (key) => {
		if (key.code === "Enter") {
			const { ISOValue } = dateValue;

			const date = new Date(ISOValue);
			const dateString = date.toString();

			if (typeof date === "object" && dateString !== "Invalid Date") {
				onChange(JSON.stringify(ISOValue));
			} else {
				onChange(ISOValue);
			}

			superClose();
		}
	};

	return {
		dateValue,
		setDateValue,
		dateFormat,
		separator,
		useDatePicker,
		handleDateSave,
		handleKeyDown,
	};
}

export default useDateEditor;
