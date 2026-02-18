import { Error } from "@/lib/error-display";
import isEmpty from "lodash/isEmpty";
import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";
import {
	useImperativeHandle,
	forwardRef,
	useCallback,
	useRef,
	useEffect,
	useState,
} from "react";
import { useFieldArray } from "react-hook-form";

import getField from "../../../../../../../../common/forms/getField";
import { calculateWidth } from "../../../../../../utils/getWidthFromSpan";
import getConcatenatedColumnValues from "../utils/getConcatenatedColumnValues";

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
		parsedCSVData = [],
		firstRowAsHeader = "Yes",
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
		append(getAppendValue(fields));
		setLastFieldAdded((prev) => !prev);
	}, [append, getAppendValue, fields]);

	return (
		<div className="pt-8">
			{fields.map((field, fieldIndex) => {
				const dataInColumn = getConcatenatedColumnValues(
					parsedCSVData,
					fieldIndex,
				);

				const parentName = name;

				return (
					<div key={field.id}>
						<div
							className={`text-base font-medium text-[#263238] mb-2 mt-6 ${
								fieldIndex === 0
									? "mt-0"
									: ""
							}`}
						>
							Import Field {fieldIndex + 1}
						</div>
						<div className="flex gap-6">
							{controls?.map((config, index) => {
								const {
									type,
									span,
									name: childControlName,
									InputProps = {},
									show = true,
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

								if (!show) {
									return null;
								}

								return (
									<div
										className="mt-2"
										key={`${parentName}.${index}.${childControlName}`}
										style={{ width }}
										data-testid={`${name}-${childControlName}-${fieldIndex}`}
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
									onClick={() => remove(fieldIndex)}
									className="flex items-start cursor-pointer mt-4"
									tabIndex={0}
									role="button"
									onKeyDown={(e) =>
										e.key === "Enter" && remove(fieldIndex)
									}
								>
									<ODSIcon
										outeIconName="OUTETrashIcon"
										outeIconProps={{
											className: "text-[#212121] w-6 h-6 cursor-pointer",
										}}
									/>
								</div>
							)}
						</div>
						{firstRowAsHeader === "No" &&
							!isEmpty(dataInColumn) && (
								<div className="text-[#607d8b] text-base mt-5 overflow-hidden text-ellipsis line-clamp-2">
									Data in Column: <span>{dataInColumn}</span>
								</div>
							)}

						{fieldIndex < fields.length - 1 && (
							<div className="mt-6 bg-[#cfd8dc] h-px" />
						)}
					</div>
				);
			})}

			{showAddButton && (
				<div className="mt-4">
					<Button
						onClick={handleAddField}
						className="text-white px-4 py-2 rounded border-none cursor-pointer"
						style={{
							backgroundColor: addButtonColour,
						}}
					>
						<ODSIcon outeIconName="OUTEAddIcon" />
						{addButtonLabel}
					</Button>
				</div>
			)}
		</div>
	);
});

export default FieldArrayController;
