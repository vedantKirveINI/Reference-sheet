import React from "react";
import { Controller } from "react-hook-form";

function TimeController(props) {
	const {
		name = "",
		defaultValue,
		control = {},
		rules = {},
		label = "",
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
						const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
						const time = `${String(displayHour).padStart(2, "0")}:${minutes}`;
						onChange({ time, meridiem });
					} else {
						onChange({ time: "", meridiem: "AM" });
					}
				};

				let timeInputValue = "";
				if (value?.time) {
					const [h, m] = value.time.split(":");
					let hour24 = parseInt(h, 10);
					if (value.meridiem === "PM" && hour24 !== 12) hour24 += 12;
					if (value.meridiem === "AM" && hour24 === 12) hour24 = 0;
					timeInputValue = `${String(hour24).padStart(2, "0")}:${m}`;
				}

				return (
					<div className="w-full">
						{label && (
							<label className="text-sm font-medium text-gray-700 mb-1 block">
								{label}
							</label>
						)}
						<input
							type="time"
							className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							value={timeInputValue}
							onChange={handleTimeChange}
							{...rest}
						/>
					</div>
				);
			}}
		/>
	);
}

export default TimeController;
