import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Error } from "@/lib/error-display";
import ODSIcon from "@/lib/oute-icon";
import { forwardRef } from "react";

import { calculateWidth } from "../../../../../pages/MainPage/utils/getWidthFromSpan";
import getField from "../../../../../common/forms/getField";
import RenderItem from "../RenderItem";

const ENTER_KEY_CODE = 13;

function SortableField(
	{
		field = {},
		fieldIndex = "",
		controls = [],
		remove = () => {},
		control = {},
		errors = {},
		name = "",
		fields = [],
		isDraggable = true,
		showOutsideIcons = false,
		showOutSideDragIcon = true,
		showFirstFieldDelete = false,
		handleAddField = () => {},
	},
	ref,
) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: field.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const shouldEnableDrag = fields.length > 1 && isDraggable;
	const parentName = name;

	return (
		<div
			ref={setNodeRef}
			className="flex justify-between items-center gap-2.5 p-0 mb-2 transition-all duration-150"
			style={style}
		>
			{(controls || []).map((config, index) => {
				const {
					type,
					span,
					name: childControlName,
					InputProps = {},
					addOnEnter = false,
				} = config;
				const Element = getField(type);
				const width = calculateWidth(span);

				const modifiedEndAdornment = InputProps?.endAdornment ? (
					<RenderItem
						element={InputProps.endAdornment}
						isDraggable={shouldEnableDrag}
						listeners={listeners}
						attributes={attributes}
						remove={remove}
						fieldIndex={fieldIndex}
						fieldsLength={fields.length}
					/>
				) : null;

				return (
					<div
						className="w-full flex-1"
						key={`${parentName}.${index}.${childControlName}`}
						style={{ width }}
						data-testid={`${parentName}-${childControlName}-${fieldIndex}`}
					>
						<Element
							ref={(ele) => {
								if (ref?.current) {
									ref.current[name] = ref.current[name] || {};
									ref.current[name][fieldIndex] =
										ref.current[name][fieldIndex] || {};
									ref.current[name][fieldIndex][
										childControlName
									] = ele;
								}
							}}
							error={
								errors?.[name]?.[fieldIndex]?.[childControlName]
							}
							{...config}
							InputProps={{
								...InputProps,
								endAdornment: modifiedEndAdornment,
							}}
							{...(addOnEnter && {
								onKeyDown: (event) => {
									if (event.keyCode === ENTER_KEY_CODE) {
										if (event.target.tagName === "DIV") {
											return;
										}

										event.preventDefault();
										const nextIndex = fieldIndex + 1;
										if (
											nextIndex < fields.length &&
											ref?.current?.[name]?.[nextIndex]?.[
												childControlName
											]
										) {
											ref.current[name][nextIndex][
												childControlName
											].focus();
										} else {
											handleAddField();
										}
									}
								},
							})}
							control={control}
							name={`${name}.${fieldIndex}.${childControlName}`}
						/>

						{errors?.[name]?.[fieldIndex]?.[childControlName]
							?.message && (
							<Error className="text-[0.625rem] py-1">
								{errors[name][fieldIndex][childControlName].message}
							</Error>
						)}
					</div>
				);
			})}

			{showOutsideIcons && (
				<div className="flex items-center gap-2 shrink-0">
					{showOutSideDragIcon && fields?.length > 1 && (
						<div
							{...listeners}
							{...attributes}
							className="cursor-grab"
						>
							<ODSIcon
								outeIconName="OUTEDragIcon"
								outeIconProps={{
									size: 18,
									className: "text-gray-400",
								}}
							/>
						</div>
					)}

					{(fields?.length > 1 || showFirstFieldDelete) && (
						<div
							onClick={() => remove(fieldIndex)}
							className="cursor-pointer flex items-center justify-center p-1 rounded transition-colors duration-150 text-gray-500 hover:bg-red-100 hover:text-red-600 active:bg-red-200"
							tabIndex={0}
							role="button"
							onKeyDown={(e) =>
								e.key === "Enter" && remove(fieldIndex)
							}
						>
							<ODSIcon
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									size: 18,
									className: "text-current",
								}}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default forwardRef(SortableField);
