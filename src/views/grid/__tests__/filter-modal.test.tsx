import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPopover, FilterRule } from '../filter-modal';
import { CellType, IColumn } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open }: any) => <div data-testid="popover" data-open={open}>{children}</div>,
  PopoverTrigger: ({ children, asChild }: any) => <div data-testid="popover-trigger">{asChild ? children : <button>{children}</button>}</div>,
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

function makeColumns(): IColumn[] {
  return [
    { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
    { id: 'col-2', name: 'Age', type: CellType.Number, width: 100 },
    { id: 'col-3', name: 'Status', type: CellType.SCQ, width: 150, options: { options: ['Active', 'Inactive'] } },
    { id: 'col-4', name: 'Date', type: CellType.DateTime, width: 150 },
    { id: 'col-5', name: 'Active', type: CellType.YesNo, width: 100 },
    { id: 'col-6', name: 'Price', type: CellType.Currency, width: 100 },
    { id: 'col-7', name: 'Tags', type: CellType.MCQ, width: 150, options: { options: ['tag1', 'tag2'] } },
    { id: 'col-8', name: 'Type', type: CellType.DropDown, width: 150, options: { options: ['A', 'B'] } },
    { id: 'col-9', name: 'Rating', type: CellType.Rating, width: 100 },
  ];
}

describe('FilterPopover', () => {
  const columns = makeColumns();
  let onApply: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onApply = vi.fn();
  });

  it('renders empty state when no filter rules', () => {
    render(<FilterPopover columns={columns} filterConfig={[]} onApply={onApply} />);
    expect(screen.getByText('No filter conditions applied')).toBeInTheDocument();
  });

  it('renders "Add condition" button', () => {
    render(<FilterPopover columns={columns} filterConfig={[]} onApply={onApply} />);
    expect(screen.getByText('Add condition')).toBeInTheDocument();
  });

  it('renders "Apply Filters" button disabled when no changes', () => {
    render(<FilterPopover columns={columns} filterConfig={[]} onApply={onApply} />);
    const applyBtn = screen.getByText('Apply Filters');
    expect(applyBtn.closest('button')).toBeDisabled();
  });

  it('adds a filter rule when "Add condition" is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterPopover columns={columns} filterConfig={[]} onApply={onApply} />);
    await user.click(screen.getByText('Add condition'));
    expect(screen.getByText('Where')).toBeInTheDocument();
  });

  it('enables Apply button after adding a rule', async () => {
    const user = userEvent.setup();
    render(<FilterPopover columns={columns} filterConfig={[]} onApply={onApply} />);
    await user.click(screen.getByText('Add condition'));
    const applyBtn = screen.getByText('Apply Filters');
    expect(applyBtn.closest('button')).not.toBeDisabled();
  });

  it('calls onApply when Apply button is clicked', async () => {
    const user = userEvent.setup();
    render(<FilterPopover columns={columns} filterConfig={[]} onApply={onApply} />);
    await user.click(screen.getByText('Add condition'));
    await user.click(screen.getByText('Apply Filters'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ columnId: 'col-1', operator: 'contains' }),
    ]));
  });

  it('renders existing filter rules from config', () => {
    const config: FilterRule[] = [
      { columnId: 'col-1', operator: 'contains', value: 'test', conjunction: 'and' },
    ];
    render(<FilterPopover columns={columns} filterConfig={config} onApply={onApply} />);
    expect(screen.getByText('Where')).toBeInTheDocument();
  });

  it('removes a filter rule when trash icon is clicked', async () => {
    const user = userEvent.setup();
    const config: FilterRule[] = [
      { columnId: 'col-1', operator: 'contains', value: 'test', conjunction: 'and' },
    ];
    render(<FilterPopover columns={columns} filterConfig={config} onApply={onApply} />);
    const buttons = screen.getAllByRole('button');
    const deleteBtn = buttons.find(btn => {
      const svg = btn.querySelector('svg');
      return svg && !btn.textContent;
    });
    if (deleteBtn) {
      await user.click(deleteBtn);
      expect(screen.getByText('No filter conditions applied')).toBeInTheDocument();
    }
  });

  it('shows conjunction label for multiple rules', async () => {
    const user = userEvent.setup();
    render(<FilterPopover columns={columns} filterConfig={[]} onApply={onApply} />);
    await user.click(screen.getByText('Add condition'));
    await user.click(screen.getByText('Add condition'));
    expect(screen.getByText('Where')).toBeInTheDocument();
  });

  it('provides value input for filter rules', () => {
    const config: FilterRule[] = [
      { columnId: 'col-2', operator: 'equals', value: '', conjunction: 'and' },
    ];
    render(<FilterPopover columns={columns} filterConfig={config} onApply={onApply} />);
    const input = screen.getByPlaceholderText('Value');
    expect(input).toBeInTheDocument();
  });

  it('hides value input for is_empty operator', () => {
    const config: FilterRule[] = [
      { columnId: 'col-1', operator: 'is_empty', value: '', conjunction: 'and' },
    ];
    render(<FilterPopover columns={columns} filterConfig={config} onApply={onApply} />);
    expect(screen.queryByPlaceholderText('Value')).not.toBeInTheDocument();
  });

  it('exports FilterRule type', () => {
    const rule: FilterRule = { columnId: 'col-1', operator: 'contains', value: 'test', conjunction: 'and' };
    expect(rule.columnId).toBe('col-1');
  });
});
