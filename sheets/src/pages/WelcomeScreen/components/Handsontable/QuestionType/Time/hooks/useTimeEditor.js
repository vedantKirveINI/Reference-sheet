import { useState, useEffect, useCallback, useRef } from "react";

import {
	getISOValue,
	parseISOValue,
} from "../../../../../../../utils/dateHelpers";
import validateTime from "../../../../../../../utils/validateTime";
import validateAndParseTime from "../utils/validateAndParseTime";

//to get timezone
const date = new Date();
const options = {
	timeZoneName: "short",
};
const timeWithZone = date.toLocaleString("en-US", options);
const timeZone = timeWithZone?.split(" ").pop();

function useTimeEditor({
	initialValue = "",
	onChange = () => {},
	cellProperties = {},
	superClose = () => {},
}) {
	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const settings = fieldInfo?.options || {};
	const { isTwentyFourHour = false } = settings;

	const { parsedValue } = validateAndParseTime(
		initialValue,
		isTwentyFourHour,
	);

	const { time = "", meridiem = "", ISOValue = "" } = parsedValue || {};

	const {
		hours = "",
		minutes = "",
		meridiem: meridiemFromISO = "",
	} = parseISOValue(ISOValue, isTwentyFourHour) || {};

	let timeFromISO = "";

	if (hours && minutes) {
		timeFromISO = `${hours}:${minutes}`;
	}

	const [timeValue, setTimeValue] = useState({
		time: time || timeFromISO,
		meridiem: meridiem || meridiemFromISO,
	});
	const [openDropdown, setOpenDropdown] = useState(false);

	const inputMaskRef = useRef(null);
	const triggerRef = useRef(null);

	const iconName = openDropdown ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	const handleTimeSave = useCallback(
		(updatedTime = {}) => {
			const { time = "", meridiem = "" } = updatedTime;

			const ISOValue = getISOValue(time, meridiem);

			if (validateTime({ timeValue: updatedTime, isTwentyFourHour })) {
				let meridiem = updatedTime?.meridiem;

				if (!time) {
					meridiem = "";
				}

				if (time && !meridiem) {
					const { meridiem: meridiemFromISO } =
						parseISOValue(ISOValue);
					meridiem = meridiemFromISO;
				}

				if (
					(time && meridiem) ||
					(timeValue?.time && timeValue?.meridiem)
				) {
					const val = JSON.stringify({
						...updatedTime,
						timeZone,
						ISOValue,
						meridiem,
					});

					onChange(val);
				}
			} else {
				inputMaskRef.current.focus();
			}
		},
		[isTwentyFourHour, onChange],
	);

	const handleKeyDown = (key) => {
		if (["Enter", "Tab"].includes(key.code)) {
			if (validateTime({ timeValue, isTwentyFourHour })) {
				const { time = "", meridiem = "" } = timeValue;
				let saveMeridiem = meridiem;

				const ISOValue = getISOValue(time, meridiem);

				if (!time) {
					saveMeridiem = "";
				}

				if (time && !meridiem) {
					const { meridiem: meridiemFromISO } =
						parseISOValue(ISOValue);
					saveMeridiem = meridiemFromISO;
				}

				if (time && meridiem) {
					onChange({
						time,
						meridiem: saveMeridiem,
						timeZone,
						ISOValue,
					});
				}
			}

			superClose();
		}
	};

	const handleInputFocus = useCallback(() => {
		if (openDropdown) {
			setOpenDropdown(false);
		}
	}, [openDropdown]);

	// Auto-save when timeValue changes
	useEffect(() => {
		handleTimeSave(timeValue);
	}, [handleTimeSave, timeValue]);

	// Focus input when dropdown closes
	useEffect(() => {
		if (!openDropdown && inputMaskRef.current) {
			inputMaskRef.current.focus();
		}
	}, [openDropdown]);

	return {
		timeValue,
		setTimeValue,
		handleKeyDown,
		inputMaskRef,
		isTwentyFourHour,
		openDropdown,
		setOpenDropdown,
		triggerRef,
		iconName,
		handleInputFocus,
	};
}

export default useTimeEditor;
