import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ContextMenu,
  ContextMenuItem,
  getHeaderMenuItems,
  getRecordMenuItems,
  getColorMenuItems,
} from '../context-menu';
import { TextWrapMode } from '@/types';

describe('ContextMenu component', () => {
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
  });

  it('renders menu items', () => {
    const items: ContextMenuItem[] = [
      { label: 'Item 1', onClick: vi.fn() },
      { label: 'Item 2', onClick: vi.fn() },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('calls onClick and onClose when item is clicked', () => {
    const onClick = vi.fn();
    const items: ContextMenuItem[] = [
      { label: 'Action', onClick },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    fireEvent.click(screen.getByText('Action'));
    expect(onClick).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClick when item is disabled', () => {
    const onClick = vi.fn();
    const items: ContextMenuItem[] = [
      { label: 'Disabled', onClick, disabled: true },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    fireEvent.click(screen.getByText('Disabled'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders separator items', () => {
    const items: ContextMenuItem[] = [
      { label: 'Before', onClick: vi.fn() },
      { label: '', onClick: vi.fn(), separator: true },
      { label: 'After', onClick: vi.fn() },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('renders destructive items with destructive styling', () => {
    const items: ContextMenuItem[] = [
      { label: 'Delete', onClick: vi.fn(), destructive: true },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    const btn = screen.getByText('Delete').closest('button');
    expect(btn?.className).toContain('destructive');
  });

  it('renders check mark for checked items', () => {
    const items: ContextMenuItem[] = [
      { label: 'Checked', onClick: vi.fn(), checked: true },
      { label: 'Unchecked', onClick: vi.fn(), checked: false },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    expect(screen.getByText('Checked')).toBeInTheDocument();
    expect(screen.getByText('Unchecked')).toBeInTheDocument();
  });

  it('renders color picker items', () => {
    const onColorSelect = vi.fn();
    const items: ContextMenuItem[] = [
      { label: 'Color', onClick: vi.fn(), colorPicker: true, onColorSelect, currentColor: null },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByTitle('Red')).toBeInTheDocument();
    expect(screen.getByTitle('Blue')).toBeInTheDocument();
  });

  it('calls onColorSelect when color swatch is clicked', () => {
    const onColorSelect = vi.fn();
    const items: ContextMenuItem[] = [
      { label: 'Color', onClick: vi.fn(), colorPicker: true, onColorSelect, currentColor: null },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    fireEvent.click(screen.getByTitle('Red'));
    expect(onColorSelect).toHaveBeenCalledWith('#FEE2E2');
    expect(onClose).toHaveBeenCalled();
  });

  it('renders clear color button', () => {
    const onColorSelect = vi.fn();
    const items: ContextMenuItem[] = [
      { label: 'Color', onClick: vi.fn(), colorPicker: true, onColorSelect, currentColor: '#FEE2E2' },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    expect(screen.getByTitle('Clear color')).toBeInTheDocument();
  });

  it('calls onColorSelect with null when clear is clicked', () => {
    const onColorSelect = vi.fn();
    const items: ContextMenuItem[] = [
      { label: 'Color', onClick: vi.fn(), colorPicker: true, onColorSelect, currentColor: '#FEE2E2' },
    ];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    fireEvent.click(screen.getByTitle('Clear color'));
    expect(onColorSelect).toHaveBeenCalledWith(null);
  });

  it('closes on Escape key', () => {
    const items: ContextMenuItem[] = [{ label: 'Item', onClick: vi.fn() }];
    render(<ContextMenu position={{ x: 100, y: 100 }} items={items} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('getHeaderMenuItems', () => {
  it('returns all header menu items', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
    });
    expect(items.length).toBeGreaterThan(10);
  });

  it('includes edit, duplicate, insert before/after items', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
    });
    const labels = items.map(i => i.label);
    expect(labels).toContain('Edit field');
    expect(labels).toContain('Duplicate field');
    expect(labels).toContain('Insert field before');
    expect(labels).toContain('Insert field after');
  });

  it('includes sort, filter, group items', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
    });
    const labels = items.map(i => i.label);
    expect(labels).toContain('Sort A → Z');
    expect(labels).toContain('Sort Z → A');
    expect(labels).toContain('Filter by this field');
    expect(labels).toContain('Group by this field');
  });

  it('includes hide field and delete field', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
    });
    const labels = items.map(i => i.label);
    expect(labels).toContain('Hide field');
    expect(labels).toContain('Delete field');
  });

  it('includes text wrap options', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
    });
    const labels = items.map(i => i.label);
    expect(labels).toContain('Clip text');
    expect(labels).toContain('Wrap text');
    expect(labels).toContain('Overflow text');
  });

  it('marks current text wrap mode as checked', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
      currentTextWrapMode: TextWrapMode.Wrap,
    });
    const wrapItem = items.find(i => i.label === 'Wrap text');
    expect(wrapItem?.checked).toBe(true);
    const clipItem = items.find(i => i.label === 'Clip text');
    expect(clipItem?.checked).toBe(false);
  });

  it('includes enrich all for enrichment columns', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
      isEnrichmentColumn: true,
    });
    const labels = items.map(i => i.label);
    expect(labels).toContain('Enrich all records');
  });

  it('excludes enrich all for non-enrichment columns', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
      isEnrichmentColumn: false,
    });
    const labels = items.map(i => i.label);
    expect(labels).not.toContain('Enrich all records');
  });

  it('shows freeze/unfreeze based on isFrozen', () => {
    const frozenItems = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
      isFrozen: true,
    });
    expect(frozenItems.find(i => i.label === 'Unfreeze column')).toBeDefined();

    const unfrozenItems = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
      isFrozen: false,
    });
    expect(unfrozenItems.find(i => i.label === 'Freeze up to this column')).toBeDefined();
  });

  it('calls handler functions', () => {
    const onEditField = vi.fn();
    const onSortAsc = vi.fn();
    const onDeleteColumn = vi.fn();
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
      onEditField,
      onSortAsc,
      onDeleteColumn,
    });
    items.find(i => i.label === 'Edit field')?.onClick();
    expect(onEditField).toHaveBeenCalled();
    items.find(i => i.label === 'Sort A → Z')?.onClick();
    expect(onSortAsc).toHaveBeenCalled();
    items.find(i => i.label === 'Delete field')?.onClick();
    expect(onDeleteColumn).toHaveBeenCalled();
  });

  it('includes column color picker', () => {
    const items = getHeaderMenuItems({
      column: { name: 'Test' },
      columnIndex: 0,
    });
    const colorItem = items.find(i => i.label === 'Column color');
    expect(colorItem?.colorPicker).toBe(true);
  });
});

describe('getRecordMenuItems', () => {
  it('returns record menu items', () => {
    const items = getRecordMenuItems({
      rowIndex: 0,
      isMultipleSelected: false,
    });
    expect(items.length).toBeGreaterThan(0);
  });

  it('includes insert above/below', () => {
    const items = getRecordMenuItems({
      rowIndex: 0,
      isMultipleSelected: false,
    });
    const labels = items.map(i => i.label);
    expect(labels).toContain('Insert row above');
    expect(labels).toContain('Insert row below');
  });

  it('includes expand record and duplicate row', () => {
    const items = getRecordMenuItems({
      rowIndex: 0,
      isMultipleSelected: false,
    });
    const labels = items.map(i => i.label);
    expect(labels).toContain('Expand record');
    expect(labels).toContain('Duplicate row');
  });

  it('disables expand/duplicate when multiple selected', () => {
    const items = getRecordMenuItems({
      rowIndex: 0,
      isMultipleSelected: true,
    });
    const expandItem = items.find(i => i.label === 'Expand record');
    expect(expandItem?.disabled).toBe(true);
    const dupeItem = items.find(i => i.label === 'Duplicate row');
    expect(dupeItem?.disabled).toBe(true);
  });

  it('shows "Delete rows" when multiple selected', () => {
    const items = getRecordMenuItems({
      rowIndex: 0,
      isMultipleSelected: true,
    });
    const deleteItem = items.find(i => i.destructive);
    expect(deleteItem?.label).toBe('Delete rows');
  });

  it('shows "Delete row" when single selected', () => {
    const items = getRecordMenuItems({
      rowIndex: 0,
      isMultipleSelected: false,
    });
    const deleteItem = items.find(i => i.destructive);
    expect(deleteItem?.label).toBe('Delete row');
  });

  it('calls handler functions', () => {
    const onInsertAbove = vi.fn();
    const onInsertBelow = vi.fn();
    const onDeleteRows = vi.fn();
    const items = getRecordMenuItems({
      rowIndex: 0,
      isMultipleSelected: false,
      onInsertAbove,
      onInsertBelow,
      onDeleteRows,
    });
    items.find(i => i.label === 'Insert row above')?.onClick();
    expect(onInsertAbove).toHaveBeenCalled();
    items.find(i => i.label === 'Insert row below')?.onClick();
    expect(onInsertBelow).toHaveBeenCalled();
    items.find(i => i.destructive)?.onClick();
    expect(onDeleteRows).toHaveBeenCalled();
  });
});

describe('getColorMenuItems', () => {
  it('returns row color item', () => {
    const onSetRowColor = vi.fn();
    const items = getColorMenuItems({
      rowIndex: 0,
      onSetRowColor,
    });
    const rowColor = items.find(i => i.label === 'Set row color');
    expect(rowColor).toBeDefined();
    expect(rowColor?.colorPicker).toBe(true);
  });

  it('includes cell color when colId and handler provided', () => {
    const onSetRowColor = vi.fn();
    const onSetCellColor = vi.fn();
    const items = getColorMenuItems({
      rowIndex: 0,
      colId: 'col-1',
      onSetRowColor,
      onSetCellColor,
    });
    const cellColor = items.find(i => i.label === 'Set cell color');
    expect(cellColor).toBeDefined();
  });

  it('excludes cell color when no colId', () => {
    const onSetRowColor = vi.fn();
    const items = getColorMenuItems({
      rowIndex: 0,
      onSetRowColor,
    });
    const cellColor = items.find(i => i.label === 'Set cell color');
    expect(cellColor).toBeUndefined();
  });
});
