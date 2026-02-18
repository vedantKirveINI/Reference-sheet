import React, { memo } from "react";

import timeControls from "./config/timeControls";
import useTimePicker from "./hooks/useTimePicker";
import getField from "../../common/forms/getField";

function TimePicker({ value, onChange = () => {}, ...rest }) {
	const { formHook, setTimeValues } = useTimePicker({
		value,
		onChange,
	});

	const { control } = formHook;

	return (
		<div className="flex items-center gap-2.5">
			{timeControls.map((config) => {
				const { name, type } = config;
				const Element = getField(type);

				return (
					<div key={name} className="flex items-center gap-2">
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
