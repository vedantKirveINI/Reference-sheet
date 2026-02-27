import { useState, useCallback, useMemo, useEffect } from "react";
import type { IRecord, IColumn } from "@/types";

interface UseExpandedRecordHandlerProps {
	record: IRecord | null;
	columns: IColumn[];
	onSave: (editedFields: Record<string, unknown>) => Promise<void>;
	onClose: () => void;
	recordIds?: string[];
	onFieldChange?: (fieldId: string, newValue: unknown) => void;
	onDelete?: (recordId: string) => Promise<void>;
	onDuplicate?: (recordId: string) => Promise<void>;
	onCopyUrl?: () => void;
	onRecordChange?: (recordId: string) => void;
	lockedFields?: string[]; // Field IDs that cannot be changed
}

export const useExpandedRecordHandler = ({
	record,
	columns,
	recordIds = [],
	onSave,
	onClose,
	onFieldChange,
	onDelete,
	onDuplicate,
	onCopyUrl,
	onRecordChange,
	lockedFields,
}: UseExpandedRecordHandlerProps) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [editedFields, setEditedFields] = useState<Record<string, unknown>>(
		{},
	);
	const [isSaving, setIsSaving] = useState(false);

	// Track field changes locally (like sheets ExpandedRow)
	const handleFieldChange = useCallback(
		(fieldId: string, newValue: unknown) => {
			// Prevent changes to locked fields
			if (lockedFields?.includes(fieldId)) {
				return; // Silently ignore changes
			}

			setEditedFields((prev) => ({
				...prev,
				[fieldId]: newValue,
			}));
			// Also call external onFieldChange if provided
			onFieldChange?.(fieldId, newValue);
		},
		[lockedFields, onFieldChange],
	);

	// Check if there are any changes
	// For new records (when record is null or has no id), always allow saving
	// For existing records, only allow saving when there are actual changes
	const hasChanges = useMemo(() => {
		const isNewRecord = !record || !record.id;
		// For new records, always allow saving (even with no changes)
		// For existing records, require at least one field change
		return isNewRecord || Object.keys(editedFields).length > 0;
	}, [editedFields, record]);

	// Handle save - emit socket events for all changes
	const handleSave = useCallback(async () => {
		setIsSaving(true);
		try {
			await onSave(editedFields);
			setEditedFields({});
		} catch {
			// Don't clear editedFields on error so user can retry
		} finally {
			setIsSaving(false);
		}
	}, [editedFields, onSave]);

	// Handle cancel - discard changes and close
	const handleCancel = useCallback(() => {
		setEditedFields({});
		onClose();
	}, [onClose]);

	// Reset edited fields when record changes
	useEffect(() => {
		setEditedFields({});
	}, [record?.id]);

	// Get record title from primary field (first field or name field)
	const recordTitle = useMemo(() => {
		if (!record) return "Untitled Record";

		// Try to find a "name" field first
		const nameField = columns.find(
			(col) =>
				col.id === "name_field" ||
				col.name.toLowerCase().includes("name"),
		);

		if (nameField) {
			const cell = record.cells[nameField.id];
			if (cell && cell.displayData) {
				return String(cell.displayData);
			}
		}

		// Otherwise use first field
		const firstField = columns[0];
		if (firstField) {
			const cell = record.cells[firstField.id];
			if (cell && cell.displayData) {
				return String(cell.displayData);
			}
		}

		return "Untitled Record";
	}, [record, columns]);

	// Filter visible fields (columns that are visible in the view)
	const visibleFields = useMemo(() => {
		// Show all fields for now (can filter by view visibility later)
		return columns;
	}, [columns]);

	// Phase 4: Navigation logic
	const currentRecordIndex = useMemo(() => {
		if (!record || !recordIds.length) return -1;
		return recordIds.findIndex((id) => id === record.id);
	}, [record, recordIds]);

	const hasPrev = currentRecordIndex > 0;
	const hasNext =
		currentRecordIndex >= 0 && currentRecordIndex < recordIds.length - 1;

	const handlePrev = useCallback(() => {
		if (!hasPrev || currentRecordIndex <= 0) return;
		const prevRecordId = recordIds[currentRecordIndex - 1];
		onRecordChange?.(prevRecordId);
	}, [hasPrev, currentRecordIndex, recordIds, onRecordChange]);

	const handleNext = useCallback(() => {
		if (
			!hasNext ||
			currentRecordIndex < 0 ||
			currentRecordIndex >= recordIds.length - 1
		)
			return;
		const nextRecordId = recordIds[currentRecordIndex + 1];
		onRecordChange?.(nextRecordId);
	}, [hasNext, currentRecordIndex, recordIds, onRecordChange]);

	const handleDelete = useCallback(async () => {
		if (!record || !onDelete) return;
		try {
			await onDelete(record.id);
			setShowDeleteConfirm(false);
			onClose();
		} catch {
			// Keep dialog open on error
		}
	}, [record, onDelete, onClose]);

	const handleDuplicate = useCallback(async () => {
		if (!record || !onDuplicate) return;
		try {
			await onDuplicate(record.id);
			// Don't close on duplicate - user might want to edit the new record
		} catch {}
	}, [record, onDuplicate]);

	const handleCopyUrl = useCallback(() => {
		if (onCopyUrl) {
			onCopyUrl();
		} else {
			// Fallback: copy current URL with recordId
			const url = new URL(window.location.href);
			url.searchParams.set("recordId", record?.id || "");
			navigator.clipboard.writeText(url.toString());
		}
	}, [onCopyUrl, record?.id]);

	const handleShowDeleteConfirm = useCallback(() => {
		setShowDeleteConfirm(true);
	}, []);

	const handleHideDeleteConfirm = useCallback(() => {
		setShowDeleteConfirm(false);
	}, []);

	return {
		// State
		showDeleteConfirm,
		editedFields,
		isSaving,
		// Computed values
		hasChanges,
		recordTitle,
		visibleFields,
		hasPrev,
		hasNext,
		// Handlers
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
	};
};
