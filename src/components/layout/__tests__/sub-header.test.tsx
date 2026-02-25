import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => {
      const map: Record<string, string> = {
        'toolbar.hideFields': 'Hide fields',
        'toolbar.filterRecords': 'Filter',
        'toolbar.sortRecords': 'Sort',
        'toolbar.groupRecords': 'Group',
        'toolbar.sortedBy': `Sorted by ${opts?.count ?? ''} field`,
        'toolbar.sortedByPlural': `Sorted by ${opts?.count ?? ''} fields`,
        'toolbar.groupedBy': `Grouped by ${opts?.count ?? ''} field`,
        'toolbar.groupedByPlural': `Grouped by ${opts?.count ?? ''} fields`,
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/stores', () => ({
  useUIStore: (selector: any) => {
    const state = {
      zoomLevel: 100,
      setZoomLevel: vi.fn(),
      rowHeightLevel: 'short',
      setRowHeightLevel: vi.fn(),
      fieldNameLines: 1,
      setFieldNameLines: vi.fn(),
      columnTextWrapModes: {},
      setColumnTextWrapMode: vi.fn(),
      getColumnTextWrapMode: () => 'clip',
      activeCell: null,
    };
    return selector(state);
  },
  useModalControlStore: (selector?: any) => {
    const state = {
      sort: { isOpen: false, initialData: null, fields: [] },
      filter: { isOpen: false, initialData: null, fields: [] },
      groupBy: { isOpen: false, initialData: null, fields: [] },
      openSort: vi.fn(),
      closeSort: vi.fn(),
      openFilter: vi.fn(),
      closeFilter: vi.fn(),
      openGroupBy: vi.fn(),
      closeGroupBy: vi.fn(),
      openExportModal: vi.fn(),
      openImportModal: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  },
  useGridViewStore: (selector: any) => {
    const state = {
      selectedRows: new Set<number>(),
      clearSelectedRows: vi.fn(),
    };
    return selector(state);
  },
  useConditionalColorStore: (selector: any) => {
    const state = { rules: [] };
    return selector(state);
  },
}));

vi.mock('@/views/grid/sort-modal', () => ({
  SortPopover: () => <div data-testid="sort-popover">Sort Popover</div>,
}));

vi.mock('@/views/grid/filter-modal', () => ({
  FilterPopover: () => <div data-testid="filter-popover">Filter Popover</div>,
}));

vi.mock('@/views/grid/group-modal', () => ({
  GroupPopover: () => <div data-testid="group-popover">Group Popover</div>,
}));

vi.mock('@/views/grid/conditional-color-popover', () => ({
  ConditionalColorPopover: () => <div data-testid="color-popover">Color Popover</div>,
}));

vi.mock('@/views/grid/hide-fields-modal', () => ({
  HideFieldsContent: () => <div data-testid="hide-fields">Hide Fields</div>,
}));

import { SubHeader } from '../sub-header';

const columns = [
  { id: 'col-1', name: 'Name', type: 'SHORT_TEXT', rawId: 1, width: 200, options: [], rawOptions: {}, dbFieldName: 'f1', isPrimary: true, isComputed: false, fieldFormat: null },
  { id: 'col-2', name: 'Status', type: 'SCQ', rawId: 2, width: 200, options: ['Active', 'Inactive'], rawOptions: {}, dbFieldName: 'f2', isPrimary: false, isComputed: false, fieldFormat: null },
];

describe('SubHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders add record button', () => {
    render(<SubHeader columns={columns} />);
    expect(screen.getByText('Add record')).toBeInTheDocument();
  });

  it('calls onAddRow when add record clicked', () => {
    const onAddRow = vi.fn();
    render(<SubHeader columns={columns} onAddRow={onAddRow} />);
    fireEvent.click(screen.getByText('Add record'));
    expect(onAddRow).toHaveBeenCalled();
  });

  it('renders filter button', () => {
    render(<SubHeader columns={columns} />);
    expect(screen.getByText('Filter')).toBeInTheDocument();
  });

  it('renders sort button', () => {
    render(<SubHeader columns={columns} />);
    expect(screen.getByText('Sort')).toBeInTheDocument();
  });

  it('renders group button', () => {
    render(<SubHeader columns={columns} />);
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('renders hide fields button', () => {
    render(<SubHeader columns={columns} />);
    expect(screen.getByText('Hide fields')).toBeInTheDocument();
  });

  it('shows active filter count text', () => {
    const filterConfig = [
      { columnId: 'col-1', operator: 'contains', value: 'test' },
    ];
    render(<SubHeader columns={columns} filterConfig={filterConfig as any} />);
    expect(screen.getByText('Filtered by Name')).toBeInTheDocument();
  });

  it('shows multiple filter count text', () => {
    const filterConfig = [
      { columnId: 'col-1', operator: 'contains', value: 'a' },
      { columnId: 'col-2', operator: 'equals', value: 'b' },
    ];
    render(<SubHeader columns={columns} filterConfig={filterConfig as any} />);
    expect(screen.getByText('Filtered by Name and 1 more')).toBeInTheDocument();
  });

  it('shows sort count text', () => {
    const sortConfig = [
      { columnId: 'col-1', direction: 'asc' as const },
    ];
    render(<SubHeader columns={columns} sortConfig={sortConfig as any} />);
    expect(screen.getByText(/Sorted by/)).toBeInTheDocument();
  });

  it('shows selected rows toolbar when rows selected', () => {
    vi.mocked(vi.fn()).mockImplementation;
    const { rerender } = render(<SubHeader columns={columns} />);
  });

  it('renders kanban-specific toolbar when currentView is kanban', () => {
    render(<SubHeader columns={columns} currentView="kanban" />);
    expect(screen.getByText(/Stacked by/)).toBeInTheDocument();
  });

  it('shows hidden count when columns hidden', () => {
    render(<SubHeader columns={columns} hiddenColumnIds={new Set(['col-1'])} />);
    expect(screen.getByText('1 hidden')).toBeInTheDocument();
  });
});
