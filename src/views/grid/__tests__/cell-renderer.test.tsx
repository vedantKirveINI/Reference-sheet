import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CellRenderer } from '../cell-renderer';
import { CellType } from '@/types';

function makeProps(overrides: Record<string, any> = {}) {
  return {
    cell: {
      type: CellType.String,
      data: 'Hello',
      displayData: 'Hello',
      options: {},
      ...overrides.cell,
    },
    column: {
      id: 'col-1',
      name: 'Name',
      type: CellType.String,
      width: 200,
      options: [],
      ...overrides.column,
    },
    isActive: false,
    isEditing: false,
    onStartEdit: vi.fn(),
    onEndEdit: vi.fn(),
    ...overrides,
  };
}

describe('CellRenderer', () => {
  describe('display mode', () => {
    it('renders String cell', () => {
      const props = makeProps({ cell: { type: CellType.String, data: 'Test', displayData: 'Test', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders Number cell right-aligned', () => {
      const props = makeProps({ cell: { type: CellType.Number, data: 42, displayData: '42', options: {} } });
      const { container } = render(<CellRenderer {...props as any} />);
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(container.querySelector('.justify-end')).toBeInTheDocument();
    });

    it('renders SCQ cell with chip', () => {
      const props = makeProps({
        cell: { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active', 'Inactive'] } },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders SCQ cell with no data', () => {
      const props = makeProps({
        cell: { type: CellType.SCQ, data: null, displayData: '', options: { options: ['Active'] } },
      });
      const { container } = render(<CellRenderer {...props as any} />);
      expect(container.querySelector('.rounded-full')).not.toBeInTheDocument();
    });

    it('renders MCQ cell with multiple chips', () => {
      const props = makeProps({
        cell: { type: CellType.MCQ, data: ['Red', 'Blue'], displayData: 'Red, Blue', options: { options: ['Red', 'Blue', 'Green'] } },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Blue')).toBeInTheDocument();
    });

    it('renders DropDown cell with chip', () => {
      const props = makeProps({
        cell: {
          type: CellType.DropDown,
          data: 'Option 1',
          displayData: 'Option 1',
          options: { options: [{ id: '1', label: 'Option 1' }, { id: '2', label: 'Option 2' }] },
        },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders YesNo cell with Check icon for Yes', () => {
      const props = makeProps({ cell: { type: CellType.YesNo, data: 'Yes', displayData: 'Yes', options: {} } });
      const { container } = render(<CellRenderer {...props as any} />);
      expect(container.querySelector('.text-green-600')).toBeInTheDocument();
    });

    it('renders YesNo cell with Square icon for No', () => {
      const props = makeProps({ cell: { type: CellType.YesNo, data: 'No', displayData: 'No', options: {} } });
      const { container } = render(<CellRenderer {...props as any} />);
      expect(container.querySelector('.text-gray-300')).toBeInTheDocument();
    });

    it('renders DateTime cell', () => {
      const props = makeProps({ cell: { type: CellType.DateTime, data: '2025-01-01', displayData: 'Jan 1, 2025', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Jan 1, 2025')).toBeInTheDocument();
    });

    it('renders CreatedTime cell with lock icon', () => {
      const props = makeProps({ cell: { type: CellType.CreatedTime, data: '2025-01-01', displayData: 'Jan 1, 2025', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Jan 1, 2025')).toBeInTheDocument();
    });

    it('renders Slider cell with progress bar', () => {
      const props = makeProps({
        cell: { type: CellType.Slider, data: 50, displayData: '50%', options: { maxValue: 100 } },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders Rating cell with stars', () => {
      const props = makeProps({
        cell: { type: CellType.Rating, data: 3, displayData: '3', options: { maxRating: 5 } },
      });
      const { container } = render(<CellRenderer {...props as any} />);
      const filledStars = container.querySelectorAll('.fill-amber-400');
      expect(filledStars.length).toBe(3);
    });

    it('renders OpinionScale cell', () => {
      const props = makeProps({
        cell: { type: CellType.OpinionScale, data: 7, displayData: '7/10', options: { maxValue: 10 } },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('renders Formula cell in italics', () => {
      const props = makeProps({ cell: { type: CellType.Formula, data: '42', displayData: '42', options: {} } });
      const { container } = render(<CellRenderer {...props as any} />);
      expect(container.querySelector('.italic')).toBeInTheDocument();
    });

    it('renders List cell with chips', () => {
      const props = makeProps({
        cell: { type: CellType.List, data: ['A', 'B'], displayData: 'A, B', options: {} },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('renders Enrichment cell with sparkle icon', () => {
      const props = makeProps({ cell: { type: CellType.Enrichment, data: 'Tech', displayData: 'Tech', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Tech')).toBeInTheDocument();
    });

    it('renders Signature cell with signed badge', () => {
      const props = makeProps({ cell: { type: CellType.Signature, data: 'sig-data', displayData: 'Signed', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Signed')).toBeInTheDocument();
    });

    it('renders Signature cell with not signed text', () => {
      const props = makeProps({ cell: { type: CellType.Signature, data: null, displayData: '', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('Not signed')).toBeInTheDocument();
    });

    it('renders FileUpload cell with file count', () => {
      const props = makeProps({
        cell: { type: CellType.FileUpload, data: [{ name: 'file.pdf' }], displayData: '1 file', options: {} },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('1 file')).toBeInTheDocument();
    });

    it('renders FileUpload cell with no files', () => {
      const props = makeProps({
        cell: { type: CellType.FileUpload, data: [], displayData: '', options: {} },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('No files')).toBeInTheDocument();
    });

    it('renders Ranking cell with numbered items', () => {
      const props = makeProps({
        cell: { type: CellType.Ranking, data: [{ id: '1', label: 'First' }, { id: '2', label: 'Second' }], displayData: '', options: {} },
      });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('1. First')).toBeInTheDocument();
      expect(screen.getByText('2. Second')).toBeInTheDocument();
    });

    it('renders Time cell', () => {
      const props = makeProps({ cell: { type: CellType.Time, data: '10:30', displayData: '10:30 AM', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('10:30 AM')).toBeInTheDocument();
    });

    it('renders default cell type', () => {
      const props = makeProps({ cell: { type: 'UNKNOWN', data: 'raw', displayData: 'raw', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByText('raw')).toBeInTheDocument();
    });

    it('renders empty default cell', () => {
      const props = makeProps({ cell: { type: 'UNKNOWN', data: null, displayData: '', options: {} } });
      const { container } = render(<CellRenderer {...props as any} />);
      expect(container.textContent).toBe('');
    });
  });

  describe('editing mode', () => {
    it('renders String editor when editing', () => {
      const props = makeProps({ isEditing: true, cell: { type: CellType.String, data: 'Hello', displayData: 'Hello', options: {} } });
      render(<CellRenderer {...props as any} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('Hello');
    });

    it('String editor calls onEndEdit on Enter', () => {
      const onEndEdit = vi.fn();
      const props = makeProps({ isEditing: true, onEndEdit, cell: { type: CellType.String, data: 'Hello', displayData: 'Hello', options: {} } });
      render(<CellRenderer {...props as any} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'World' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onEndEdit).toHaveBeenCalledWith('World');
    });

    it('String editor calls onEndEdit with original on Escape', () => {
      const onEndEdit = vi.fn();
      const props = makeProps({ isEditing: true, onEndEdit, cell: { type: CellType.String, data: 'Hello', displayData: 'Hello', options: {} } });
      render(<CellRenderer {...props as any} />);
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onEndEdit).toHaveBeenCalledWith('Hello');
    });

    it('renders Number editor when editing', () => {
      const props = makeProps({ isEditing: true, cell: { type: CellType.Number, data: 42, displayData: '42', options: {} } });
      render(<CellRenderer {...props as any} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(42);
    });

    it('renders SCQ select editor when editing', () => {
      const props = makeProps({
        isEditing: true,
        cell: { type: CellType.SCQ, data: 'A', displayData: 'A', options: { options: ['A', 'B', 'C'] } },
      });
      render(<CellRenderer {...props as any} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('renders MCQ checkbox editor when editing', () => {
      const props = makeProps({
        isEditing: true,
        cell: { type: CellType.MCQ, data: ['A'], displayData: 'A', options: { options: ['A', 'B'] } },
      });
      render(<CellRenderer {...props as any} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('YesNo editor toggles value immediately', () => {
      const onEndEdit = vi.fn();
      const props = makeProps({
        isEditing: true,
        onEndEdit,
        cell: { type: CellType.YesNo, data: 'Yes', displayData: 'Yes', options: {} },
      });
      render(<CellRenderer {...props as any} />);
      expect(onEndEdit).toHaveBeenCalledWith('No');
    });

    it('falls back to StringEditor for unknown type in editing mode', () => {
      const props = makeProps({ isEditing: true, cell: { type: 'UNKNOWN', data: 'test', displayData: 'test', options: {} } });
      render(<CellRenderer {...props as any} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
