import { create } from "zustand";
import { IHeaderMenu, IRecordMenu } from "@/types";

interface GridViewState {
  selection: any;
  headerMenu: IHeaderMenu | null;
  recordMenu: IRecordMenu | null;

  setSelection: (selection: any) => void;
  openHeaderMenu: (menu: IHeaderMenu) => void;
  closeHeaderMenu: () => void;
  openRecordMenu: (menu: IRecordMenu) => void;
  closeRecordMenu: () => void;
}

export const useGridViewStore = create<GridViewState>()((set) => ({
  selection: null,
  headerMenu: null,
  recordMenu: null,

  setSelection: (selection) => set({ selection }),

  openHeaderMenu: (menu) => set({ headerMenu: menu, recordMenu: null }),
  closeHeaderMenu: () => set({ headerMenu: null }),

  openRecordMenu: (menu) => set({ recordMenu: menu, headerMenu: null }),
  closeRecordMenu: () => set({ recordMenu: null }),
}));
