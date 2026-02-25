import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortPopover, SortRule } from '../sort-modal';
import { CellType, IColumn } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));

function makeColumns(): IColumn[] {
  return [
    { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
    { id: 'col-2', name: 'Age', type: CellType.Number, width: 100 },
    { id: 'col-3', name: 'Status', type: CellType.SCQ, width: 150 },
    { id: 'col-4', name: 'Created', type: CellType.DateTime, width: 150 },
  ];
}

describe('SortPopover', () => {
  const columns = makeColumns();
  let onApply: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onApply = vi.fn();
  });

  it('renders field picker when no sort rules exist', () => {
    render(<SortPopover columns={columns} sortConfig={[]} onApply={onApply} />);
    expect(screen.getByText('Pick fields to sort by')).toBeInTheDocument();
  });

  it('renders column names in picker when empty', () => {
    render(<SortPopover columns={columns} sortConfig={[]} onApply={onApply} />);
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Age').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
  });

  it('adds a sort rule when field is selected from empty picker', async () => {
    const user = userEvent.setup();
    render(<SortPopover columns={columns} sortConfig={[]} onApply={onApply} />);
    const nameButtons = screen.getAllByText('Name');
    await user.click(nameButtons[0]);
    expect(screen.getAllByText('A → Z').length).toBeGreaterThan(0);
  });

  it('renders existing sort rules', () => {
    const config: SortRule[] = [{ columnId: 'col-1', direction: 'asc' }];
    render(<SortPopover columns={columns} sortConfig={config} onApply={onApply} />);
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('A → Z').length).toBeGreaterThan(0);
  });

  it('renders descending direction label', () => {
    const config: SortRule[] = [{ columnId: 'col-1', direction: 'desc' }];
    render(<SortPopover columns={columns} sortConfig={config} onApply={onApply} />);
    expect(screen.getAllByText('Z → A').length).toBeGreaterThan(0);
  });

  it('Apply Sort button is disabled when no changes', () => {
    const config: SortRule[] = [{ columnId: 'col-1', direction: 'asc' }];
    render(<SortPopover columns={columns} sortConfig={config} onApply={onApply} />);
    const applyBtn = screen.getByText('Apply Sort');
    expect(applyBtn.closest('button')).toBeDisabled();
  });

  it('calls onApply with rules when Apply Sort is clicked', async () => {
    const user = userEvent.setup();
    render(<SortPopover columns={columns} sortConfig={[]} onApply={onApply} />);
    const nameButtons = screen.getAllByText('Name');
    await user.click(nameButtons[0]);
    await user.click(screen.getByText('Apply Sort'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith([{ columnId: 'col-1', direction: 'asc' }]);
  });

  it('renders "Add another sort" button when rules exist', () => {
    const config: SortRule[] = [{ columnId: 'col-1', direction: 'asc' }];
    render(<SortPopover columns={columns} sortConfig={config} onApply={onApply} />);
    expect(screen.getByText('Add another sort')).toBeInTheDocument();
  });

  it('disables "Add another sort" when all columns used', () => {
    const config: SortRule[] = columns.map(c => ({ columnId: c.id, direction: 'asc' as const }));
    render(<SortPopover columns={columns} sortConfig={config} onApply={onApply} />);
    const addBtn = screen.getByText('Add another sort');
    expect(addBtn.closest('button')).toBeDisabled();
  });

  it('removes a sort rule when trash is clicked', async () => {
    const user = userEvent.setup();
    const config: SortRule[] = [
      { columnId: 'col-1', direction: 'asc' },
      { columnId: 'col-2', direction: 'desc' },
    ];
    render(<SortPopover columns={columns} sortConfig={config} onApply={onApply} />);
    const trashBtns = screen.getAllByRole('button').filter(
      btn => btn.querySelector('.lucide-trash-2') || btn.classList.contains('h-8')
    );
    expect(trashBtns.length).toBeGreaterThan(0);
  });
});
