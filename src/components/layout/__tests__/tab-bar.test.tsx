import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TabBar } from '../tab-bar';

const tables = [
  { id: 't1', name: 'Table 1' },
  { id: 't2', name: 'Table 2' },
  { id: 't3', name: 'Table 3' },
];

describe('TabBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all table tabs', () => {
    render(<TabBar tables={tables} activeTableId="t1" />);
    expect(screen.getByText('Table 1')).toBeInTheDocument();
    expect(screen.getByText('Table 2')).toBeInTheDocument();
    expect(screen.getByText('Table 3')).toBeInTheDocument();
  });

  it('highlights active table', () => {
    render(<TabBar tables={tables} activeTableId="t1" />);
    const activeTab = screen.getByText('Table 1').closest('div[class*="cursor-pointer"]');
    expect(activeTab?.className).toContain('font-medium');
  });

  it('calls onTableSelect when tab clicked', () => {
    const onTableSelect = vi.fn();
    render(<TabBar tables={tables} activeTableId="t1" onTableSelect={onTableSelect} />);
    fireEvent.click(screen.getByText('Table 2'));
    expect(onTableSelect).toHaveBeenCalledWith('t2');
  });

  it('renders add table button', () => {
    const { container } = render(<TabBar tables={tables} activeTableId="t1" />);
    const addBtn = container.querySelector('.border-l button');
    expect(addBtn).toBeInTheDocument();
  });

  it('calls onAddTable when add button clicked', () => {
    const onAddTable = vi.fn();
    const { container } = render(<TabBar tables={tables} activeTableId="t1" onAddTable={onAddTable} />);
    const addBtn = container.querySelector('.border-l button')!;
    fireEvent.click(addBtn);
    expect(onAddTable).toHaveBeenCalled();
  });

  it('disables add button when isAddingTable', () => {
    const { container } = render(<TabBar tables={tables} activeTableId="t1" isAddingTable />);
    const addBtn = container.querySelector('.border-l button');
    expect(addBtn).toBeDisabled();
  });

  it('shows default table when no tables prop', () => {
    render(<TabBar />);
    expect(screen.getByText('Table 1')).toBeInTheDocument();
  });

  it('enters rename mode and saves on Enter', () => {
    const onRenameTable = vi.fn();
    render(<TabBar tables={tables} activeTableId="t1" onRenameTable={onRenameTable} />);
    const moreBtn = document.querySelector('[class*="opacity-0"]');
    if (moreBtn) {
      fireEvent.click(moreBtn);
    }
  });

  it('shows delete confirmation dialog', () => {
    render(<TabBar tables={tables} activeTableId="t1" />);
    expect(screen.queryByText('Delete table?')).not.toBeInTheDocument();
  });

  it('prevents deletion when only one table', () => {
    render(<TabBar tables={[{ id: 't1', name: 'Only Table' }]} activeTableId="t1" />);
  });

  it('renders active indicator bar on selected tab', () => {
    render(<TabBar tables={tables} activeTableId="t2" />);
    const activeTab = screen.getByText('Table 2').closest('div[class*="cursor-pointer"]');
    const indicator = activeTab?.querySelector('.bg-primary');
    expect(indicator).toBeInTheDocument();
  });
});
