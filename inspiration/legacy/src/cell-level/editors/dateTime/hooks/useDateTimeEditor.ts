import { useState, useRef, useCallback } from "react";
import type { IDateTimeCell } from "@/types";

interface UseDateTimeEditorProps {
	initialValue: IDateTimeCell | null;
	onChange: (value: string | null) => void;
}

export function useDateTimeEditor({
	initialValue,
	onChange,
}: UseDateTimeEditorProps) {
	const initialData = initialValue?.data || null;
	const [dateTimeVal, setDateTimeVal] = useState<string | null>(initialData);

	const dateTimeInputRef = useRef<any>(null);

	const onChangeHandler = useCallback((updatedDateTime: string | null) => {
		setDateTimeVal(updatedDateTime);
	}, []);

	const handleOkClick = useCallback(
		(updatedDateTime: string | null) => {
			setDateTimeVal(updatedDateTime);
		},
		[onChange],
	);

	const handleSave = useCallback(() => {
		onChange(dateTimeVal);
	}, [dateTimeVal, onChange]);

	/**
	 * Reset to initial value (for Escape key)
	 */
	const resetToInitial = useCallback(() => {
		setDateTimeVal(initialData);
	}, [initialData]);

	return {
		dateTimeVal,
		onChangeHandler,
		handleOkClick,
		handleSave,
		resetToInitial,
		dateTimeInputRef,
	};
}
