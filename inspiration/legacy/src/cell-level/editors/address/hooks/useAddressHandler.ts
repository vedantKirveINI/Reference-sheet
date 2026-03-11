/**
 * Custom hook for address editor form management
 * Uses react-hook-form for form state
 * Inspired by sheets project's useAddressHandler
 */
import { useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { getControls } from "../utils/getControls";
import { validateAndParsedAddress } from "../utils/validateAndParseAddress";

interface UseAddressHandlerProps {
	initialValue?: string;
	cellProperties?: any;
	onChange?: (value: string) => void;
	onCellUpdate?: (value: string) => void;
	setShow?: (show: boolean) => void;
}

export function useAddressHandler({
	initialValue = "",
	cellProperties = {},
	onChange = () => {},
	onCellUpdate,
	setShow = () => {},
}: UseAddressHandlerProps) {
	// Memoize parsed value to prevent infinite loops
	const newValue = useMemo(() => {
		const { parsedValue } = validateAndParsedAddress(initialValue);
		return parsedValue || {};
	}, [initialValue]);

	// Memoize settings to prevent recreating controls on every render
	const settings = useMemo(() => {
		const { fieldInfo = {} } = cellProperties?.cellProperties || {};
		return fieldInfo?.options || {};
	}, [cellProperties]);

	// Memoize controls to prevent recreating array on every render
	const { controls } = useMemo(() => {
		return getControls({ settings });
	}, [settings]);

	// Memoize defaultValues to prevent form re-initialization
	const defaultValues = useMemo(() => {
		return newValue;
	}, [newValue]);

	const {
		register,
		formState: { errors },
		handleSubmit,
		reset,
	} = useForm({ defaultValues });

	// Track previous initialValue to prevent unnecessary resets
	const prevInitialValueRef = useRef<string>(initialValue);

	// Reset form when initialValue changes (only when it actually changes)
	// This ensures form prefills correctly when modal opens with existing data
	useEffect(() => {
		// Only reset if initialValue actually changed
		if (prevInitialValueRef.current !== initialValue) {
			prevInitialValueRef.current = initialValue;
			reset(newValue);
		}
	}, [initialValue, newValue, reset]);

	const handleSave = (data: any) => {
		setShow(false);
		onChange(JSON.stringify(data));
	};

	const onSubmit = (data: any) => {
		handleSave(data);
	};

	/**
	 * Clear all fields - resets form to empty values
	 * Pattern: Immediately updates the cell to show empty state
	 * This ensures the active cell display updates immediately when cleared
	 * Uses onCellUpdate to update cell without closing modal
	 */
	const handleAllFieldsClear = () => {
		const emptyValues = controls.reduce(
			(acc, config) => {
				acc[config.name] = "";
				return acc;
			},
			{} as Record<string, string>,
		);

		// Reset form with empty values
		reset(emptyValues);

		// Immediately update the cell to show empty state
		// Use onCellUpdate if available (updates cell without closing modal)
		// Otherwise use onChange (which will close modal)
		const updateCell = onCellUpdate || onChange;
		updateCell(JSON.stringify(null));
	};

	return {
		errors,
		controls,
		register,
		onSubmit,
		handleSubmit,
		handleAllFieldsClear,
	};
}
