import React, { useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import type { IRecord, IColumn, ICell } from "@/types";
import { ExpandedRecordContent } from "./ExpandedRecordContent/ExpandedRecordContent";
import { ExpandedRecordHeader } from "./ExpandedRecordHeader/ExpandedRecordHeader";
import { ExpandedRecordFooter } from "./ExpandedRecordFooter/ExpandedRecordFooter";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useExpandedRecordHandler } from "./hooks/useExpandedRecordHandler";
import { formatCell } from "@/pages/MainPage/hooks/useSheetLifecycle";

export interface IExpandedRecordProps {
	record: IRecord | null;
	columns: IColumn[];
	recordIds?: string[];
	visible: boolean;
	onClose: () => void;
	onSave: (editedFields: Record<string, unknown>) => Promise<void>;
	onFieldChange?: (fieldId: string, newValue: unknown) => void;
	isViewOnly?: boolean;
	onDelete?: (recordId: string) => Promise<void>;
	onDuplicate?: (recordId: string) => Promise<void>;
	onCopyUrl?: () => void;
	onRecordChange?: (recordId: string) => void;
	initialFields?: Record<string, unknown>;
	lockedFields?: string[];
}

export const ExpandedRecord: React.FC<IExpandedRecordProps> = ({
	record,
	columns,
	recordIds = [],
	visible,
	onClose,
	onFieldChange,
	onSave,
	isViewOnly = false,
	onDelete,
	onDuplicate,
	onCopyUrl,
	onRecordChange,
	initialFields,
	lockedFields,
}) => {
	const syntheticRecord = useMemo<IRecord | null>(() => {
		if (record) return record;

		if (initialFields) {
			const cells: Record<string, ICell> = {};
			columns.forEach((col) => {
				const value = initialFields[col.id];
				cells[col.id] = formatCell(value, col);
			});
			return { id: "", cells };
		}

		const cells: Record<string, ICell> = {};
		columns.forEach((col) => {
			cells[col.id] = formatCell(undefined, col);
		});
		return { id: "", cells };
	}, [record, initialFields, columns]);

	const recordToUse = syntheticRecord || record;

	const {
		showDeleteConfirm,
		editedFields,
		isSaving,
		hasChanges,
		recordTitle,
		visibleFields,
		hasPrev,
		hasNext,
		handleFieldChange,
		handleSave,
		handleCancel,
		handlePrev,
		handleNext,
		handleDelete,
		handleDuplicate,
		handleCopyUrl,
		handleShowDeleteConfirm,
		handleHideDeleteConfirm,
	} = useExpandedRecordHandler({
		record: recordToUse,
		columns,
		recordIds,
		onSave,
		onClose,
		onFieldChange,
		onDelete,
		onDuplicate,
		onCopyUrl,
		onRecordChange,
		lockedFields,
	});

	if (!visible) {
		return null;
	}

	return (
		<>
			<Dialog open={visible} onOpenChange={(v) => !v && onClose()}>
				<DialogContent className="max-w-[60vw] p-0">
					<DialogHeader className="p-4 pb-0">
						<DialogTitle asChild>
							<ExpandedRecordHeader
								title={recordTitle}
								onClose={onClose}
								onPrev={handlePrev}
								onNext={handleNext}
								disabledPrev={!hasPrev}
								disabledNext={!hasNext}
								onDelete={
									onDelete ? handleShowDeleteConfirm : undefined
								}
								onDuplicate={onDuplicate ? handleDuplicate : undefined}
								onCopyUrl={handleCopyUrl}
								canDelete={!!onDelete && !isViewOnly}
								canDuplicate={!!onDuplicate && !isViewOnly}
							/>
						</DialogTitle>
					</DialogHeader>
					<ExpandedRecordContent
						record={recordToUse}
						fields={visibleFields}
						onFieldChange={handleFieldChange}
						editedFields={editedFields}
						isViewOnly={isViewOnly}
						lockedFields={lockedFields}
					/>
					{!isViewOnly && (
						<DialogFooter className="p-4 pt-0">
							<ExpandedRecordFooter
								onCancel={handleCancel}
								onSave={handleSave}
								hasChanges={hasChanges}
								isSaving={isSaving}
							/>
						</DialogFooter>
					)}
				</DialogContent>
			</Dialog>

			{showDeleteConfirm && (
				<ConfirmDialog
					open={showDeleteConfirm}
					title="Delete Record?"
					description="You are about to delete this record. This action cannot be undone."
					confirmText="DELETE"
					cancelText="CANCEL"
					confirmButtonVariant="contained"
					onConfirm={handleDelete}
					onCancel={handleHideDeleteConfirm}
				/>
			)}
		</>
	);
};
