import { DateInput } from "@oute/oute-ds.atom.date-input";
import { forwardRef } from "react";

import useDateEditor from "../hooks/useDateEditor";

import styles from "./styles.module.scss";

function Date(
	{
		initialValue = "",
		onChange = () => {},
		cellProperties = {},
		superClose = () => {},
	},
	ref,
) {
	const {
		dateValue = "",
		setDateValue = () => {},
		dateFormat = "DDMMYYYY",
		separator = "/",
		useDatePicker = true,
		handleDateSave = () => {},
		handleKeyDown = () => {},
	} = useDateEditor({ initialValue, onChange, cellProperties, superClose });

	return (
		<div
			className={styles.date_container}
			onKeyDown={handleKeyDown}
			ref={ref}
			data-testid="date-editor"
		>
			{dateValue && (
				<DateInput
					value={dateValue}
					onChange={(value) => {
						setDateValue(value);
						handleDateSave(value);
					}}
					autoFocus={true}
					format={dateFormat}
					separator={separator}
					enableCalender={useDatePicker}
				/>
			)}
		</div>
	);
}

export default forwardRef(Date);
