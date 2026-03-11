import kebabCase from "lodash/kebabCase";
import ODSTextField from "oute-ds-text-field";

function TextField({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) {
	const { type = "" } = field || {};

	const isMultiline = type === "LONG_TEXT";

	return (
		<ODSTextField
			className="black"
			onChange={onChange}
			value={value || ""}
			multiline={isMultiline}
			rows={isMultiline ? 7 : undefined}
			autoFocus={fieldIndex === 0}
			data-testid={`${kebabCase(type)}-expanded-row`}
			disabled={type === "ENRICHMENT"}
			fullWidth
		/>
	);
}

export default TextField;
