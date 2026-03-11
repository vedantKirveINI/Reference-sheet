import React, { memo } from "react";

import timeControls from "./config/timeControls";
import useTimePicker from "./hooks/useTimePicker";
import getField from "../../common/forms/getField";
import styles from "./styles.module.scss";

function TimePicker({ value, onChange = () => {}, ...rest }) {
	const { formHook, setTimeValues } = useTimePicker({
		value,
		onChange,
	});

	const { control } = formHook;

	return (
		<div className={styles.time_field_container}>
			{timeControls.map((config) => {
				const { name, type } = config;
				const Element = getField(type);

				return (
					<div key={name} className={styles.time_ele}>
						<Element
							{...config}
							{...rest}
							control={control}
							onChange={(e, v) => {
								setTimeValues((prev) => ({
									...prev,
									[name]: v,
								}));
							}}
							textFieldProps={{
								...config.textFieldProps,
								...(name !== "meridiem"
									? {
											InputProps: {
												endAdornment: <></>,
											},
										}
									: {}),
							}}
						/>
						{name !== "meridiem" && ":"}
					</div>
				);
			})}
		</div>
	);
}

export default memo(TimePicker);
