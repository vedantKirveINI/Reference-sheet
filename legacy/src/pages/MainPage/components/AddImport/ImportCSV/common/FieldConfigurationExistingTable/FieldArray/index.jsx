import { Error } from "@oute/oute-ds.atom.error";
import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import {
	useImperativeHandle,
	forwardRef,
	useCallback,
	useState,
	useRef,
	useEffect,
} from "react";
import { useFieldArray } from "react-hook-form";

import getField from "../../../../../../../../common/forms/getField";
import { calculateWidth } from "../../../../../../utils/getWidthFromSpan";

import styles from "./styles.module.scss";

const FieldArrayController = forwardRef((props, ref) => {
	const {
		name = "",
		control = {},
		controls = [],
		errors = {},
		showAddButton = false,
		addButtonLabel = "Add Choice",
		addButtonColour = "#263238",
		getAppendValue = () => {},
		showFirstFieldDelete = false,
		focusFieldName = "",
	} = props || {};

	const [lastFieldAdded, setLastFieldAdded] = useState(false);
	const fieldRefs = useRef({});

	useImperativeHandle(ref, () => ({
		addField: handleAddField,
		[name]: fieldRefs.current?.[name],
	}));

	const { fields, append, remove } = useFieldArray({
		control,
		name,
	});

	useEffect(() => {
		if (fieldRefs?.current && fields.length > 0) {
			const fieldIndex = fields.length - 1;

			const fieldObject = fieldRefs?.current?.[`${name}`]?.[fieldIndex];

			if (fieldObject && lastFieldAdded) {
				const fieldKey =
					focusFieldName in fieldObject
						? focusFieldName
						: Object.keys(fieldObject)[0];

				if (fieldKey && fieldObject[fieldKey]) {
					fieldObject[fieldKey].scrollIntoView({
						behavior: "smooth",
						inline: "center",
					});

					setLastFieldAdded((prev) => !prev);
				}
			}
		}
	}, [lastFieldAdded]);

	const handleAddField = useCallback(() => {
		append(getAppendValue());
		setLastFieldAdded((prev) => !prev);
	}, [append, getAppendValue]);

	const parentName = name;

	return (
		<div className={styles.field_array_content}>
			{fields.map((field, fieldIndex) => {
				return (
					<div key={field.id}>
						<div
							className={`${styles.field_container} ${
								fieldIndex === 0
									? styles.first_field_container
									: ""
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

								let finalOptions;

								if (
									type === "select" &&
									typeof config.getDynamicOptions ===
										"function"
								) {
									const fieldValue =
										control._formValues?.[name]?.[
											fieldIndex
										]?.[childControlName];

									finalOptions = config.options || [];

									if (
										type === "select" &&
										typeof config.getDynamicOptions ===
											"function"
									) {
										finalOptions =
											config.getDynamicOptions(
												fieldValue?.value,
											) || [];
									}
								}

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
											ref={(ele) => {
												if (fieldRefs?.current) {
													fieldRefs.current[name] =
														fieldRefs.current[
															name
														] || {};
													fieldRefs.current[name][
														fieldIndex
													] =
														fieldRefs.current[name][
															fieldIndex
														] || {};
													fieldRefs.current[name][
														fieldIndex
													][childControlName] = ele;
												}
											}}
											error={
												errors?.[name]?.[fieldIndex]?.[
													childControlName
												]
											}
											{...config}
											{...(type === "select" &&
											typeof config.getDynamicOptions ===
												"function"
												? { options: finalOptions }
												: {})}
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
											<Error
												text={
													errors[name][fieldIndex][
														childControlName
													].message
												}
												style={{
													fontSize: "0.625rem",
													padding: "0.25rem 0",
												}}
											/>
										)}
									</div>
								);
							})}
							{(fields?.length > 1 || showFirstFieldDelete) && (
								<div
									onClick={() => {
										return remove(fieldIndex);
									}}
									className={styles.remove_icon}
									tabIndex={0}
									role="button"
									onKeyDown={(e) =>
										e.key === "Enter" && remove(fieldIndex)
									}
								>
									<ODSIcon
										outeIconName="OUTETrashIcon"
										outeIconProps={{
											sx: {
												color: "#212121",
												width: "1.5rem",
												height: "1.5rem",
												cursor: "pointer",
											},
										}}
									/>
								</div>
							)}
						</div>
						{fieldIndex < fields.length - 1 && (
							<div className={styles.divider} />
						)}
					</div>
				);
			})}

			{showAddButton && (
				<div style={{ marginTop: "1rem" }}>
					<ODSButton
						onClick={handleAddField}
						style={{
							backgroundColor: addButtonColour,
							color: "#fff",
							padding: "0.5rem 1rem",
							borderRadius: "4px",
							border: "none",
							cursor: "pointer",
						}}
					>
						<ODSIcon outeIconName="OUTEAddIcon" />
						{addButtonLabel}
					</ODSButton>
				</div>
			)}
		</div>
	);
});

export default FieldArrayController;
