import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormView } from '../form-view';
import { CellType } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'common:records.recordDetails': 'Record',
        'common:add': 'Add',
        'common:noResults': 'No records',
        'common:previous': 'Previous',
        'common:next': 'Next',
        'common:records.newRecord': 'New Record',
        'common:records.of': 'of',
        'common:search': 'Search',
      };
      return map[k] ?? k;
    },
  }),
}));

function makeData(overrides: Record<string, any> = {}) {
  return {
    columns: overrides.columns ?? [
      { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
      { id: 'col-2', name: 'Amount', type: CellType.Number, width: 100 },
      { id: 'col-3', name: 'Status', type: CellType.SCQ, width: 150 },
    ],
    records: overrides.records ?? [
      {
        id: 'rec-1',
        cells: {
          'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice', options: {} },
          'col-2': { type: CellType.Number, data: 100, displayData: '100', options: {} },
          'col-3': { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active', 'Inactive'] } },
        },
      },
      {
        id: 'rec-2',
        cells: {
          'col-1': { type: CellType.String, data: 'Bob', displayData: 'Bob', options: {} },
          'col-2': { type: CellType.Number, data: 200, displayData: '200', options: {} },
          'col-3': { type: CellType.SCQ, data: 'Inactive', displayData: 'Inactive', options: { options: ['Active', 'Inactive'] } },
        },
      },
    ],
  };
}

describe('FormView', () => {
  it('renders without crashing', () => {
    const { container } = render(<FormView data={makeData() as any} />);
    expect(container).toBeTruthy();
  });

  it('renders record list sidebar', () => {
    render(<FormView data={makeData() as any} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders record details header', () => {
    render(<FormView data={makeData() as any} />);
    expect(screen.getByText(/Record 1 of 2/)).toBeInTheDocument();
  });

  it('renders field labels', () => {
    render(<FormView data={makeData() as any} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders text input for String field', () => {
    render(<FormView data={makeData() as any} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders number input for Number field', () => {
    render(<FormView data={makeData() as any} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders select for SCQ field', () => {
    render(<FormView data={makeData() as any} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to next record', () => {
    render(<FormView data={makeData() as any} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText(/Record 2 of 2/)).toBeInTheDocument();
  });

  it('navigates to previous record', () => {
    render(<FormView data={makeData() as any} />);
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText(/Record 1 of 2/)).toBeInTheDocument();
  });

  it('disables Previous button on first record', () => {
    render(<FormView data={makeData() as any} />);
    const prevBtn = screen.getByText('Previous').closest('button');
    expect(prevBtn).toBeDisabled();
  });

  it('disables Next button on last record', () => {
    render(<FormView data={makeData() as any} />);
    fireEvent.click(screen.getByText('Next'));
    const nextBtn = screen.getByText('Next').closest('button');
    expect(nextBtn).toBeDisabled();
  });

  it('calls onCellChange when field value changes', () => {
    const onCellChange = vi.fn();
    render(<FormView data={makeData() as any} onCellChange={onCellChange} />);
    const textInputs = screen.getAllByRole('textbox');
    fireEvent.change(textInputs[0], { target: { value: 'Charlie' } });
    expect(onCellChange).toHaveBeenCalledWith('rec-1', 'col-1', 'Charlie');
  });

  it('calls onAddRow when New Record button is clicked', () => {
    const onAddRow = vi.fn();
    render(<FormView data={makeData() as any} onAddRow={onAddRow} />);
    fireEvent.click(screen.getByText('New Record'));
    expect(onAddRow).toHaveBeenCalled();
  });

  it('selects record from sidebar', () => {
    render(<FormView data={makeData() as any} />);
    fireEvent.click(screen.getByText('Bob'));
    expect(screen.getByText(/Record 2 of 2/)).toBeInTheDocument();
  });

  it('renders empty state when no records', () => {
    const data = makeData({ records: [] });
    render(<FormView data={data as any} />);
    expect(screen.getAllByText('No records').length).toBeGreaterThanOrEqual(1);
  });

  it('filters out group records', () => {
    const data = makeData({
      records: [
        ...makeData().records,
        { id: '__group__1', cells: {} },
      ],
    });
    render(<FormView data={data as any} />);
    expect(screen.getByText(/Record 1 of 2/)).toBeInTheDocument();
  });

  it('renders YesNo field as switch', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Active', type: CellType.YesNo, width: 100 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.YesNo, data: 'Yes', displayData: 'Yes', options: {} },
          },
        },
      ],
    });
    render(<FormView data={data as any} />);
    expect(screen.getAllByText('Yes').length).toBeGreaterThanOrEqual(1);
  });

  it('renders Rating field with stars', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Rating', type: CellType.Rating, width: 100 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.Rating, data: 3, displayData: '3', options: { maxRating: 5 } },
          },
        },
      ],
    });
    const { container } = render(<FormView data={data as any} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBeGreaterThanOrEqual(5);
  });

  it('renders Slider field with range input', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Progress', type: CellType.Slider, width: 100 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.Slider, data: 50, displayData: '50%', options: {} },
          },
        },
      ],
    });
    render(<FormView data={data as any} />);
    const range = screen.getByRole('slider');
    expect(range).toBeInTheDocument();
    expect(range).toHaveValue('50');
  });

  it('renders DateTime field with datetime-local input', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Date', type: CellType.DateTime, width: 100 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.DateTime, data: '2025-01-15T10:30:00', displayData: 'Jan 15', options: {} },
          },
        },
      ],
    });
    const { container } = render(<FormView data={data as any} />);
    expect(container.querySelector('input[type="datetime-local"]')).toBeInTheDocument();
  });

  it('renders MCQ field with checkboxes', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Tags', type: CellType.MCQ, width: 100 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.MCQ, data: ['Red'], displayData: 'Red', options: { options: ['Red', 'Blue'] } },
          },
        },
      ],
    });
    render(<FormView data={data as any} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
  });
});
