import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from '../calendar-view';
import { CellType } from '@/types';
import dayjs from 'dayjs';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string, params?: any) => {
      const map: Record<string, string> = {
        'calendar.noEvents': 'No date fields',
        'calendar.day': 'Date field',
        'calendar.today': 'Today',
        'calendar.moreEvents': `+${params?.count || 0} more`,
      };
      return map[k] ?? k;
    },
  }),
}));

function makeData(overrides: Record<string, any> = {}) {
  const today = dayjs().format('YYYY-MM-DD');
  return {
    columns: overrides.columns ?? [
      { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
      { id: 'col-2', name: 'Due Date', type: CellType.DateTime, width: 150 },
    ],
    records: overrides.records ?? [
      {
        id: 'rec-1',
        cells: {
          'col-1': { type: CellType.String, data: 'Task 1', displayData: 'Task 1', options: {} },
          'col-2': { type: CellType.DateTime, data: today, displayData: today, options: {} },
        },
      },
    ],
  };
}

describe('CalendarView', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('shows no-date-fields message when no date columns', () => {
    const data = makeData({
      columns: [{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 }],
    });
    render(
      <CalendarView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('No date fields')).toBeInTheDocument();
  });

  it('renders date field selector', () => {
    render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  it('renders Today button', () => {
    render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('renders current month and year', () => {
    render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    const monthYear = dayjs().format('MMMM YYYY');
    expect(screen.getByText(monthYear)).toBeInTheDocument();
  });

  it('renders calendar grid with 42 cells', () => {
    const { container } = render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    const dayCells = container.querySelectorAll('.min-h-\\[100px\\]');
    expect(dayCells.length).toBe(42);
  });

  it('navigates to previous month', () => {
    const { container } = render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    const buttons = container.querySelectorAll('button');
    const prevBtn = Array.from(buttons).find(b => {
      const text = b.textContent ?? '';
      return text === '' && b.querySelector('svg');
    });
    if (prevBtn) fireEvent.click(prevBtn);
    const prevMonth = dayjs().subtract(1, 'month').format('MMMM YYYY');
    expect(screen.getByText(prevMonth)).toBeInTheDocument();
  });

  it('renders events on correct dates', () => {
    render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('calls onExpandRecord when event is clicked', () => {
    const onExpand = vi.fn();
    render(
      <CalendarView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} onExpandRecord={onExpand} />
    );
    fireEvent.click(screen.getByText('Task 1'));
    expect(onExpand).toHaveBeenCalledWith('rec-1');
  });

  it('renders with CreatedTime column', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
        { id: 'col-2', name: 'Created', type: CellType.CreatedTime, width: 150 },
      ],
    });
    const { container } = render(
      <CalendarView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('shows overflow count for many events', () => {
    const today = dayjs().format('YYYY-MM-DD');
    const records = Array.from({ length: 5 }, (_, i) => ({
      id: `rec-${i}`,
      cells: {
        'col-1': { type: CellType.String, data: `Task ${i}`, displayData: `Task ${i}`, options: {} },
        'col-2': { type: CellType.DateTime, data: today, displayData: today, options: {} },
      },
    }));
    render(
      <CalendarView data={makeData({ records }) as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });
});
