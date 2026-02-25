import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HideFieldsContent } from '../hide-fields-modal';
import { CellType, IColumn } from '@/types';

vi.mock('@/stores', () => ({
  useFieldsStore: vi.fn((selector: any) => {
    const store = {
      getEnrichmentGroupMap: () => new Map<string, string[]>(),
    };
    return selector(store);
  }),
}));

function makeColumns(): IColumn[] {
  return [
    { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
    { id: 'col-2', name: 'Age', type: CellType.Number, width: 100 },
    { id: 'col-3', name: 'Status', type: CellType.SCQ, width: 150 },
  ];
}

describe('HideFieldsContent', () => {
  let onToggleColumn: ReturnType<typeof vi.fn>;
  let onPersist: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggleColumn = vi.fn();
    onPersist = vi.fn();
  });

  it('renders header', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set()}
        onToggleColumn={onToggleColumn}
      />
    );
    expect(screen.getByText('Hide fields')).toBeInTheDocument();
  });

  it('renders all column names', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set()}
        onToggleColumn={onToggleColumn}
      />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('shows switch toggles for each field', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set()}
        onToggleColumn={onToggleColumn}
      />
    );
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);
  });

  it('toggles are checked when columns are visible', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set()}
        onToggleColumn={onToggleColumn}
      />
    );
    const switches = screen.getAllByRole('switch');
    switches.forEach(sw => {
      expect(sw).toHaveAttribute('aria-checked', 'true');
    });
  });

  it('toggles are unchecked for hidden columns', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set(['col-2'])}
        onToggleColumn={onToggleColumn}
      />
    );
    const switches = screen.getAllByRole('switch');
    expect(switches[1]).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onToggleColumn when switch is clicked', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set()}
        onToggleColumn={onToggleColumn}
        onPersist={onPersist}
      />
    );
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(onToggleColumn).toHaveBeenCalledWith('col-1');
  });

  it('calls onPersist when switch is clicked', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set()}
        onToggleColumn={onToggleColumn}
        onPersist={onPersist}
      />
    );
    const switches = screen.getAllByRole('switch');
    fireEvent.click(switches[0]);
    expect(onPersist).toHaveBeenCalled();
  });

  it('shows hidden count footer when fields are hidden', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set(['col-1', 'col-2'])}
        onToggleColumn={onToggleColumn}
      />
    );
    expect(screen.getByText('2 fields hidden')).toBeInTheDocument();
  });

  it('shows singular "field" when 1 field hidden', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set(['col-1'])}
        onToggleColumn={onToggleColumn}
      />
    );
    expect(screen.getByText('1 field hidden')).toBeInTheDocument();
  });

  it('does not show hidden count when no fields hidden', () => {
    render(
      <HideFieldsContent
        columns={makeColumns()}
        hiddenColumnIds={new Set()}
        onToggleColumn={onToggleColumn}
      />
    );
    expect(screen.queryByText(/field.*hidden/)).not.toBeInTheDocument();
  });
});
