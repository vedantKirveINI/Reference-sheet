// Zustand Fields Store - Manages field/column state
// Similar to viewStore pattern, handles allColumns and visibleColumns
import { create } from "zustand";
import { IColumn } from "@/types";
import { parseColumnMeta } from "@/utils/columnMetaUtils";
import { filterHiddenColumns } from "@/utils/columnFilterUtils";

// ExtendedColumn type for internal use (matches useSheetLifecycle)
type ExtendedColumn = IColumn & {
	rawType?: string;
	rawOptions?: any;
	rawId?: string | number;
	dbFieldName?: string;
	description?: string | null;
	computedFieldMeta?: any;
	fieldFormat?: string;
	entityType?: string;
	identifier?: any;
	fieldsToEnrich?: any;
	status?: string;
	order?: number;
};

interface FieldsState {
	// State
	allColumns: ExtendedColumn[]; // All fields from API (source of truth)
	loading: boolean;
	error: string | null;

	// Computed getter (not stored, computed on access)
	getVisibleColumns: (
		columnMeta?: string | null,
		viewType?: "grid" | "kanban",
	) => ExtendedColumn[];

	// Actions
	setAllColumns: (columns: ExtendedColumn[]) => void;
	updateColumn: (columnId: string, updates: Partial<ExtendedColumn>) => void;
	updateColumns: (
		updates: Array<{ id: string; updates: Partial<ExtendedColumn> }>,
	) => void;
	clearFields: () => void;
	clearError: () => void;
}

export const useFieldsStore = create<FieldsState>((set, get) => ({
	// Initial state
	allColumns: [],
	loading: false,
	error: null,

	// Computed: Get visible columns based on columnMeta and viewType
	getVisibleColumns: (
		columnMeta?: string | null,
		viewType: "grid" | "kanban" = "grid",
	) => {
		const { allColumns } = get();
		if (!columnMeta) return allColumns;

		const parsedColumnMeta = parseColumnMeta(columnMeta);

		// Grid view: uses hidden property (inverted logic)
		if (viewType === "grid") {
			return filterHiddenColumns(allColumns, parsedColumnMeta);
		}

		// Kanban view: uses visible property (opt-in, default true)
		// For now, we'll use the same filterHiddenColumns but could create a separate utility
		// Since we're using is_hidden for both, we can use the same filter
		// TODO: If Kanban uses visible property in future, create filterVisibleColumns utility
		return filterHiddenColumns(allColumns, parsedColumnMeta);
	},

	// Set all columns (called from recordsFetched)
	setAllColumns: (columns: IColumn[]) => {
		set({ allColumns: columns, error: null });
	},

	// Update a single column (e.g., width change)
	updateColumn: (columnId: string, updates: Partial<IColumn>) => {
		set((state) => ({
			allColumns: state.allColumns.map((col) =>
				col.id === columnId ? { ...col, ...updates } : col,
			),
		}));
	},

	// Update multiple columns (e.g., batch width updates)
	updateColumns: (
		updates: Array<{ id: string; updates: Partial<IColumn> }>,
	) => {
		set((state) => {
			const updateMap = new Map(
				updates.map((u) => [u.id, u.updates]),
			);
			return {
				allColumns: state.allColumns.map((col) => {
					const columnUpdates = updateMap.get(col.id);
					return columnUpdates ? { ...col, ...columnUpdates } : col;
				}),
			};
		});
	},

	// Clear all fields
	clearFields: () => {
		set({ allColumns: [], error: null });
	},

	// Clear error
	clearError: () => {
		set({ error: null });
	},
}));
