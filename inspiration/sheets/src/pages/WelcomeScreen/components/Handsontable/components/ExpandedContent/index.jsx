import FIELD_TYPE_COMPONENT_MAP from "../../utils/fieldTypeComponentMapping";
import FieldLabel from "../FieldLabel";

import styles from "./styles.module.scss";

function ExpandedContentRenderer({
	fields = [],
	record = {},
	onFieldChange = () => {},
	editedFields = {},
}) {
	return (
		<div className={styles.expanded_content_container}>
			{(fields || []).map((field, fieldIndex) => {
				const { name, type, id, dbFieldName } = field;
				const originalValue = record[dbFieldName];
				const value =
					dbFieldName in editedFields
						? editedFields[dbFieldName]
						: originalValue;

				const Component = FIELD_TYPE_COMPONENT_MAP[type];

				// Check if current field is the last one in the array
				const isLastIndex = fieldIndex === fields.length - 1;

				return (
					<FieldLabel
						key={id}
						label={name}
						type={type}
						isLastIndex={isLastIndex}
					>
						{Component ? (
							<Component
								fieldIndex={fieldIndex}
								value={value}
								onChange={(e) => {
									return onFieldChange(
										dbFieldName,
										e?.target?.value ?? e,
									);
								}}
								field={field}
							/>
						) : (
							<div>{String(value ?? "")}</div>
						)}
					</FieldLabel>
				);
			})}
		</div>
	);
}

export default ExpandedContentRenderer;
