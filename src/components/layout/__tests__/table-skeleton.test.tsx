import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TableSkeleton } from '../table-skeleton';

describe('TableSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with animate-pulse class', () => {
    const { container } = render(<TableSkeleton />);
    expect((container.firstChild as HTMLElement).className).toContain('animate-pulse');
  });

  it('renders correct number of header columns (7)', () => {
    const { container } = render(<TableSkeleton />);
    const headerRow = container.querySelector('.flex.border-b.border-border.bg-muted');
    const headerCells = headerRow?.querySelectorAll('.flex-1');
    expect(headerCells?.length).toBe(7);
  });

  it('renders correct number of data rows (12)', () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll('.flex.border-b.border-border\\/50');
    expect(rows.length).toBe(12);
  });

  it('each row has 7 data cells', () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll('.flex.border-b.border-border\\/50');
    const firstRow = rows[0];
    const cells = firstRow?.querySelectorAll('.flex-1');
    expect(cells?.length).toBe(7);
  });

  it('has row number placeholder in each row', () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll('.flex.border-b.border-border\\/50');
    rows.forEach((row) => {
      const rowHeader = row.querySelector('.w-16');
      expect(rowHeader).toBeTruthy();
    });
  });
});
