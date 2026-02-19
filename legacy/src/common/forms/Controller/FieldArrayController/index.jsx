import { closestCenter, DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext } from "@dnd-kit/sortable";
import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import React, { useState, useEffect, forwardRef, useCallback } from "react";
import { useFieldArray } from "react-hook-form";

import SortableField from "./SortableField";
import styles from "./styles.module.scss";

const FieldArrayController = forwardRef((props, ref) => {
	const {
		name = "",
		control = {},
		controls = [],
		errors = {},
		showAddButton = true,
		addButtonLabel = "Add Choice",
		addButtonColour = "#263238",
		getAppendValue = () => {},
		variant = "outlined",
		size = "medium",
		focusFieldName = "",
		showOutsideIcons = false,
		showOutSideDragIcon = true,
		showFirstFieldDelete = false,
	} = props || {};

	const [lastFieldAdded, setLastFieldAdded] = useState(false);

	const { fields, append, remove, move } = useFieldArray({
		control,
		name: name,
	});

	useEffect(() => {
		if (ref?.current && fields.length > 0) {
			const fieldIndex = fields.length - 1;

			const fieldObject = ref?.current?.[`${name}`]?.[fieldIndex];

			if (fieldObject) {
				const fieldKey =
					focusFieldName in fieldObject
						? focusFieldName
						: Object.keys(fieldObject)[0];

				if (fieldKey && fieldObject[fieldKey]) {
					fieldObject[fieldKey].focus();
				}
			}
		}
	}, [lastFieldAdded]);

	const handleDragEnd = useCallback(
		(event) => {
			const { active, over } = event;
			if (!over || active.id === over.id) return;

			const oldIndex = fields.findIndex((f) => f.id === active.id);
			const newIndex = fields.findIndex((f) => f.id === over.id);

			if (oldIndex !== -1 && newIndex !== -1) {
				move(oldIndex, newIndex);
			}
		},
		[fields, move],
	);

	const handleAddField = useCallback(() => {
		append(getAppendValue());
		setLastFieldAdded((prev) => !prev);
	}, [append, getAppendValue]);

	return (
		<div className={styles.field_array_container}>
			<DndContext
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
				modifiers={[restrictToVerticalAxis]}
			>
				<SortableContext items={fields.map((field) => field.id)}>
					{fields.map((field, fieldIndex) => (
						<SortableField
							key={field.id}
							fieldIndex={fieldIndex}
							field={field}
							showFirstFieldDelete={showFirstFieldDelete}
							showOutsideIcons={showOutsideIcons}
							showOutSideDragIcon={showOutSideDragIcon}
							fields={fields}
							ref={ref}
							handleAddField={handleAddField}
							{...{
								controls,
								remove,
								control,
								errors,
								name,
								...props,
							}}
						/>
					))}
				</SortableContext>
			</DndContext>

			{showAddButton && (
				<div className={styles.add_container}>
					<ODSButton
						label={addButtonLabel}
						variant={variant}
						size={size}
						startIcon={
							<ODSIcon
								outeIconName="OUTEAddIcon"
								outeIconProps={{
									sx: {
										color: addButtonColour,
										width: "1rem",
										height: "1rem",
									},
								}}
							/>
						}
						onClick={handleAddField}
						sx={{
							fontFamily:
								"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
							fontSize: "0.8125rem",
							fontWeight: 500,
							textTransform: "none",
							padding: "0.375rem 0.75rem",
							minHeight: "auto",
							"&:hover": {
								backgroundColor: "rgba(31, 41, 55, 0.04)",
							},
						}}
					/>
				</div>
			)}
		</div>
	);
});

export default FieldArrayController;
