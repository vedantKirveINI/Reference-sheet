import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConditionalColorPopover } from '../conditional-color-popover';
import { CellType, IColumn } from '@/types';

const mockRules: any[] = [];
const mockAddRule = vi.fn();
const mockUpdateRule = vi.fn();
const mockRemoveRule = vi.fn();
const mockAddCondition = vi.fn();
const mockUpdateCondition = vi.fn();
const mockRemoveCondition = vi.fn();

vi.mock('@/stores/conditional-color-store', () => ({
  useConditionalColorStore: (selector: any) => {
    const store = {
      rules: mockRules,
      addRule: mockAddRule,
      updateRule: mockUpdateRule,
      removeRule: mockRemoveRule,
      addCondition: mockAddCondition,
      updateCondition: mockUpdateCondition,
      removeCondition: mockRemoveCondition,
    };
    return selector(store);
  },
}));

function makeColumns(): IColumn[] {
  return [
    { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
    { id: 'col-2', name: 'Amount', type: CellType.Number, width: 100 },
    { id: 'col-3', name: 'Rating', type: CellType.Rating, width: 100 },
  ];
}

describe('ConditionalColorPopover', () => {
  const columns = makeColumns();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRules.length = 0;
  });

  it('renders trigger children', () => {
    render(
      <ConditionalColorPopover columns={columns}>
        <button>Open Colors</button>
      </ConditionalColorPopover>
    );
    expect(screen.getByText('Open Colors')).toBeInTheDocument();
  });

  it('shows popover content when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ConditionalColorPopover columns={columns}>
        <button>Open Colors</button>
      </ConditionalColorPopover>
    );
    await user.click(screen.getByText('Open Colors'));
    expect(screen.getByText('Color rows based on conditions')).toBeInTheDocument();
  });

  it('shows empty state when no rules', async () => {
    const user = userEvent.setup();
    render(
      <ConditionalColorPopover columns={columns}>
        <button>Open</button>
      </ConditionalColorPopover>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('No color rules configured')).toBeInTheDocument();
  });

  it('shows "Add rule" button', async () => {
    const user = userEvent.setup();
    render(
      <ConditionalColorPopover columns={columns}>
        <button>Open</button>
      </ConditionalColorPopover>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Add rule')).toBeInTheDocument();
  });

  it('calls addRule when "Add rule" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ConditionalColorPopover columns={columns}>
        <button>Open</button>
      </ConditionalColorPopover>
    );
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByText('Add rule'));
    expect(mockAddRule).toHaveBeenCalledTimes(1);
    expect(mockAddRule).toHaveBeenCalledWith(expect.objectContaining({
      conditions: expect.arrayContaining([
        expect.objectContaining({ fieldId: 'col-1', operator: 'equals' }),
      ]),
      conjunction: 'and',
      isActive: true,
    }));
  });

  it('disables "Add rule" when no columns', async () => {
    const user = userEvent.setup();
    render(
      <ConditionalColorPopover columns={[]}>
        <button>Open</button>
      </ConditionalColorPopover>
    );
    await user.click(screen.getByText('Open'));
    const addBtn = screen.getByText('Add rule').closest('button');
    expect(addBtn).toBeDisabled();
  });

  it('renders rules with color swatches when rules exist', async () => {
    const user = userEvent.setup();
    mockRules.push({
      id: 'rule-1',
      conditions: [{ id: 'cond-1', fieldId: 'col-1', operator: 'equals', value: 'test' }],
      conjunction: 'and',
      color: 'rgba(239, 68, 68, 0.15)',
      isActive: true,
    });
    render(
      <ConditionalColorPopover columns={columns}>
        <button>Open</button>
      </ConditionalColorPopover>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByText('Where')).toBeInTheDocument();
  });
});
