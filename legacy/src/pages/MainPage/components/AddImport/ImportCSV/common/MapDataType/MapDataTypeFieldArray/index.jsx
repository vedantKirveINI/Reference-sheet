import { Trash2, Plus } from "lucide-react";
import { useImperativeHandle, forwardRef, useCallback } from "react";
import { useFieldArray } from "react-hook-form";

import styles from "./styles.module.scss";
import getField from "../../../../../../../../common/forms/getField";
import { calculateWidth } from "../../../../../../utils/getWidthFromSpan";

const MapDataTypeFieldArray = forwardRef((props, ref) => {
	const {
		name = "",
		control = {},
		controls = [],
		errors = {},
		showAddButton = false,
		addButtonLabel = "Add Choice",
		addButtonColour = "#263238",
		getAppendValue = () => {},
		showDeleteIcon = false,
		showFirstFieldDelete = false,
	} = props || {};

	useImperativeHandle(ref, () => ({
		addField: handleAddField,
	}));

	const { fields, append, remove } = useFieldArray({
		control,
		name,
	});

	const handleAddField = useCallback(() => {
		append(getAppendValue(fields));
	}, [append, getAppendValue, fields]);

	const parentName = name;

	return (
		<div className={styles.field_array_content}>
			{fields.map((field, fieldIndex) => (
				<div key={field.id}>
					{fieldIndex < fields.length && (
						<div className={styles.divider} />
					)}
					<div
						className={`${styles.field_container} ${
							fieldIndex === 0 ? styles.first_field_container : ""
						}`}
					>
						Import Field {fieldIndex + 1}
					</div>
					<div className={styles.option_row}>
						{controls?.map((config, index) => {
							const {
								type,
								span,
								name: childControlName,
								InputProps = {},
							} = config;

							const Element = getField(type);
							const width = calculateWidth(span || 6);

							return (
								<div
									className={styles.option_container}
									key={`${parentName}.${index}.${childControlName}`}
									style={{ width }}
									data-testid={`${parentName}-${childControlName}-${fieldIndex}`}
								>
									<Element
										error={
											errors?.[name]?.[fieldIndex]?.[
												childControlName
											]
										}
										{...config}
										InputProps={{
											...InputProps,
											endAdornment:
												InputProps?.endAdornment,
										}}
										control={control}
										name={`${name}.${fieldIndex}.${childControlName}`}
									/>

									{errors?.[name]?.[fieldIndex]?.[
										childControlName
									]?.message && (
										<span
											style={{
												fontSize: "0.625rem",
												padding: "0.25rem 0",
												color: "#d32f2f",
												display: "block",
											}}
										>
											{
												errors[name][fieldIndex][
													childControlName
												].message
											}
										</span>
									)}
								</div>
							);
						})}
					</div>

					{showDeleteIcon &&
						(fields?.length > 1 || showFirstFieldDelete) && (
							<div
								onClick={() => remove(fieldIndex)}
								className={styles.remove_icon}
								tabIndex={0}
								role="button"
								onKeyDown={(e) =>
									e.key === "Enter" && remove(fieldIndex)
								}
							>
								<Trash2
									style={{
										color: "#90A4AE",
										width: "1.125rem",
										height: "1.125rem",
										cursor: "pointer",
									}}
								/>
							</div>
						)}
				</div>
			))}

			{showAddButton && (
				<div style={{ marginTop: "1rem" }}>
					<button
						type="button"
						onClick={handleAddField}
						style={{
							backgroundColor: addButtonColour,
							color: "#fff",
							padding: "0.5rem 1rem",
							borderRadius: "4px",
							border: "none",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "6px",
						}}
					>
						<Plus
							style={{ width: "14px", height: "14px" }}
						/>
						{addButtonLabel}
					</button>
				</div>
			)}
		</div>
	);
});

export default MapDataTypeFieldArray;
