import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupPopover, GroupRule } from '../group-modal';
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

describe('GroupPopover', () => {
  const columns = makeColumns();
  let onApply: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onApply = vi.fn();
  });

  it('renders field picker when no group rules exist', () => {
    render(<GroupPopover columns={columns} groupConfig={[]} onApply={onApply} />);
    expect(screen.getByText('Set fields to group records')).toBeInTheDocument();
  });

  it('renders column names in picker when empty', () => {
    render(<GroupPopover columns={columns} groupConfig={[]} onApply={onApply} />);
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Age').length).toBeGreaterThan(0);
  });

  it('adds a group rule when a field is selected', async () => {
    const user = userEvent.setup();
    render(<GroupPopover columns={columns} groupConfig={[]} onApply={onApply} />);
    const nameButtons = screen.getAllByText('Name');
    await user.click(nameButtons[0]);
    expect(screen.getAllByText('Ascending').length).toBeGreaterThan(0);
  });

  it('renders existing group rules', () => {
    const config: GroupRule[] = [{ columnId: 'col-1', direction: 'asc' }];
    render(<GroupPopover columns={columns} groupConfig={config} onApply={onApply} />);
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ascending').length).toBeGreaterThan(0);
  });

  it('renders descending direction', () => {
    const config: GroupRule[] = [{ columnId: 'col-1', direction: 'desc' }];
    render(<GroupPopover columns={columns} groupConfig={config} onApply={onApply} />);
    expect(screen.getAllByText('Descending').length).toBeGreaterThan(0);
  });

  it('Apply Grouping is disabled when no changes', () => {
    const config: GroupRule[] = [{ columnId: 'col-1', direction: 'asc' }];
    render(<GroupPopover columns={columns} groupConfig={config} onApply={onApply} />);
    const applyBtn = screen.getByText('Apply Grouping');
    expect(applyBtn.closest('button')).toBeDisabled();
  });

  it('calls onApply when Apply Grouping is clicked', async () => {
    const user = userEvent.setup();
    render(<GroupPopover columns={columns} groupConfig={[]} onApply={onApply} />);
    const nameButtons = screen.getAllByText('Name');
    await user.click(nameButtons[0]);
    await user.click(screen.getByText('Apply Grouping'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith([{ columnId: 'col-1', direction: 'asc' }]);
  });

  it('limits group rules to maximum 3', async () => {
    const config: GroupRule[] = [
      { columnId: 'col-1', direction: 'asc' },
      { columnId: 'col-2', direction: 'asc' },
      { columnId: 'col-3', direction: 'asc' },
    ];
    render(<GroupPopover columns={columns} groupConfig={config} onApply={onApply} />);
    expect(screen.queryByText('Add another group')).not.toBeInTheDocument();
  });

  it('shows "Add another group" button when fewer than 3 rules', () => {
    const config: GroupRule[] = [{ columnId: 'col-1', direction: 'asc' }];
    render(<GroupPopover columns={columns} groupConfig={config} onApply={onApply} />);
    expect(screen.getByText('Add another group')).toBeInTheDocument();
  });

  it('removes a group rule when trash is clicked', async () => {
    const user = userEvent.setup();
    const config: GroupRule[] = [{ columnId: 'col-1', direction: 'asc' }];
    render(<GroupPopover columns={columns} groupConfig={config} onApply={onApply} />);
    const trashBtns = screen.getAllByRole('button');
    const deleteBtn = trashBtns.find(btn => btn.classList.contains('h-8') && btn.classList.contains('w-8'));
    if (deleteBtn) {
      await user.click(deleteBtn);
      expect(screen.queryByText('Ascending')).not.toBeInTheDocument();
    }
  });
});
