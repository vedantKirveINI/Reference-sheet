import { create } from "zustand";
import { IColumn } from "@/types";

interface ModalState {
  isOpen: boolean;
  initialData: any;
  fields: IColumn[];
}

const defaultModalState: ModalState = {
  isOpen: false,
  initialData: null,
  fields: [],
};

export type ImportModalMode = "existing" | "new";

interface ModalControlState {
  sort: ModalState;
  filter: ModalState;
  groupBy: ModalState;
  hideFields: boolean;
  exportModal: boolean;
  importModal: boolean;
  importModalMode: ImportModalMode;
  shareModal: boolean;

  openSort: (initialData?: any, fields?: IColumn[]) => void;
  closeSort: () => void;

  openFilter: (initialData?: any, fields?: IColumn[]) => void;
  closeFilter: () => void;

  openGroupBy: (initialData?: any, fields?: IColumn[]) => void;
  closeGroupBy: () => void;

  toggleHideFields: () => void;
  openHideFields: () => void;
  closeHideFields: () => void;

  openExportModal: () => void;
  closeExportModal: () => void;
  openImportModal: (mode?: ImportModalMode) => void;
  closeImportModal: () => void;
  openShareModal: () => void;
  closeShareModal: () => void;
}

export const useModalControlStore = create<ModalControlState>()((set, get) => ({
  sort: { ...defaultModalState },
  filter: { ...defaultModalState },
  groupBy: { ...defaultModalState },
  hideFields: false,
  exportModal: false,
  importModal: false,
  importModalMode: "existing" as ImportModalMode,
  shareModal: false,

  openSort: (initialData = null, fields = []) => {
    if (get().sort.isOpen) return;
    set({ sort: { isOpen: true, initialData, fields } });
  },
  closeSort: () => set({ sort: { ...defaultModalState } }),

  openFilter: (initialData = null, fields = []) => {
    if (get().filter.isOpen) return;
    set({ filter: { isOpen: true, initialData, fields } });
  },
  closeFilter: () => set({ filter: { ...defaultModalState } }),

  openGroupBy: (initialData = null, fields = []) => {
    if (get().groupBy.isOpen) return;
    set({ groupBy: { isOpen: true, initialData, fields } });
  },
  closeGroupBy: () => set({ groupBy: { ...defaultModalState } }),

  toggleHideFields: () => set((state) => ({ hideFields: !state.hideFields })),
  openHideFields: () => set({ hideFields: true }),
  closeHideFields: () => set({ hideFields: false }),

  openExportModal: () => set({ exportModal: true }),
  closeExportModal: () => set({ exportModal: false }),
  openImportModal: (mode: ImportModalMode = "existing") => set({ importModal: true, importModalMode: mode }),
  closeImportModal: () => set({ importModal: false, importModalMode: "existing" }),
  openShareModal: () => set({ shareModal: true }),
  closeShareModal: () => set({ shareModal: false }),
}));
