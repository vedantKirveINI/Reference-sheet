import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CellEditorOverlay } from '../cell-editor-overlay';
import { CellType } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/services/api', () => ({
  getFileUploadUrl: vi.fn(),
  uploadFileToPresignedUrl: vi.fn(),
  confirmFileUpload: vi.fn(),
  updateLinkCell: vi.fn(),
  searchForeignRecords: vi.fn(),
  triggerButtonClick: vi.fn(),
}));

vi.mock('@/stores/grid-view-store', () => ({
  useGridViewStore: vi.fn(() => ({})),
}));

const defaultRect = { x: 100, y: 100, width: 200, height: 32 };

describe('CellEditorOverlay', () => {
  const onCommit = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('String editor', () => {
    it('renders text input for String type', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'hello', displayData: 'hello' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('hello');
    });

    it('commits on Enter', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'hello', displayData: 'hello' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'world' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    it('cancels on Escape', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'hello', displayData: 'hello' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(onCancel).toHaveBeenCalled();
    });

    it('commits on Tab', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'test', displayData: 'test' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Tab' });
    });

    it('uses initialCharacter when provided', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'old', displayData: 'old' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
          initialCharacter="n"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('n');
    });

    it('commits and navigates down on Enter', () => {
      const onCommitAndNavigate = vi.fn();
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'hello', displayData: 'hello' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
          onCommitAndNavigate={onCommitAndNavigate}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(onCommitAndNavigate).toHaveBeenCalledWith('hello', 'down');
    });

    it('commits and navigates up on Shift+Enter', () => {
      const onCommitAndNavigate = vi.fn();
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'hello', displayData: 'hello' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
          onCommitAndNavigate={onCommitAndNavigate}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
      expect(onCommitAndNavigate).toHaveBeenCalledWith('hello', 'up');
    });

    it('commits and navigates right on Tab', () => {
      const onCommitAndNavigate = vi.fn();
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'hello', displayData: 'hello' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
          onCommitAndNavigate={onCommitAndNavigate}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(onCommitAndNavigate).toHaveBeenCalledWith('hello', 'right');
    });

    it('commits and navigates left on Shift+Tab', () => {
      const onCommitAndNavigate = vi.fn();
      render(
        <CellEditorOverlay
          cell={{ type: CellType.String, data: 'hello', displayData: 'hello' }}
          column={{ id: 'col-1', name: 'Name', type: CellType.String, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
          onCommitAndNavigate={onCommitAndNavigate}
        />
      );
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
      expect(onCommitAndNavigate).toHaveBeenCalledWith('hello', 'left');
    });
  });

  describe('Number editor', () => {
    it('renders number input for Number type', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.Number, data: 42, displayData: '42' }}
          column={{ id: 'col-1', name: 'Count', type: CellType.Number, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveValue(42);
    });

    it('commits null for empty number', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.Number, data: 42, displayData: '42' }}
          column={{ id: 'col-1', name: 'Count', type: CellType.Number, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      expect(onCommit).toHaveBeenCalledWith(null);
    });
  });

  describe('SCQ editor', () => {
    it('renders select options for SCQ type', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.SCQ, data: 'Option A', displayData: 'Option A', options: { options: ['Option A', 'Option B', 'Option C'] } }}
          column={{ id: 'col-1', name: 'Status', type: CellType.SCQ, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
      expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('commits selected option', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.SCQ, data: null, displayData: '', options: { options: ['Yes', 'No'] } }}
          column={{ id: 'col-1', name: 'Choice', type: CellType.SCQ, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      fireEvent.click(screen.getByText('Yes'));
      expect(onCommit).toHaveBeenCalledWith('Yes');
    });
  });

  describe('DateTime editor', () => {
    it('renders datetime-local input', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.DateTime, data: '2025-01-15T10:30:00Z', displayData: '2025-01-15', options: { dateFormat: 'YYYY/MM/DD', separator: '/', includeTime: true, isTwentyFourHourFormat: true } }}
          column={{ id: 'col-1', name: 'Date', type: CellType.DateTime, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const input = document.querySelector('input[type="datetime-local"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Checkbox editor', () => {
    it('immediately commits toggled value for Checkbox type', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.Checkbox, data: false, displayData: 'false' }}
          column={{ id: 'col-1', name: 'Done', type: CellType.Checkbox, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      expect(onCommit).toHaveBeenCalledWith(true);
    });

    it('toggles true to false for Checkbox', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.Checkbox, data: true, displayData: 'true' }}
          column={{ id: 'col-1', name: 'Done', type: CellType.Checkbox, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      expect(onCommit).toHaveBeenCalledWith(false);
    });
  });

  describe('Default editor', () => {
    it('falls back to StringInput for unknown types', () => {
      render(
        <CellEditorOverlay
          cell={{ type: 'UNKNOWN_TYPE' as any, data: 'test', displayData: 'test' }}
          column={{ id: 'col-1', name: 'Unknown', type: 'UNKNOWN_TYPE' as any, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('MCQ editor', () => {
    it('renders multi-select options', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.MCQ, data: ['A'], displayData: 'A', options: { options: ['A', 'B', 'C'] } }}
          column={{ id: 'col-1', name: 'Tags', type: CellType.MCQ, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      expect(screen.getAllByText('A').length).toBeGreaterThan(0);
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  describe('Rating editor', () => {
    it('renders rating stars', () => {
      render(
        <CellEditorOverlay
          cell={{ type: CellType.Rating, data: 3, displayData: '3', options: { maxRating: 5 } }}
          column={{ id: 'col-1', name: 'Rating', type: CellType.Rating, width: 200 } as any}
          rect={defaultRect}
          onCommit={onCommit}
          onCancel={onCancel}
        />
      );
      const stars = document.querySelectorAll('button');
      expect(stars.length).toBeGreaterThan(0);
    });
  });
});
