/**
 * Address Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows a modal-based pattern
 * Opens a Dialog modal for address editing
 * Similar to how Address editor works in sheets project
 */
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { IAddressCell } from "@/types";
import Address from "./Address";
import { validateAndParseAddress } from "../../renderers/address/utils/validateAndParseAddress";

interface AddressEditorProps {
	cell: IAddressCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: any) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

export const AddressEditor: React.FC<AddressEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	const [show, setShow] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	/**
	 * Parse initial value (handles both JSON string and object)
	 * Pattern: Like CurrencyEditor - use useMemo to parse value
	 */
	const initialValue = useMemo(() => {
		const { parsedValue } = validateAndParseAddress(cell?.data);
		if (parsedValue) {
			return JSON.stringify(parsedValue);
		}
		return "";
	}, [cell?.data]);

	// Open modal when editing starts
	useEffect(() => {
		if (isEditing) {
			setShow(true);
		}
	}, [isEditing]);

	/**
	 * Handle address change from modal
	 * Saves address as JSON string and closes modal
	 */
	const handleChange = useCallback(
		(addressDetails: string) => {
			// addressDetails is already a JSON string from Address component
			onChange(addressDetails);
			setShow(false);
			onSave?.();
		},
		[onChange, onSave],
	);

	/**
	 * Handle cell update without closing modal
	 * Used for Clear All to update cell display immediately
	 */
	const handleCellUpdate = useCallback(
		(addressDetails: string) => {
			// Update cell display without closing modal
			onChange(addressDetails);
		},
		[onChange],
	);

	/**
	 * Handle modal close
	 */
	const handleClose = useCallback(() => {
		setShow(false);
		onCancel?.();
	}, [onCancel]);

	/**
	 * Keyboard event handler
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				handleClose();
			}
		},
		[handleClose],
	);

	/**
	 * Editor positioning and styling
	 * For modal-based editors, we just need a trigger element
	 */
	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width}px`,
		height: `${rect.height}px`,
		zIndex: 1000,
		pointerEvents: "auto",
	};

	return (
		<>
			{/* Hidden trigger div - modal opens automatically when isEditing is true */}
			<div
				ref={containerRef}
				style={editorStyle}
				onKeyDown={handleKeyDown}
				tabIndex={-1}
				data-testid="address-editor"
			/>
			{/* Address Modal */}
			<Address
				initialValue={initialValue}
				onChange={handleChange}
				onCellUpdate={handleCellUpdate}
				cellProperties={{}}
				show={show}
				setShow={setShow}
				close={handleClose}
			/>
		</>
	);
};

