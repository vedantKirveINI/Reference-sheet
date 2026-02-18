// Clipboard hook - Inspired by Teable
// Phase 1: Foundation - Copy functionality
// Phase 2: Paste functionality
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/utils/copyAndPaste.ts
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/hooks/useSelectionOperation.ts

import { useCallback } from "react";
import { getCopyData } from "@/utils/getCopyData";
import { serializeCellValueHtml } from "@/utils/clipboardHtml";
import { parsePasteData, prepareBatchCellUpdates } from "@/utils/pasteUtils";
import type { ITableData, IColumn, ICell } from "@/types";
import type { CombinedSelection } from "@/managers/selection-manager";
import { SelectionRegionType } from "@/types/selection";
import type { IRange } from "@/types/selection";

// Clipboard MIME types
export enum ClipboardTypes {
	text = "text/plain",
	html = "text/html",
	Files = "Files",
}

/**
 * Check if browser is Safari
 * Safari has different clipboard API behavior
 */
const isSafari = (): boolean => {
	return /^(?:(?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Copy data interface
 */
export interface ICopyData {
	content: string; // TSV string
	rawContent: unknown[][]; // Raw cell values
	header: IColumn[]; // Column metadata
}

/**
 * Copy handler - Writes data to clipboard
 * Handles both TSV and HTML formats
 * Special handling for Safari browser
 *
 * @param getCopyData - Function that returns copy data
 */
const copyHandler = async (getCopyData: () => ICopyData): Promise<void> => {
	// Safari can't await asynchronous action before navigator.clipboard.write
	if (!isSafari()) {
		const { header, content, rawContent } = getCopyData();
		const htmlContent = serializeCellValueHtml(rawContent, header);

		await navigator.clipboard.write([
			new ClipboardItem({
				[ClipboardTypes.text]: new Blob([content], {
					type: ClipboardTypes.text,
				}),
				[ClipboardTypes.html]: new Blob([htmlContent], {
					type: ClipboardTypes.html,
				}),
			}),
		]);
		return;
	}

	// Safari-specific handling: Create async blob promises
	const getText = async (): Promise<Blob> => {
		const { content } = getCopyData();
		return new Blob([content], { type: ClipboardTypes.text });
	};

	const getHtml = async (): Promise<Blob> => {
		const { header, rawContent } = getCopyData();
		const htmlContent = serializeCellValueHtml(rawContent, header);
		return new Blob([htmlContent], { type: ClipboardTypes.html });
	};

	await navigator.clipboard.write([
		new ClipboardItem({
			[ClipboardTypes.text]: getText(),
			[ClipboardTypes.html]: getHtml(),
		}),
	]);
};

/**
 * useClipboard hook - Provides copy functionality
 *
 * @returns Object with handleCopy function
 */
export const useClipboard = () => {
	/**
	 * Handle copy operation
	 * Extracts data from selection and writes to clipboard
	 *
	 * @param selection - Current selection
	 * @param tableData - Table data
	 * @param onSuccess - Optional success callback
	 * @param onError - Optional error callback
	 */
	const handleCopy = useCallback(
		async (
			selection: CombinedSelection,
			tableData: ITableData,
			onSuccess?: () => void,
			onError?: (error: Error) => void,
		): Promise<void> => {
			// Check if selection is valid
			if (selection.type === "None" || selection.ranges.length === 0) {
				return;
			}

			// Check clipboard API availability
			if (!navigator.clipboard || !navigator.clipboard.write) {
				const error = new Error("Clipboard API not available");
				onError?.(error);
				return;
			}

			try {
				// Extract copy data from selection
				const getCopyDataFn = () => {
					const { content, rawContent, headers } = getCopyData({
						tableData,
						selection,
					});
					return {
						content,
						rawContent,
						header: headers,
					};
				};

				await copyHandler(getCopyDataFn);
				onSuccess?.();
			} catch (error) {
				const err =
					error instanceof Error ? error : new Error("Copy failed");
				onError?.(err);
				throw err;
			}
		},
		[],
	);

	/**
	 * Handle paste operation
	 * Parses clipboard data and prepares batch cell updates
	 *
	 * @param clipboardEvent - Clipboard event from paste
	 * @param selection - Current selection (where to paste)
	 * @param tableData - Table data
	 * @param onPaste - Callback with batch updates: (updates: Array<{rowIndex, columnIndex, cell}>) => void
	 * @param onError - Optional error callback
	 */
	const handlePaste = useCallback(
		(
			clipboardEvent: React.ClipboardEvent,
			selection: CombinedSelection,
			tableData: ITableData,
			onPaste: (
				updates: Array<{
					rowIndex: number;
					columnIndex: number;
					cell: ICell;
				}>,
			) => void,
			onError?: (error: Error) => void,
		): void => {
			try {
				// Prevent default paste behavior
				clipboardEvent.preventDefault();
				clipboardEvent.stopPropagation();

				// Check if selection is valid
				if (
					selection.type === SelectionRegionType.None ||
					selection.ranges.length === 0
				) {
					return;
				}

				// Only support cell selection for paste (for now)
				if (selection.type !== SelectionRegionType.Cells) {
					return;
				}

				// Get target cell from selection
				const ranges = selection.serialize();
				if (ranges.length < 2) {
					return;
				}

				const [startRange] = ranges as [IRange, IRange];
				const [startColumnIndex, startRowIndex] = startRange as [
					number,
					number,
				];

				// Parse clipboard data
				const pasteData = parsePasteData(clipboardEvent.clipboardData);

				if (pasteData.cellValues.length === 0) {
					return;
				}

				// Prepare batch updates
				const updates = prepareBatchCellUpdates(
					pasteData,
					{
						startRow: startRowIndex,
						startCol: startColumnIndex,
					},
					tableData.columns,
					tableData.records,
				);

				if (updates.length === 0) {
					return;
				}

				onPaste(updates);
			} catch (error) {
				const err =
					error instanceof Error ? error : new Error("Paste failed");
				onError?.(err);
			}
		},
		[],
	);

	return {
		handleCopy,
		handlePaste,
	};
};
