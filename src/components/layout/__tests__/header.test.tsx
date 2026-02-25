import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'header.untitled': 'Untitled',
        'search': 'Search',
        'noResults': 'No results',
        'rename': 'Rename',
        'export': 'Export',
        'duplicate': 'Duplicate',
        'hide': 'Hide',
        'show': 'Show',
        'delete': 'Delete',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const mockSetCurrentView = vi.fn();
const mockAddView = vi.fn();
const mockUpdateView = vi.fn();
const mockRemoveView = vi.fn();
const mockOpenShareModal = vi.fn();

vi.mock('@/stores', () => ({
  useViewStore: (selector: any) => {
    const state = {
      views: [
        { id: 'v1', name: 'Grid View', type: 'grid', user_id: '', tableId: 't1' },
        { id: 'v2', name: 'Kanban View', type: 'kanban', user_id: '', tableId: 't1' },
      ],
      currentViewId: 'v1',
      setCurrentView: mockSetCurrentView,
      addView: mockAddView,
      updateView: mockUpdateView,
      removeView: mockRemoveView,
    };
    return selector(state);
  },
  useModalControlStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ openShareModal: mockOpenShareModal });
    }
    return { openShareModal: mockOpenShareModal };
  },
  useUIStore: (selector: any) => {
    const state = {
      accentColor: '#39A380',
      setAccentColor: vi.fn(),
      theme: 'light',
      setTheme: vi.fn(),
    };
    return selector(state);
  },
  THEME_PRESETS: [{ name: 'Green', color: '#39A380' }],
}));

vi.mock('@/services/api', () => ({
  createView: vi.fn().mockResolvedValue({ data: { id: 'v-new', name: 'New View', type: 'grid' } }),
  renameView: vi.fn().mockResolvedValue({}),
  deleteView: vi.fn().mockResolvedValue({}),
  exportData: vi.fn().mockResolvedValue({ data: new Blob(['csv data']) }),
  getShareMembers: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('@/components/create-view-modal', () => ({
  CreateViewModal: () => null,
}));

vi.mock('@/views/auth/user-menu', () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

import { Header } from '../header';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the header element', () => {
    render(<Header />);
    expect(document.querySelector('header')).toBeInTheDocument();
  });

  it('renders table name (from tableName prop)', () => {
    render(<Header tableName="My Table" />);
    expect(screen.getByText('My Table')).toBeInTheDocument();
  });

  it('renders sheetName when no tableName', () => {
    render(<Header sheetName="My Sheet" />);
    expect(screen.getByText('My Sheet')).toBeInTheDocument();
  });

  it('renders "Untitled" when no name given', () => {
    render(<Header />);
    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('renders view tabs', () => {
    render(<Header />);
    expect(screen.getByText('Grid View')).toBeInTheDocument();
    expect(screen.getByText('Kanban View')).toBeInTheDocument();
  });

  it('highlights active view', () => {
    render(<Header />);
    const gridView = screen.getByText('Grid View');
    const pill = gridView.closest('[role="button"]');
    expect(pill?.className).toContain('font-medium');
  });

  it('switches view on click', () => {
    render(<Header />);
    fireEvent.click(screen.getByText('Kanban View'));
    expect(mockSetCurrentView).toHaveBeenCalledWith('v2');
  });

  it('enters editing mode on double click of name', () => {
    render(<Header tableName="My Table" />);
    const nameEl = screen.getByText('My Table');
    fireEvent.doubleClick(nameEl);
    const input = document.querySelector('input');
    expect(input).toBeInTheDocument();
    expect(input?.value).toBe('My Table');
  });

  it('commits name on Enter', () => {
    const onNameChange = vi.fn();
    render(<Header tableName="My Table" onTableNameChange={onNameChange} />);
    fireEvent.doubleClick(screen.getByText('My Table'));
    const input = document.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNameChange).toHaveBeenCalledWith('New Name');
  });

  it('cancels name editing on Escape', () => {
    render(<Header tableName="My Table" />);
    fireEvent.doubleClick(screen.getByText('My Table'));
    const input = document.querySelector('input')!;
    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.getByText('My Table')).toBeInTheDocument();
  });

  it('renders logo/brand mark', () => {
    render(<Header />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders expand views popover trigger', () => {
    render(<Header />);
    const listButton = document.querySelector('button');
    expect(listButton).toBeInTheDocument();
  });
});
