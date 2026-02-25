import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecordHistoryPanel } from '../record-history-panel';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'history.loading': 'Loading history...',
        'history.noHistory': 'No history',
        'history.loadMore': 'Load more',
        'history.recordCreated': 'Record created',
        'history.recordDeleted': 'Record deleted',
        'history.fieldCreated': 'was set',
        'history.fieldUpdated': 'was changed',
        'history.by': 'by',
        'history.unknownUser': 'Unknown',
      };
      return map[key] || key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const mockGetRecordHistory = vi.fn();

vi.mock('@/services/api', () => ({
  getRecordHistory: (...args: any[]) => mockGetRecordHistory(...args),
}));

describe('RecordHistoryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockGetRecordHistory.mockReturnValue(new Promise(() => {}));
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    expect(screen.getByText('Loading history...')).toBeInTheDocument();
  });

  it('shows empty state when no history entries', async () => {
    mockGetRecordHistory.mockResolvedValue({ data: { records: [], totalPages: 1 } });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText('No history')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    mockGetRecordHistory.mockRejectedValue(new Error('Network error'));
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load history')).toBeInTheDocument();
    });
  });

  it('renders history entries', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: 'field-1',
            field_name: 'Name',
            before_value: 'Old',
            after_value: 'New',
            action: 'update',
            changed_by: { name: 'Alice' },
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 1,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('was changed')).toBeInTheDocument();
      expect(screen.getByText('Old')).toBeInTheDocument();
      expect(screen.getByText('New')).toBeInTheDocument();
    });
  });

  it('renders create action entries', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: '__all__',
            field_name: null,
            before_value: null,
            after_value: null,
            action: 'create',
            changed_by: { name: 'Bob' },
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 1,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText('Record created')).toBeInTheDocument();
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
    });
  });

  it('renders delete action entries', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: 'field-1',
            field_name: 'Name',
            before_value: 'Old',
            after_value: null,
            action: 'delete',
            changed_by: null,
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 1,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText('Record deleted')).toBeInTheDocument();
    });
  });

  it('shows user attribution', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: 'field-1',
            field_name: 'Name',
            before_value: 'A',
            after_value: 'B',
            action: 'update',
            changed_by: { email: 'alice@example.com' },
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 1,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText(/alice@example\.com/)).toBeInTheDocument();
    });
  });

  it('shows "Load more" button when multiple pages exist', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: 'field-1',
            field_name: 'Name',
            before_value: 'A',
            after_value: 'B',
            action: 'update',
            changed_by: { name: 'User' },
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 3,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText('Load more')).toBeInTheDocument();
    });
  });

  it('does not show "Load more" when on last page', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: 'field-1',
            field_name: 'Name',
            before_value: 'A',
            after_value: 'B',
            action: 'update',
            changed_by: { name: 'User' },
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 1,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.queryByText('Load more')).not.toBeInTheDocument();
    });
  });

  it('groups entries by date', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: 'field-1',
            field_name: 'Name',
            before_value: 'A',
            after_value: 'B',
            action: 'update',
            changed_by: { name: 'User' },
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 1,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText(/June 15/)).toBeInTheDocument();
    });
  });

  it('shows "System" when changed_by is null', async () => {
    mockGetRecordHistory.mockResolvedValue({
      data: {
        records: [
          {
            id: 1,
            record_id: 1,
            field_id: 'field-1',
            field_name: 'Name',
            before_value: 'A',
            after_value: 'B',
            action: 'update',
            changed_by: null,
            changed_at: '2025-06-15T10:00:00Z',
          },
        ],
        totalPages: 1,
      },
    });
    render(<RecordHistoryPanel baseId="base-1" tableId="table-1" recordId="rec-1" />);
    await waitFor(() => {
      expect(screen.getByText(/System/)).toBeInTheDocument();
    });
  });
});
