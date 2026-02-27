import React from "react";

import { formatDate } from "../../../../../../../utils/dateHelpers";

import styles from "./styles.module.scss";

const DateRenderer = (props) => {
	const { value = "", fieldInfo = {} } = props;

	const { dateFormat = "DDMMYYYY", separator = "/" } =
		fieldInfo?.options || {};

	if (!value) return;
	let parsedDateValue = value;

	if (value instanceof Date) {
		parsedDateValue = value;
	} else {
		try {
			parsedDateValue = JSON.parse(value);
		} catch (error) {
			console.error("error >>", value, error);
		}
	}

	const newDateValue = parsedDateValue;

	const formattedDate = formatDate(newDateValue, dateFormat, separator);

	return (
		<div className={styles.date_renderer} data-testid="date-renderere">
			{formattedDate}
		</div>
	);
};

export default DateRenderer;
