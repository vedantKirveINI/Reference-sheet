import { create } from "zustand";
import { IColumn, IComputedFieldMeta, IEnrichmentIdentifier } from "@/types";
import { ViewType } from "@/types";

export interface IExtendedColumn extends IColumn {
  rawType?: string;
  rawOptions?: Record<string, unknown>;
  rawId?: string;
  dbFieldName?: string;
  description?: string;
  computedFieldMeta?: IComputedFieldMeta;
  fieldFormat?: string;
  entityType?: string;
  identifier?: IEnrichmentIdentifier[];
  fieldsToEnrich?: string[];
  status?: string;
}

interface ColumnMetaEntry {
  order: number;
  width?: number;
  hidden?: boolean;
}

type ColumnMetaMap = Record<string, ColumnMetaEntry>;

function parseColumnMeta(columnMeta?: string): ColumnMetaMap | null {
  if (!columnMeta) return null;
  try {
    return JSON.parse(columnMeta) as ColumnMetaMap;
  } catch {
    return null;
  }
}

interface FieldsState {
  allColumns: IExtendedColumn[];
  loading: boolean;
  error: string | null;

  getVisibleColumns: (columnMeta?: string, viewType?: ViewType) => IExtendedColumn[];
  setAllColumns: (columns: IExtendedColumn[]) => void;
  updateColumn: (id: string, updates: Partial<IExtendedColumn>) => void;
  updateColumns: (updates: Array<{ id: string } & Partial<IExtendedColumn>>) => void;
  clearFields: () => void;
  clearError: () => void;
}

export const useFieldsStore = create<FieldsState>()((set, get) => ({
  allColumns: [],
  loading: false,
  error: null,

  getVisibleColumns: (columnMeta?: string, _viewType?: ViewType) => {
    const { allColumns } = get();
    const meta = parseColumnMeta(columnMeta);

    if (!meta) {
      return allColumns.filter((col) => !col.isHidden);
    }

    return allColumns
      .filter((col) => {
        const colMeta = meta[col.id];
        if (colMeta?.hidden) return false;
        if (col.isHidden && !colMeta) return false;
        return true;
      })
      .sort((a, b) => {
        const orderA = meta[a.id]?.order ?? a.order ?? 0;
        const orderB = meta[b.id]?.order ?? b.order ?? 0;
        return orderA - orderB;
      });
  },

  setAllColumns: (columns) => set({ allColumns: columns }),

  updateColumn: (id, updates) =>
    set((state) => ({
      allColumns: state.allColumns.map((col) =>
        col.id === id ? { ...col, ...updates } : col
      ),
    })),

  updateColumns: (updates) =>
    set((state) => {
      const updateMap = new Map(updates.map((u) => [u.id, u]));
      return {
        allColumns: state.allColumns.map((col) => {
          const update = updateMap.get(col.id);
          return update ? { ...col, ...update } : col;
        }),
      };
    }),

  clearFields: () => set({ allColumns: [], error: null }),

  clearError: () => set({ error: null }),
}));
