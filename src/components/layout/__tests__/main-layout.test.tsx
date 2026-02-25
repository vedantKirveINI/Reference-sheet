import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const mockToggleSidebar = vi.fn();
vi.mock('@/stores', () => ({
  useUIStore: (selector: any) => {
    const state = {
      sidebarExpanded: true,
      toggleSidebar: mockToggleSidebar,
      zoomLevel: 100,
      setZoomLevel: vi.fn(),
      rowHeightLevel: 'short',
      setRowHeightLevel: vi.fn(),
      fieldNameLines: 1,
      setFieldNameLines: vi.fn(),
      columnTextWrapModes: {},
      setColumnTextWrapMode: vi.fn(),
      getColumnTextWrapMode: () => 'clip',
      activeCell: null,
      accentColor: '#39A380',
      setAccentColor: vi.fn(),
      theme: 'light',
      setTheme: vi.fn(),
    };
    return selector(state);
  },
  useViewStore: (selector: any) => {
    const state = {
      views: [],
      currentViewId: null,
      setCurrentView: vi.fn(),
      addView: vi.fn(),
      updateView: vi.fn(),
      removeView: vi.fn(),
    };
    return selector(state);
  },
  useModalControlStore: (selector?: any) => {
    const state = {
      sort: { isOpen: false, initialData: null, fields: [] },
      filter: { isOpen: false, initialData: null, fields: [] },
      groupBy: { isOpen: false, initialData: null, fields: [] },
      openSort: vi.fn(),
      closeSort: vi.fn(),
      openFilter: vi.fn(),
      closeFilter: vi.fn(),
      openGroupBy: vi.fn(),
      closeGroupBy: vi.fn(),
      openExportModal: vi.fn(),
      openImportModal: vi.fn(),
      openShareModal: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  },
  useGridViewStore: (selector: any) => {
    const state = {
      selectedRows: new Set<number>(),
      clearSelectedRows: vi.fn(),
    };
    return selector(state);
  },
  useConditionalColorStore: (selector: any) => {
    const state = { rules: [] };
    return selector(state);
  },
  THEME_PRESETS: [{ name: 'Green', color: '#39A380' }],
}));

vi.mock('@/services/api', () => ({
  createView: vi.fn(),
  renameView: vi.fn(),
  deleteView: vi.fn(),
  exportData: vi.fn(),
  getShareMembers: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('@/components/create-view-modal', () => ({
  CreateViewModal: () => null,
}));

import { MainLayout } from '../main-layout';

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <MainLayout>
        <div>Main content</div>
      </MainLayout>
    );
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('renders header and sub-header', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    expect(document.querySelector('header')).toBeInTheDocument();
  });

  it('toggles sidebar on Ctrl+B', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    fireEvent.keyDown(document, { key: 'b', ctrlKey: true });
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('toggles sidebar on Meta+B', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    fireEvent.keyDown(document, { key: 'b', metaKey: true });
    expect(mockToggleSidebar).toHaveBeenCalled();
  });

  it('renders with sidebar expanded', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    const layout = container.firstChild as HTMLElement;
    expect(layout.className).toContain('flex');
  });
});
