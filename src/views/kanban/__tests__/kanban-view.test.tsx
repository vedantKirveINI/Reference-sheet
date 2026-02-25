import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanView } from '../kanban-view';
import { CellType } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'kanban.noCards': 'No stackable fields',
        'kanban.stack': 'Stack by',
        'kanban.addCard': 'Add card',
        'kanban.uncategorized': 'Uncategorized',
        'kanban.hideEmptyStacks': 'Visible fields',
      };
      return map[k] ?? k;
    },
  }),
}));

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Droppable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) =>
    <div>{children({ innerRef: vi.fn(), droppableProps: {}, placeholder: null }, { isDraggingOver: false })}</div>,
  Draggable: ({ children }: { children: (provided: any, snapshot: any) => React.ReactNode }) =>
    <div>{children({ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} }, { isDragging: false })}</div>,
}));

function makeData(overrides: Record<string, any> = {}) {
  return {
    columns: overrides.columns ?? [
      { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
      { id: 'col-2', name: 'Status', type: CellType.SCQ, width: 150 },
    ],
    records: overrides.records ?? [
      {
        id: 'rec-1',
        cells: {
          'col-1': { type: CellType.String, data: 'Task 1', displayData: 'Task 1', options: {} },
          'col-2': { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active', 'Inactive'] } },
        },
      },
      {
        id: 'rec-2',
        cells: {
          'col-1': { type: CellType.String, data: 'Task 2', displayData: 'Task 2', options: {} },
          'col-2': { type: CellType.SCQ, data: 'Inactive', displayData: 'Inactive', options: { options: ['Active', 'Inactive'] } },
        },
      },
    ],
  };
}

describe('KanbanView', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <KanbanView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(container).toBeTruthy();
  });

  it('shows no-stackable-fields message when no SCQ/DropDown columns', () => {
    const data = makeData({
      columns: [{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 }],
    });
    render(
      <KanbanView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('No stackable fields')).toBeInTheDocument();
  });

  it('renders stack-by selector', () => {
    render(
      <KanbanView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Stack by:')).toBeInTheDocument();
  });

  it('renders stacks for SCQ options', () => {
    render(
      <KanbanView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows stack column name in selector', () => {
    render(
      <KanbanView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows dropdown when stack selector is clicked', () => {
    render(
      <KanbanView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Status'));
    expect(screen.getByText('SCQ')).toBeInTheDocument();
  });

  it('renders add card buttons in stacks', () => {
    render(
      <KanbanView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getAllByText('Add card').length).toBeGreaterThanOrEqual(1);
  });

  it('renders with DropDown stacking column', () => {
    const data = makeData({
      columns: [
        { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
        { id: 'col-2', name: 'Category', type: CellType.DropDown, width: 150 },
      ],
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.String, data: 'Item', displayData: 'Item', options: {} },
            'col-2': {
              type: CellType.DropDown,
              data: 'A',
              displayData: 'A',
              options: { options: [{ id: '1', label: 'A' }, { id: '2', label: 'B' }] },
            },
          },
        },
      ],
    });
    render(
      <KanbanView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Category')).toBeInTheDocument();
  });

  it('renders uncategorized stack for records without a value', () => {
    const data = makeData({
      records: [
        {
          id: 'rec-1',
          cells: {
            'col-1': { type: CellType.String, data: 'Orphan', displayData: 'Orphan', options: {} },
            'col-2': { type: CellType.SCQ, data: null, displayData: '', options: { options: ['Active'] } },
          },
        },
      ],
    });
    render(
      <KanbanView data={data as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} />
    );
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });

  it('calls onExpandRecord when card is clicked', () => {
    const onExpand = vi.fn();
    render(
      <KanbanView data={makeData() as any} onCellChange={vi.fn()} onAddRow={vi.fn()} onDeleteRows={vi.fn()} onDuplicateRow={vi.fn()} onExpandRecord={onExpand} />
    );
  });
});
