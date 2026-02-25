import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GanttView } from '../gantt-view';
import { CellType } from '@/types';
import dayjs from 'dayjs';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'views:gantt.noTasks': 'No date fields',
        'views:gantt.startDate': 'Start Date',
        'views:gantt.endDate': 'End Date',
        'views:calendar.today': 'Today',
        'common:name': 'Name',
        'common:header.untitled': 'Untitled',
      };
      return map[k] ?? k;
    },
  }),
}));

function makeData(overrides: Record<string, any> = {}) {
  const start = dayjs().subtract(5, 'day').format('YYYY-MM-DD');
  const end = dayjs().add(5, 'day').format('YYYY-MM-DD');
  return {
    columns: overrides.columns ?? [
      { id: 'col-1', name: 'Task Name', type: CellType.String, width: 200 },
      { id: 'col-2', name: 'Start', type: CellType.DateTime, width: 150 },
      { id: 'col-3', name: 'End', type: CellType.DateTime, width: 150 },
    ],
    records: overrides.records ?? [
      {
        id: 'rec-1',
        cells: {
          'col-1': { type: CellType.String, data: 'Task 1', displayData: 'Task 1', options: {} },
          'col-2': { type: CellType.DateTime, data: start, displayData: start, options: {} },
          'col-3': { type: CellType.DateTime, data: end, displayData: end, options: {} },
        },
      },
    ],
  };
}

describe('GanttView', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('shows no-date-fields message when no date columns', () => {
    const data = makeData({
      columns: [{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 }],
    });
    render(
      <GanttView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('No date fields')).toBeInTheDocument();
  });

  it('renders start/end date selectors', () => {
    render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Start Date:')).toBeInTheDocument();
    expect(screen.getByText('End Date:')).toBeInTheDocument();
  });

  it('renders task names in left panel', () => {
    render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });

  it('renders Name header in left panel', () => {
    render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders scale selector buttons', () => {
    render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('day')).toBeInTheDocument();
    expect(screen.getByText('week')).toBeInTheDocument();
    expect(screen.getByText('month')).toBeInTheDocument();
  });

  it('renders Today button', () => {
    render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('renders today line', () => {
    const { container } = render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    const todayLine = container.querySelector('.bg-red-500');
    expect(todayLine).toBeInTheDocument();
  });

  it('switches to week scale', () => {
    render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    fireEvent.click(screen.getByText('week'));
    const weekBtn = screen.getByText('week');
    expect(weekBtn.classList.contains('bg-card') || weekBtn.className.includes('emerald')).toBe(true);
  });

  it('switches to month scale', () => {
    render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    fireEvent.click(screen.getByText('month'));
    const monthBtn = screen.getByText('month');
    expect(monthBtn).toBeInTheDocument();
  });

  it('renders timeline header cells', () => {
    const { container } = render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    const headerCells = container.querySelectorAll('.border-r.border-border');
    expect(headerCells.length).toBeGreaterThan(0);
  });

  it('renders task bar', () => {
    const { container } = render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    const bar = container.querySelector('.rounded-full.cursor-pointer');
    expect(bar).toBeInTheDocument();
  });

  it('calls onExpandRecord when task is clicked', () => {
    const onExpand = vi.fn();
    const { container } = render(
      <GanttView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} onExpandRecord={onExpand} />
    );
    const taskName = screen.getByText('Task 1');
    fireEvent.click(taskName);
    expect(onExpand).toHaveBeenCalledWith('rec-1');
  });

  it('renders point markers for single-date tasks', () => {
    const date = dayjs().format('YYYY-MM-DD');
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Task Name', type: CellType.String, width: 200 },
        { id: 'col-2', name: 'Date', type: CellType.DateTime, width: 150 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.String, data: 'Point Task', displayData: 'Point Task', options: {} },
            'col-2': { type: CellType.DateTime, data: date, displayData: date, options: {} },
          },
        },
      ],
    });
    const { container } = render(
      <GanttView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    const diamond = container.querySelector('.rotate-45');
    expect(diamond).toBeInTheDocument();
  });

  it('handles records without dates gracefully', () => {
    const data = makeData({
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.String, data: 'No Date', displayData: 'No Date', options: {} },
            'col-2': { type: CellType.DateTime, data: null, displayData: '', options: {} },
            'col-3': { type: CellType.DateTime, data: null, displayData: '', options: {} },
          },
        },
      ],
    });
    const { container } = render(
      <GanttView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });
});
