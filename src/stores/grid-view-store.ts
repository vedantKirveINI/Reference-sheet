import { create } from "zustand";
import { IHeaderMenu, IRecordMenu } from "@/types";

interface LinkedRecordStackItem {
  foreignTableId: string;
  recordId: number;
  title?: string;
}

interface GridViewState {
  selection: any;
  headerMenu: IHeaderMenu | null;
  recordMenu: IRecordMenu | null;
  selectedRows: Set<number>;
  expandedRecordId: string | null;
  linkedRecordStack: LinkedRecordStackItem[];
  linkedRecordModalOpen: boolean;

  setSelection: (selection: any) => void;
  openHeaderMenu: (menu: IHeaderMenu) => void;
  closeHeaderMenu: () => void;
  openRecordMenu: (menu: IRecordMenu) => void;
  closeRecordMenu: () => void;
  setSelectedRows: (rows: Set<number>) => void;
  clearSelectedRows: () => void;
  setExpandedRecordId: (id: string | null) => void;
  openLinkedRecord: (item: LinkedRecordStackItem) => void;
  pushLinkedRecord: (item: LinkedRecordStackItem) => void;
  popLinkedRecord: () => void;
  closeLinkedRecordModal: () => void;
}

export const useGridViewStore = create<GridViewState>()((set) => ({
  selection: null,
  headerMenu: null,
  recordMenu: null,
  selectedRows: new Set<number>(),
  expandedRecordId: null,
  linkedRecordStack: [],
  linkedRecordModalOpen: false,

  setSelection: (selection) => set({ selection }),

  openHeaderMenu: (menu) => set({ headerMenu: menu, recordMenu: null }),
  closeHeaderMenu: () => set({ headerMenu: null }),

  openRecordMenu: (menu) => set({ recordMenu: menu, headerMenu: null }),
  closeRecordMenu: () => set({ recordMenu: null }),

  setSelectedRows: (rows) => set({ selectedRows: rows }),
  clearSelectedRows: () => set({ selectedRows: new Set<number>() }),
  setExpandedRecordId: (id) => set({ expandedRecordId: id }),

  openLinkedRecord: (item) => set({ linkedRecordStack: [item], linkedRecordModalOpen: true }),
  pushLinkedRecord: (item) => set((state) => ({
    linkedRecordStack: [...state.linkedRecordStack, item],
  })),
  popLinkedRecord: () => set((state) => ({
    linkedRecordStack: state.linkedRecordStack.length > 1
      ? state.linkedRecordStack.slice(0, -1)
      : state.linkedRecordStack,
  })),
  closeLinkedRecordModal: () => set({ linkedRecordStack: [], linkedRecordModalOpen: false }),
}));
