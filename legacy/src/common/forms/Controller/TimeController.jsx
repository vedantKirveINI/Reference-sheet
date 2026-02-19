import { Input } from "@/components/ui/input";
import React from "react";
import { Controller } from "react-hook-form";

function TimeController(props) {
	const {
		name = "",
		defaultValue,
		control = {},
		rules = {},
		label = "",
		className,
		...rest
	} = props || {};

	return (
		<Controller
			name={name}
			control={control}
			defaultValue={defaultValue}
			rules={rules}
			render={({ field: { onChange, value } }) => {
				const handleTimeChange = (e) => {
					const timeValue = e.target.value;
					if (timeValue) {
						const [hours, minutes] = timeValue.split(":");
						const hour = parseInt(hours, 10);
						const meridiem = hour >= 12 ? "PM" : "AM";
						const displayHour = hour % 12 || 12;
						const formattedTime = `${String(displayHour).padStart(2, "0")}:${minutes}`;
						onChange({
							time: formattedTime,
							meridiem: meridiem,
						});
					} else {
						onChange({ time: "", meridiem: "AM" });
					}
				};

				let inputValue = "";
				if (value?.time) {
					const [hours, minutes] = value.time.split(":");
					let hour = parseInt(hours, 10);
					if (value.meridiem === "PM" && hour !== 12) {
						hour += 12;
					} else if (value.meridiem === "AM" && hour === 12) {
						hour = 0;
					}
					inputValue = `${String(hour).padStart(2, "0")}:${minutes}`;
				}

				return (
					<Input
						type="time"
						{...rest}
						className={className}
						value={inputValue}
						onChange={handleTimeChange}
					/>
				);
			}}
		/>
	);
}

export default TimeController;
