import { closestCenter, DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

	const variantMap = {
		contained: "default",
		outlined: "outline",
		text: "ghost",
	};

	const sizeMap = {
		small: "sm",
		medium: "default",
		large: "lg",
	};

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
					<Button
						variant={variantMap[variant] || "outline"}
						size={sizeMap[size] || "default"}
						onClick={handleAddField}
						type="button"
						className="text-sm font-medium"
					>
						<Plus className="h-4 w-4" />
						{addButtonLabel}
					</Button>
				</div>
			)}
		</div>
	);
});

export default FieldArrayController;
