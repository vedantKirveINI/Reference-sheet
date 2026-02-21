export const GRID_THEME = {
  headerHeight: 34,
  rowHeaderWidth: 60,
  defaultRowHeight: 32,
  appendRowHeight: 32,
  appendColumnWidth: 44,
  resizeHandleWidth: 4,
  minColumnWidth: 50,

  bgColor: '#ffffff',
  cellBorderColor: '#e5e7eb',
  headerBgColor: '#f9fafb',
  headerBorderColor: '#e5e7eb',
  headerTextColor: '#374151',
  cellTextColor: '#111827',
  cellTextSecondary: '#6b7280',
  rowNumberColor: '#9ca3af',

  activeCellBorderColor: '#39A380',
  activeCellBorderWidth: 2,
  selectedRowBg: '#f0fdf4',
  hoverRowBg: 'rgba(57, 163, 128, 0.04)',

  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 13,
  headerFontSize: 13,
  headerFontWeight: '500',
  cellPaddingX: 12,
  cellPaddingY: 6,

  chipColors: [
    { bg: '#dbeafe', text: '#1d4ed8' },
    { bg: '#dcfce7', text: '#15803d' },
    { bg: '#fef3c7', text: '#b45309' },
    { bg: '#f3e8ff', text: '#7e22ce' },
    { bg: '#fce7f3', text: '#be185d' },
    { bg: '#cffafe', text: '#0e7490' },
    { bg: '#ffedd5', text: '#c2410c' },
    { bg: '#ffe4e6', text: '#be123c' },
    { bg: '#ccfbf1', text: '#0f766e' },
    { bg: '#e0e7ff', text: '#4338ca' },
  ],
};

export type GridTheme = typeof GRID_THEME;
