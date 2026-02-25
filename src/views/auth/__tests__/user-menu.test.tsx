import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useUIStore } from '@/stores';

vi.mock('@/components/ui/dropdown-menu', () => {
  return {
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children, asChild }: any) => <div data-testid="dropdown-trigger">{asChild ? children : <button>{children}</button>}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, onClick, disabled }: any) => (
      <div role="menuitem" data-disabled={disabled || undefined} onClick={onClick}>{children}</div>
    ),
    DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
    DropdownMenuSeparator: () => <hr />,
  };
});

import { UserMenu } from '../user-menu';

describe('UserMenu', () => {
  beforeEach(() => {
    useUIStore.getState().setTheme('light');
  });

  it('renders trigger button', () => {
    render(<UserMenu />);
    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
  });

  it('renders user name and email', () => {
    render(<UserMenu />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders Settings menu item', () => {
    render(<UserMenu />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders Sign out menu item', () => {
    render(<UserMenu />);
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('shows Dark mode option when in light mode', () => {
    useUIStore.getState().setTheme('light');
    render(<UserMenu />);
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
  });

  it('shows Light mode option when in dark mode', () => {
    useUIStore.getState().setTheme('dark');
    render(<UserMenu />);
    expect(screen.getByText('Light mode')).toBeInTheDocument();
  });

  it('toggles theme from light to dark', () => {
    useUIStore.getState().setTheme('light');
    render(<UserMenu />);
    const darkModeItem = screen.getByText('Dark mode').closest('[role="menuitem"]')!;
    darkModeItem.click();
    expect(useUIStore.getState().theme).toBe('dark');
  });

  it('toggles theme from dark to light', () => {
    useUIStore.getState().setTheme('dark');
    render(<UserMenu />);
    const lightModeItem = screen.getByText('Light mode').closest('[role="menuitem"]')!;
    lightModeItem.click();
    expect(useUIStore.getState().theme).toBe('light');
  });

  it('renders user icon in trigger', () => {
    const { container } = render(<UserMenu />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
