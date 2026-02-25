import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ListFieldEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  onCancel?: () => void;
  popoverStyle?: boolean;
}

export function ListFieldEditor({
  value,
  onChange,
  placeholder,
  onCancel,
  popoverStyle = true,
}: ListFieldEditorProps) {
  const { t } = useTranslation(['common']);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>(value);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<string[]>(value);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (popoverStyle) {
      searchRef.current?.focus({ preventScroll: true });
    }
  }, [popoverStyle]);

  const toggle = (option: string) => {
    setSelected((prev) => {
      const next = prev.includes(option) ? prev.filter((v) => v !== option) : [...prev, option];
      selectedRef.current = next;
      return next;
    });
    if (!popoverStyle) onChange(selectedRef.current);
  };

  const addNewTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    setSelected((prev) => {
      const next = [...prev, trimmed];
      selectedRef.current = next;
      return next;
    });
    setSearch('');
    if (!popoverStyle) {
      setTimeout(() => onChange(selectedRef.current), 0);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      const trimmed = search.trim();
      const exactMatch = selected.find((o) => o.toLowerCase() === trimmed.toLowerCase());
      if (exactMatch) {
        toggle(exactMatch);
      } else {
        addNewTag(search);
      }
      setSearch('');
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const relatedTarget = e.relatedTarget as Node | null;
    setTimeout(() => {
      if (containerRef.current && relatedTarget && containerRef.current.contains(relatedTarget)) {
        return;
      }
      const active = document.activeElement;
      if (containerRef.current && (containerRef.current === active || containerRef.current.contains(active))) {
        return;
      }
      onChange(selectedRef.current);
    }, 200);
  };

  const filtered = selected.filter((o) => o.toLowerCase().includes(search.toLowerCase()));
  const showCreateOption =
    search.trim() && !selected.some((o) => o.toLowerCase() === search.trim().toLowerCase());

  const placeholderText = placeholder ?? t('fieldModal.searchOrCreateTag');

  const content = (
    <>
      <div className="p-1.5 border-b border-border">
        <input
          ref={searchRef}
          type="text"
          placeholder={placeholderText}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#39A380]"
        />
      </div>
      {selected.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b border-border">
          {selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs"
            >
              {v}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => toggle(v)}
                className="rounded-full w-5 h-5 flex items-center justify-center hover:bg-emerald-200 hover:text-emerald-900 text-emerald-700 transition-colors"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {showCreateOption && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => addNewTag(search)}
            className="w-full text-left px-2 py-1.5 text-sm rounded transition-colors hover:bg-accent text-emerald-600 font-medium"
          >
            + Create &quot;{search.trim()}&quot;
          </button>
        )}
        {filtered.length === 0 && !showCreateOption && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">No options found</div>
        )}
        {filtered.map((option) => (
          <button
            key={option}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={() => toggle(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              selected.includes(option) ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-accent'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                  selected.includes(option)
                    ? 'bg-emerald-500 border-[#39A380] text-white'
                    : 'border-muted-foreground/30'
                }`}
              >
                {selected.includes(option) ? '✓' : ''}
              </span>
              {option}
            </span>
          </button>
        ))}
      </div>
    </>
  );

  const containerClassName =
    'bg-popover text-popover-foreground border-2 border-[#39A380] rounded shadow-lg min-w-[200px]';

  if (popoverStyle) {
    return (
      <div
        ref={containerRef}
        className={containerClassName}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel?.();
        }}
        onBlur={handleBlur}
      >
        {content}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={containerClassName} onBlur={handleBlur}>
      {content}
    </div>
  );
}
