// Context Menu Hook - Inspired by Teable
// Phase 1: Foundation - Handle right-click events and open context menus
// Phase 2A: Delete Records functionality
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx

import React, { useCallback, useState, useMemo } from "react";
import { useGridViewStore } from "@/stores/gridViewStore";
import type { CombinedSelection } from "@/managers/selection-manager";
import type { ITableData } from "@/types";
import type { IPosition } from "@/types/contextMenu";
import { SelectionRegionType } from "@/types/selection";
import { getEffectRows, getSelectedRecordIds } from "@/utils/selectionUtils";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface IUseContextMenuProps {
	selection: CombinedSelection;
	tableData: ITableData;
	onDeleteRecords: (recordIds: string[]) => void;
	onInsertRecord?: (
		anchorId: string,
		position: "before" | "after",
		num: number,
	) => void;
	onDuplicateRecord?: (recordId: string) => void;
	onEditColumn?: (columnId: string, anchorPosition?: IPosition) => void;
	onDuplicateColumn?: (columnId: string) => void;
	onInsertColumn?: (
		columnId: string,
		position: "left" | "right",
		anchorPosition?: IPosition,
	) => void;
	onDeleteColumns?: (columnIds: number[]) => void;
	onClearSelection?: () => void;
	// Current sort/filter/groupBy state for context menu actions
	currentSort?: any;
	currentFilter?: any;
	currentGroupBy?: any;
	fields?: Array<{
		id: number | string;
		name: string;
		dbFieldName?: string;
		type?: string;
	}>;
	// Prevent context menus from opening in non-default views
	canEditRecords?: boolean;
	canEditFields?: boolean;
}

/**
 * Hook for handling context menu operations
 * Opens appropriate menu based on selection type
 */
export const useContextMenu = (props: IUseContextMenuProps) => {
	const {
		selection,
		tableData,
		onDeleteRecords,
		onInsertRecord,
		onDuplicateRecord,
		onEditColumn,
		onDuplicateColumn,
		onInsertColumn,
		onDeleteColumns,
		onClearSelection,
		canEditRecords = true,
		canEditFields = true,
	} = props;
	const { openRecordMenu, openHeaderMenu, closeRecordMenu, closeHeaderMenu } =
		useGridViewStore();
	const { records, columns } = tableData;

	// State for confirmation dialog
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean;
		title: string;
		description: string;
		onConfirm: () => void;
	}>({
		open: false,
		title: "",
		description: "",
		onConfirm: () => {},
	});

	/**
	 * Handle context menu for cells/rows
	 * Opens RecordMenu when right-clicking on cells or rows
	 *
	 * @param event - Mouse event
	 * @param position - Click position
	 * @param currentSelection - Current selection (passed from callback to ensure we use the latest selection)
	 */
	const handleCellContextMenu = useCallback(
		(
			event: React.MouseEvent,
			position: IPosition,
			currentSelection?: CombinedSelection,
		) => {
			event.preventDefault();
			event.stopPropagation();

			// Don't open context menu in non-default views
			if (!canEditRecords) {
				return;
			}

			// Use currentSelection if provided (from callback), otherwise use selection from props
			const selectionToUse = currentSelection || selection;
			const { type, ranges } = selectionToUse;

			// Only handle if we have a cell or row selection
			if (
				type !== SelectionRegionType.Cells &&
				type !== SelectionRegionType.Rows
			) {
				return;
			}

			// Determine if multiple rows are selected (exactly like Teable)
			// For cell selection: rowStart = ranges[0][1], rowEnd = ranges[1][1]
			// For row selection: rowStart = ranges[0][0], rowEnd = ranges[0][1] (but we check ranges.length)
			const rowStart =
				type === SelectionRegionType.Cells
					? ranges[0][1]
					: ranges[0][0];
			const rowEnd =
				type === SelectionRegionType.Cells
					? ranges[1][1]
					: ranges[0][1];

			// Check if multiple rows are selected (exactly like Teable line 415-416)
			const isMultipleSelected =
				(type === SelectionRegionType.Rows && ranges.length > 1) ||
				Math.abs(rowEnd - rowStart) > 0;

			if (isMultipleSelected) {
				// Multiple rows selected
				// Phase 2A: Implement delete records with confirmation (like Teable)
				const deleteRows = getEffectRows(selectionToUse);

				openRecordMenu({
					position,
					isMultipleSelected: true,
					deleteRecords: async () => {
						// Show confirmation dialog if >= 10 records (like Teable line 425)
						if (deleteRows >= 10) {
							const recordIds = getSelectedRecordIds(
								selectionToUse,
								records,
							);
							setConfirmDialog({
								open: true,
								title: "Delete Records?",
								description: `You are about to delete ${deleteRows} records. This action cannot be undone.`,
								onConfirm: () => {
									onDeleteRecords(recordIds);
									onClearSelection?.();
									setConfirmDialog({
										open: false,
										title: "",
										description: "",
										onConfirm: () => {},
									});
								},
							});
							return;
						}

						// For < 10 records, delete directly (still show confirmation for safety)
						const recordIds = getSelectedRecordIds(
							selectionToUse,
							records,
						);
						setConfirmDialog({
							open: true,
							title: "Delete Records?",
							description: `You are about to delete ${deleteRows} record${deleteRows > 1 ? "s" : ""}. This action cannot be undone.`,
							onConfirm: () => {
								onDeleteRecords(recordIds);
								onClearSelection?.();
								setConfirmDialog({
									open: false,
									title: "",
									description: "",
									onConfirm: () => {},
								});
							},
						});
					},
				});
			} else {
				// Single row selected
				const record = records[rowStart];
				const neighborRecords: ((typeof records)[number] | null)[] = [];
				neighborRecords[0] =
					rowStart === 0 ? null : records[rowStart - 1];
				neighborRecords[1] =
					rowStart >= records.length - 1
						? null
						: records[rowStart + 1];

				openRecordMenu({
					position,
					record,
					neighborRecords,
					isMultipleSelected: false,
					insertRecord: (anchorId, position, num) => {
						// Phase 2B: Implement insert record functionality
						if (onInsertRecord) {
							onInsertRecord(anchorId, position, num);
						}
					},
					duplicateRecord: async () => {
						// Phase 2B: Implement duplicate record functionality
						if (onDuplicateRecord && record) {
							onDuplicateRecord(record.id);
						}
					},
					deleteRecords: async () => {
						// Phase 2A: Implement delete single record with confirmation
						const recordIds = getSelectedRecordIds(
							selectionToUse,
							records,
						);
						setConfirmDialog({
							open: true,
							title: "Delete Record?",
							description:
								"You are about to delete this record. This action cannot be undone.",
							onConfirm: () => {
								onDeleteRecords(recordIds);
								onClearSelection?.();
								setConfirmDialog({
									open: false,
									title: "",
									description: "",
									onConfirm: () => {},
								});
							},
						});
					},
				});
			}
		},
		[
			selection,
			records,
			openRecordMenu,
			onDeleteRecords,
			onInsertRecord,
			onDuplicateRecord,
			onClearSelection,
			canEditRecords,
		],
	);

	/**
	 * Handle context menu for column headers
	 * Opens HeaderMenu when right-clicking on column headers
	 */
	const handleHeaderContextMenu = useCallback(
		(event: React.MouseEvent, position: IPosition, columnIndex: number) => {
			event.preventDefault();
			event.stopPropagation();

			// Don't open context menu in non-default views
			if (!canEditFields) {
				return;
			}

			const { type, ranges } = selection;

			// Get selected columns
			let selectedColumns: typeof columns;

			if (type === SelectionRegionType.Columns) {
				// Multiple columns selected
				const [start, end] = ranges[0];
				const colStart = Math.min(start, end);
				const colEnd = Math.max(start, end);
				selectedColumns = columns.slice(colStart, colEnd + 1);
			} else {
				// Single column selected
				selectedColumns = [columns[columnIndex]];
			}

			openHeaderMenu({
				position,
				columns: selectedColumns,
				currentSort: props.currentSort,
				currentFilter: props.currentFilter,
				currentGroupBy: props.currentGroupBy,
				fields: props.fields || [],
				onSelectionClear: () => {
					onClearSelection?.();
				},
				onEditColumn: (columnId: string) => {
					if (onEditColumn) {
						onEditColumn(columnId, position);
					}
				},
				onDuplicateColumn: (columnId: string) => {
					// Phase 2B: Implement duplicate column functionality
					if (onDuplicateColumn) {
						onDuplicateColumn(columnId);
					}
				},
				onInsertColumn: (
					columnId: string,
					insertPosition: "left" | "right",
				) => {
					if (onInsertColumn) {
						onInsertColumn(columnId, insertPosition, position);
					}
				},
				onDeleteColumns: (columnIds: number[]) => {
					// Phase 2B: Implement delete columns functionality
					if (onDeleteColumns) {
						onDeleteColumns(columnIds);
					}
				},
			});
		},
		[
			selection,
			columns,
			openHeaderMenu,
			onEditColumn,
			onDuplicateColumn,
			onInsertColumn,
			onDeleteColumns,
			onClearSelection,
			props.currentSort,
			props.currentFilter,
			props.currentGroupBy,
			props.fields,
			canEditFields,
		],
	);

	// Phase 2A: Create confirmation dialog component using useMemo
	const confirmDialogElement = useMemo(
		() => (
			<ConfirmDialog
				open={confirmDialog.open}
				title={confirmDialog.title}
				description={confirmDialog.description}
				confirmText="Delete"
				cancelText="Cancel"
				confirmButtonVariant="contained"
				onConfirm={() => {
					confirmDialog.onConfirm();
				}}
				onCancel={() => {
					setConfirmDialog({
						open: false,
						title: "",
						description: "",
						onConfirm: () => {},
					});
				}}
			/>
		),
		[confirmDialog],
	);

	return {
		handleCellContextMenu,
		handleHeaderContextMenu,
		closeRecordMenu,
		closeHeaderMenu,
		// Phase 2A: Return confirmation dialog component
		confirmDialog: confirmDialogElement,
	};
};
