import DateTimePicker from "../../../../../../../components/DateTimePicker";

import useDateField from "./hooks/useDateField";
import styles from "./styles.module.scss";

const DateField = ({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) => {
	const {
		dateTimeVal,
		onChangeHandler,
		dateTimeInputRef,
		dateFormat,
		separator,
		includeTime,
	} = useDateField({ value, onChange, field });

	return (
		<div
			className={styles.date_field_container}
			data-testid="date-time-expanded-row"
		>
			<DateTimePicker
				value={dateTimeVal}
				dateFormat={dateFormat}
				separator={separator}
				includeTime={includeTime}
				onChange={onChangeHandler}
				onSubmit={onChangeHandler}
				inputRef={dateTimeInputRef}
				hideBorders={true}
				inputFocus={fieldIndex === 0}
				sx={{
					".MuiInputBase-root": {
						borderRadius: "0.25rem",
					},
					".MuiInputBase-input": {
						padding: "0.31rem 0.45rem",
					},
				}}
			/>
		</div>
	);
};

export default DateField;
