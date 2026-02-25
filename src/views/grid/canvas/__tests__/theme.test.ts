import { describe, it, expect } from 'vitest';
import { GRID_THEME, GRID_THEME_DARK, type GridTheme } from '../theme';

describe('GRID_THEME (light)', () => {
  it('exports expected layout dimensions', () => {
    expect(GRID_THEME.headerHeight).toBe(34);
    expect(GRID_THEME.rowHeaderWidth).toBe(60);
    expect(GRID_THEME.defaultRowHeight).toBe(32);
    expect(GRID_THEME.appendRowHeight).toBe(32);
    expect(GRID_THEME.appendColumnWidth).toBe(44);
    expect(GRID_THEME.resizeHandleWidth).toBe(4);
    expect(GRID_THEME.minColumnWidth).toBe(50);
  });

  it('exports color tokens', () => {
    expect(GRID_THEME.bgColor).toBe('#ffffff');
    expect(GRID_THEME.cellBorderColor).toBe('#e5e7eb');
    expect(GRID_THEME.headerBgColor).toBe('#f9fafb');
    expect(GRID_THEME.headerTextColor).toBe('#374151');
    expect(GRID_THEME.cellTextColor).toBe('#111827');
    expect(GRID_THEME.cellTextSecondary).toBe('#6b7280');
    expect(GRID_THEME.rowNumberColor).toBe('#9ca3af');
    expect(GRID_THEME.activeCellBorderColor).toBe('#39A380');
  });

  it('exports typography settings', () => {
    expect(GRID_THEME.fontSize).toBe(13);
    expect(GRID_THEME.headerFontSize).toBe(13);
    expect(GRID_THEME.headerFontWeight).toBe('500');
    expect(typeof GRID_THEME.fontFamily).toBe('string');
  });

  it('exports cell padding', () => {
    expect(GRID_THEME.cellPaddingX).toBe(12);
    expect(GRID_THEME.cellPaddingY).toBe(6);
  });

  it('exports chip colors array with 10 entries', () => {
    expect(GRID_THEME.chipColors).toHaveLength(10);
    GRID_THEME.chipColors.forEach(chip => {
      expect(chip).toHaveProperty('bg');
      expect(chip).toHaveProperty('text');
      expect(chip.bg).toMatch(/^#/);
      expect(chip.text).toMatch(/^#/);
    });
  });

  it('exports selection/hover colors', () => {
    expect(GRID_THEME.selectedRowBg).toBe('#f0fdf4');
    expect(typeof GRID_THEME.hoverRowBg).toBe('string');
    expect(GRID_THEME.activeCellBorderWidth).toBe(2);
  });
});

describe('GRID_THEME_DARK', () => {
  it('overrides background for dark mode', () => {
    expect(GRID_THEME_DARK.bgColor).toBe('#09090b');
    expect(GRID_THEME_DARK.bgColor).not.toBe(GRID_THEME.bgColor);
  });

  it('overrides cell text colors for dark mode', () => {
    expect(GRID_THEME_DARK.cellTextColor).toBe('#fafafa');
    expect(GRID_THEME_DARK.cellTextSecondary).toBe('#a1a1aa');
  });

  it('overrides header colors for dark mode', () => {
    expect(GRID_THEME_DARK.headerBgColor).toBe('#0f0f11');
    expect(GRID_THEME_DARK.headerTextColor).toBe('#d4d4d8');
  });

  it('preserves same layout dimensions as light theme', () => {
    expect(GRID_THEME_DARK.headerHeight).toBe(GRID_THEME.headerHeight);
    expect(GRID_THEME_DARK.rowHeaderWidth).toBe(GRID_THEME.rowHeaderWidth);
    expect(GRID_THEME_DARK.defaultRowHeight).toBe(GRID_THEME.defaultRowHeight);
    expect(GRID_THEME_DARK.minColumnWidth).toBe(GRID_THEME.minColumnWidth);
    expect(GRID_THEME_DARK.fontSize).toBe(GRID_THEME.fontSize);
    expect(GRID_THEME_DARK.cellPaddingX).toBe(GRID_THEME.cellPaddingX);
  });

  it('has 10 dark chip colors', () => {
    expect(GRID_THEME_DARK.chipColors).toHaveLength(10);
  });

  it('keeps same active cell border color', () => {
    expect(GRID_THEME_DARK.activeCellBorderColor).toBe('#39A380');
  });
});

describe('GridTheme type', () => {
  it('both themes satisfy the GridTheme type', () => {
    const lightTheme: GridTheme = GRID_THEME;
    const darkTheme: GridTheme = GRID_THEME_DARK;
    expect(lightTheme).toBeDefined();
    expect(darkTheme).toBeDefined();
  });
});
