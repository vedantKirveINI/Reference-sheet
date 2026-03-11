import React, { useMemo } from "react";
import ODSDialog from "oute-ds-dialog";
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
	onSave: (editedFields: Record<string, unknown>) => Promise<void>; // Emits socket events on save
	onFieldChange?: (fieldId: string, newValue: unknown) => void; // Only tracks changes locally
	isViewOnly?: boolean;
	onDelete?: (recordId: string) => Promise<void>;
	onDuplicate?: (recordId: string) => Promise<void>;
	onCopyUrl?: () => void;
	onRecordChange?: (recordId: string) => void; // For navigation
	initialFields?: Record<string, unknown>; // Initial values for new records
	lockedFields?: string[]; // Field IDs that cannot be changed
}

/**
 * ExpandedRecord - Main component for displaying and editing records
 *
 * Features:
 * - Modal wrapper (desktop) / Drawer (mobile)
 * - Header with title and actions
 * - Content area with all fields
 * - Field editing support
 */
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
	// Create synthetic record for new record mode with initial values
	const syntheticRecord = useMemo<IRecord | null>(() => {
		if (record) return record; // Existing record

		if (initialFields) {
			// Create synthetic record with initial values
			// Create cells for all columns, pre-filling values from initialFields where available
			const cells: Record<string, ICell> = {};
			columns.forEach((col) => {
				const value = initialFields[col.id];
				// formatCell handles undefined/null and creates appropriate empty cells
				cells[col.id] = formatCell(value, col);
			});
			return { id: "", cells };
		}

		// Create empty synthetic record for new record without initial values
		const cells: Record<string, ICell> = {};
		columns.forEach((col) => {
			cells[col.id] = formatCell(undefined, col);
		});
		return { id: "", cells };
	}, [record, initialFields, columns]);

	// Use synthetic record if available, otherwise use actual record
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
			<ODSDialog
				open={visible}
				onClose={onClose}
				dialogWidth="60vw"
				showFullscreenIcon={false}
				hideBackdrop={false}
				draggable={false}
				dialogPosition="center"
				dialogTitle={
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
				}
				showCloseIcon={false}
				removeContentPadding
				dialogContent={
					<ExpandedRecordContent
						record={recordToUse}
						fields={visibleFields}
						onFieldChange={handleFieldChange}
						editedFields={editedFields}
						isViewOnly={isViewOnly}
						lockedFields={lockedFields}
					/>
				}
				dialogActions={
					!isViewOnly && (
						<ExpandedRecordFooter
							onCancel={handleCancel}
							onSave={handleSave}
							hasChanges={hasChanges}
							isSaving={isSaving}
						/>
					)
				}
			/>

			{/* Phase 4: Delete Confirmation Dialog */}
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
