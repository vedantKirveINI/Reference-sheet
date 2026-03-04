import { useRef, useState, useEffect, useCallback } from 'react';
import type { IDateTimeCell } from '@/types/cell';

interface DateTimeEditorProps {
  cell: IDateTimeCell;
  rect: { x: number; y: number; width: number; height: number };
  onCommit: (value: string | null) => void;
  onCancel: () => void;
  onCommitAndNavigate?: (value: string | null, direction: 'down' | 'up' | 'right' | 'left') => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function isoToLocalDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isoToLocalTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

  const [datePart, setDatePart] = useState<string>(() =>
    storedISO ? isoToLocalDate(storedISO) : ''
  );
  const [timePart, setTimePart] = useState<string>(() =>
    storedISO ? isoToLocalTime(storedISO) : ''
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const buildValue = useCallback((): string | null => {
    if (!datePart) return null;
    if (includeTime) {
      return buildISOFromLocalParts(datePart, timePart);
    }
    const existingTime = storedISO ? isoToLocalTime(storedISO) : '00:00';
    return buildISOFromLocalParts(datePart, existingTime);
  }, [datePart, timePart, includeTime, storedISO]);

  const handleCommit = useCallback(() => {
    onCommit(buildValue());
  }, [buildValue, onCommit]);

  const handleClear = useCallback(() => {
    onCommit(null);
  }, [onCommit]);

  const handleCommitRef = useRef(handleCommit);
  useEffect(() => { handleCommitRef.current = handleCommit; }, [handleCommit]);

  useEffect(() => {
    dateInputRef.current?.focus();
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

  return (
    <div
      ref={containerRef}
      className="bg-background border border-border rounded-lg shadow-lg p-3 flex flex-col gap-2"
      style={{ minWidth: Math.max(rect.width, 220) }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Date</label>
        <input
          ref={dateInputRef}
          type="date"
          className="w-full bg-background text-foreground text-sm px-2 py-1.5 outline-none border border-border rounded-md focus:border-ring"
          value={datePart}
          onChange={(e) => setDatePart(e.target.value)}
        />
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
