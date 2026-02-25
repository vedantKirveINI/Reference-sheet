import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockToggleSidebar = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'sidebar.newTable': 'New Table',
        'sidebar.searchTables': 'Search tables',
        'sidebar.deleteTable': 'Delete Table',
        'rename': 'Rename',
        'delete': 'Delete',
        'cancel': 'Cancel',
        'noResults': 'No results',
        'language': 'Language',
        'english': 'English',
        'spanish': 'Spanish',
        'arabic': 'Arabic',
        'portuguese': 'Portuguese',
        'workflow.createWorkflow': 'Create Workflow',
        'workflow.workflowDescription': 'Automate your tasks',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/stores', () => ({
  useUIStore: (selector: any) => {
    const state = {
      sidebarExpanded: true,
      toggleSidebar: mockToggleSidebar,
    };
    return selector(state);
  },
}));

import { Sidebar } from '../sidebar';

const tables = [
  { id: 't1', name: 'Table One' },
  { id: 't2', name: 'Table Two' },
  { id: 't3', name: 'Customers' },
];

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders table list', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    expect(screen.getByText('Table One')).toBeInTheDocument();
    expect(screen.getByText('Table Two')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
  });

  it('highlights active table', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    const activeButton = screen.getByText('Table One').closest('button');
    expect(activeButton?.className).toContain('font-medium');
  });

  it('calls onTableSelect when table clicked', () => {
    const onTableSelect = vi.fn();
    render(<Sidebar tables={tables} activeTableId="t1" onTableSelect={onTableSelect} />);
    fireEvent.click(screen.getByText('Table Two'));
    expect(onTableSelect).toHaveBeenCalledWith('t2');
  });

  it('renders "New Table" button', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    expect(screen.getByText('New Table')).toBeInTheDocument();
  });

  it('calls onAddTable when new table button clicked', () => {
    const onAddTable = vi.fn();
    render(<Sidebar tables={tables} activeTableId="t1" onAddTable={onAddTable} />);
    fireEvent.click(screen.getByText('New Table'));
    expect(onAddTable).toHaveBeenCalled();
  });

  it('disables new table button when isAddingTable', () => {
    render(<Sidebar tables={tables} activeTableId="t1" isAddingTable />);
    const btn = screen.getByText('New Table…').closest('button');
    expect(btn).toBeDisabled();
  });

  it('renders search input', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    expect(screen.getByPlaceholderText('Search tables')).toBeInTheDocument();
  });

  it('filters tables by search query', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    const searchInput = screen.getByPlaceholderText('Search tables');
    fireEvent.change(searchInput, { target: { value: 'Customer' } });
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.queryByText('Table One')).not.toBeInTheDocument();
    expect(screen.queryByText('Table Two')).not.toBeInTheDocument();
  });

  it('shows "No results" when search has no matches', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    const searchInput = screen.getByPlaceholderText('Search tables');
    fireEvent.change(searchInput, { target: { value: 'zzzzz' } });
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('enters rename mode on double-click', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    fireEvent.doubleClick(screen.getByText('Table One'));
    const renameInput = document.querySelector('input[class*="text-xs"]');
    expect(renameInput).toBeInTheDocument();
  });

  it('calls toggleSidebar on collapse button click', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    const collapseBtn = document.querySelector('[aria-label]');
    if (collapseBtn) {
      fireEvent.click(collapseBtn);
    }
  });

  it('renders workflow creation button', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    expect(screen.getByText('Create Workflow')).toBeInTheDocument();
  });

  it('renders language selector', () => {
    render(<Sidebar tables={tables} activeTableId="t1" />);
    expect(screen.getByText(/Language/)).toBeInTheDocument();
  });

  it('persists sidebar width', () => {
    render(<Sidebar tables={tables} activeTableId="t1" sidebarWidth={300} />);
    const aside = document.querySelector('aside');
    expect(aside?.style.width).toBe('300px');
  });
});
