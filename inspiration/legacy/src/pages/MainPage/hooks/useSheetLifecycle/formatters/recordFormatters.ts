import {
	CellType,
	ICell,
	IRecord,
	IRecordRaw,
	IRowHeader,
	INumberCell,
	IMCQCell,
	ISCQCell,
	IYesNoCell,
	IPhoneNumberCell,
	IZipCodeCell,
	IDropDownCell,
	IAddressCell,
	IDateTimeCell,
	ICreatedTimeCell,
	ISignatureCell,
	ISliderCell,
	IFileUploadCell,
	ITimeCell,
	IRatingCell,
	IOpinionScaleCell,
	IEnrichmentCell,
	IFormulaCell,
	IStringCell,
	RowHeightLevel,
} from "@/types";
import { parseColumnMeta, getColumnWidth } from "@/utils/columnMetaUtils";
import { COLUMN_WIDTH_MAPPING } from "@/constants/columnWidthMapping";
import { formatCell, mapFieldTypeToCellType } from "./cellFormatters";
import type {
	RecordsFetchedPayload,
	CreatedRowPayload,
	UpdatedRowPayload,
	FormatResult,
	ExtendedColumn,
} from "../types";

export const formatRecordsFetched = (
	payload: RecordsFetchedPayload,
	viewId: string,
	columnMeta?: string | null,
): FormatResult => {
	const fields = payload?.fields || [];
	const rawRecords = payload?.records || [];
	const parsedColumnMeta = parseColumnMeta(columnMeta);

	const columns: ExtendedColumn[] = fields.map((field, index) => {
		const cellType = mapFieldTypeToCellType(field.type);
		const columnWidth = getColumnWidth(
			field.id,
			field.type,
			parsedColumnMeta,
			COLUMN_WIDTH_MAPPING,
		);
		return {
			id: field.dbFieldName,
			name: field.name,
			type: cellType,
			width: columnWidth,
			isFrozen: false,
			order: typeof field.order === "number" ? field.order : index + 1,
			rawType: field.type,
			rawOptions: field.options,
			rawId: field.id,
			dbFieldName: field.dbFieldName,
			description: field.description ?? "",
			computedFieldMeta: field.computedFieldMeta,
			fieldFormat: field.fieldFormat,
			entityType: field.entityType,
			identifier: field.identifier,
			fieldsToEnrich: field.fieldsToEnrich,
			options:
				cellType === CellType.MCQ ||
				cellType === CellType.SCQ ||
				cellType === CellType.YesNo ||
				cellType === CellType.DropDown
					? field.options?.options || []
					: undefined,
			status: (field as any).status,
		};
	});

	const rowOrderKey = viewId ? `_row_view${viewId}` : undefined;

	const records: IRecord[] = rawRecords.map((record, index) => {
		const cells: Record<string, ICell> = {};
		columns.forEach((column) => {
			const rawValue = record[column.id];
			cells[column.id] = formatCell(rawValue, column);
		});
		// Store __created_time so when a CREATED_TIME field is added via socket we can show it without refetch (sheets pattern)
		const _raw: IRecordRaw | undefined =
			record?.__created_time !== undefined
				? { __created_time: record.__created_time ?? null }
				: undefined;
		return {
			id: String(record?.__id ?? index + 1),
			cells,
			...(typeof _raw !== "undefined" && Object.keys(_raw).length > 0
				? { _raw }
				: {}),
		};
	});

	const rowHeaders: IRowHeader[] = records.map((_, index) => ({
		id: `row_${index + 1}`,
		rowIndex: index,
		heightLevel: RowHeightLevel.Short,
		displayIndex: index + 1,
		orderValue:
			(rowOrderKey ? rawRecords[index]?.[rowOrderKey] : undefined) ??
			rawRecords[index]?.__id ??
			index + 1,
	}));

	const groupPoints = payload?.groupPoints;
	return { columns, records, rowHeaders, groupPoints };
};

export const formatCreatedRow = (
	payload: CreatedRowPayload[],
	columns: ExtendedColumn[],
	viewId: string,
): {
	newRecord: IRecord;
	rowHeader: IRowHeader;
	orderValue: number | undefined;
} => {
	if (!payload || payload.length === 0) {
		throw new Error("Empty created_row payload");
	}
	const recordData = payload[0];
	const { __id, __status, socket_id, ...fieldData } = recordData;
	const rowOrderKey = viewId ? `_row_view${viewId}` : undefined;
	const orderValue = rowOrderKey ? fieldData[rowOrderKey] : undefined;
	const cells: Record<string, ICell> = {};

	columns.forEach((column) => {
		const rawValue = fieldData[column.id];
		if (rawValue !== undefined) {
			cells[column.id] = formatCell(rawValue, column);
		} else {
			switch (column.type) {
				case CellType.Number:
					cells[column.id] = {
						type: CellType.Number,
						data: null,
						displayData: "",
					} as INumberCell;
					break;
				case CellType.MCQ:
					cells[column.id] = {
						type: CellType.MCQ,
						data: [],
						displayData: "[]",
						options: column.options,
					} as IMCQCell;
					break;
				case CellType.List:
					cells[column.id] = {
						type: CellType.List,
						data: [],
						displayData: "[]",
					} as unknown as ICell;
					break;
				case CellType.SCQ:
					cells[column.id] = {
						type: CellType.SCQ,
						data: null,
						displayData: "",
						options: column.options,
					} as ISCQCell;
					break;
				case CellType.YesNo:
					cells[column.id] = {
						type: CellType.YesNo,
						data: null,
						displayData: "",
						options: column.options,
					} as IYesNoCell;
					break;
				case CellType.PhoneNumber:
					cells[column.id] = {
						type: CellType.PhoneNumber,
						data: null,
						displayData: "",
					} as IPhoneNumberCell;
					break;
				case CellType.ZipCode:
					cells[column.id] = {
						type: CellType.ZipCode,
						data: null,
						displayData: "",
					} as IZipCodeCell;
					break;
				case CellType.DropDown:
					cells[column.id] = {
						type: CellType.DropDown,
						data: null,
						displayData: "[]",
						options: column.options,
					} as IDropDownCell;
					break;
				case CellType.Address:
					cells[column.id] = {
						type: CellType.Address,
						data: null,
						displayData: "",
					} as IAddressCell;
					break;
				case CellType.DateTime:
					cells[column.id] = {
						type: CellType.DateTime,
						data: null,
						displayData: "",
					} as IDateTimeCell;
					break;
				case CellType.CreatedTime:
					cells[column.id] = {
						type: CellType.CreatedTime,
						data: null,
						displayData: "",
						readOnly: true,
					} as ICreatedTimeCell;
					break;
				case CellType.Signature:
					cells[column.id] = {
						type: CellType.Signature,
						data: null,
						displayData: "",
					} as ISignatureCell;
					break;
				case CellType.Slider:
					cells[column.id] = {
						type: CellType.Slider,
						data: null,
						displayData: "",
						options: {
							minValue: column.rawOptions?.minValue ?? 0,
							maxValue: column.rawOptions?.maxValue ?? 10,
						},
					} as ISliderCell;
					break;
				case CellType.FileUpload:
					cells[column.id] = {
						type: CellType.FileUpload,
						data: null,
						displayData: "",
						options: {
							maxFileSizeBytes:
								column.rawOptions?.maxFileSizeBytes ?? 10485760,
							allowedFileTypes:
								column.rawOptions?.allowedFileTypes ?? [],
							noOfFilesAllowed:
								column.rawOptions?.noOfFilesAllowed ?? 100,
						},
					} as IFileUploadCell;
					break;
				case CellType.Time:
					cells[column.id] = {
						type: CellType.Time,
						data: null,
						displayData: "",
						options: {
							isTwentyFourHour:
								column.rawOptions?.isTwentyFourHour ?? false,
						},
					} as ITimeCell;
					break;
				case CellType.Rating:
					cells[column.id] = {
						type: CellType.Rating,
						data: null,
						displayData: "",
						options: {
							maxRating: column.rawOptions?.maxRating ?? 10,
							icon: column.rawOptions?.icon ?? "star",
							...(column.rawOptions?.color && {
								color: column.rawOptions.color,
							}),
						},
					} as IRatingCell;
					break;
				case CellType.OpinionScale:
					cells[column.id] = {
						type: CellType.OpinionScale,
						data: null,
						displayData: "",
						options: {
							maxValue: column.rawOptions?.maxValue ?? 10,
						},
					} as IOpinionScaleCell;
					break;
				case CellType.Enrichment:
					cells[column.id] = {
						type: CellType.Enrichment,
						data: null,
						displayData: "",
						readOnly: true,
						options: {
							config: {
								identifier: (
									column.rawOptions?.identifier ||
									column.rawOptions?.config?.identifier ||
									[]
								).map((ident: any) => ({
									field_id: ident.field_id || ident.fieldId,
									dbFieldName:
										ident.dbFieldName ||
										ident.db_field_name,
									required: ident.required || false,
								})),
							},
						},
					} as IEnrichmentCell;
					break;
				case CellType.String:
					if (column.rawType === "FORMULA") {
						const formulaComputedFieldMeta =
							column.rawOptions?.computedFieldMeta ||
							(column as any).computedFieldMeta ||
							{};
						cells[column.id] = {
							type: CellType.String,
							data: null,
							displayData: "",
							readOnly: true,
							options: {
								computedFieldMeta: {
									hasError:
										formulaComputedFieldMeta.hasError ||
										false,
									shouldShowLoading:
										formulaComputedFieldMeta.shouldShowLoading ||
										false,
									expression:
										formulaComputedFieldMeta.expression,
								},
							},
						} as IFormulaCell;
					} else {
						cells[column.id] = {
							type: CellType.String,
							data: "",
							displayData: "",
						} as IStringCell;
					}
					break;
				default:
					cells[column.id] = {
						type: CellType.String,
						data: "",
						displayData: "",
					} as IStringCell;
			}
		}
	});

	const _raw: IRecordRaw | undefined =
		fieldData?.__created_time !== undefined
			? { __created_time: fieldData.__created_time ?? null }
			: undefined;
	const newRecord: IRecord = {
		id: String(__id),
		cells,
		...(typeof _raw !== "undefined" && Object.keys(_raw).length > 0
			? { _raw }
			: {}),
	};
	const rowHeader: IRowHeader = {
		id: `row_${__id}`,
		rowIndex: 0,
		heightLevel: RowHeightLevel.Short,
		displayIndex: 0,
		orderValue: orderValue ?? __id,
	};
	return { newRecord, rowHeader, orderValue };
};

export const formatUpdatedRow = (
	payload: UpdatedRowPayload[],
	allColumns: ExtendedColumn[],
	currentRecords: IRecord[],
): {
	updatedCells: Map<number, Record<string, ICell>>;
	socketId?: string;
	enrichedFieldIds: Array<{ rowId: number; fieldId: string }>;
	formulaFieldIds: Array<{ rowId: number; fieldId: string }>;
} => {
	const updatedCells = new Map<number, Record<string, ICell>>();
	let socketId: string | undefined;
	const enrichedFieldIds: Array<{ rowId: number; fieldId: string }> = [];
	const formulaFieldIds: Array<{ rowId: number; fieldId: string }> = [];

	payload.forEach((rowData) => {
		const { row_id, fields_info, socket_id, enrichedFieldId } = rowData;
		socketId = socket_id;
		if (enrichedFieldId) {
			enrichedFieldIds.push({ rowId: row_id, fieldId: enrichedFieldId });
		}
		const normalizedRowId = Number(row_id);
		const recordIndex = currentRecords.findIndex((record) => {
			const recordIdNum = Number(record.id);
			return (
				recordIdNum === normalizedRowId ||
				record.id === String(normalizedRowId) ||
				String(record.id) === String(normalizedRowId)
			);
		});
		if (recordIndex === -1) return;
		const record = currentRecords[recordIndex];
		const updatedCellsForRecord: Record<string, ICell> = {
			...record.cells,
		};
		fields_info.forEach(({ field_id, data }) => {
			const normalizedFieldId = Number(field_id);
			const column = allColumns.find((columnItem: ExtendedColumn) => {
				const rawIdMatch =
					columnItem.rawId !== undefined &&
					(Number(columnItem.rawId) === normalizedFieldId ||
						columnItem.rawId === normalizedFieldId ||
						String(columnItem.rawId) === String(normalizedFieldId));
				return rawIdMatch;
			});
			if (!column) return;
			if (column.rawType === "FORMULA") {
				formulaFieldIds.push({
					rowId: row_id,
					fieldId: String(column.rawId || column.id),
				});
			}
			updatedCellsForRecord[column.id] = formatCell(data, column);
		});
		updatedCells.set(row_id, updatedCellsForRecord);
	});
	return {
		updatedCells,
		socketId,
		enrichedFieldIds,
		formulaFieldIds,
	};
};
