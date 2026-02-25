import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanStack } from '../kanban-stack';
import { CellType } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'kanban.addCard': 'Add card',
      };
      return map[k] ?? k;
    },
  }),
}));

vi.mock('@hello-pangea/dnd', () => ({
  Droppable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) =>
    <div data-testid="droppable">{children({ innerRef: vi.fn(), droppableProps: {}, placeholder: null }, { isDraggingOver: false })}</div>,
  Draggable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) =>
    <div>{children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false })}</div>,
}));

const mockColumns = [
  { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
  { id: 'col-2', name: 'Status', type: CellType.SCQ, width: 150 },
];

const mockRecords = [
  {
    id: 'rec-1',
    cells: {
      'col-1': { type: CellType.String, data: 'Task 1', displayData: 'Task 1', options: {} },
      'col-2': { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active'] } },
    },
  },
  {
    id: 'rec-2',
    cells: {
      'col-1': { type: CellType.String, data: 'Task 2', displayData: 'Task 2', options: {} },
      'col-2': { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active'] } },
    },
  },
];

describe('KanbanStack', () => {
  it('renders stack title', () => {
    render(
      <KanbanStack
        id="active"
        title="Active"
        records={mockRecords as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#d1fae5"
        colorText="#065f46"
        onAddRecord={vi.fn()}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders record count badge', () => {
    render(
      <KanbanStack
        id="active"
        title="Active"
        records={mockRecords as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#d1fae5"
        colorText="#065f46"
        onAddRecord={vi.fn()}
      />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders add card button', () => {
    render(
      <KanbanStack
        id="active"
        title="Active"
        records={[] as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#d1fae5"
        colorText="#065f46"
        onAddRecord={vi.fn()}
      />
    );
    expect(screen.getByText('Add card')).toBeInTheDocument();
  });

  it('calls onAddRecord when add button clicked', () => {
    const onAddRecord = vi.fn();
    render(
      <KanbanStack
        id="active"
        title="Active"
        records={[] as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#d1fae5"
        colorText="#065f46"
        onAddRecord={onAddRecord}
      />
    );
    fireEvent.click(screen.getByText('Add card'));
    expect(onAddRecord).toHaveBeenCalled();
  });

  it('renders with custom colors', () => {
    const { container } = render(
      <KanbanStack
        id="active"
        title="Active"
        records={[] as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#ff0000"
        colorText="#0000ff"
        onAddRecord={vi.fn()}
      />
    );
    const header = container.querySelector('[style*="background-color"]');
    expect(header).toBeTruthy();
  });

  it('renders empty stack', () => {
    render(
      <KanbanStack
        id="empty"
        title="Empty"
        records={[] as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#d1fae5"
        colorText="#065f46"
        onAddRecord={vi.fn()}
      />
    );
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders droppable zone', () => {
    render(
      <KanbanStack
        id="active"
        title="Active"
        records={mockRecords as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#d1fae5"
        colorText="#065f46"
        onAddRecord={vi.fn()}
      />
    );
    expect(screen.getByTestId('droppable')).toBeInTheDocument();
  });

  it('renders with visible fields filter', () => {
    const visibleFields = new Set(['col-1']);
    render(
      <KanbanStack
        id="active"
        title="Active"
        records={mockRecords as any}
        columns={mockColumns as any}
        stackFieldId="col-2"
        colorBg="#d1fae5"
        colorText="#065f46"
        onAddRecord={vi.fn()}
        visibleFields={visibleFields}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
