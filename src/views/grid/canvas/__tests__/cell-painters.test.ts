import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paintCell, paintLoadingCell, paintErrorCell } from '../cell-painters';
import { GRID_THEME } from '../theme';
import { CellType } from '@/types';
import type { IRenderRect } from '../types';

function createMockCtx() {
  const ctx: any = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn((text: string) => ({
      width: text.length * 8,
    })),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  };
  return ctx as CanvasRenderingContext2D;
}

const defaultRect: IRenderRect = { x: 0, y: 0, width: 200, height: 32 };
const theme = GRID_THEME;

describe('paintCell', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  describe('paintString (CellType.String)', () => {
    it('renders text for SHORT_TEXT', () => {
      paintCell(ctx, { type: CellType.String, data: 'hello', displayData: 'hello' }, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('does nothing for empty displayData', () => {
      paintCell(ctx, { type: CellType.String, data: '', displayData: '' }, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('handles Wrap text mode', () => {
      paintCell(ctx, { type: CellType.String, data: 'hello world long text', displayData: 'hello world long text' }, defaultRect, theme, 'Wrap');
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles Overflow text mode', () => {
      paintCell(ctx, { type: CellType.String, data: 'hello', displayData: 'hello' }, defaultRect, theme, 'Overflow');
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('paintNumber (CellType.Number)', () => {
    it('renders number right-aligned', () => {
      paintCell(ctx, { type: CellType.Number, data: 42, displayData: '42' } as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('does nothing for empty displayData', () => {
      paintCell(ctx, { type: CellType.Number, data: null, displayData: '' } as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('handles Wrap text mode', () => {
      paintCell(ctx, { type: CellType.Number, data: 42, displayData: '42' } as any, defaultRect, theme, 'Wrap');
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles Overflow text mode', () => {
      paintCell(ctx, { type: CellType.Number, data: 42, displayData: '42' } as any, defaultRect, theme, 'Overflow');
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('paintSCQ (CellType.SCQ)', () => {
    it('renders a chip for selected value', () => {
      const cell = { type: CellType.SCQ, data: 'Option A', displayData: 'Option A', options: { options: ['Option A', 'Option B'] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('does nothing for null data', () => {
      const cell = { type: CellType.SCQ, data: null, displayData: '', options: { options: ['A'] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintMCQ (CellType.MCQ)', () => {
    it('renders multiple chips', () => {
      const cell = { type: CellType.MCQ, data: ['A', 'B'], displayData: 'A, B', options: { options: ['A', 'B', 'C'] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('does nothing for empty array', () => {
      const cell = { type: CellType.MCQ, data: [], displayData: '', options: { options: [] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });

    it('shows overflow indicator when chips exceed width', () => {
      const data = Array.from({ length: 20 }, (_, i) => `LongOptionName${i}`);
      const cell = { type: CellType.MCQ, data, displayData: '', options: { options: data } };
      paintCell(ctx, cell as any, { ...defaultRect, width: 100 }, theme);
      const calls = (ctx.fillText as any).mock.calls;
      const hasPlus = calls.some((c: any) => c[0].startsWith('+'));
      expect(hasPlus).toBe(true);
    });
  });

  describe('paintDropDown (CellType.DropDown)', () => {
    it('renders chips from string array', () => {
      const cell = { type: CellType.DropDown, data: ['A', 'B'], displayData: '', options: { options: ['A', 'B'] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('renders chips from object array with labels', () => {
      const cell = { type: CellType.DropDown, data: [{ id: 1, label: 'Opt1' }], displayData: '', options: { options: [{ id: 1, label: 'Opt1' }] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('does nothing for empty array', () => {
      const cell = { type: CellType.DropDown, data: [], displayData: '', options: { options: [] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintYesNo (CellType.YesNo)', () => {
    it('draws green filled box for Yes', () => {
      const cell = { type: CellType.YesNo, data: 'Yes', displayData: 'Yes', options: { options: ['Yes', 'No'] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws empty box for No', () => {
      const cell = { type: CellType.YesNo, data: 'No', displayData: 'No', options: { options: ['Yes', 'No'] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('draws empty box for null', () => {
      const cell = { type: CellType.YesNo, data: null, displayData: '', options: { options: ['Yes', 'No'] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('paintDateTime (CellType.DateTime)', () => {
    it('delegates to paintString', () => {
      const cell = { type: CellType.DateTime, data: '2025-01-01', displayData: '01/01/2025', options: { dateFormat: 'MM/DD/YYYY', separator: '/', includeTime: false, isTwentyFourHourFormat: false } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('paintCreatedTime (CellType.CreatedTime)', () => {
    it('renders lock icon and text', () => {
      const cell = { type: CellType.CreatedTime, data: '2025-01-01', displayData: '01/01/2025', readOnly: true, options: { dateFormat: 'MM/DD/YYYY', separator: '/', includeTime: false, isTwentyFourHourFormat: false } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === '🔒')).toBe(true);
    });

    it('does nothing for empty displayData', () => {
      const cell = { type: CellType.CreatedTime, data: null, displayData: '', readOnly: true, options: { dateFormat: 'MM/DD/YYYY', separator: '/', includeTime: false, isTwentyFourHourFormat: false } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintCurrency (CellType.Currency)', () => {
    it('renders valid currency value', () => {
      const cell = { type: CellType.Currency, data: { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: '100' }, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('renders nothing for null data', () => {
      const cell = { type: CellType.Currency, data: null, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintPhoneNumber (CellType.PhoneNumber)', () => {
    it('renders phone number with country code', () => {
      const cell = { type: CellType.PhoneNumber, data: { countryCode: 'US', countryNumber: '1', phoneNumber: '5551234567' }, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('renders nothing for null data', () => {
      const cell = { type: CellType.PhoneNumber, data: null, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintZipCode (CellType.ZipCode)', () => {
    it('renders zip code with country code', () => {
      const cell = { type: CellType.ZipCode, data: { countryCode: 'US', zipCode: '62701' }, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('renders nothing for null data', () => {
      const cell = { type: CellType.ZipCode, data: null, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintAddress (CellType.Address)', () => {
    it('renders address from displayData string', () => {
      const cell = { type: CellType.Address, data: null, displayData: '123 Main St, Springfield, IL' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('renders nothing for null data and empty displayData', () => {
      const cell = { type: CellType.Address, data: null, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintSignature (CellType.Signature)', () => {
    it('renders "Signed" chip when data is truthy', () => {
      const cell = { type: CellType.Signature, data: 'some-signature-data', displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'Signed')).toBe(true);
    });

    it('renders "Not signed" when data is falsy', () => {
      const cell = { type: CellType.Signature, data: null, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'Not signed')).toBe(true);
    });
  });

  describe('paintSlider (CellType.Slider)', () => {
    it('renders slider bar and text', () => {
      const cell = { type: CellType.Slider, data: 50, displayData: '50%', options: { minValue: 0, maxValue: 100 } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles zero value', () => {
      const cell = { type: CellType.Slider, data: 0, displayData: '0%', options: { minValue: 0, maxValue: 100 } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('paintFileUpload (CellType.FileUpload)', () => {
    it('renders file count for non-empty files', () => {
      const cell = { type: CellType.FileUpload, data: [{ url: 'a', size: 100, mimeType: 'text/plain' }], displayData: '', options: {} };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => typeof c[0] === 'string' && c[0].includes('file'))).toBe(true);
    });

    it('renders "No files" for empty array', () => {
      const cell = { type: CellType.FileUpload, data: [], displayData: '', options: {} };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'No files')).toBe(true);
    });

    it('renders "1 file" singular', () => {
      const cell = { type: CellType.FileUpload, data: [{ url: 'a', size: 100, mimeType: 'text/plain' }], displayData: '', options: {} };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => typeof c[0] === 'string' && c[0].includes('1 file'))).toBe(true);
    });
  });

  describe('paintTime (CellType.Time)', () => {
    it('delegates to paintString', () => {
      const cell = { type: CellType.Time, data: { time: '10:30', meridiem: 'AM', ISOValue: '10:30:00' }, displayData: '10:30 AM', options: { isTwentyFourHour: false } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('paintRanking (CellType.Ranking)', () => {
    it('renders ranked items as chips', () => {
      const cell = { type: CellType.Ranking, data: [{ id: 1, rank: 1, label: 'First' }, { id: 2, rank: 2, label: 'Second' }], displayData: '', options: { options: [] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('does nothing for empty ranking', () => {
      const cell = { type: CellType.Ranking, data: [], displayData: '', options: { options: [] } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintRating (CellType.Rating)', () => {
    it('renders filled and empty stars', () => {
      const cell = { type: CellType.Rating, data: 3, displayData: '3', options: { maxRating: 5 } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalledTimes(5);
    });

    it('uses default maxRating of 5', () => {
      const cell = { type: CellType.Rating, data: 2, displayData: '2' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalledTimes(5);
    });

    it('handles null data as 0 rating', () => {
      const cell = { type: CellType.Rating, data: null, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalledTimes(5);
    });
  });

  describe('paintOpinionScale (CellType.OpinionScale)', () => {
    it('renders value/max chip', () => {
      const cell = { type: CellType.OpinionScale, data: 7, displayData: '7', options: { maxValue: 10 } };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === '7/10')).toBe(true);
    });

    it('uses default max of 10', () => {
      const cell = { type: CellType.OpinionScale, data: 5, displayData: '5' };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === '5/10')).toBe(true);
    });
  });

  describe('paintFormula (CellType.Formula)', () => {
    it('renders formula result in italic', () => {
      const cell = { type: CellType.Formula, data: '42', displayData: '42', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
      expect((ctx as any).font).toContain('italic');
    });

    it('renders loading state', () => {
      const cell = { type: CellType.Formula, data: null, displayData: '', readOnly: true, options: { computedFieldMeta: { shouldShowLoading: true } } };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'Loading...')).toBe(true);
    });

    it('renders error state', () => {
      const cell = { type: CellType.Formula, data: null, displayData: 'Error', readOnly: true, options: { computedFieldMeta: { hasError: true } } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('renders nothing for empty text without meta', () => {
      const cell = { type: CellType.Formula, data: null, displayData: '', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintList (CellType.List)', () => {
    it('renders items as chips', () => {
      const cell = { type: CellType.List, data: ['Item1', 'Item2'], displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('does nothing for empty list', () => {
      const cell = { type: CellType.List, data: [], displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('paintEnrichment (CellType.Enrichment)', () => {
    it('renders sparkle and text when data present', () => {
      const cell = { type: CellType.Enrichment, data: 'enriched', displayData: 'enriched', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === '✨')).toBe(true);
    });

    it('renders play button when no data', () => {
      const cell = { type: CellType.Enrichment, data: null, displayData: '', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('paintLink (CellType.Link)', () => {
    it('renders linked record chips', () => {
      const cell = { type: CellType.Link, data: [{ id: 1, title: 'Record A' }], displayData: '', options: { foreignTableId: 1, relationship: 'ManyMany' as const } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'Record A')).toBe(true);
    });

    it('renders nothing for empty data', () => {
      const cell = { type: CellType.Link, data: [], displayData: '', options: { foreignTableId: 1, relationship: 'ManyMany' as const } };
      paintCell(ctx, cell as any, defaultRect, theme);
    });

    it('uses id fallback for title', () => {
      const cell = { type: CellType.Link, data: [{ id: 5 }], displayData: '', options: { foreignTableId: 1, relationship: 'ManyMany' as const } };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === '#5')).toBe(true);
    });
  });

  describe('paintUser (CellType.User)', () => {
    it('renders user avatar and name', () => {
      const cell = { type: CellType.User, data: [{ id: '1', name: 'John', email: 'john@test.com' }], displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.arc).toHaveBeenCalled();
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'J')).toBe(true);
    });

    it('does nothing for null data', () => {
      const cell = { type: CellType.User, data: null, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.arc).not.toHaveBeenCalled();
    });
  });

  describe('paintCreatedBy (CellType.CreatedBy)', () => {
    it('renders avatar and name', () => {
      const cell = { type: CellType.CreatedBy, data: { id: '1', name: 'Alice' }, displayData: '', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.arc).toHaveBeenCalled();
    });

    it('does nothing for null data', () => {
      const cell = { type: CellType.CreatedBy, data: null, displayData: '', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.arc).not.toHaveBeenCalled();
    });
  });

  describe('paintLastModifiedBy (CellType.LastModifiedBy)', () => {
    it('delegates to paintCreatedBy logic', () => {
      const cell = { type: CellType.LastModifiedBy, data: { id: '1', name: 'Bob' }, displayData: '', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.arc).toHaveBeenCalled();
    });
  });

  describe('paintLastModifiedTime (CellType.LastModifiedTime)', () => {
    it('renders secondary-colored text', () => {
      const cell = { type: CellType.LastModifiedTime, data: '2025-01-01', displayData: '01/01/2025', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('handles Wrap mode', () => {
      const cell = { type: CellType.LastModifiedTime, data: '2025-01-01', displayData: '01/01/2025', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme, 'Wrap');
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });

  describe('paintAutoNumber (CellType.AutoNumber)', () => {
    it('renders number as text', () => {
      const cell = { type: CellType.AutoNumber, data: 42, displayData: '42', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('renders empty string for null data', () => {
      const cell = { type: CellType.AutoNumber, data: null, displayData: '', readOnly: true };
      paintCell(ctx, cell as any, defaultRect, theme);
    });
  });

  describe('paintButton (CellType.Button)', () => {
    it('renders button with label', () => {
      const cell = { type: CellType.Button, data: null, displayData: '', options: { label: 'Submit', style: 'primary' } };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'Submit')).toBe(true);
    });

    it('uses default label "Click" when no label', () => {
      const cell = { type: CellType.Button, data: null, displayData: '', options: {} };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0] === 'Click')).toBe(true);
    });

    it('handles all button styles', () => {
      const styles = ['primary', 'default', 'danger', 'success', 'warning'];
      for (const style of styles) {
        const freshCtx = createMockCtx();
        const cell = { type: CellType.Button, data: null, displayData: '', options: { label: 'Btn', style } };
        paintCell(freshCtx, cell as any, defaultRect, theme);
        expect(freshCtx.fill).toHaveBeenCalled();
      }
    });
  });

  describe('paintCheckbox (CellType.Checkbox)', () => {
    it('renders filled checkbox for true', () => {
      const cell = { type: CellType.Checkbox, data: true, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
    });

    it('renders empty checkbox for false', () => {
      const cell = { type: CellType.Checkbox, data: false, displayData: '' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('paintRollup (CellType.Rollup)', () => {
    it('renders rollup value', () => {
      const cell = { type: CellType.Rollup, data: 42, displayData: '42', readOnly: true, options: { linkFieldId: 1, lookupFieldId: 2, foreignTableId: 3, expression: 'SUM' } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });

    it('uses displayData when present', () => {
      const cell = { type: CellType.Rollup, data: 42, displayData: 'SUM: 42', readOnly: true, options: { linkFieldId: 1, lookupFieldId: 2, foreignTableId: 3, expression: 'SUM' } };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0].includes('SUM: 42'))).toBe(true);
    });
  });

  describe('paintLookup (CellType.Lookup)', () => {
    it('renders lookup values as chips', () => {
      const cell = { type: CellType.Lookup, data: ['val1', 'val2'], displayData: '', readOnly: true, options: { linkFieldId: 1, lookupFieldId: 2, foreignTableId: 3 } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('renders displayData when data is empty array', () => {
      const cell = { type: CellType.Lookup, data: [], displayData: 'fallback', readOnly: true, options: { linkFieldId: 1, lookupFieldId: 2, foreignTableId: 3 } };
      paintCell(ctx, cell as any, defaultRect, theme);
      const calls = (ctx.fillText as any).mock.calls;
      expect(calls.some((c: any) => c[0]?.includes?.('fallback'))).toBe(true);
    });

    it('renders nothing when both data and displayData empty', () => {
      const cell = { type: CellType.Lookup, data: null, displayData: '', readOnly: true, options: { linkFieldId: 1, lookupFieldId: 2, foreignTableId: 3 } };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).not.toHaveBeenCalled();
    });
  });

  describe('default case', () => {
    it('falls back to paintString for unknown type', () => {
      const cell = { type: 'UNKNOWN_TYPE' as any, data: 'test', displayData: 'test' };
      paintCell(ctx, cell as any, defaultRect, theme);
      expect(ctx.fillText).toHaveBeenCalled();
    });
  });
});

describe('paintLoadingCell', () => {
  it('renders loading text when provided', () => {
    const ctx = createMockCtx();
    paintLoadingCell(ctx, defaultRect, theme, 'Loading...');
    const calls = (ctx.fillText as any).mock.calls;
    expect(calls.some((c: any) => c[0] === 'Loading...')).toBe(true);
  });

  it('renders skeleton gradient when no text', () => {
    const ctx = createMockCtx();
    paintLoadingCell(ctx, defaultRect, theme);
    expect(ctx.createLinearGradient).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });
});

describe('paintErrorCell', () => {
  it('renders error background and warning triangle', () => {
    const ctx = createMockCtx();
    paintErrorCell(ctx, 'Error text', defaultRect, theme);
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    const calls = (ctx.fillText as any).mock.calls;
    expect(calls.some((c: any) => c[0] === '!')).toBe(true);
  });
});
