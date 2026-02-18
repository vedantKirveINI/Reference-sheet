import { Error } from "@/lib/error-display";
import ODSIcon from "@/lib/oute-icon";
import { useImperativeHandle, forwardRef, useCallback } from "react";
import { useFieldArray } from "react-hook-form";

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
		<div className="pt-4">
			{fields.map((field, fieldIndex) => (
				<div key={field.id}>
					{fieldIndex < fields.length && (
						<div className="my-6 bg-[#cfd8dc] h-px" />
					)}
					<div
						className={`text-base font-medium text-[#263238] mb-2 ${
							fieldIndex === 0 ? "mt-0" : ""
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
							} = config;

							const Element = getField(type);
							const width = calculateWidth(span || 6);

							return (
								<div
									className="mt-2"
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
					</div>

					{showDeleteIcon &&
						(fields?.length > 1 || showFirstFieldDelete) && (
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
										className: "text-[#90A4AE] w-[1.125rem] h-[1.125rem] cursor-pointer",
									}}
								/>
							</div>
						)}
				</div>
			))}

			{showAddButton && (
				<div className="mt-4">
					<button
						type="button"
						onClick={handleAddField}
						className="text-white px-4 py-2 rounded border-none cursor-pointer"
						style={{
							backgroundColor: addButtonColour,
						}}
					>
						<ODSIcon
							icon="plus"
							size={14}
							style={{ marginRight: 6 }}
						/>
						{addButtonLabel}
					</button>
				</div>
			)}
		</div>
	);
});

export default MapDataTypeFieldArray;
