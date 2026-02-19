import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Error } from "@oute/oute-ds.atom.error";
import ODSIcon from "oute-ds-icon";
import { forwardRef } from "react";

import { calculateWidth } from "../../../../../pages/MainPage/utils/getWidthFromSpan";
import getField from "../../../../../common/forms/getField";
import RenderItem from "../RenderItem";

import styles from "./styles.module.scss";

const ENTER_KEY_CODE = 13; // Key code for the Enter key

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
			className={styles.field_array_content}
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
						className={styles.option_container}
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
							<Error
								text={
									errors[name][fieldIndex][childControlName]
										.message
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

			{showOutsideIcons && (
				<div className={styles.icon_container}>
					{showOutSideDragIcon && fields?.length > 1 && (
						<div
							{...listeners}
							{...attributes}
							style={{ cursor: "grab" }}
						>
							<ODSIcon
								outeIconName="OUTEDragIcon"
								outeIconProps={{
									sx: {
										color: "#90A4AE",
										width: "1.125rem",
										height: "1.125rem",
									},
								}}
							/>
						</div>
					)}

					{(fields?.length > 1 || showFirstFieldDelete) && (
						<div
							onClick={() => remove(fieldIndex)}
							className={styles.remove_icon}
							tabIndex={0}
							role="button"
							onKeyDown={(e) =>
								e.key === "Enter" && remove(fieldIndex)
							}
						>
							<ODSIcon
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									sx: {
										color: "#90A4AE",
										width: "1.125rem",
										height: "1.125rem",
										cursor: "pointer",
									},
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
