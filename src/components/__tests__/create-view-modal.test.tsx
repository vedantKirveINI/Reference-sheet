import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateViewModal } from '../create-view-modal';

vi.mock('@/services/api', () => ({
  createView: vi.fn().mockResolvedValue({ data: { data: { id: 'view-new', name: 'Test', type: 'grid' } } }),
}));

const mockAddView = vi.fn();
const mockSetCurrentView = vi.fn();
const mockViews: any[] = [];

vi.mock('@/stores/view-store', () => ({
  useViewStore: (selector: any) => {
    const store = {
      addView: mockAddView,
      setCurrentView: mockSetCurrentView,
      views: mockViews,
    };
    return selector(store);
  },
}));

vi.mock('@/stores/fields-store', () => ({
  useFieldsStore: (selector: any) => {
    const store = {
      allColumns: [
        { id: 'col-1', name: 'Status', type: 'SCQ', rawType: 'SCQ', rawId: 1, width: 150 },
        { id: 'col-2', name: 'Name', type: 'String', rawType: 'SHORT_TEXT', rawId: 2, width: 200 },
      ],
    };
    return selector(store);
  },
}));

describe('CreateViewModal', () => {
  let onClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onClose = vi.fn();
    vi.clearAllMocks();
  });

  it('does not render when closed', () => {
    render(<CreateViewModal open={false} onClose={onClose} />);
    expect(screen.queryByText('Create new view')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<CreateViewModal open={true} onClose={onClose} />);
    expect(screen.getByText('Create new view')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<CreateViewModal open={true} onClose={onClose} />);
    expect(screen.getByText(/Choose a view type/)).toBeInTheDocument();
  });

  it('renders view name input', () => {
    render(<CreateViewModal open={true} onClose={onClose} />);
    expect(screen.getByPlaceholderText('Enter view name')).toBeInTheDocument();
  });

  it('renders all 5 view type options', () => {
    render(<CreateViewModal open={true} onClose={onClose} />);
    expect(screen.getByText('Grid')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Kanban')).toBeInTheDocument();
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Form')).toBeInTheDocument();
  });

  it('renders Cancel and Create view buttons', () => {
    render(<CreateViewModal open={true} onClose={onClose} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create view')).toBeInTheDocument();
  });

  it('shows error when submit with empty name', async () => {
    const user = userEvent.setup();
    render(<CreateViewModal open={true} onClose={onClose} />);
    await user.click(screen.getByText('Create view'));
    expect(screen.getByText('View name is required')).toBeInTheDocument();
  });

  it('shows Kanban stacking field dropdown when Kanban is selected', async () => {
    const user = userEvent.setup();
    render(<CreateViewModal open={true} onClose={onClose} />);
    await user.click(screen.getByText('Kanban'));
    expect(screen.getByText('Stacking field')).toBeInTheDocument();
    expect(screen.getByText(/single-select field/)).toBeInTheDocument();
  });

  it('lists SCQ columns in stacking field dropdown', async () => {
    const user = userEvent.setup();
    render(<CreateViewModal open={true} onClose={onClose} />);
    await user.click(screen.getByText('Kanban'));
    expect(screen.getByText(/Select a field/)).toBeInTheDocument();
  });

  it('does not show stacking field for non-Kanban types', async () => {
    const user = userEvent.setup();
    render(<CreateViewModal open={true} onClose={onClose} />);
    await user.click(screen.getByText('Grid'));
    expect(screen.queryByText('Stacking field')).not.toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateViewModal open={true} onClose={onClose} />);
    await user.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('creates view and calls onClose on successful submit', async () => {
    const user = userEvent.setup();
    render(<CreateViewModal open={true} onClose={onClose} baseId="base-1" tableId="table-1" />);
    const input = screen.getByPlaceholderText('Enter view name');
    await user.type(input, 'My View');
    await user.click(screen.getByText('Create view'));
    await waitFor(() => {
      expect(mockAddView).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('clears error when typing in name input', async () => {
    const user = userEvent.setup();
    render(<CreateViewModal open={true} onClose={onClose} />);
    await user.click(screen.getByText('Create view'));
    expect(screen.getByText('View name is required')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Enter view name'), 'T');
    expect(screen.queryByText('View name is required')).not.toBeInTheDocument();
  });
});
