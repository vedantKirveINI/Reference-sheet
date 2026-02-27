import React from "react";
import type { IRecord, IColumn } from "@/types";
import { ExpandedRecordField } from "../ExpandedRecordField/ExpandedRecordField";
import styles from "./ExpandedRecordContent.module.scss";

interface IExpandedRecordContentProps {
	record: IRecord | null;
	fields: IColumn[];
	onFieldChange?: (fieldId: string, newValue: unknown) => void;
	editedFields?: Record<string, unknown>; // Local changes (like sheets)
	isViewOnly?: boolean;
	lockedFields?: string[]; // Field IDs that cannot be changed
}

/**
 * ExpandedRecordContent - Content area with all fields
 *
 * Displays fields in a vertical form layout
 */
export const ExpandedRecordContent: React.FC<IExpandedRecordContentProps> = ({
	record,
	fields,
	onFieldChange,
	editedFields = {},
	isViewOnly = false,
	lockedFields,
}) => {
	if (!record) {
		return (
			<div className={styles.content}>
				<div className={styles.loading}>Loading record...</div>
			</div>
		);
	}

	// For new records (id is empty string), we still have a synthetic record with cells

	return (
		<div className={styles.content}>
			{fields.map((field) => {
				const cell = record.cells[field.id];
				// Use edited value if exists, otherwise use original cell value
				const currentValue =
					field.id in editedFields
						? editedFields[field.id]
						: (cell?.data ?? null);

				// Lock field if in lockedFields array
				const isFieldLocked = lockedFields?.includes(field.id) || false;

				return (
					<ExpandedRecordField
						key={field.id}
						field={field}
						cell={cell}
						value={currentValue}
						onChange={(newValue) => {
							onFieldChange?.(field.id, newValue);
						}}
						readonly={isViewOnly || isFieldLocked}
					/>
				);
			})}
		</div>
	);
};
