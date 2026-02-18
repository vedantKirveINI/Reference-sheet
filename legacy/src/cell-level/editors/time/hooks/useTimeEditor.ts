/**
 * Custom hook for Time editor
 * Manages time input state, validation, and formatting
 * Inspired by sheets project's useTimeEditor
 */
import {
	useState,
	useEffect,
	useCallback,
	useRef,
	type SetStateAction,
} from "react";
import type { ITimeCell } from "@/types";
import {
	validateAndParseTime,
	parseISOValueForTime,
	getISOValue,
} from "@/utils/dateHelpers";
import { validateTime } from "../../../renderers/time/utils/validateTime";
import { getTimeZone } from "../utils/timeHelpers";

interface UseTimeEditorProps {
	initialValue: ITimeCell | null;
	onChange: (value: ITimeCell["data"]) => void;
	isTwentyFourHour?: boolean;
}

interface TimeValue {
	time: string;
	meridiem: string;
}

export function useTimeEditor({
	initialValue,
	onChange,
	isTwentyFourHour = false,
}: UseTimeEditorProps) {
	// Parse initial value
	const initialData = initialValue?.data || null;
	const { isValid, parsedValue } = validateAndParseTime(
		initialData,
		isTwentyFourHour,
	);

	const { time = "", meridiem = "", ISOValue = "" } = parsedValue || {};

	// Parse from ISO if time is missing
	const parsedFromISO = ISOValue
		? parseISOValueForTime(ISOValue, isTwentyFourHour)
		: null;

	const {
		hours = "",
		minutes = "",
		meridiem: meridiemFromISO = "",
	} = parsedFromISO || {};

	let timeFromISO = "";
	if (hours && minutes) {
		timeFromISO = `${hours}:${minutes}`;
	}

	// Initialize state
	const [timeValue, setTimeValueState] = useState<TimeValue>({
		time: time || timeFromISO,
		meridiem: meridiem || meridiemFromISO,
	});
	// Track if the user actually edited anything; used to skip saving on no-op close
	const [hasUserEdited, setHasUserEdited] = useState(false);

	const [openDropdown, setOpenDropdown] = useState(false);
	const inputMaskRef = useRef<HTMLInputElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);

	const iconName = openDropdown ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	// Get timezone
	const timeZone = getTimeZone();

	/**
	 * Save time value - called on Enter/Tab/blur
	 * This follows the pattern of calling onChange only on save events
	 */
	const handleSave = useCallback(() => {
		// If nothing was changed by the user, don't emit onChange (preserve existing value/error)
		if (!hasUserEdited) {
			return;
		}

		// Trim time value to handle any whitespace from input mask
		let { time = "", meridiem = "" } = timeValue;
		time = time.trim();
		meridiem = meridiem.trim();

		// For 24hr format, ensure meridiem is empty
		if (isTwentyFourHour) {
			meridiem = "";
		}

		// Skip validation if time is empty (allow clearing the cell)
		if (!time) {
			// If time is empty, save empty data
			onChange(null);
			return;
		}

		// Validate time format (only the time part, not meridiem)
		if (validateTime({ timeValue: { time }, isTwentyFourHour })) {
			// Generate ISO value (for 24hr format, meridiem should be null)
			const ISOValue = getISOValue(
				time,
				isTwentyFourHour ? null : meridiem || null,
			);

			// For 12hr format, handle missing meridiem
			if (!isTwentyFourHour && !meridiem) {
				// Try to get meridiem from ISO
				const parsed = parseISOValueForTime(ISOValue, isTwentyFourHour);
				if (parsed?.meridiem) {
					meridiem = parsed.meridiem;
				}
			}

			// Only save if we have valid ISO value (getISOValue validates length)
			if (ISOValue) {
				const payload: ITimeCell["data"] = {
					time,
					meridiem: isTwentyFourHour ? "" : meridiem,
					ISOValue,
					timeZone: time ? timeZone : "",
				};

				onChange(payload);
			}
		}
		// If validation fails, don't save (cell will remain unchanged or clear)
	}, [hasUserEdited, timeValue, isTwentyFourHour, onChange, timeZone]);

	/**
	 * Reset to initial value (for Escape key)
	 */
	const resetToInitial = useCallback(() => {
		setTimeValueState({
			time: time || timeFromISO,
			meridiem: meridiem || meridiemFromISO,
		});
		setHasUserEdited(false);
	}, [time, timeFromISO, meridiem, meridiemFromISO]);

	/**
	 * Handle input focus - close dropdown if open
	 */
	const handleInputFocus = useCallback(() => {
		if (openDropdown) {
			setOpenDropdown(false);
		}
	}, [openDropdown]);

	/**
	 * Wrapper setter that also marks the editor as "dirty" when user changes time/meridiem.
	 * Supports both functional and value setters (mirrors React setState API).
	 */
	const setTimeValue = useCallback(
		(value: SetStateAction<TimeValue>) => {
			setHasUserEdited(true);
			setTimeValueState(value);
		},
		[],
	);

	// Focus input when dropdown closes
	useEffect(() => {
		if (!openDropdown && inputMaskRef.current) {
			inputMaskRef.current.focus();
		}
	}, [openDropdown]);

	return {
		timeValue,
		setTimeValue,
		handleSave,
		resetToInitial,
		inputMaskRef,
		isTwentyFourHour,
		openDropdown,
		setOpenDropdown,
		triggerRef,
		iconName,
		handleInputFocus,
	};
}
