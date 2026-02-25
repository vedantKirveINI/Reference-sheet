import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FooterStatsBar } from '../footer-stats-bar';
import { CellType } from '@/types';
import { useUIStore } from '@/stores/ui-store';
import { useStatisticsStore } from '@/stores/statistics-store';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

function makeData(overrides: Record<string, any> = {}) {
  return {
    columns: overrides.columns ?? [
      { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
      { id: 'col-2', name: 'Amount', type: CellType.Number, width: 100 },
    ],
    records: overrides.records ?? [
      {
        id: 'rec-1',
        cells: {
          'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice' },
          'col-2': { type: CellType.Number, data: 100, displayData: '100' },
        },
      },
      {
        id: 'rec-2',
        cells: {
          'col-1': { type: CellType.String, data: 'Bob', displayData: 'Bob' },
          'col-2': { type: CellType.Number, data: 200, displayData: '200' },
        },
      },
    ],
  };
}

describe('FooterStatsBar', () => {
  beforeEach(() => {
    useUIStore.setState({ activeCell: null });
    useStatisticsStore.setState({ columnStatisticConfig: {} });
  });

  it('renders record count', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={10}
        visibleRecordCount={8}
        sortCount={0}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.getByText('8 records')).toBeInTheDocument();
  });

  it('renders singular record text', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={1}
        visibleRecordCount={1}
        sortCount={0}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.getByText('1 record')).toBeInTheDocument();
  });

  it('shows "Select a cell to see summary" when no active cell', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={2}
        visibleRecordCount={2}
        sortCount={0}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.getByText('Select a cell to see summary')).toBeInTheDocument();
  });

  it('shows filter badge when filters active', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={10}
        visibleRecordCount={8}
        sortCount={0}
        filterCount={2}
        groupCount={0}
      />
    );
    expect(screen.getByText('2 filtered')).toBeInTheDocument();
  });

  it('shows sort badge when sorts active', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={10}
        visibleRecordCount={10}
        sortCount={3}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.getByText('3 sorts')).toBeInTheDocument();
  });

  it('shows singular sort text', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={10}
        visibleRecordCount={10}
        sortCount={1}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.getByText('1 sort')).toBeInTheDocument();
  });

  it('shows group badge when groups active', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={10}
        visibleRecordCount={10}
        sortCount={0}
        filterCount={0}
        groupCount={2}
      />
    );
    expect(screen.getByText('2 groups')).toBeInTheDocument();
  });

  it('does not show badges when all counts are zero', () => {
    const { container } = render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={10}
        visibleRecordCount={10}
        sortCount={0}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.queryByText(/filtered/)).not.toBeInTheDocument();
    expect(screen.queryByText(/sort/)).not.toBeInTheDocument();
    expect(screen.queryByText(/group/)).not.toBeInTheDocument();
  });

  it('renders AI prompt button', () => {
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={2}
        visibleRecordCount={2}
        sortCount={0}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.getByText('Ask AI anything about your data...')).toBeInTheDocument();
  });

  it('shows column name when cell is active', () => {
    useUIStore.setState({ activeCell: { rowIndex: 0, columnIndex: 1 } });
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={2}
        visibleRecordCount={2}
        sortCount={0}
        filterCount={0}
        groupCount={0}
      />
    );
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('shows statistic selector when column is selected', () => {
    useUIStore.setState({ activeCell: { rowIndex: 0, columnIndex: 1 } });
    render(
      <FooterStatsBar
        data={makeData() as any}
        totalRecordCount={2}
        visibleRecordCount={2}
        sortCount={0}
        filterCount={0}
        groupCount={0}
      />
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
