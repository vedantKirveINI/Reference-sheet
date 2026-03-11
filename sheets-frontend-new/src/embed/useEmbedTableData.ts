/**
 * TinyTable Embed – Table data manager
 *
 * Converts the embed protocol's table definitions + sample records
 * into the ITableData format the grid renderer understands.
 */

import { useState, useCallback } from "react";
import {
  CellType,
  type ICell,
  type ICurrencyData,
  type IPhoneNumberData,
  type ITimeData,
} from "@/types/cell";
import type { IColumn, IRecord, IRowHeader, ITableData } from "@/types/grid";
import { RowHeightLevel } from "@/types/grid";
import type { EmbedTableDefinition, EmbedTableField } from "./types";

// ---------------------------------------------------------------------------
// Field → Column mapping
// ---------------------------------------------------------------------------

function fieldToColumn(field: EmbedTableField, index: number): IColumn {
  return {
    id: field.id,
    name: field.name,
    type: field.type,
    width: defaultWidthForType(field.type),
    options: field.options,
    order: index,
  };
}

function defaultWidthForType(type: CellType): number {
  switch (type) {
    case CellType.LongText:
    case CellType.Address:
      return 240;
    case CellType.Number:
    case CellType.Rating:
    case CellType.Checkbox:
    case CellType.YesNo:
    case CellType.OpinionScale:
      return 120;
    case CellType.Currency:
    case CellType.PhoneNumber:
    case CellType.DateTime:
      return 180;
    default:
      return 160;
  }
}

// ---------------------------------------------------------------------------
// Sample record → IRecord mapping
// ---------------------------------------------------------------------------

function sampleToRecord(
  raw: Record<string, unknown>,
  fields: EmbedTableField[],
  index: number,
): IRecord {
  const cells: Record<string, ICell> = {};

  for (const field of fields) {
    const value = raw[field.name] ?? raw[field.id] ?? null;
    cells[field.id] = valueToCell(value, field);
  }

  return {
    id: `embed_row_${index}`,
    cells,
  };
}

function valueToCell(value: unknown, field: EmbedTableField): ICell {
  const type = field.type;

  switch (type) {
    case CellType.String:
      return { type, data: String(value ?? ""), displayData: String(value ?? "") };

    case CellType.LongText:
      return { type, data: String(value ?? ""), displayData: String(value ?? "") };

    case CellType.Number:
      return {
        type,
        data: value != null ? Number(value) : null,
        displayData: value != null ? String(value) : "",
      };

    case CellType.Currency: {
      const opts = field.options as Record<string, unknown> | undefined;
      const symbol = (opts?.symbol as string) ?? "$";
      const numVal = value != null ? Number(typeof value === "object" ? (value as any)?.value ?? (value as any)?.currencyValue : value) : null;
      const currData: ICurrencyData | null = numVal != null ? {
        countryCode: (opts?.countryCode as string) ?? "US",
        currencyCode: (opts?.code as string) ?? "USD",
        currencySymbol: symbol,
        currencyValue: numVal,
      } : null;
      return {
        type,
        data: currData,
        displayData: numVal != null ? `${symbol}${numVal.toLocaleString()}` : "",
      };
    }

    case CellType.DateTime:
      return {
        type,
        data: value != null ? String(value) : null,
        displayData: value != null ? String(value) : "",
        options: { dateFormat: "MM/DD/YYYY", separator: "/", includeTime: false, isTwentyFourHourFormat: false },
      };

    case CellType.SCQ: {
      const options = ((field.options as any)?.choices ?? (field.options as any)?.options ?? []) as string[];
      return {
        type,
        data: value != null ? String(value) : null,
        displayData: value != null ? String(value) : "",
        options: { options },
      };
    }

    case CellType.MCQ: {
      const options = ((field.options as any)?.choices ?? (field.options as any)?.options ?? []) as string[];
      const arr = Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
      return {
        type,
        data: arr,
        displayData: arr.join(", "),
        options: { options },
      };
    }

    case CellType.DropDown: {
      const options = ((field.options as any)?.choices ?? (field.options as any)?.options ?? []) as string[];
      const arr = Array.isArray(value) ? value.map(String) : value ? [String(value)] : null;
      return {
        type,
        data: arr,
        displayData: arr ? arr.join(", ") : "",
        options: { options },
      };
    }

    case CellType.YesNo:
      return {
        type,
        data: value != null ? String(value) : null,
        displayData: value != null ? String(value) : "",
        options: { options: ["Yes", "No"] },
      };

    case CellType.Checkbox:
      return {
        type,
        data: value != null ? Boolean(value) : null,
        displayData: value ? "Yes" : "",
      };

    case CellType.Rating:
      return {
        type,
        data: value != null ? Number(value) : null,
        displayData: value != null ? String(value) : "",
      };

    case CellType.PhoneNumber: {
      const phone: IPhoneNumberData | null = value
        ? typeof value === "object"
          ? (value as IPhoneNumberData)
          : { countryCode: "", countryNumber: "", phoneNumber: String(value) }
        : null;
      return {
        type,
        data: phone,
        displayData: phone ? `${phone.countryNumber} ${phone.phoneNumber}` : "",
      };
    }

    case CellType.Time: {
      const time: ITimeData | null = value
        ? typeof value === "object"
          ? (value as ITimeData)
          : { time: String(value), meridiem: "", ISOValue: "" }
        : null;
      return {
        type,
        data: time,
        displayData: time ? `${time.time}${time.meridiem ? " " + time.meridiem : ""}` : "",
        options: { isTwentyFourHour: false },
      };
    }

    default:
      return {
        type: CellType.String,
        data: value != null ? String(value) : "",
        displayData: value != null ? String(value) : "",
      };
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface EmbedTableState {
  tables: EmbedTableDefinition[];
  activeTableId: string;
  /** Processed ITableData keyed by table id. */
  tableDataMap: Map<string, ITableData>;
}

const EMPTY_STATE: EmbedTableState = {
  tables: [],
  activeTableId: "",
  tableDataMap: new Map(),
};

export function useEmbedTableData() {
  const [state, setState] = useState<EmbedTableState>(EMPTY_STATE);

  const buildTableData = useCallback(
    (table: EmbedTableDefinition): ITableData => {
      const columns = table.fields.map(fieldToColumn);
      const records = (table.sampleRecords ?? []).map((raw, i) =>
        sampleToRecord(raw, table.fields, i),
      );
      const rowHeaders: IRowHeader[] = records.map((r, i) => ({
        id: r.id,
        rowIndex: i,
        heightLevel: RowHeightLevel.Short,
      }));
      return { columns, records, rowHeaders };
    },
    [],
  );

  const loadTables = useCallback(
    (tables: EmbedTableDefinition[], activeTableId?: string) => {
      const map = new Map<string, ITableData>();
      for (const t of tables) {
        map.set(t.id, buildTableData(t));
      }
      setState({
        tables,
        activeTableId: activeTableId ?? tables[0]?.id ?? "",
        tableDataMap: map,
      });
    },
    [buildTableData],
  );

  const updateTable = useCallback(
    (
      tableId: string | undefined,
      fields?: EmbedTableField[],
      sampleRecords?: Record<string, unknown>[],
    ) => {
      setState((prev) => {
        const targetId = tableId ?? prev.activeTableId;
        const existingTable = prev.tables.find((t) => t.id === targetId);
        if (!existingTable) return prev;

        const updated: EmbedTableDefinition = {
          ...existingTable,
          fields: fields ?? existingTable.fields,
          sampleRecords: sampleRecords ?? existingTable.sampleRecords,
        };

        const newTables = prev.tables.map((t) =>
          t.id === targetId ? updated : t,
        );
        const newMap = new Map(prev.tableDataMap);
        newMap.set(targetId, buildTableData(updated));

        return { ...prev, tables: newTables, tableDataMap: newMap };
      });
    },
    [buildTableData],
  );

  const setActiveTable = useCallback((tableId: string) => {
    setState((prev) => ({ ...prev, activeTableId: tableId }));
  }, []);

  return {
    ...state,
    loadTables,
    updateTable,
    setActiveTable,
  };
}
