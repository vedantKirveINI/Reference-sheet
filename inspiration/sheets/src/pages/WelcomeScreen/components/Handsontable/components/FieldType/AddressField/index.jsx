import ODSTextField from "oute-ds-text-field";
import React, { useState } from "react";

import Address from "../../../QuestionType/Address/AddressEditor/Address";
import getAddress from "../../../QuestionType/Address/utils/getAddress";
import validateAndParsedAddress from "../../../QuestionType/Address/utils/validateAndParseAddress";

function AddressField({
	value = "",
	onChange = () => {},
	cellProperties = {},
	fieldIndex = 0,
}) {
	const [showEditor, setShowEditor] = useState(false);
	const { isValid = false, parsedValue = {} } =
		validateAndParsedAddress(value);

	const handleClick = () => {
		setShowEditor(true);
	};

	return (
		<>
			<ODSTextField
				className="black"
				value={isValid ? getAddress(parsedValue) : ""}
				placeholder="Click to add address"
				onClick={handleClick}
				readOnly
				sx={{
					"& .MuiInputBase-input": {
						cursor: "pointer",
					},
				}}
				fullWidth
				autoFocus={fieldIndex === 0}
				data-testid="address-expanded-row"
			/>

			{showEditor && (
				<Address
					show={showEditor}
					setShow={setShowEditor}
					initialValue={value}
					onChange={onChange}
					cellProperties={cellProperties}
				/>
			)}
		</>
	);
}

export default AddressField;
