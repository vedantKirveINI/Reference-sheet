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

interface ModalControlState {
  sort: ModalState;
  filter: ModalState;
  groupBy: ModalState;

  openSort: (initialData?: any, fields?: IColumn[]) => void;
  closeSort: () => void;

  openFilter: (initialData?: any, fields?: IColumn[]) => void;
  closeFilter: () => void;

  openGroupBy: (initialData?: any, fields?: IColumn[]) => void;
  closeGroupBy: () => void;
}

export const useModalControlStore = create<ModalControlState>()((set, get) => ({
  sort: { ...defaultModalState },
  filter: { ...defaultModalState },
  groupBy: { ...defaultModalState },

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
}));
