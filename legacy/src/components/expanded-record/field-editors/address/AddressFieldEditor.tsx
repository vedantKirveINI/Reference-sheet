import { useState, useMemo, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import { Input } from "@/components/ui/input";
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

	const valueString = useMemo(() => {
		if (!value) return "";
		if (typeof value === "string") return value;
		if (typeof value === "object" && value !== null) {
			return JSON.stringify(value);
		}
		return "";
	}, [value]);

	const { isValid = false, parsedValue = null } = useMemo(() => {
		return validateAndParseAddress(valueString);
	}, [valueString]);

	const displayAddress = useMemo(() => {
		if (!isValid || !parsedValue) return "";
		return getAddress(parsedValue);
	}, [isValid, parsedValue]);

	const handleClick = () => {
		if (readonly) return;
		setShowEditor(true);
	};

	const handleAddressChange = (addressDetails: string) => {
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
			<Input
				value={displayAddress}
				placeholder="Click to add address"
				onClick={handleClick}
				readOnly
				disabled={readonly}
				className={`w-full ${readonly ? "cursor-not-allowed" : "cursor-pointer"}`}
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
