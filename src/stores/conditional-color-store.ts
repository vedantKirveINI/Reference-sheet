import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ColorRule {
  id: string;
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than';
  value: string;
  color: string;
  isActive: boolean;
}

interface ConditionalColorStore {
  rules: ColorRule[];
  addRule: (rule: ColorRule) => void;
  updateRule: (id: string, updates: Partial<ColorRule>) => void;
  removeRule: (id: string) => void;
  setRules: (rules: ColorRule[]) => void;
}

export const useConditionalColorStore = create<ConditionalColorStore>()(
  persist(
    (set) => ({
      rules: [],
      addRule: (rule) => set((s) => ({ rules: [...s.rules, rule] })),
      updateRule: (id, updates) => set((s) => ({
        rules: s.rules.map((r) => r.id === id ? { ...r, ...updates } : r),
      })),
      removeRule: (id) => set((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      setRules: (rules) => set({ rules }),
    }),
    {
      name: 'tinytable-conditional-colors',
    }
  )
);
