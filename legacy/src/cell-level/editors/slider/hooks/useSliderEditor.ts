import { useState, useCallback } from "react";
import type React from "react";
import { validateSlider } from "../../../renderers/slider/utils/validateSlider";

interface UseSliderEditorProps {
	initialValue: number | null;
	onChange?: (value: number | null) => void;
	minValue?: number;
	maxValue?: number;
}

export function useSliderEditor({
	initialValue,
	onChange = () => {},
	minValue = 0,
	maxValue = 10,
}: UseSliderEditorProps) {
	// Validate initial value and set to null if invalid
	const [sliderValue, setSliderValue] = useState<number | null>(() => {
		const { isValid, processedValue } = validateSlider({
			value: initialValue,
			minValue,
			maxValue,
		});
		return isValid ? processedValue : null;
	});

	// Handle slider value change (local state only - onChange called on save)
	const handleSliderChange = useCallback(
		(_event: Event | React.SyntheticEvent, newValue: number | number[]) => {
			const value = Array.isArray(newValue) ? newValue[0] : newValue;
			setSliderValue(value);
		},
		[],
	);

	// Handle save - call onChange with current value
	const handleSave = useCallback(() => {
		onChange(sliderValue);
	}, [sliderValue, onChange]);

	return {
		sliderValue: sliderValue ?? minValue, // MUI Slider needs a number, use minValue as default
		handleSliderChange,
		handleSave,
		minValue,
		maxValue,
	};
}
