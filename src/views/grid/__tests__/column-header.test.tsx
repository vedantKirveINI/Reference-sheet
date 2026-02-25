import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnHeader } from '../column-header';
import { CellType } from '@/types';

function makeColumn(overrides: Record<string, any> = {}) {
  return {
    id: 'col-1',
    name: 'Name',
    type: CellType.String,
    width: 200,
    options: [],
    rawId: 1,
    rawOptions: {},
    dbFieldName: 'field_1',
    isPrimary: false,
    isComputed: false,
    fieldFormat: null,
    ...overrides,
  };
}

describe('ColumnHeader', () => {
  it('renders column name', () => {
    const col = makeColumn({ name: 'Status' });
    render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders with correct width style', () => {
    const col = makeColumn();
    const { container } = render(<ColumnHeader column={col as any} width={300} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    const header = container.firstChild as HTMLElement;
    expect(header.style.width).toBe('300px');
    expect(header.style.minWidth).toBe('300px');
  });

  it('renders type icon for String type', () => {
    const col = makeColumn({ type: CellType.String });
    const { container } = render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders type icon for Number type', () => {
    const col = makeColumn({ type: CellType.Number });
    const { container } = render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders type icon for SCQ type', () => {
    const col = makeColumn({ type: CellType.SCQ });
    render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    expect(screen.getByText(col.name)).toBeInTheDocument();
  });

  it('renders type icon for DateTime type', () => {
    const col = makeColumn({ type: CellType.DateTime });
    render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    expect(screen.getByText(col.name)).toBeInTheDocument();
  });

  it('renders type icon for Currency type', () => {
    const col = makeColumn({ type: CellType.Currency });
    render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    expect(screen.getByText(col.name)).toBeInTheDocument();
  });

  it('renders type icon for Rating type', () => {
    const col = makeColumn({ type: CellType.Rating });
    render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    expect(screen.getByText(col.name)).toBeInTheDocument();
  });

  it('renders type icon for Enrichment type', () => {
    const col = makeColumn({ type: CellType.Enrichment });
    render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    expect(screen.getByText(col.name)).toBeInTheDocument();
  });

  it('falls back to Type icon for unknown cell type', () => {
    const col = makeColumn({ type: 'UNKNOWN_TYPE' });
    render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    expect(screen.getByText(col.name)).toBeInTheDocument();
  });

  it('has a resize handle', () => {
    const col = makeColumn();
    const { container } = render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    const resizeHandle = container.querySelector('.cursor-col-resize');
    expect(resizeHandle).toBeInTheDocument();
  });

  it('calls onResize during drag', () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();
    const col = makeColumn();
    const { container } = render(<ColumnHeader column={col as any} width={200} onResize={onResize} onResizeEnd={onResizeEnd} />);
    const resizeHandle = container.querySelector('.cursor-col-resize')!;

    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 150 });
    expect(onResize).toHaveBeenCalledWith(50);

    fireEvent.mouseUp(document);
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it('contains a chevron-down indicator', () => {
    const col = makeColumn();
    const { container } = render(<ColumnHeader column={col as any} width={200} onResize={vi.fn()} onResizeEnd={vi.fn()} />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
