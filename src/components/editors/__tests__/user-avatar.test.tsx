import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar, UserAvatarGroup } from '../user-avatar';
import type { IUserInfo } from '@/types/cell';

describe('UserAvatar', () => {
  const userWithAvatar: IUserInfo = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
  };

  const userWithoutAvatar: IUserInfo = {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
  };

  it('renders avatar image when user has avatar', () => {
    render(<UserAvatar user={userWithAvatar} />);
    const img = screen.getByAltText('John Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders initials fallback when no avatar', () => {
    render(<UserAvatar user={userWithoutAvatar} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('uses email initial when name is empty', () => {
    render(<UserAvatar user={{ id: 'user-3', name: '', email: 'test@example.com' }} />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('uses ? when both name and email are empty', () => {
    render(<UserAvatar user={{ id: 'user-4', name: '' }} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('respects size prop for image', () => {
    render(<UserAvatar user={userWithAvatar} size={48} />);
    const img = screen.getByAltText('John Doe');
    expect(img).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('respects size prop for initials', () => {
    render(<UserAvatar user={userWithoutAvatar} size={48} />);
    const div = screen.getByText('J');
    expect(div).toHaveStyle({ width: '48px', height: '48px' });
  });

  it('applies custom className', () => {
    render(<UserAvatar user={userWithAvatar} className="custom-class" />);
    const img = screen.getByAltText('John Doe');
    expect(img.className).toContain('custom-class');
  });

  it('uses default size of 24', () => {
    render(<UserAvatar user={userWithAvatar} />);
    const img = screen.getByAltText('John Doe');
    expect(img).toHaveStyle({ width: '24px', height: '24px' });
  });
});

describe('UserAvatarGroup', () => {
  const users: IUserInfo[] = [
    { id: 'u1', name: 'Alice', avatar: 'https://example.com/a.jpg' },
    { id: 'u2', name: 'Bob', avatar: 'https://example.com/b.jpg' },
    { id: 'u3', name: 'Charlie' },
    { id: 'u4', name: 'Diana' },
    { id: 'u5', name: 'Eve' },
  ];

  it('displays up to maxDisplay users', () => {
    render(<UserAvatarGroup users={users} maxDisplay={3} />);
    expect(screen.getByAltText('Alice')).toBeInTheDocument();
    expect(screen.getByAltText('Bob')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('shows +N for remaining users', () => {
    render(<UserAvatarGroup users={users} maxDisplay={3} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not show +N when all users displayed', () => {
    render(<UserAvatarGroup users={users.slice(0, 2)} maxDisplay={3} />);
    expect(screen.queryByText(/\+/)).toBeNull();
  });

  it('handles empty users array', () => {
    const { container } = render(<UserAvatarGroup users={[]} />);
    expect(container.querySelector('img')).toBeNull();
  });
});
