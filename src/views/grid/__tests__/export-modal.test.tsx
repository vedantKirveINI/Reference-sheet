import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportModal } from '../export-modal';
import { CellType, ITableData, IColumn, IRecord } from '@/types';

vi.mock('@/stores', () => ({
  useModalControlStore: () => ({
    exportModal: true,
    closeExportModal: vi.fn(),
  }),
}));

vi.mock('@/services/api', () => ({
  exportData: vi.fn().mockResolvedValue({ data: 'col1,col2\nval1,val2' }),
}));

vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn(() => new ArrayBuffer(8)),
}));

function makeTableData(): ITableData {
  const columns: IColumn[] = [
    { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
    { id: 'col-2', name: 'Age', type: CellType.Number, width: 100 },
    { id: 'col-3', name: 'Active', type: CellType.YesNo, width: 100 },
  ];
  const records: IRecord[] = [
    { id: 'rec-1', cells: { 'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice' }, 'col-2': { type: CellType.Number, data: 30, displayData: '30' }, 'col-3': { type: CellType.YesNo, data: true, displayData: 'Yes' } } },
    { id: 'rec-2', cells: { 'col-1': { type: CellType.String, data: 'Bob', displayData: 'Bob' }, 'col-2': { type: CellType.Number, data: 25, displayData: '25' }, 'col-3': { type: CellType.YesNo, data: false, displayData: 'No' } } },
  ];
  return { columns, records, rowHeaders: [] };
}

describe('ExportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders export modal with title', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });

  it('renders format selection (CSV, Excel, JSON, PDF)', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('CSV is selected by default', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
  });

  it('renders column list with checkboxes', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(3);
    expect(screen.getByText('Columns')).toBeInTheDocument();
  });

  it('shows row count', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getAllByText(/2 row/).length).toBeGreaterThan(0);
  });

  it('shows "Select all" and "Deselect all" links', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('Select all')).toBeInTheDocument();
    expect(screen.getByText('Deselect all')).toBeInTheDocument();
  });

  it('renders preview section', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders options section with include headers toggle', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('Include headers')).toBeInTheDocument();
  });

  it('shows CSV encoding option only when CSV format selected', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('UTF-8')).toBeInTheDocument();
    expect(screen.getByText('UTF-8 BOM')).toBeInTheDocument();
  });

  it('switches format when clicking format buttons', async () => {
    const user = userEvent.setup();
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    await user.click(screen.getByText('JSON'));
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    expect(screen.queryByText('UTF-8')).not.toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('shows hidden columns toggle when hidden columns exist', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set(['col-2'])} />);
    expect(screen.getByText(/Include.*hidden column/)).toBeInTheDocument();
  });

  it('does not show hidden columns toggle when none hidden', () => {
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    expect(screen.queryByText(/Include.*hidden column/)).not.toBeInTheDocument();
  });

  it('disables export button when no columns selected', async () => {
    const user = userEvent.setup();
    render(<ExportModal data={makeTableData()} hiddenColumnIds={new Set()} />);
    await user.click(screen.getByText('Deselect all'));
    const exportBtn = screen.getByText(/Export as/).closest('button');
    expect(exportBtn).toBeDisabled();
  });
});
