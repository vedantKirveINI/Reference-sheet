import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than' | 'greater_or_equal' | 'less_or_equal';

export interface Condition {
  id: string;
  fieldId: string;
  operator: ConditionOperator;
  value: string;
}

export interface ColorRule {
  id: string;
  conditions: Condition[];
  conjunction: 'and' | 'or';
  color: string;
  isActive: boolean;
}

interface ConditionalColorStore {
  rules: ColorRule[];
  addRule: (rule: ColorRule) => void;
  updateRule: (id: string, updates: Partial<ColorRule>) => void;
  removeRule: (id: string) => void;
  reorderRules: (fromIndex: number, toIndex: number) => void;
  addCondition: (ruleId: string, condition: Condition) => void;
  updateCondition: (ruleId: string, conditionId: string, updates: Partial<Condition>) => void;
  removeCondition: (ruleId: string, conditionId: string) => void;
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
      reorderRules: (fromIndex, toIndex) => set((s) => {
        const newRules = [...s.rules];
        const [moved] = newRules.splice(fromIndex, 1);
        newRules.splice(toIndex, 0, moved);
        return { rules: newRules };
      }),
      addCondition: (ruleId, condition) => set((s) => ({
        rules: s.rules.map((r) =>
          r.id === ruleId ? { ...r, conditions: [...r.conditions, condition] } : r
        ),
      })),
      updateCondition: (ruleId, conditionId, updates) => set((s) => ({
        rules: s.rules.map((r) =>
          r.id === ruleId
            ? {
                ...r,
                conditions: r.conditions.map((c) =>
                  c.id === conditionId ? { ...c, ...updates } : c
                ),
              }
            : r
        ),
      })),
      removeCondition: (ruleId, conditionId) => set((s) => ({
        rules: s.rules.map((r) =>
          r.id === ruleId
            ? { ...r, conditions: r.conditions.filter((c) => c.id !== conditionId) }
            : r
        ),
      })),
    }),
    {
      name: 'tinytable-conditional-colors',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0 && persistedState?.rules) {
          persistedState.rules = persistedState.rules.map((r: any) => {
            if (r.conditions) return r;
            return {
              id: r.id,
              conditions: [{
                id: r.id + '_c0',
                fieldId: r.fieldId || '',
                operator: r.operator || 'equals',
                value: r.value || '',
              }],
              conjunction: 'and' as const,
              color: r.color || 'rgba(239, 68, 68, 0.15)',
              isActive: r.isActive ?? true,
            };
          });
        }
        return persistedState as ConditionalColorStore;
      },
    }
  )
);
