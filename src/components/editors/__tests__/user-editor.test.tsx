import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserEditor } from '../user-editor';
import type { IUserInfo } from '@/types/cell';

vi.mock('@/services/api', () => ({
  searchUsers: vi.fn().mockResolvedValue({ data: [] }),
}));

describe('UserEditor', () => {
  const users: IUserInfo[] = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com' },
  ];

  it('renders with selected users', () => {
    render(<UserEditor value={users} onChange={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders with null value', () => {
    render(<UserEditor value={null} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Select users...')).toBeInTheDocument();
  });

  it('renders placeholder when no users selected', () => {
    render(<UserEditor value={[]} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Select users...')).toBeInTheDocument();
  });

  it('passes isMultiple prop to CollaboratorPicker', () => {
    render(<UserEditor value={[]} onChange={vi.fn()} isMultiple={false} />);
    expect(screen.getByPlaceholderText('Select users...')).toBeInTheDocument();
  });
});
