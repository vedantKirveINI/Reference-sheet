import { describe, it, expect, beforeEach } from 'vitest';
import { useConditionalColorStore, ColorRule, Condition } from '../conditional-color-store';

function makeCondition(overrides: Partial<Condition> = {}): Condition {
  return {
    id: 'cond-1',
    fieldId: 'f1',
    operator: 'equals',
    value: 'test',
    ...overrides,
  };
}

function makeRule(overrides: Partial<ColorRule> = {}): ColorRule {
  return {
    id: 'rule-1',
    conditions: [makeCondition()],
    conjunction: 'and',
    color: '#FF0000',
    isActive: true,
    ...overrides,
  };
}

function resetStore() {
  useConditionalColorStore.setState({ rules: [] });
}

describe('useConditionalColorStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('has empty rules', () => {
      expect(useConditionalColorStore.getState().rules).toEqual([]);
    });
  });

  describe('addRule', () => {
    it('adds a rule', () => {
      const rule = makeRule();
      useConditionalColorStore.getState().addRule(rule);
      expect(useConditionalColorStore.getState().rules).toHaveLength(1);
      expect(useConditionalColorStore.getState().rules[0]).toEqual(rule);
    });

    it('adds multiple rules', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1' }));
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r2' }));
      expect(useConditionalColorStore.getState().rules).toHaveLength(2);
    });
  });

  describe('updateRule', () => {
    it('updates a rule by id', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1', color: '#FF0000' }));
      useConditionalColorStore.getState().updateRule('r1', { color: '#00FF00' });
      expect(useConditionalColorStore.getState().rules[0].color).toBe('#00FF00');
    });

    it('does not affect other rules', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1', color: '#FF0000' }));
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r2', color: '#0000FF' }));
      useConditionalColorStore.getState().updateRule('r1', { color: '#00FF00' });
      expect(useConditionalColorStore.getState().rules[1].color).toBe('#0000FF');
    });

    it('can toggle isActive', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1', isActive: true }));
      useConditionalColorStore.getState().updateRule('r1', { isActive: false });
      expect(useConditionalColorStore.getState().rules[0].isActive).toBe(false);
    });
  });

  describe('removeRule', () => {
    it('removes a rule by id', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1' }));
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r2' }));
      useConditionalColorStore.getState().removeRule('r1');
      expect(useConditionalColorStore.getState().rules).toHaveLength(1);
      expect(useConditionalColorStore.getState().rules[0].id).toBe('r2');
    });

    it('does nothing for non-existent id', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1' }));
      useConditionalColorStore.getState().removeRule('r-nonexistent');
      expect(useConditionalColorStore.getState().rules).toHaveLength(1);
    });
  });

  describe('reorderRules', () => {
    it('moves rule from one position to another', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1' }));
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r2' }));
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r3' }));
      useConditionalColorStore.getState().reorderRules(0, 2);
      const ids = useConditionalColorStore.getState().rules.map((r) => r.id);
      expect(ids).toEqual(['r2', 'r3', 'r1']);
    });

    it('move to same position is no-op', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1' }));
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r2' }));
      useConditionalColorStore.getState().reorderRules(0, 0);
      expect(useConditionalColorStore.getState().rules[0].id).toBe('r1');
    });
  });

  describe('addCondition', () => {
    it('adds a condition to a rule', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1' }));
      const newCond = makeCondition({ id: 'cond-2', fieldId: 'f2' });
      useConditionalColorStore.getState().addCondition('r1', newCond);
      expect(useConditionalColorStore.getState().rules[0].conditions).toHaveLength(2);
    });
  });

  describe('updateCondition', () => {
    it('updates a condition within a rule', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1', conditions: [makeCondition({ id: 'c1', value: 'old' })] }));
      useConditionalColorStore.getState().updateCondition('r1', 'c1', { value: 'new' });
      expect(useConditionalColorStore.getState().rules[0].conditions[0].value).toBe('new');
    });

    it('does not affect conditions in other rules', () => {
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r1', conditions: [makeCondition({ id: 'c1' })] }));
      useConditionalColorStore.getState().addRule(makeRule({ id: 'r2', conditions: [makeCondition({ id: 'c2', value: 'keep' })] }));
      useConditionalColorStore.getState().updateCondition('r1', 'c1', { value: 'changed' });
      expect(useConditionalColorStore.getState().rules[1].conditions[0].value).toBe('keep');
    });
  });

  describe('removeCondition', () => {
    it('removes a condition from a rule', () => {
      useConditionalColorStore.getState().addRule(makeRule({
        id: 'r1',
        conditions: [makeCondition({ id: 'c1' }), makeCondition({ id: 'c2' })],
      }));
      useConditionalColorStore.getState().removeCondition('r1', 'c1');
      expect(useConditionalColorStore.getState().rules[0].conditions).toHaveLength(1);
      expect(useConditionalColorStore.getState().rules[0].conditions[0].id).toBe('c2');
    });
  });
});
