import React from "react";
import type { IRecord, IColumn } from "@/types";
import { ExpandedRecordField } from "../ExpandedRecordField/ExpandedRecordField";

interface IExpandedRecordContentProps {
	record: IRecord | null;
	fields: IColumn[];
	onFieldChange?: (fieldId: string, newValue: unknown) => void;
	editedFields?: Record<string, unknown>;
	isViewOnly?: boolean;
	lockedFields?: string[];
}

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
			<div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto flex flex-col gap-7 md:p-4 md:max-h-[calc(100vh-150px)]">
				<div className="p-8 text-center text-gray-500 text-sm">
					Loading record...
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto flex flex-col gap-7 md:p-4 md:max-h-[calc(100vh-150px)]">
			{fields.map((field) => {
				const cell = record.cells[field.id];
				const currentValue =
					field.id in editedFields
						? editedFields[field.id]
						: (cell?.data ?? null);

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
