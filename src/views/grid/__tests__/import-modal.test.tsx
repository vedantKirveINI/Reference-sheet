import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportModal } from '../import-modal';
import { CellType, ITableData, IColumn, IRecord } from '@/types';

const mockCloseImportModal = vi.fn();

vi.mock('@/stores', () => ({
  useModalControlStore: () => ({
    importModal: true,
    importModalMode: 'existing',
    closeImportModal: mockCloseImportModal,
  }),
}));

vi.mock('@/services/api', () => ({
  importToExistingTable: vi.fn().mockResolvedValue({ data: { success: true } }),
  importToNewTable: vi.fn().mockResolvedValue({ data: { success: true } }),
  uploadCSVForImport: vi.fn().mockResolvedValue('https://example.com/file.csv'),
}));

vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((text: string) => ({
      data: text.split('\n').map(row => row.split(',')),
      errors: [],
    })),
  },
}));

vi.mock('xlsx', () => ({
  read: vi.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} },
  })),
  utils: {
    sheet_to_json: vi.fn(() => [
      ['Name', 'Age'],
      ['Alice', '30'],
    ]),
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
  ];
  const records: IRecord[] = [
    { id: 'rec-1', cells: { 'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice' }, 'col-2': { type: CellType.Number, data: 30, displayData: '30' } } },
  ];
  return { columns, records, rowHeaders: [] };
}

describe('ImportModal', () => {
  const onImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders import modal dialog', () => {
    render(<ImportModal data={makeTableData()} onImport={onImport} />);
    expect(screen.getByText(/Import to/)).toBeInTheDocument();
  });

  it('renders upload area for file selection', () => {
    render(<ImportModal data={makeTableData()} onImport={onImport} />);
    expect(screen.getAllByText(/drag.*drop|click.*upload|CSV|XLSX/i).length).toBeGreaterThan(0);
  });

  it('renders step indicator', () => {
    render(<ImportModal data={makeTableData()} onImport={onImport} />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('shows download template button', () => {
    render(<ImportModal data={makeTableData()} onImport={onImport} />);
    expect(screen.getByText(/Download template/i)).toBeInTheDocument();
  });

  it('has file input accepting csv and xlsx', () => {
    render(<ImportModal data={makeTableData()} onImport={onImport} />);
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.getAttribute('accept')).toContain('.csv');
  });

  it('renders toggle for first row as header', () => {
    render(<ImportModal data={makeTableData()} onImport={onImport} />);
    expect(screen.getByText(/first row.*header/i)).toBeInTheDocument();
  });
});
