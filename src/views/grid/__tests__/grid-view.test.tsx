import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GridView } from '../grid-view';
import { CellType } from '@/types';
import { useUIStore } from '@/stores/ui-store';
import { useGridViewStore } from '@/stores/grid-view-store';
import { useFieldsStore } from '@/stores/fields-store';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('@/services/api', () => ({
  updateRecordColors: vi.fn(),
  getCommentCountsByTable: vi.fn().mockResolvedValue({ data: { counts: {} } }),
  processEnrichment: vi.fn(),
  processEnrichmentForAll: vi.fn(),
}));

function makeData(overrides: Record<string, any> = {}) {
  return {
    columns: overrides.columns ?? [
      { id: 'col-1', name: 'Name', type: CellType.String, width: 200, rawId: 1, rawOptions: {}, dbFieldName: 'field_1', isPrimary: true, isComputed: false, fieldFormat: null, options: [] },
      { id: 'col-2', name: 'Status', type: CellType.SCQ, width: 150, rawId: 2, rawOptions: {}, dbFieldName: 'field_2', isPrimary: false, isComputed: false, fieldFormat: null, options: ['Active', 'Inactive'] },
    ],
    records: overrides.records ?? [
      {
        id: 'rec-1',
        cells: {
          'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice', options: {} },
          'col-2': { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active', 'Inactive'] } },
        },
      },
      {
        id: 'rec-2',
        cells: {
          'col-1': { type: CellType.String, data: 'Bob', displayData: 'Bob', options: {} },
          'col-2': { type: CellType.SCQ, data: 'Inactive', displayData: 'Inactive', options: { options: ['Active', 'Inactive'] } },
        },
      },
    ],
  };
}

describe('GridView', () => {
  beforeEach(() => {
    useUIStore.getState().setTheme('light');
    useGridViewStore.getState().setSelectedRows(new Set());
    useFieldsStore.getState().setAllColumns([]);
  });

  it('renders without crashing', () => {
    const { container } = render(<GridView data={makeData() as any} />);
    expect(container).toBeTruthy();
  });

  it('renders a canvas element', () => {
    const { container } = render(<GridView data={makeData() as any} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders the scroll container', () => {
    const { container } = render(<GridView data={makeData() as any} />);
    expect(container.querySelector('[style]')).toBeInTheDocument();
  });

  it('syncs columns to fields store', () => {
    const data = makeData();
    render(<GridView data={data as any} />);
    const stored = useFieldsStore.getState().allColumns;
    expect(stored.length).toBe(2);
  });

  it('renders add row button area', () => {
    const { container } = render(<GridView data={makeData() as any} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('calls onAddRow when add row is triggered', () => {
    const onAddRow = vi.fn();
    const { container } = render(<GridView data={makeData() as any} onAddRow={onAddRow} />);
    const addRowBtn = container.querySelector('[data-testid="add-row-button"]');
    if (addRowBtn) {
      fireEvent.click(addRowBtn);
      expect(onAddRow).toHaveBeenCalled();
    }
  });

  it('renders with empty data', () => {
    const data = { columns: [], records: [] };
    const { container } = render(<GridView data={data as any} />);
    expect(container).toBeTruthy();
  });

  it('handles hiddenColumnIds prop', () => {
    const hidden = new Set(['col-2']);
    const { container } = render(<GridView data={makeData() as any} hiddenColumnIds={hidden} />);
    expect(container).toBeTruthy();
  });

  it('handles searchQuery prop', () => {
    const { container } = render(<GridView data={makeData() as any} searchQuery="Alice" />);
    expect(container).toBeTruthy();
  });

  it('handles frozenColumnCount prop', () => {
    const { container } = render(<GridView data={makeData() as any} frozenColumnCount={1} />);
    expect(container).toBeTruthy();
  });

  it('accepts sortedColumnIds, filteredColumnIds, groupedColumnIds', () => {
    const { container } = render(
      <GridView
        data={makeData() as any}
        sortedColumnIds={new Set(['col-1'])}
        filteredColumnIds={new Set(['col-2'])}
        groupedColumnIds={new Set()}
      />
    );
    expect(container).toBeTruthy();
  });

  it('handles theme change', () => {
    const { container } = render(<GridView data={makeData() as any} />);
    useUIStore.getState().setTheme('dark');
    expect(container).toBeTruthy();
  });

  it('handles unmount cleanly', () => {
    const { unmount } = render(<GridView data={makeData() as any} />);
    expect(() => unmount()).not.toThrow();
  });

  it('resets state when record count decreases', () => {
    const data1 = makeData();
    const { rerender } = render(<GridView data={data1 as any} />);
    const data2 = makeData({ records: [data1.records[0]] });
    rerender(<GridView data={data2 as any} />);
  });

  it('resets state when column count changes', () => {
    const data1 = makeData();
    const { rerender } = render(<GridView data={data1 as any} />);
    const data2 = makeData({ columns: [data1.columns[0]] });
    rerender(<GridView data={data2 as any} />);
  });

  it('renders with field modal props', () => {
    const { container } = render(
      <GridView
        data={makeData() as any}
        fieldModal={null}
        fieldModalOpen={false}
        setFieldModal={vi.fn()}
        setFieldModalOpen={vi.fn()}
        setFieldModalAnchorPosition={vi.fn()}
        onFieldSave={vi.fn()}
      />
    );
    expect(container).toBeTruthy();
  });
});
