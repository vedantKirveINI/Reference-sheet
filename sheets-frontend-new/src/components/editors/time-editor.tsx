import { useRef, useState, useEffect, useCallback } from 'react';
import type { ITimeCell, ITimeData } from '@/types/cell';

interface TimeEditorProps {
  cell: ITimeCell;
  rect: { x: number; y: number; width: number; height: number };
  onCommit: (value: ITimeData | null) => void;
  onCancel: () => void;
  onCommitAndNavigate?: (value: ITimeData | null, direction: 'down' | 'up' | 'right' | 'left') => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

// Validation regexes matching the reference sheets implementation
const time12HourRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])$/;
const time24HourRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

function isValidTime(time: string, isTwentyFourHour: boolean): boolean {
  if (!time) return true;
  return isTwentyFourHour ? time24HourRegex.test(time) : time12HourRegex.test(time);
}

function getLegacyTimeZoneShort(): string {
  const date = new Date();
  const timeWithZone = date.toLocaleString('en-US', { timeZoneName: 'short' });
  const parts = timeWithZone.split(' ');
  return parts[parts.length - 1] || '';
}

function hours24to12(h: number): { hours12: number; meridiem: 'AM' | 'PM' } {
  if (h === 0) return { hours12: 12, meridiem: 'AM' };
  if (h < 12) return { hours12: h, meridiem: 'AM' };
  if (h === 12) return { hours12: 12, meridiem: 'PM' };
  return { hours12: h - 12, meridiem: 'PM' };
}

function hours12to24(h: number, meridiem: 'AM' | 'PM'): number {
  if (meridiem === 'AM') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

function iso24hrTime(isoValue: string): string {
  const d = new Date(isoValue);
  if (isNaN(d.getTime())) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Formats raw digit input into a masked time string (HH:MM).
 * Auto-inserts colon after the first two digits — user never types it.
 */
function formatTimeInput(digits: string): string {
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

/**
 * Extracts only digits from a time string (strips the colon).
 */
function extractDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function TimeEditor({ cell, rect, onCommit, onCancel, onCommitAndNavigate }: TimeEditorProps) {
  const options = cell.options ?? { isTwentyFourHour: false };
  const isTwentyFourHour = options.isTwentyFourHour ?? false;
  const existingData = cell.data as ITimeData | null;

  // Derive initial display time and meridiem from existing cell data
  const { initialTime, initialMeridiem } = (() => {
    if (!existingData) return { initialTime: '', initialMeridiem: 'AM' as const };

    let time24 = '';
    if (existingData.ISOValue) {
      time24 = iso24hrTime(existingData.ISOValue);
    } else if (existingData.time) {
      if (existingData.meridiem) {
        const parts = existingData.time.split(':');
        if (parts.length === 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m)) {
            const h24 = hours12to24(h, existingData.meridiem as 'AM' | 'PM');
            time24 = `${pad(h24)}:${pad(m)}`;
          }
        }
      } else {
        time24 = existingData.time;
      }
    }

    let mer: 'AM' | 'PM' = 'AM';
    if (existingData.meridiem === 'PM') mer = 'PM';
    else if (existingData.meridiem === 'AM') mer = 'AM';
    else if (time24) {
      const h = parseInt(time24.split(':')[0], 10);
      mer = h >= 12 ? 'PM' : 'AM';
    }

    // Convert to display format
    if (isTwentyFourHour) {
      return { initialTime: time24, initialMeridiem: mer };
    } else if (time24) {
      const parts = time24.split(':');
      const h24 = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h24) && !isNaN(m)) {
        const { hours12 } = hours24to12(h24);
        return { initialTime: `${pad(hours12)}:${pad(m)}`, initialMeridiem: mer };
      }
    }
    return { initialTime: '', initialMeridiem: mer };
  })();

  // `time` stores the display value in HH:MM format (12h or 24h depending on mode)
  const [time, setTime] = useState<string>(initialTime);
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>(initialMeridiem);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMeridiemToggle = useCallback((newMeridiem: 'AM' | 'PM') => {
    setMeridiem(newMeridiem);
  }, []);

  const buildValue = useCallback((): ITimeData | null => {
    if (!time || !isValidTime(time, isTwentyFourHour)) return null;

    const parts = time.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;

    let hours24: number;
    let displayTime: string;
    let displayMeridiem: string;

    if (isTwentyFourHour) {
      hours24 = h;
      displayTime = `${pad(h)}:${pad(m)}`;
      displayMeridiem = '';
    } else {
      hours24 = hours12to24(h, meridiem);
      displayTime = `${h}:${pad(m)}`;
      displayMeridiem = meridiem;
    }

    const isoDate = new Date();
    isoDate.setHours(hours24, m, 0, 0);

    return {
      time: displayTime,
      meridiem: displayMeridiem,
      ISOValue: isoDate.toISOString(),
      timeZone: getLegacyTimeZoneShort(),
    };
  }, [time, meridiem, isTwentyFourHour]);

  const handleCommit = useCallback(() => {
    onCommit(buildValue());
  }, [buildValue, onCommit]);

  const handleClear = useCallback(() => {
    onCommit(null);
  }, [onCommit]);

  // Stable ref for outside-click handler
  const handleCommitRef = useRef(handleCommit);
  useEffect(() => { handleCommitRef.current = handleCommit; }, [handleCommit]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  // Outside click commits
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

  /**
   * Masked input handler — auto-inserts colon after 2 digits.
   * User types only digits; the colon appears automatically.
   * Validation enforces 12h (01-12) or 24h (00-23) for hours, 00-59 for minutes.
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = extractDigits(rawValue);

    // Cap at 4 digits (HHMM)
    if (digits.length > 4) return;

    const formatted = formatTimeInput(digits);
    setTime(formatted);
  }, []);

  /**
   * Handle backspace to remove colon seamlessly — when cursor is right after
   * the colon, backspace removes the last hour digit instead of getting stuck.
   */
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const input = e.currentTarget;
      const cursorPos = input.selectionStart ?? 0;
      const selEnd = input.selectionEnd ?? 0;

      // If cursor is right after colon (position 3) with no selection, skip the colon
      if (cursorPos === 3 && selEnd === 3) {
        e.preventDefault();
        const digits = extractDigits(time);
        // Remove the 2nd hour digit (last digit before colon)
        const newDigits = digits.slice(0, 1) + digits.slice(2);
        const formatted = formatTimeInput(newDigits);
        setTime(formatted);
        // Position cursor before where the colon was
        requestAnimationFrame(() => {
          input.setSelectionRange(1, 1);
        });
      }
    }
  }, [time]);

  const isComplete = isValidTime(time, isTwentyFourHour);

  return (
    <div
      ref={containerRef}
      className="bg-background border border-border rounded-xl shadow-lg p-3 flex flex-col gap-3"
      style={{ minWidth: Math.max(rect.width, 220) }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Time input island */}
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center rounded-lg border px-3 py-2 flex-1 transition-colors ${
            isComplete
              ? 'border-border focus-within:border-ring'
              : time.length > 0
                ? 'border-destructive/50 focus-within:border-destructive'
                : 'border-border focus-within:border-ring'
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            placeholder={isTwentyFourHour ? 'HH:MM' : 'HH:MM'}
            className="w-full bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground/50"
            value={time}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        {/* AM/PM toggle — only in 12-hour mode */}
        {!isTwentyFourHour && (
          <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
            <button
              type="button"
              className={`px-2.5 py-2 text-xs font-medium transition-colors ${
                meridiem === 'AM'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMeridiemToggle('AM');
              }}
            >
              AM
            </button>
            <button
              type="button"
              className={`px-2.5 py-2 text-xs font-medium transition-colors border-l border-border ${
                meridiem === 'PM'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMeridiemToggle('PM');
              }}
            >
              PM
            </button>
          </div>
        )}
      </div>

      {/* Action buttons island */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleClear(); }}
        >
          Clear
        </button>
        <div className="flex gap-1.5">
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const now = new Date();
              if (isTwentyFourHour) {
                setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
              } else {
                const { hours12, meridiem: nowMeridiem } = hours24to12(now.getHours());
                setTime(`${pad(hours12)}:${pad(now.getMinutes())}`);
                setMeridiem(nowMeridiem);
              }
            }}
          >
            Now
          </button>
          <button
            type="button"
            className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90 transition-opacity"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleCommit(); }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
