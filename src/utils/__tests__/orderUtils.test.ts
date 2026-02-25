import { describe, it, expect } from 'vitest';
import { calculateFieldOrder, type ColumnInsertPosition } from '../orderUtils';

describe('calculateFieldOrder', () => {
  const makeColumns = (orders: number[]) =>
    orders.map((order, i) => ({ id: `col-${i}`, name: `Col ${i}`, order, type: 'String', width: 150 }));

  describe('append position', () => {
    it('returns lastOrder + 1 for non-empty columns', () => {
      const columns = makeColumns([1, 2, 3]);
      expect(calculateFieldOrder({ columns, position: 'append' })).toBe(4);
    });

    it('returns 1 for empty columns', () => {
      expect(calculateFieldOrder({ columns: [], position: 'append' })).toBe(1);
    });

    it('uses column length as fallback when no order property', () => {
      const columns = [{ id: 'a', name: 'A', type: 'String', width: 150 }] as any[];
      delete columns[0].order;
      expect(calculateFieldOrder({ columns, position: 'append' })).toBe(2);
    });
  });

  describe('left position', () => {
    it('inserts before first column', () => {
      const columns = makeColumns([2, 4, 6]);
      const order = calculateFieldOrder({ columns, targetIndex: 0, position: 'left' });
      expect(order).toBeLessThan(2);
      expect(order).toBe(1);
    });

    it('inserts between two columns', () => {
      const columns = makeColumns([2, 4, 6]);
      const order = calculateFieldOrder({ columns, targetIndex: 1, position: 'left' });
      expect(order).toBeGreaterThan(2);
      expect(order).toBeLessThan(4);
      expect(order).toBe(3);
    });

    it('clamps negative targetIndex to 0', () => {
      const columns = makeColumns([2, 4]);
      const order = calculateFieldOrder({ columns, targetIndex: -1, position: 'left' });
      expect(order).toBeLessThan(2);
    });

    it('clamps oversized targetIndex', () => {
      const columns = makeColumns([2, 4]);
      const order = calculateFieldOrder({ columns, targetIndex: 100, position: 'left' });
      expect(order).toBeGreaterThan(2);
      expect(order).toBeLessThan(4);
    });
  });

  describe('right position', () => {
    it('inserts after last column', () => {
      const columns = makeColumns([2, 4, 6]);
      const order = calculateFieldOrder({ columns, targetIndex: 2, position: 'right' });
      expect(order).toBeGreaterThan(6);
      expect(order).toBe(7);
    });

    it('inserts between two columns', () => {
      const columns = makeColumns([2, 4, 6]);
      const order = calculateFieldOrder({ columns, targetIndex: 0, position: 'right' });
      expect(order).toBeGreaterThan(2);
      expect(order).toBeLessThan(4);
      expect(order).toBe(3);
    });

    it('defaults targetIndex to 0 when undefined', () => {
      const columns = makeColumns([2, 4]);
      const order = calculateFieldOrder({ columns, position: 'right' });
      expect(order).toBeGreaterThan(2);
      expect(order).toBeLessThan(4);
    });
  });

  describe('edge cases', () => {
    it('handles single column append', () => {
      const columns = makeColumns([5]);
      expect(calculateFieldOrder({ columns, position: 'append' })).toBe(6);
    });

    it('handles single column left', () => {
      const columns = makeColumns([5]);
      const order = calculateFieldOrder({ columns, targetIndex: 0, position: 'left' });
      expect(order).toBeLessThan(5);
    });

    it('handles single column right', () => {
      const columns = makeColumns([5]);
      const order = calculateFieldOrder({ columns, targetIndex: 0, position: 'right' });
      expect(order).toBeGreaterThan(5);
    });
  });
});
