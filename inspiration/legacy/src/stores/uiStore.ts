// Zustand UI Store - Manages application UI state
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RowHeightLevel } from "@/types";

// UI Store State Interface
interface UIState {
	// Sidebar state
	sidebarExpanded: boolean;
	toggleSidebar: () => void;
	expandSidebar: () => void;
	collapseSidebar: () => void;

	// Current view (grid, kanban, etc.)
	currentView: "grid" | "kanban";
	setCurrentView: (view: "grid" | "kanban") => void;

	// Zoom level
	zoomLevel: number;
	setZoomLevel: (level: number) => void;

	// Cell selection state
	selectedCells: Array<{ rowIndex: number; columnIndex: number }>;
	setSelectedCells: (
		cells: Array<{ rowIndex: number; columnIndex: number }>,
	) => void;
	clearSelection: () => void;

	// Active cell (for editing)
	activeCell: { rowIndex: number; columnIndex: number } | null;
	setActiveCell: (
		cell: { rowIndex: number; columnIndex: number } | null,
	) => void;

	// Current sheet/table data state
	useBackendHeaders: boolean;
	setUseBackendHeaders: (use: boolean) => void;

	// Filter state
	filterState: any;
	setFilterState: (filter: any) => void;

	// Sort state
	sortState: any;
	setSortState: (sort: any) => void;

	// Theme preferences
	theme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;

	// Row height (view-level setting) - Inspired by Teable
	rowHeightLevel: RowHeightLevel;
	setRowHeightLevel: (level: RowHeightLevel) => void;
}

// Zustand store with persistence
export const useUIStore = create<UIState>()(
	persist(
		(set) => ({
			// Sidebar state - defaults to expanded on desktop
			sidebarExpanded:
				typeof window !== "undefined" ? window.innerWidth > 768 : true,
			toggleSidebar: () =>
				set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
			expandSidebar: () => set({ sidebarExpanded: true }),
			collapseSidebar: () => set({ sidebarExpanded: false }),

			// Current view - defaults to grid
			currentView: "grid",
			setCurrentView: (view) => set({ currentView: view }),

			// Zoom level - defaults to 100%
			zoomLevel: 100,
			setZoomLevel: (level) => set({ zoomLevel: level }),

			// Cell selection - empty array by default
			selectedCells: [],
			setSelectedCells: (cells) => set({ selectedCells: cells }),
			clearSelection: () => set({ selectedCells: [] }),

			// Active cell - null by default
			activeCell: null,
			setActiveCell: (cell) => set({ activeCell: cell }),

			// Backend headers - defaults to false (use generated)
			useBackendHeaders: false,
			setUseBackendHeaders: (use) => set({ useBackendHeaders: use }),

			// Filter state - empty object by default
			filterState: {},
			setFilterState: (filter) => set({ filterState: filter }),

			// Sort state - empty object by default
			sortState: {},
			setSortState: (sort) => set({ sortState: sort }),

			// Theme - defaults to light
			theme: "light",
			setTheme: (theme) => set({ theme }),

			// Row height - defaults to Medium (like Teable)
			rowHeightLevel: RowHeightLevel.Medium,
			setRowHeightLevel: (level) => set({ rowHeightLevel: level }),
		}),
		{
			name: "ui-state", // LocalStorage key
			// Only persist certain fields
			partialize: (state) => ({
				sidebarExpanded: state.sidebarExpanded,
				currentView: state.currentView,
				zoomLevel: state.zoomLevel,
				useBackendHeaders: state.useBackendHeaders,
				theme: state.theme,
				rowHeightLevel: state.rowHeightLevel,
			}),
		},
	),
);
