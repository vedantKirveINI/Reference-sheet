import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LinkedRecordExpandModal } from '../linked-record-expand-modal';

vi.mock('@/services/api', () => ({
  getForeignTableFields: vi.fn().mockResolvedValue({
    data: [
      { id: 1, name: 'Name', type: 'TEXT' },
      { id: 2, name: 'Status', type: 'SINGLE_SELECT' },
      { id: 3, name: 'Age', type: 'NUMBER' },
    ],
  }),
  getForeignTableRecord: vi.fn().mockResolvedValue({
    data: {
      __id: 'rec-1',
      field_1: 'Alice',
      field_2: 'Active',
      field_3: 25,
    },
  }),
}));

describe('LinkedRecordExpandModal', () => {
  const baseProps = {
    open: true,
    baseId: 'base-1',
    stack: [{ foreignTableId: 'table-1', recordId: 1, title: 'Test Record' }],
    onClose: vi.fn(),
    onPushRecord: vi.fn(),
    onPopRecord: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    render(<LinkedRecordExpandModal {...baseProps} open={false} />);
    expect(screen.queryByText('Test Record')).not.toBeInTheDocument();
  });

  it('does not render when stack is empty', () => {
    render(<LinkedRecordExpandModal {...baseProps} stack={[]} />);
    expect(screen.queryByText('Test Record')).not.toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(<LinkedRecordExpandModal {...baseProps} />);
    expect(screen.getByText('Loading record...')).toBeInTheDocument();
  });

  it('renders record data after loading', async () => {
    render(<LinkedRecordExpandModal {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  it('renders field names for the record', async () => {
    render(<LinkedRecordExpandModal {...baseProps} />);
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
    });
  });

  it('renders a close button that calls onClose', async () => {
    const user = userEvent.setup();
    render(<LinkedRecordExpandModal {...baseProps} />);
    const closeButtons = screen.getAllByRole('button').filter(
      b => b.textContent?.includes('Close') || b.getAttribute('aria-label') === 'Close'
    );
    expect(closeButtons.length).toBeGreaterThan(0);
    await user.click(closeButtons[0]);
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it('shows read-only notice', () => {
    render(<LinkedRecordExpandModal {...baseProps} />);
    expect(screen.getByText(/Read-only/)).toBeInTheDocument();
  });

  it('does not show back button for single level stack', () => {
    render(<LinkedRecordExpandModal {...baseProps} />);
    expect(screen.queryByTitle('Go back')).not.toBeInTheDocument();
  });

  it('shows back button for multi-level stack', () => {
    const stack = [
      { foreignTableId: 'table-1', recordId: 1, title: 'Parent' },
      { foreignTableId: 'table-2', recordId: 2, title: 'Child' },
    ];
    render(<LinkedRecordExpandModal {...baseProps} stack={stack} />);
    expect(screen.getByTitle('Go back')).toBeInTheDocument();
  });

  it('shows depth indicator for multi-level stack', () => {
    const stack = [
      { foreignTableId: 'table-1', recordId: 1, title: 'Parent' },
      { foreignTableId: 'table-2', recordId: 2, title: 'Child' },
    ];
    render(<LinkedRecordExpandModal {...baseProps} stack={stack} />);
    expect(screen.getByText('2 levels deep')).toBeInTheDocument();
  });

  it('calls onPopRecord when back button is clicked', async () => {
    const user = userEvent.setup();
    const stack = [
      { foreignTableId: 'table-1', recordId: 1, title: 'Parent' },
      { foreignTableId: 'table-2', recordId: 2, title: 'Child' },
    ];
    render(<LinkedRecordExpandModal {...baseProps} stack={stack} />);
    await user.click(screen.getByTitle('Go back'));
    expect(baseProps.onPopRecord).toHaveBeenCalled();
  });
});
