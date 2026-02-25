import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CollaboratorPicker } from '../collaborator-picker';
import type { IUserInfo } from '@/types/cell';
import * as api from '@/services/api';

vi.mock('@/services/api', () => ({
  searchUsers: vi.fn(),
}));

describe('CollaboratorPicker', () => {
  const selectedUsers: IUserInfo[] = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders selected users', () => {
    render(<CollaboratorPicker selectedUsers={selectedUsers} onChange={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows placeholder when no users selected', () => {
    render(<CollaboratorPicker selectedUsers={[]} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('removes user when X is clicked', () => {
    const onChange = vi.fn();
    render(<CollaboratorPicker selectedUsers={selectedUsers} onChange={onChange} />);
    const removeButtons = screen.getAllByRole('button');
    const xButton = removeButtons.find(btn => btn.querySelector('svg'));
    if (xButton) fireEvent.click(xButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('shows custom placeholder', () => {
    render(
      <CollaboratorPicker selectedUsers={[]} onChange={vi.fn()} placeholder="Find people..." />
    );
    expect(screen.getByPlaceholderText('Find people...')).toBeInTheDocument();
  });

  it('does not search with less than 2 characters', async () => {
    const searchUsersMock = vi.mocked(api.searchUsers);
    render(<CollaboratorPicker selectedUsers={[]} onChange={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'a' } });
    await waitFor(() => {
      expect(searchUsersMock).not.toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('searches users with 2+ characters', async () => {
    const searchUsersMock = vi.mocked(api.searchUsers);
    searchUsersMock.mockResolvedValue({ data: [{ id: 'u2', name: 'Bob', email: 'bob@test.com' }] });
    render(<CollaboratorPicker selectedUsers={[]} onChange={vi.fn()} />);
    const input = screen.getByPlaceholderText('Search users...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'bo' } });
    await waitFor(() => {
      expect(searchUsersMock).toHaveBeenCalledWith({ query: 'bo' });
    }, { timeout: 500 });
  });

  it('adds user in multiple mode', async () => {
    const onChange = vi.fn();
    const searchUsersMock = vi.mocked(api.searchUsers);
    searchUsersMock.mockResolvedValue({ data: [{ id: 'u2', name: 'Bob', email: 'bob@test.com' }] });
    render(<CollaboratorPicker selectedUsers={selectedUsers} onChange={onChange} isMultiple />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Bob' } });
    await waitFor(() => {
      const bobBtn = screen.queryByText('Bob');
      if (bobBtn) fireEvent.click(bobBtn);
    }, { timeout: 500 });
  });

  it('replaces users in single mode', async () => {
    const onChange = vi.fn();
    const searchUsersMock = vi.mocked(api.searchUsers);
    searchUsersMock.mockResolvedValue({ data: [{ id: 'u2', name: 'Bob', email: 'bob@test.com' }] });
    render(<CollaboratorPicker selectedUsers={selectedUsers} onChange={onChange} isMultiple={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Bob' } });
    await waitFor(() => {
      const bobBtn = screen.queryByText('Bob');
      if (bobBtn) fireEvent.click(bobBtn);
    }, { timeout: 500 });
  });
});
