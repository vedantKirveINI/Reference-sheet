import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RowHeightLevel, TextWrapMode } from "@/types";

interface CellPosition {
  rowIndex: number;
  columnIndex: number;
}

interface UIState {
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;

  currentView: "grid" | "kanban";
  setCurrentView: (view: "grid" | "kanban") => void;

  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  selectedCells: CellPosition[];
  setSelectedCells: (cells: CellPosition[]) => void;
  clearSelection: () => void;

  activeCell: CellPosition | null;
  setActiveCell: (cell: CellPosition | null) => void;

  filterState: any;
  setFilterState: (filter: any) => void;

  sortState: any;
  setSortState: (sort: any) => void;

  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  accentColor: string;
  setAccentColor: (color: string) => void;

  rowHeightLevel: RowHeightLevel;
  setRowHeightLevel: (level: RowHeightLevel) => void;

  fieldNameLines: number;
  setFieldNameLines: (lines: number) => void;

  defaultTextWrapMode: TextWrapMode;
  columnTextWrapModes: Record<string, TextWrapMode>;
  setColumnTextWrapMode: (columnId: string, mode: TextWrapMode) => void;
  getColumnTextWrapMode: (columnId: string) => TextWrapMode;

  columnColors: Record<string, string | null>;
  setColumnColor: (columnId: string, color: string | null) => void;
  setColumnColors: (colors: Record<string, string | null>) => void;
}

export const THEME_PRESETS = [
  { name: "Brand Green", color: "#39A380" },
  { name: "Ocean Blue", color: "#2563EB" },
  { name: "Royal Purple", color: "#7C3AED" },
  { name: "Sunset Orange", color: "#EA580C" },
  { name: "Rose Pink", color: "#DB2777" },
  { name: "Teal", color: "#0891B2" },
  { name: "Amber", color: "#D97706" },
  { name: "Indigo", color: "#4F46E5" },
  { name: "Emerald", color: "#059669" },
  { name: "Slate", color: "#475569" },
];

const getDefaultSidebarExpanded = (): boolean => {
  if (typeof window === "undefined") return true;
  return window.innerWidth > 768;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarExpanded: getDefaultSidebarExpanded(),
      toggleSidebar: () =>
        set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
      expandSidebar: () => set({ sidebarExpanded: true }),
      collapseSidebar: () => set({ sidebarExpanded: false }),

      currentView: "grid",
      setCurrentView: (view) => set({ currentView: view }),

      zoomLevel: 100,
      setZoomLevel: (level) => set({ zoomLevel: level }),

      selectedCells: [],
      setSelectedCells: (cells) => set({ selectedCells: cells }),
      clearSelection: () => set({ selectedCells: [], activeCell: null }),

      activeCell: null,
      setActiveCell: (cell) => set({ activeCell: cell }),

      filterState: null,
      setFilterState: (filter) => set({ filterState: filter }),

      sortState: null,
      setSortState: (sort) => set({ sortState: sort }),

      theme: "light",
      setTheme: (theme) => set({ theme }),

      accentColor: "#39A380",
      setAccentColor: (color) => set({ accentColor: color }),

      rowHeightLevel: RowHeightLevel.Medium,
      setRowHeightLevel: (level) => set({ rowHeightLevel: level }),

      fieldNameLines: 1,
      setFieldNameLines: (lines) => set({ fieldNameLines: lines }),

      defaultTextWrapMode: TextWrapMode.Clip,
      columnTextWrapModes: {},
      columnColors: {},
      setColumnColor: (columnId, color) => set((state) => ({
        columnColors: { ...state.columnColors, [columnId]: color },
      })),
      setColumnColors: (colors) => set(() => ({
        columnColors: colors,
      })),
      setColumnTextWrapMode: (columnId, mode) => set((state) => ({
        columnTextWrapModes: { ...state.columnTextWrapModes, [columnId]: mode },
      })),
      getColumnTextWrapMode: (columnId): TextWrapMode => {
        const s = get();
        return s.columnTextWrapModes[columnId] ?? s.defaultTextWrapMode;
      },
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        currentView: state.currentView,
        zoomLevel: state.zoomLevel,
        theme: state.theme,
        accentColor: state.accentColor,
        rowHeightLevel: state.rowHeightLevel,
        fieldNameLines: state.fieldNameLines,
        columnTextWrapModes: state.columnTextWrapModes,
        columnColors: state.columnColors,
      }),
    }
  )
);
