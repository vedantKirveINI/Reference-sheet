/**
 * Address Field Editor for Expanded Record View
 *
 * Pattern: Matches Sheets implementation exactly
 * - Uses ODSTextField as read-only input showing formatted address
 * - Opens Address dialog on click
 * - Uses same Address component from cell-level editors
 */
import { useState, useMemo, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import ODSTextField from "oute-ds-text-field";
import Address from "@/cell-level/editors/address/Address";
import { validateAndParseAddress } from "@/cell-level/renderers/address/utils/validateAndParseAddress";
import { getAddress } from "@/cell-level/renderers/address/utils/getAddress";

export const AddressFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const [showEditor, setShowEditor] = useState(false);

	// Convert value to string format (Address component expects JSON string)
	const valueString = useMemo(() => {
		if (!value) return "";
		if (typeof value === "string") return value;
		if (typeof value === "object" && value !== null) {
			return JSON.stringify(value);
		}
		return "";
	}, [value]);

	// Parse and validate address for display
	const { isValid = false, parsedValue = null } = useMemo(() => {
		return validateAndParseAddress(valueString);
	}, [valueString]);

	// Get formatted address string for display
	const displayAddress = useMemo(() => {
		if (!isValid || !parsedValue) return "";
		return getAddress(parsedValue);
	}, [isValid, parsedValue]);

	// Handle click to open editor
	const handleClick = () => {
		if (readonly) return;
		setShowEditor(true);
	};

	// Handle address change from dialog
	const handleAddressChange = (addressDetails: string) => {
		// addressDetails is a JSON string from Address component
		// Parse it to object for onChange
		try {
			const parsed = JSON.parse(addressDetails);
			onChange(parsed);
		} catch {
			onChange(null);
		}
		setShowEditor(false);
	};

	return (
		<>
			<ODSTextField
				className="black"
				value={displayAddress}
				placeholder="Click to add address"
				onClick={handleClick}
				readOnly
				disabled={readonly}
				sx={{
					"& .MuiInputBase-input": {
						cursor: readonly ? "not-allowed" : "pointer",
					},
				}}
				fullWidth
				data-testid="address-expanded-row"
			/>

			{showEditor && (
				<Address
					show={showEditor}
					setShow={setShowEditor}
					initialValue={valueString}
					onChange={handleAddressChange}
					cellProperties={{}}
					close={() => setShowEditor(false)}
				/>
			)}
		</>
	);
};
