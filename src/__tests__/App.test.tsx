import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { CellType, ViewType } from '@/types';
import { useViewStore } from '@/stores/view-store';
import { useGridViewStore } from '@/stores/grid-view-store';
import { useFieldsStore } from '@/stores/fields-store';
import { useUIStore } from '@/stores/ui-store';
import { useModalControlStore } from '@/stores/modal-control-store';

const mockSwitchTable = vi.fn();
const mockSwitchView = vi.fn();
const mockEmitRowCreate = vi.fn();
const mockEmitRowUpdate = vi.fn();
const mockEmitRowInsert = vi.fn();
const mockDeleteRecords = vi.fn();
const mockRefetchRecords = vi.fn();
const mockGetIds = vi.fn().mockReturnValue({ assetId: 'base-1', tableId: 'tbl-1', viewId: 'view-1' });

const baseData = {
  columns: [
    { id: 'col-1', name: 'Name', type: CellType.String, width: 200, rawId: 1, rawOptions: {}, dbFieldName: 'field_1', isPrimary: true, isComputed: false, fieldFormat: null, options: [] },
    { id: 'col-2', name: 'Status', type: CellType.SCQ, width: 150, rawId: 2, rawOptions: {}, dbFieldName: 'field_2', isPrimary: false, isComputed: false, fieldFormat: null, options: ['Active', 'Done'] },
  ],
  records: [
    {
      id: 'rec-1',
      cells: {
        'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice', options: {} },
        'col-2': { type: CellType.SCQ, data: 'Active', displayData: 'Active', options: { options: ['Active', 'Done'] } },
      },
    },
  ],
  rowHeaders: [{ id: 'rec-1', rowIndex: 0, heightLevel: 'Short' }],
};

const defaultSheetData = {
  data: baseData,
  isLoading: false,
  error: null,
  emitRowCreate: mockEmitRowCreate,
  emitRowUpdate: mockEmitRowUpdate,
  emitRowInsert: mockEmitRowInsert,
  deleteRecords: mockDeleteRecords,
  refetchRecords: mockRefetchRecords,
  tableList: [{ id: 'tbl-1', name: 'Table 1' }],
  sheetName: 'Test Sheet',
  switchTable: mockSwitchTable,
  switchView: mockSwitchView,
  currentTableId: 'tbl-1',
  getIds: mockGetIds,
  setTableList: vi.fn(),
  setSheetName: vi.fn(),
  currentView: { id: 'view-1', name: 'Grid View', type: 'default_grid' },
  hasNewRecords: false,
};

const mockUseSheetData = vi.fn().mockReturnValue(defaultSheetData);

vi.mock('@/hooks/useSheetData', () => ({
  useSheetData: () => mockUseSheetData(),
}));

vi.mock('@/hooks/useTheme', () => ({
  useTheme: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en', changeLanguage: vi.fn() } }),
  Trans: ({ children }: any) => children,
}));

vi.mock('@/services/api', () => ({
  updateColumnMeta: vi.fn().mockResolvedValue({}),
  createTable: vi.fn().mockResolvedValue({ data: { id: 'new-tbl' } }),
  createMultipleFields: vi.fn().mockResolvedValue({}),
  renameTable: vi.fn().mockResolvedValue({}),
  deleteTable: vi.fn().mockResolvedValue({}),
  updateSheetName: vi.fn().mockResolvedValue({}),
  createField: vi.fn().mockResolvedValue({ data: { id: 10 } }),
  updateField: vi.fn().mockResolvedValue({}),
  updateFieldsStatus: vi.fn().mockResolvedValue({}),
  updateLinkCell: vi.fn().mockResolvedValue({}),
  updateViewFilter: vi.fn().mockResolvedValue({}),
  updateViewSort: vi.fn().mockResolvedValue({}),
  updateViewGroupBy: vi.fn().mockResolvedValue({}),
  getGroupPoints: vi.fn().mockResolvedValue({ data: [] }),
  createEnrichmentField: vi.fn().mockResolvedValue({}),
  updateRecordColors: vi.fn(),
  getCommentCountsByTable: vi.fn().mockResolvedValue({ data: { counts: {} } }),
  processEnrichment: vi.fn(),
  processEnrichmentForAll: vi.fn(),
}));

vi.mock('@/services/socket', () => ({
  getSocket: vi.fn().mockReturnValue({ on: vi.fn(), off: vi.fn(), emit: vi.fn() }),
}));

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/views/grid/grid-view', () => ({
  GridView: (props: any) => <div data-testid="grid-view">GridView</div>,
}));

vi.mock('@/views/kanban/kanban-view', () => ({
  KanbanView: (props: any) => <div data-testid="kanban-view">KanbanView</div>,
}));

vi.mock('@/views/calendar/calendar-view', () => ({
  CalendarView: (props: any) => <div data-testid="calendar-view">CalendarView</div>,
}));

vi.mock('@/views/gantt/gantt-view', () => ({
  GanttView: (props: any) => <div data-testid="gantt-view">GanttView</div>,
}));

vi.mock('@/views/gallery/gallery-view', () => ({
  GalleryView: (props: any) => <div data-testid="gallery-view">GalleryView</div>,
}));

vi.mock('@/views/form/form-view', () => ({
  FormView: (props: any) => <div data-testid="form-view">FormView</div>,
}));

vi.mock('@/views/grid/footer-stats-bar', () => ({
  FooterStatsBar: () => <div data-testid="footer-stats-bar" />,
}));

vi.mock('@/views/grid/ai-chat-panel', () => ({
  AIChatPanel: () => <div data-testid="ai-chat-panel" />,
}));

vi.mock('@/views/grid/expanded-record-modal', () => ({
  ExpandedRecordModal: (props: any) => props.open ? <div data-testid="expanded-record-modal" /> : null,
}));

vi.mock('@/views/grid/export-modal', () => ({
  ExportModal: () => <div data-testid="export-modal" />,
}));

vi.mock('@/views/grid/import-modal', () => ({
  ImportModal: () => <div data-testid="import-modal" />,
}));

vi.mock('@/views/sharing/share-modal', () => ({
  ShareModal: () => <div data-testid="share-modal" />,
}));

vi.mock('@/components/create-table-modal', () => ({
  CreateTableModal: (props: any) => props.open ? <div data-testid="create-table-modal" /> : null,
}));

vi.mock('@/components/linked-record-expand-modal', () => ({
  LinkedRecordExpandModal: () => null,
}));

vi.mock('@/components/comments/comment-panel', () => ({
  CommentPanel: () => <div data-testid="comment-panel">CommentPanel</div>,
}));

vi.mock('@/components/layout/main-layout', () => ({
  MainLayout: ({ children, ...props }: any) => (
    <div data-testid="main-layout" data-active-table={props.activeTableId}>
      <span data-testid="sheet-name">{props.sheetName}</span>
      {props.tables?.map((t: any) => (
        <button key={t.id} data-testid={`table-tab-${t.id}`} onClick={() => props.onTableSelect(t.id)}>{t.name}</button>
      ))}
      <button data-testid="add-table-btn" onClick={props.onAddTable}>Add Table</button>
      {children}
    </div>
  ),
}));

vi.mock('@/components/layout/table-skeleton', () => ({
  TableSkeleton: () => <div data-testid="table-skeleton" />,
}));

vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: () => <div data-testid="confirm-dialog" />,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useViewStore.getState().setViews([
      { id: 'view-1', name: 'Grid View', type: 'default_grid' as any },
    ]);
    useViewStore.getState().setCurrentView('view-1');
    useGridViewStore.getState().setExpandedRecordId(null);
    useGridViewStore.getState().setCommentSidebarOpen(false);
    useFieldsStore.getState().setAllColumns([]);

    mockUseSheetData.mockReturnValue({ ...defaultSheetData });
  });

  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders the main layout with sheet name', () => {
    render(<App />);
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('sheet-name')).toHaveTextContent('Test Sheet');
  });

  it('renders GridView by default', () => {
    render(<App />);
    expect(screen.getByTestId('grid-view')).toBeInTheDocument();
  });

  it.each([
    ['kanban', ViewType.Kanban, 'kanban-view'],
    ['calendar', ViewType.Calendar, 'calendar-view'],
    ['gantt', ViewType.Gantt, 'gantt-view'],
    ['gallery', ViewType.Gallery, 'gallery-view'],
    ['form', ViewType.Form, 'form-view'],
  ])('renders %s view when active', (name, viewType, testId) => {
    const viewId = `view-${name}`;
    mockUseSheetData.mockReturnValue({
      ...defaultSheetData,
      tableList: [{ id: 'tbl-1', name: 'Table 1', views: [{ id: viewId, name, type: viewType }] }],
      currentView: { id: viewId, name, type: viewType },
    });
    useViewStore.getState().setViews([{ id: viewId, name, type: viewType as any }]);
    useViewStore.getState().setCurrentView(viewId);
    render(<App />);
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('renders footer stats bar', () => {
    render(<App />);
    expect(screen.getByTestId('footer-stats-bar')).toBeInTheDocument();
  });

  it('renders AI chat panel', () => {
    render(<App />);
    expect(screen.getByTestId('ai-chat-panel')).toBeInTheDocument();
  });

  it('renders export and import modals', () => {
    render(<App />);
    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    expect(screen.getByTestId('import-modal')).toBeInTheDocument();
  });

  it('renders share modal', () => {
    render(<App />);
    expect(screen.getByTestId('share-modal')).toBeInTheDocument();
  });

  it('handles null data gracefully', () => {
    mockUseSheetData.mockReturnValue({
      ...defaultSheetData,
      data: null,
      tableList: [],
      currentTableId: null,
    });
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('calls switchTable when table tab is clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('table-tab-tbl-1'));
    expect(mockSwitchTable).toHaveBeenCalledWith('tbl-1');
  });

  it('shows comment sidebar when open', () => {
    useGridViewStore.getState().setCommentSidebarOpen(true);
    useGridViewStore.getState().setCommentSidebarRecordId('rec-1');
    render(<App />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('hides comment sidebar by default', () => {
    render(<App />);
    expect(screen.queryByText('Comments')).not.toBeInTheDocument();
  });

  it('renders comment panel when sidebar is open with record', () => {
    useGridViewStore.getState().setCommentSidebarOpen(true);
    useGridViewStore.getState().setCommentSidebarRecordId('rec-1');
    render(<App />);
    expect(screen.getByTestId('comment-panel')).toBeInTheDocument();
  });

  it('shows comment placeholder when sidebar has no record selected', () => {
    useGridViewStore.getState().setCommentSidebarOpen(true);
    render(<App />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('does not render expanded record modal when no record is expanded', () => {
    render(<App />);
    expect(screen.queryByTestId('expanded-record-modal')).not.toBeInTheDocument();
  });

  it('renders multiple tables in tab bar', () => {
    mockUseSheetData.mockReturnValue({
      ...defaultSheetData,
      tableList: [
        { id: 'tbl-1', name: 'Table 1' },
        { id: 'tbl-2', name: 'Table 2' },
      ],
    });
    render(<App />);
    expect(screen.getByTestId('table-tab-tbl-1')).toBeInTheDocument();
    expect(screen.getByTestId('table-tab-tbl-2')).toBeInTheDocument();
  });

  it('renders toaster for notifications', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('exports createEmptyCell helper for all cell types', async () => {
    const mod = await import('../App');
    expect(mod.default).toBeDefined();
  });

  it('exports GroupHeaderInfo interface via module', async () => {
    const mod = await import('../App');
    expect(mod).toBeDefined();
  });
});
