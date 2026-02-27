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
  hiddenColumnIds: Set<string>;
  collapsedEnrichmentGroups: Set<string>;
  loading: boolean;
  error: string | null;

  getVisibleColumns: (columnMeta?: string, viewType?: ViewType) => IExtendedColumn[];
  visibleColumns: () => IExtendedColumn[];
  setAllColumns: (columns: IExtendedColumn[]) => void;
  updateColumn: (id: string, updates: Partial<IExtendedColumn>) => void;
  updateColumns: (updates: Array<{ id: string } & Partial<IExtendedColumn>>) => void;
  toggleColumnVisibility: (columnId: string) => void;
  setColumnVisibility: (columnId: string, visible: boolean) => void;
  toggleEnrichmentGroupCollapse: (parentColumnId: string) => void;
  isEnrichmentGroupCollapsed: (parentColumnId: string) => boolean;
  getEnrichmentGroupMap: () => Map<string, string[]>;
  getEnrichmentParentId: (columnId: string) => string | null;
  clearFields: () => void;
  clearError: () => void;
}

export const useFieldsStore = create<FieldsState>()((set, get) => ({
  allColumns: [],
  hiddenColumnIds: new Set<string>(),
  collapsedEnrichmentGroups: new Set<string>(),
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

  toggleColumnVisibility: (columnId: string) =>
    set((state) => {
      const next = new Set(state.hiddenColumnIds);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return { hiddenColumnIds: next };
    }),

  setColumnVisibility: (columnId: string, visible: boolean) =>
    set((state) => {
      const next = new Set(state.hiddenColumnIds);
      if (visible) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return { hiddenColumnIds: next };
    }),

  toggleEnrichmentGroupCollapse: (parentColumnId: string) =>
    set((state) => {
      const next = new Set(state.collapsedEnrichmentGroups);
      if (next.has(parentColumnId)) {
        next.delete(parentColumnId);
      } else {
        next.add(parentColumnId);
      }
      return { collapsedEnrichmentGroups: next };
    }),

  isEnrichmentGroupCollapsed: (parentColumnId: string) => {
    const { collapsedEnrichmentGroups } = get();
    return collapsedEnrichmentGroups.has(parentColumnId);
  },

  getEnrichmentGroupMap: () => {
    const { allColumns } = get();
    const map = new Map<string, string[]>();

    allColumns.forEach((col) => {
      // Check if this is a parent enrichment column
      if (col.rawType === "ENRICHMENT" && col.type === "Enrichment" && col.fieldsToEnrich) {
        const childIds = (col.fieldsToEnrich as any[])?.map((f: any) => f.dbFieldName) || [];
        map.set(col.id, childIds);
      }
    });

    return map;
  },

  getEnrichmentParentId: (columnId: string) => {
    const { allColumns } = get();

    for (const col of allColumns) {
      if (col.rawType === "ENRICHMENT" && col.type === "Enrichment" && col.fieldsToEnrich) {
        const childIds = (col.fieldsToEnrich as any[])?.map((f: any) => f.dbFieldName) || [];
        if (childIds.includes(columnId)) {
          return col.id;
        }
      }
    }

    return null;
  },

  visibleColumns: () => {
    const { allColumns, hiddenColumnIds } = get();
    return allColumns.filter((col) => !hiddenColumnIds.has(col.id));
  },

  clearFields: () => set({ allColumns: [], hiddenColumnIds: new Set(), collapsedEnrichmentGroups: new Set(), error: null }),

  clearError: () => set({ error: null }),
}));
