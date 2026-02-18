import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import React from "react";

import DateTimePicker from "../../../DateTimePicker";
dayjs.extend(timezone);

function DateTimeFilter(props) {
	const {
		defaultValue = "",
		onChange = () => {},
		dateFormat,
		...rest
	} = props;

	const onChangeHandler = (dateVal) => {
		try {
			const date = dayjs(dateVal);

			if (!date.isValid()) {
				return;
			}
			const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			const localDate = date.tz(timeZone).format("DD/MM/YYYY");

			onChange(localDate);
		} catch {}
	};

	return (
		<div className="w-full p-2">
			<DateTimePicker
				{...rest}
				includeTime={false}
				dateFormat={dateFormat}
				value={defaultValue ? dayjs(defaultValue, "DDMMYYYY") : null}
				onChange={onChangeHandler}
				onSubmit={onChangeHandler}
			/>
		</div>
	);
}

export default DateTimeFilter;
