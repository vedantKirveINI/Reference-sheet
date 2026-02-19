// Expanded Record Field Component
// Individual field item with label and editor

import React from "react";
import ODSIcon from "oute-ds-icon";
import type { IColumn, ICell } from "@/types";
import { CellType } from "@/types";
import QUESTION_TYPE_ICON_MAPPING, {
	QuestionTypeIconKey,
} from "@/constants/questionTypeIconMapping";
import { getFieldEditor } from "../utils/getFieldEditor";
import styles from "./ExpandedRecordField.module.scss";

interface IExpandedRecordFieldProps {
	field: IColumn;
	cell: ICell | undefined;
	value?: unknown; // Current value (edited or original)
	onChange: (newValue: unknown) => void;
	readonly?: boolean;
}

const getIconKey = (type: string): string => {
	const typeMap: Record<string, string> = {
		String: "SHORT_TEXT",
		Number: "NUMBER",
		DateTime: "DATE",
		Time: "TIME",
		MCQ: "MCQ",
		SCQ: "SCQ",
		YesNo: "YES_NO",
		PhoneNumber: "PHONE_NUMBER",
		ZipCode: "ZIP_CODE",
		Currency: "CURRENCY",
		DropDown: "DROP_DOWN",
		Address: "ADDRESS",
		Signature: "SIGNATURE",
		FileUpload: "FILE_PICKER",
		Ranking: "RANKING",
		Rating: "RATING",
		List: "LIST",
		CreatedTime: "CREATED_TIME",
	};
	return typeMap[type] || "SHORT_TEXT";
};

/**
 * ExpandedRecordField - Individual field item
 *
 * Displays:
 * - Field icon
 * - Field name
 * - Required indicator (*)
 * - Field editor
 */
export const ExpandedRecordField: React.FC<IExpandedRecordFieldProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	// Get field icon - map CellType to icon mapping keys

	const iconKey = getIconKey(field.type);
	const fieldIcon =
		QUESTION_TYPE_ICON_MAPPING[iconKey as QuestionTypeIconKey];

	// Created Time: plain read-only text (no editor)
	const isCreatedTime =
		field.type === CellType.CreatedTime || field.type === "CREATED_TIME";
	const createdTimeDisplay =
		cell?.displayData ?? (cell?.data ? String(cell.data) : "");

	// Get appropriate editor component for this field type
	const FieldEditor = getFieldEditor(field.type);

	// Use provided value or fallback to cell data
	const cellValue = value !== undefined ? value : (cell?.data ?? null);

	return (
		<div className={styles.field}>
			<div className={styles.field_label_container}>
				{fieldIcon && (
					<ODSIcon
						imageProps={{
							src: fieldIcon,
							className: styles.field_icon,
						}}
					/>
				)}
				<span className={styles.field_name}>{field.name}</span>
				{/* {field?.required && (
					<span className={styles.required_indicator}>*</span>
				)} */}
			</div>

			<div className={styles.field_editor_container}>
				{isCreatedTime ? (
					<div className={styles.field_value_readonly}>
						{createdTimeDisplay || "—"}
					</div>
				) : (
					<FieldEditor
						field={field}
						cell={cell}
						value={cellValue}
						onChange={onChange}
						readonly={readonly}
					/>
				)}
			</div>
		</div>
	);
};
