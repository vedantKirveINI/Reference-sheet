import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RowHeightLevel } from "@/types";

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

  rowHeightLevel: RowHeightLevel;
  setRowHeightLevel: (level: RowHeightLevel) => void;

  fieldNameLines: number;
  setFieldNameLines: (lines: number) => void;
}

const getDefaultSidebarExpanded = (): boolean => {
  if (typeof window === "undefined") return true;
  return window.innerWidth > 768;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
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

      rowHeightLevel: RowHeightLevel.Medium,
      setRowHeightLevel: (level) => set({ rowHeightLevel: level }),

      fieldNameLines: 1,
      setFieldNameLines: (lines) => set({ fieldNameLines: lines }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
        currentView: state.currentView,
        zoomLevel: state.zoomLevel,
        theme: state.theme,
        rowHeightLevel: state.rowHeightLevel,
        fieldNameLines: state.fieldNameLines,
      }),
    }
  )
);
