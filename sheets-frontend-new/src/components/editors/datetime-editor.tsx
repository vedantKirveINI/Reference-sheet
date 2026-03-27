import { useRef, useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import type { IDateTimeCell } from '@/types/cell';

dayjs.extend(customParseFormat);

interface DateTimeEditorProps {
  cell: IDateTimeCell;
  rect: { x: number; y: number; width: number; height: number };
  onCommit: (value: string | null) => void;
  onCancel: () => void;
  onCommitAndNavigate?: (value: string | null, direction: 'down' | 'up' | 'right' | 'left') => void;
}

const DATE_FORMAT_LABELS: Record<string, string> = {
  DDMMYYYY: 'DD/MM/YYYY',
  MMDDYYYY: 'MM/DD/YYYY',
  YYYYMMDD: 'YYYY/MM/DD',
};

const DAYJS_FORMATS: Record<string, string> = {
  DDMMYYYY: 'DD/MM/YYYY',
  MMDDYYYY: 'MM/DD/YYYY',
  YYYYMMDD: 'YYYY/MM/DD',
};

const pad = (n: number) => String(n).padStart(2, '0');

function isoToLocalTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isoToFormattedDate(iso: string, dateFormat: string): string {
  const parsed = dayjs(iso);
  if (!parsed.isValid()) return '';
  const fmt = DAYJS_FORMATS[dateFormat] ?? DAYJS_FORMATS.DDMMYYYY;
  return parsed.format(fmt);
}

function formattedDateToISO(text: string, dateFormat: string): string | null {
  const fmt = DAYJS_FORMATS[dateFormat] ?? DAYJS_FORMATS.DDMMYYYY;
  const parsed = dayjs(text, fmt, true);
  if (!parsed.isValid()) return null;
  return parsed.format('YYYY-MM-DD');
}

function buildISOFromLocalParts(datePart: string, timePart: string): string | null {
  if (!datePart) return null;
  const combined = timePart ? `${datePart}T${timePart}` : `${datePart}T00:00`;
  const d = new Date(combined);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function DateTimeEditor({ cell, rect, onCommit, onCancel, onCommitAndNavigate }: DateTimeEditorProps) {
  const storedISO = (cell.data as string) ?? null;
  const options = (cell as IDateTimeCell).options ?? {};
  const includeTime = options.includeTime ?? false;
  const dateFormat = options.dateFormat ?? 'DDMMYYYY';
  const formatLabel = DATE_FORMAT_LABELS[dateFormat] ?? DATE_FORMAT_LABELS.DDMMYYYY;

  const [dateText, setDateTextRaw] = useState<string>(() =>
    storedISO ? isoToFormattedDate(storedISO, dateFormat) : ''
  );

  const handleDateTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const prev = dateText;
    let next = input.value;

    // Only auto-insert slash when the user is typing forward (not deleting)
    if (next.length > prev.length) {
      // Strip all non-digit, non-slash characters
      const digitsOnly = next.replace(/[^\d]/g, '');

      // Determine slash positions based on format
      // DDMMYYYY -> DD/MM/YYYY -> slash after digit 2 and digit 4
      // MMDDYYYY -> MM/DD/YYYY -> slash after digit 2 and digit 4
      // YYYYMMDD -> YYYY/MM/DD -> slash after digit 4 and digit 6
      const slashAfter = dateFormat === 'YYYYMMDD' ? [4, 6] : [2, 4];

      let formatted = '';
      let digitIndex = 0;
      for (let i = 0; i < digitsOnly.length && digitIndex < 8; i++) {
        if (slashAfter.includes(digitIndex)) {
          formatted += '/';
        }
        formatted += digitsOnly[i];
        digitIndex++;
      }
      next = formatted;
    }

    setDateTextRaw(next);
  }, [dateText, dateFormat]);
  const [timePart, setTimePart] = useState<string>(() =>
    storedISO ? isoToLocalTime(storedISO) : ''
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const calendarInputRef = useRef<HTMLInputElement>(null);

  const getISODate = useCallback((): string | null => {
    if (!dateText) return null;
    return formattedDateToISO(dateText, dateFormat);
  }, [dateText, dateFormat]);

  const buildValue = useCallback((): string | null => {
    const isoDate = getISODate();
    if (!isoDate) return null;
    if (includeTime) {
      return buildISOFromLocalParts(isoDate, timePart);
    }
    const existingTime = storedISO ? isoToLocalTime(storedISO) : '00:00';
    return buildISOFromLocalParts(isoDate, existingTime);
  }, [getISODate, timePart, includeTime, storedISO]);

  const handleCommit = useCallback(() => {
    onCommit(buildValue());
  }, [buildValue, onCommit]);

  const handleClear = useCallback(() => {
    onCommit(null);
  }, [onCommit]);

  const handleCommitRef = useRef(handleCommit);
  useEffect(() => { handleCommitRef.current = handleCommit; }, [handleCommit]);

  useEffect(() => {
    textInputRef.current?.focus();
    textInputRef.current?.select();
  }, []);

  useEffect(() => {
    const handleOutsideMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleCommitRef.current();
      }
    };
    document.addEventListener('mousedown', handleOutsideMouseDown);
    return () => document.removeEventListener('mousedown', handleOutsideMouseDown);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const val = buildValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'up' : 'down');
      } else {
        onCommit(val);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = buildValue();
      if (onCommitAndNavigate) {
        onCommitAndNavigate(val, e.shiftKey ? 'left' : 'right');
      } else {
        onCommit(val);
      }
    }
  }, [buildValue, onCommit, onCommitAndNavigate, onCancel]);

  const handleCalendarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value;
    if (!isoVal) return;
    const formatted = isoToFormattedDate(isoVal, dateFormat);
    if (formatted) {
      setDateTextRaw(formatted);
    }
  }, [dateFormat]);

  const openCalendar = useCallback(() => {
    calendarInputRef.current?.showPicker();
  }, []);

  const calendarValue = getISODate() ?? '';

  return (
    <div
      ref={containerRef}
      className="bg-background border border-border rounded-lg shadow-lg p-3 flex flex-col gap-2"
      style={{ minWidth: Math.max(rect.width, 220) }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="relative flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Date</label>
        <div className="flex items-center gap-1">
          <input
            ref={textInputRef}
            type="text"
            placeholder={formatLabel}
            className="flex-1 bg-background text-foreground text-sm px-2 py-1.5 outline-none border border-border rounded-md focus:border-ring"
            value={dateText}
            onChange={handleDateTextChange}
            maxLength={10}
          />
          <button
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted"
            onMouseDown={(e) => { e.preventDefault(); openCalendar(); }}
            title="Open calendar"
          >
            <Calendar size={14} />
          </button>
        </div>
        <div className="relative" style={{ width: 0, height: 0, overflow: 'visible' }}>
          <input
            ref={calendarInputRef}
            type="date"
            style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
            tabIndex={-1}
            value={calendarValue}
            onChange={handleCalendarChange}
          />
        </div>
      </div>

      {includeTime && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Time</label>
          <input
            type="time"
            className="w-full bg-background text-foreground text-sm px-2 py-1.5 outline-none border border-border rounded-md focus:border-ring"
            value={timePart}
            onChange={(e) => setTimePart(e.target.value)}
          />
        </div>
      )}

      <div className="flex gap-2 justify-between pt-1">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
          onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
        >
          Clear
        </button>
        <button
          type="button"
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90"
          onMouseDown={(e) => { e.preventDefault(); handleCommit(); }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
