import { DateInput } from "@oute/oute-ds.atom.date-input";
import React from "react";

import { formatDate } from "../../../../utils/dateHelpers";

import styles from "./styles.module.scss";

const DateFilter = ({
	defaultValue = "",
	onChange = () => {},
	dateFormat,
	useDatePicker,
	separator,
	...rest
}) => {
	const dateValue = formatDate(defaultValue, dateFormat, separator);

	return (
		<div className={styles.filter_date_container}>
			<DateInput
				{...rest}
				format={dateFormat}
				separator={separator}
				enableCalender={useDatePicker}
				value={{
					value: dateValue,
					ISOValue: defaultValue,
				}}
				onChange={(e) => {
					onChange(e?.ISOValue);
				}}
			/>
		</div>
	);
};

export default DateFilter;
