import type { IColumn } from '@/types/grid';

export type ColumnInsertPosition = 'append' | 'left' | 'right';

function getColumnOrderAtIndex(
  columns: IColumn[],
  index: number
): number | undefined {
  if (index < 0 || index >= columns.length) return undefined;
  const order = columns[index]?.order;
  if (typeof order === 'number') return order;
  return index + 1;
}

function getFallbackOrder(index: number): number {
  return index >= 0 ? index + 1 : 0;
}

function calculateOrderBetween(
  leftOrder: number | undefined,
  rightOrder: number | undefined,
  leftIndex: number,
  rightIndex: number
): number {
  if (leftOrder === undefined && rightOrder === undefined) {
    const leftFallback = getFallbackOrder(leftIndex);
    const rightFallback =
      rightIndex >= 0 ? getFallbackOrder(rightIndex) : leftFallback + 1;
    return (leftFallback + rightFallback) / 2;
  }
  if (leftOrder === undefined) {
    return (rightOrder ?? getFallbackOrder(rightIndex)) / 2;
  }
  if (rightOrder === undefined) {
    return leftOrder + 1;
  }
  return (leftOrder + rightOrder) / 2;
}

/**
 * Compute the order value for a new field so it appears at the given position.
 * Mirrors legacy calculateFieldOrder from orderUtils.
 */
export function calculateFieldOrder({
  columns,
  targetIndex,
  position,
}: {
  columns: IColumn[];
  targetIndex?: number;
  position: ColumnInsertPosition;
}): number {
  if (!columns.length) return 1;

  if (position === 'append') {
    const lastColumn = columns[columns.length - 1];
    const lastOrder =
      typeof lastColumn?.order === 'number' ? lastColumn.order : columns.length;
    return lastOrder + 1;
  }

  const safeIndex =
    typeof targetIndex === 'number'
      ? Math.min(Math.max(targetIndex, 0), columns.length - 1)
      : 0;

  if (position === 'left') {
    const leftIndex = safeIndex - 1;
    const rightIndex = safeIndex;
    const leftOrder = getColumnOrderAtIndex(columns, leftIndex);
    const rightOrder = getColumnOrderAtIndex(columns, rightIndex);
    return calculateOrderBetween(
      leftOrder,
      rightOrder,
      leftIndex,
      rightIndex
    );
  }

  const leftIndex = safeIndex;
  const rightIndex = safeIndex + 1;
  const leftOrder = getColumnOrderAtIndex(columns, leftIndex);
  const rightOrder = getColumnOrderAtIndex(columns, rightIndex);
  return calculateOrderBetween(leftOrder, rightOrder, leftIndex, rightIndex);
}
