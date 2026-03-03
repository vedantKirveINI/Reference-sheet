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

// Match legacy Time editor timezone behavior: short zone string like "IST", "PST"
function getLegacyTimeZoneShort(): string {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZoneName: 'short',
  };
  const timeWithZone = date.toLocaleString('en-US', options);
  const parts = timeWithZone.split(' ');
  return parts[parts.length - 1] || '';
}

function extractFrom24hrString(time24: string): { hours24: number; minutes: number } | null {
  const parts = time24.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return { hours24: h, minutes: m };
}

function iso24hrTime(isoValue: string): string {
  const d = new Date(isoValue);
  if (isNaN(d.getTime())) return '';
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function hours24to12(h: number): { hours12: number; meridiem: 'AM' | 'PM' } {
  if (h === 0) return { hours12: 12, meridiem: 'AM' };
  if (h < 12) return { hours12: h, meridiem: 'AM' };
  if (h === 12) return { hours12: 12, meridiem: 'PM' };
  return { hours12: h - 12, meridiem: 'PM' };
}

function hours12to24(h: number, meridiem: 'AM' | 'PM'): number {
  if (meridiem === 'AM') {
    return h === 12 ? 0 : h;
  }
  return h === 12 ? 12 : h + 12;
}

export function TimeEditor({ cell, rect, onCommit, onCancel, onCommitAndNavigate }: TimeEditorProps) {
  const options = cell.options ?? { isTwentyFourHour: false };
  const isTwentyFourHour = options.isTwentyFourHour ?? false;
  const existingData = cell.data as ITimeData | null;

  const initial24hr = (() => {
    if (!existingData) return '';
    if (existingData.ISOValue) return iso24hrTime(existingData.ISOValue);
    if (existingData.time) {
      if (existingData.meridiem) {
        const parts = existingData.time.split(':');
        if (parts.length === 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m)) {
            const h24 = hours12to24(h, existingData.meridiem as 'AM' | 'PM');
            return `${pad(h24)}:${pad(m)}`;
          }
        }
      } else {
        return existingData.time;
      }
    }
    return '';
  })();

  const initialMeridiem: 'AM' | 'PM' = (() => {
    if (!existingData) return 'AM';
    if (existingData.meridiem === 'PM') return 'PM';
    if (existingData.meridiem === 'AM') return 'AM';
    if (initial24hr) {
      const h = parseInt(initial24hr.split(':')[0], 10);
      return h >= 12 ? 'PM' : 'AM';
    }
    return 'AM';
  })();

  const [time24, setTime24] = useState<string>(initial24hr);
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>(initialMeridiem);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleTimeChange = useCallback((newTime24: string) => {
    setTime24(newTime24);
    const parsed = extractFrom24hrString(newTime24);
    if (parsed) {
      setMeridiem(parsed.hours24 >= 12 ? 'PM' : 'AM');
    }
  }, []);

  const handleMeridiemChange = useCallback((newMeridiem: 'AM' | 'PM') => {
    setMeridiem(newMeridiem);
    const parsed = extractFrom24hrString(time24);
    if (!parsed) return;
    let { hours24, minutes } = parsed;
    if (newMeridiem === 'AM' && hours24 >= 12) hours24 -= 12;
    if (newMeridiem === 'PM' && hours24 < 12) hours24 += 12;
    setTime24(`${pad(hours24)}:${pad(minutes)}`);
  }, [time24]);

  const buildValue = useCallback((): ITimeData | null => {
    if (!time24) return null;
    const parsed = extractFrom24hrString(time24);
    if (!parsed) return null;
    const { hours24, minutes } = parsed;

    const isoDate = new Date();
    isoDate.setHours(hours24, minutes, 0, 0);

    let displayTime: string;
    let displayMeridiem: string;

    if (isTwentyFourHour) {
      displayTime = `${pad(hours24)}:${pad(minutes)}`;
      displayMeridiem = '';
    } else {
      const { hours12, meridiem: computedMeridiem } = hours24to12(hours24);
      displayTime = `${hours12}:${pad(minutes)}`;
      displayMeridiem = computedMeridiem;
    }

    const timeZone = getLegacyTimeZoneShort();

    return {
      time: displayTime,
      meridiem: displayMeridiem,
      ISOValue: isoDate.toISOString(),
      timeZone,
    };
  }, [time24, isTwentyFourHour]);

  const handleCommit = useCallback(() => {
    onCommit(buildValue());
  }, [buildValue, onCommit]);

  const handleClear = useCallback(() => {
    onCommit(null);
  }, [onCommit]);

  const handleCommitRef = useRef(handleCommit);
  useEffect(() => { handleCommitRef.current = handleCommit; }, [handleCommit]);

  useEffect(() => {
    timeInputRef.current?.focus();
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
      style={{ minWidth: Math.max(rect.width, 200) }}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Time</label>

        {isTwentyFourHour ? (
          <input
            ref={timeInputRef}
            type="time"
            className="w-full bg-background text-foreground text-sm px-2 py-1.5 outline-none border border-border rounded-md focus:border-ring"
            value={time24}
            onChange={(e) => handleTimeChange(e.target.value)}
          />
        ) : (
          <div className="flex gap-2 items-center">
            <input
              ref={timeInputRef}
              type="time"
              className="flex-1 bg-background text-foreground text-sm px-2 py-1.5 outline-none border border-border rounded-md focus:border-ring"
              value={time24}
              onChange={(e) => handleTimeChange(e.target.value)}
            />
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                className={`px-2 py-1.5 text-xs font-medium transition-colors ${
                  meridiem === 'AM'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMeridiemChange('AM');
                }}
              >
                AM
              </button>
              <button
                type="button"
                className={`px-2 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                  meridiem === 'PM'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMeridiemChange('PM');
                }}
              >
                PM
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-between pt-1">
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleClear(); }}
        >
          Clear
        </button>
        <button
          type="button"
          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleCommit(); }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}
