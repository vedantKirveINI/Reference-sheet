import { useCallback } from "react";
import type { MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
import { showAlert } from "oute-ds-alert";
import { CellType } from "@/types";
import type { ICell } from "@/types";
import useDeleteRecords from "@/hooks/useDeleteRecords";
import type { ExtendedColumn } from "../types";

function formatCellDataForBackend(cell: ICell): any {
	let backendData: any = cell.data;
	switch (cell.type) {
		case CellType.MCQ:
		case CellType.DropDown:
			backendData = Array.isArray(cell.data) ? cell.data : [];
			break;
		case CellType.PhoneNumber:
		case CellType.ZipCode:
		case CellType.Currency:
		case CellType.Address:
			backendData =
				cell.data && typeof cell.data === "object" ? cell.data : null;
			break;
		case CellType.Number:
		case CellType.Slider:
			backendData =
				typeof cell.data === "number"
					? cell.data
					: cell.data === null
						? null
						: Number(cell.data) || null;
			break;
		case CellType.DateTime:
			backendData = typeof cell.data === "string" ? cell.data : null;
			break;
		case CellType.CreatedTime:
			backendData = typeof cell.data === "string" ? cell.data : null;
			break;
		case CellType.FileUpload:
			backendData =
				Array.isArray(cell.data) && cell.data.length > 0
					? JSON.stringify(cell.data)
					: null;
			break;
		case CellType.Time:
			backendData =
				cell.data && typeof cell.data === "object"
					? JSON.stringify(cell.data)
					: null;
			break;
		case CellType.Ranking:
			backendData =
				cell.data && Array.isArray(cell.data)
					? JSON.stringify(cell.data)
					: null;
			break;
		case CellType.Rating:
		case CellType.OpinionScale:
			backendData = cell.data ?? null;
			break;
		case CellType.Enrichment:
			backendData = cell.data ?? "";
			break;
		default:
			backendData = cell.data ?? "";
	}
	return backendData;
}

export interface UseSheetRowOpsState {
	tableId: string;
	assetId: string;
	viewId: string;
	records: any[];
	rowHeaders: any[];
	columnsRef: MutableRefObject<ExtendedColumn[]>;
	recordsRef: MutableRefObject<any[]>;
	rowHeadersRef: MutableRefObject<any[]>;
}

export function useSheetRowOps(
	socket: Socket | null,
	state: UseSheetRowOpsState,
) {
	const {
		tableId,
		assetId,
		viewId,
		records,
		rowHeaders,
		columnsRef,
		recordsRef,
		rowHeadersRef,
	} = state;
	const { deleteRecords: deleteRecordsApi } = useDeleteRecords();

	const emitRowCreate = useCallback(
		async (
			anchorId: string | null,
			position: "above" | "below",
			groupByFieldValues?: { [fieldId: string]: unknown },
			allFieldValues?: { [fieldId: string]: unknown },
		) => {
			if (!socket?.connected) {
				showAlert({
					type: "warning",
					message: "Not connected. Please wait...",
				});
				return;
			}
			if (!tableId || !assetId || !viewId) return;
			try {
				const payload: {
					tableId: string;
					baseId: string;
					viewId: string;
					fields_info: Array<{ field_id: number; data: any }>;
					order_info?: {
						is_above: boolean;
						__id: number;
						order: number;
					};
				} = {
					tableId,
					baseId: assetId,
					viewId,
					fields_info: [],
				};
				const combined = {
					...(groupByFieldValues || {}),
					...(allFieldValues || {}),
				};
				if (Object.keys(combined).length > 0) {
					const fieldsInfo: Array<{ field_id: number; data: any }> =
						[];
					const seen = new Set<number>();
					const columns = columnsRef.current;
					Object.entries(combined).forEach(([fieldId, value]) => {
						if (
							value === null ||
							value === undefined ||
							value === ""
						)
							return;
						const col = columns.find((c: ExtendedColumn) => {
							const raw = c.rawId;
							const target =
								typeof fieldId === "string"
									? Number(fieldId)
									: fieldId;
							return (
								raw === target ||
								Number(c.id) === target ||
								c.id === fieldId
							);
						});
						if (!col) return;
						const field_id =
							(col as any).rawId ?? Number(col.id) ?? 0;
						const n =
							typeof field_id === "string"
								? Number(field_id)
								: field_id;
						if (seen.has(n)) return;
						seen.add(n);
						fieldsInfo.push({ field_id: n, data: value });
					});
					payload.fields_info = fieldsInfo;
				}
				if (anchorId) {
					const anchorIndex = records.findIndex(
						(r) =>
							r.id === anchorId ||
							String(r.id) === String(anchorId),
					);
					if (anchorIndex !== -1) {
						const rec = records[anchorIndex];
						const h = rowHeaders[anchorIndex];
						const __id =
							typeof rec.id === "number"
								? rec.id
								: parseInt(String(rec.id), 10);
						if (Number.isFinite(__id)) {
							const order =
								(h as { orderValue?: number })?.orderValue ??
								h?.displayIndex ??
								anchorIndex;
							payload.order_info = {
								is_above: position === "above",
								__id,
								order: Number.isFinite(Number(order))
									? Number(order)
									: anchorIndex,
							};
						}
					}
				}
				if (
					payload.order_info &&
					(typeof payload.order_info.__id !== "number" ||
						!Number.isFinite(payload.order_info.__id))
				) {
					delete payload.order_info;
				}
				await socket.emit("row_create", payload);
			} catch (e) {
				showAlert({
					type: "error",
					message: "Failed to create record",
				});
			}
		},
		[socket, tableId, assetId, viewId, records, rowHeaders, columnsRef],
	);

	const emitRowUpdate = useCallback(
		async (rowIndex: number, columnIndex: number, cell: ICell) => {
			if (!socket?.connected || !tableId || !assetId || !viewId) return;
			const recs = recordsRef.current;
			const cols = columnsRef.current;
			const headers = rowHeadersRef.current;
			const record = recs[rowIndex];
			const column = cols[columnIndex];
			if (!record || !column) return;
			const rowHeader = headers[rowIndex];
			const row_id = Number(record.id) || parseInt(record.id, 10);
			if (Number.isNaN(row_id)) return;
			const field_id =
				Number((column as ExtendedColumn).rawId) ||
				Number(column.id) ||
				parseInt(column.id, 10);
			if (!field_id || Number.isNaN(field_id)) return;
			const backendData = formatCellDataForBackend(cell);
			const payload = {
				tableId,
				baseId: assetId,
				viewId,
				column_values: [
					{
						row_id,
						...(rowHeader?.displayIndex !== undefined && {
							order: rowHeader.displayIndex,
						}),
						fields_info: [{ field_id, data: backendData }],
					},
				],
			};
			try {
				await socket.emit("row_update", payload);
			} catch (e) {
				showAlert({
					type: "error",
					message: "Failed to update record",
				});
			}
		},
		[
			socket,
			tableId,
			assetId,
			viewId,
			recordsRef,
			columnsRef,
			rowHeadersRef,
		],
	);

	const emitRowUpdates = useCallback(
		async (
			updates: Array<{
				rowIndex: number;
				columnIndex: number;
				cell: ICell;
			}>,
		) => {
			if (
				!socket?.connected ||
				!tableId ||
				!assetId ||
				!viewId ||
				!updates.length
			)
				return;
			const recs = recordsRef.current;
			const cols = columnsRef.current;
			const headers = rowHeadersRef.current;
			const updatesByRow = new Map<
				number,
				Array<{ field_id: number; data: any; rowIndex: number }>
			>();
			for (const u of updates) {
				const record = recs[u.rowIndex];
				const column = cols[u.columnIndex];
				if (!record || !column) continue;
				const row_id = Number(record.id) || parseInt(record.id, 10);
				if (Number.isNaN(row_id)) continue;
				const field_id =
					Number(column.rawId) ||
					Number(column.id) ||
					parseInt(column.id, 10);
				if (!field_id || Number.isNaN(field_id)) continue;
				const data = formatCellDataForBackend(u.cell);
				if (!updatesByRow.has(row_id)) updatesByRow.set(row_id, []);
				updatesByRow.get(row_id)!.push({
					field_id,
					data,
					rowIndex: u.rowIndex,
				});
			}
			if (!updatesByRow.size) return;
			const column_values = Array.from(updatesByRow.entries()).map(
				([row_id, arr]) => {
					const rowIndex = arr[0].rowIndex;
					const rowHeader = headers[rowIndex];
					return {
						row_id,
						...(rowHeader?.displayIndex !== undefined && {
							order: rowHeader.displayIndex,
						}),
						fields_info: arr.map(({ field_id, data }) => ({
							field_id,
							data,
						})),
					};
				},
			);
			try {
				await socket.emit("row_update", {
					tableId,
					baseId: assetId,
					viewId,
					column_values,
				});
			} catch (e) {
				showAlert({
					type: "error",
					message: "Failed to update records",
				});
			}
		},
		[
			socket,
			tableId,
			assetId,
			viewId,
			recordsRef,
			columnsRef,
			rowHeadersRef,
		],
	);

	const deleteRecordsRequest = useCallback(
		async (recordIds: string[]) => {
			if (!tableId || !assetId || !viewId) {
				throw new Error(
					"Missing table/base/view identifiers for deleteRecordsRequest",
				);
			}
			await deleteRecordsApi({
				tableId,
				baseId: assetId,
				viewId,
				ids: recordIds,
			});
		},
		[deleteRecordsApi, tableId, assetId, viewId],
	);

	return {
		emitRowCreate,
		emitRowUpdate,
		emitRowUpdates,
		deleteRecordsRequest,
	};
}
