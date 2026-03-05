import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X, Code2, ChevronDown, ChevronRight, Type, Hash, CircleDot, CheckSquare,
  ToggleLeft, Calendar, DollarSign, Phone, MapPin, Paperclip, Clock, Star,
  FunctionSquare, List, Sparkles, Link2, Eye, Sigma, CheckCircle,
  Check, AlertCircle, Search, Braces,
} from 'lucide-react';
import { CellType } from '@/types';
import type { IExtendedColumn } from '@/stores/fields-store';
import { FORMULA_FUNCTIONS, FORMULA_CATEGORIES, type FormulaFunction } from '@/config/formula-functions';
import { parseFormulaTokens, validateFormula, insertAtCursor, type FormulaToken } from '@/utils/formula-utils';

const TYPE_ICONS: Record<string, React.ElementType> = {
  [CellType.String]: Type,
  [CellType.LongText]: Type,
  [CellType.Number]: Hash,
  [CellType.SCQ]: CircleDot,
  [CellType.MCQ]: CheckSquare,
  [CellType.DropDown]: ChevronDown,
  [CellType.YesNo]: ToggleLeft,
  [CellType.DateTime]: Calendar,
  [CellType.CreatedTime]: Calendar,
  [CellType.Currency]: DollarSign,
  [CellType.PhoneNumber]: Phone,
  [CellType.Address]: MapPin,
  [CellType.FileUpload]: Paperclip,
  [CellType.Time]: Clock,
  [CellType.Rating]: Star,
  [CellType.Formula]: FunctionSquare,
  [CellType.List]: List,
  [CellType.Enrichment]: Sparkles,
  [CellType.Checkbox]: CheckCircle,
  [CellType.Link]: Link2,
  [CellType.Lookup]: Eye,
  [CellType.Rollup]: Sigma,
};

const CATEGORY_META: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Text: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-400',
  },
  Math: {
    bg: 'bg-violet-50 dark:bg-violet-950/40',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-800',
    dot: 'bg-violet-400',
  },
  Logical: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-400',
  },
};

interface HighlightedToken {
  type: FormulaToken['type'] | 'whitespace';
  value: string;
}

function buildHighlightedSegments(expr: string, tokens: ReturnType<typeof parseFormulaTokens>): HighlightedToken[] {
  if (!expr) return [];
  const segments: HighlightedToken[] = [];
  let cursor = 0;
  for (const token of tokens) {
    if (token.start > cursor) {
      segments.push({ type: 'whitespace', value: expr.slice(cursor, token.start) });
    }
    segments.push({ type: token.type, value: token.value });
    cursor = token.end;
  }
  if (cursor < expr.length) {
    segments.push({ type: 'whitespace', value: expr.slice(cursor) });
  }
  return segments;
}

function tokenClassName(type: HighlightedToken['type']): string {
  switch (type) {
    case 'field':   return 'text-teal-600 dark:text-teal-400 font-semibold';
    case 'function': return 'text-violet-600 dark:text-violet-400 font-bold';
    case 'string':  return 'text-amber-600 dark:text-amber-500';
    case 'number':  return 'text-blue-600 dark:text-blue-400 font-medium';
    case 'operator': return 'text-rose-500 dark:text-rose-400 font-semibold';
    case 'paren':   return 'text-orange-500 dark:text-orange-400 font-bold';
    case 'separator': return 'text-muted-foreground font-semibold';
    default:        return 'text-foreground';
  }
}

function FunctionSignature({ fn, className = '' }: { fn: FormulaFunction; className?: string }) {
  const meta = CATEGORY_META[fn.category];
  return (
    <span className={`font-mono text-xs ${className}`}>
      <span className="text-violet-600 dark:text-violet-400 font-bold">{fn.name}</span>
      <span className="text-orange-500 dark:text-orange-400 font-bold">(</span>
      {fn.args.map((arg, i) => (
        <span key={arg.name}>
          {i > 0 && <span className="text-muted-foreground">, </span>}
          <span className={`italic ${meta.text}`}>{arg.name}{arg.variadic ? '…' : ''}</span>
        </span>
      ))}
      <span className="text-orange-500 dark:text-orange-400 font-bold">)</span>
    </span>
  );
}

function FunctionCard({ fn, onInsert }: { fn: FormulaFunction; onInsert: (fn: FormulaFunction) => void }) {
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[fn.category];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onInsert(fn)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full text-left px-2.5 py-2.5 rounded-xl border border-transparent hover:border-violet-200/60 dark:hover:border-violet-800/40 hover:bg-violet-50/60 dark:hover:bg-violet-950/20 transition-all group"
      >
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${meta.bg} ${meta.border}`}>
            <FunctionSquare className={`h-3 w-3 ${meta.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <FunctionSignature fn={fn} />
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-1 group-hover:text-foreground/60 transition-colors">
              {fn.description}
            </p>
          </div>
        </div>
      </button>

      {hovered && (
        <div className="absolute left-full top-0 ml-2 z-[100] w-72 rounded-xl border border-border bg-popover shadow-2xl shadow-black/15 overflow-hidden pointer-events-none">
          <div className={`px-3 py-2.5 border-b border-border ${meta.bg}`}>
            <FunctionSignature fn={fn} className="text-sm" />
            <div className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider border ${meta.bg} ${meta.border} ${meta.text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {fn.category} · returns {fn.returnType}
            </div>
          </div>
          <div className="px-3 py-2.5">
            <p className="text-xs text-foreground leading-relaxed mb-2.5">{fn.description}</p>
            {fn.args.length > 0 && (
              <div className="mb-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Arguments</p>
                <div className="space-y-1">
                  {fn.args.map(arg => (
                    <div key={arg.name} className="flex items-center gap-2">
                      <code className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${meta.bg} ${meta.border} ${meta.text}`}>
                        {arg.name}{arg.variadic ? '…' : ''}
                      </code>
                      <span className="text-[10px] text-muted-foreground">
                        {arg.type}{!arg.required ? ' (optional)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {fn.example && (
              <div className="rounded-lg bg-muted/50 border border-border px-2.5 py-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Example</p>
                <code className="text-xs text-foreground font-mono break-all leading-relaxed">{fn.example}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FormulaEditorPopupProps {
  open: boolean;
  columns: IExtendedColumn[];
  initialExpression: string;
  onApply: (expression: string) => void;
  onClose: () => void;
  flipToLeft?: boolean;
}

export function FormulaEditorPopup({
  open,
  columns,
  initialExpression,
  onApply,
  onClose,
  flipToLeft = false,
}: FormulaEditorPopupProps) {
  const [value, setValue] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [validation, setValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(FORMULA_CATEGORIES));
  const [fieldSearch, setFieldSearch] = useState('');
  const [fnSearch, setFnSearch] = useState('');
  const [activePanel, setActivePanel] = useState<'fields' | 'functions'>('fields');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setValue(initialExpression ?? '');
      setValidation(null);
      setFieldSearch('');
      setFnSearch('');
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [open, initialExpression]);

  const runValidation = useCallback((expr: string) => {
    if (validationTimerRef.current) clearTimeout(validationTimerRef.current);
    validationTimerRef.current = setTimeout(() => {
      if (!expr.trim()) { setValidation(null); return; }
      setValidation(validateFormula(expr, columns));
    }, 350);
  }, [columns]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValue(val);
    setCursorPos(e.target.selectionStart ?? val.length);
    runValidation(val);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCursorPos(e.currentTarget.selectionStart ?? value.length);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPos(e.currentTarget.selectionStart ?? value.length);
  };

  const insertText = useCallback((insertion: string) => {
    const pos = cursorPos;
    const result = insertAtCursor(value, insertion, pos);
    setValue(result.newValue);
    setCursorPos(result.selectionStart);
    runValidation(result.newValue);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(result.selectionStart, result.selectionEnd);
      }
    }, 10);
  }, [value, cursorPos, runValidation]);

  const insertField = useCallback((col: IExtendedColumn) => {
    insertText(`{${col.dbFieldName || col.name}}`);
  }, [insertText]);

  const insertFunction = useCallback((fn: FormulaFunction) => {
    insertText(fn.template);
  }, [insertText]);

  const handleApply = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onApply(trimmed);
  };

  const tokens = useMemo(() => parseFormulaTokens(value), [value]);
  const highlighted = useMemo(() => buildHighlightedSegments(value, tokens), [value, tokens]);

  const filteredColumns = useMemo(() => {
    const q = fieldSearch.toLowerCase();
    return columns.filter(c =>
      c.rawType !== 'FORMULA' &&
      c.rawType !== 'ENRICHMENT' &&
      (!q || c.name?.toLowerCase().includes(q) || c.dbFieldName?.toLowerCase().includes(q))
    );
  }, [columns, fieldSearch]);

  const filteredFunctions = useMemo(() => {
    const q = fnSearch.toLowerCase();
    if (!q) return FORMULA_FUNCTIONS;
    return FORMULA_FUNCTIONS.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.args.some(a => a.name.toLowerCase().includes(q))
    );
  }, [fnSearch]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const validationDot = validation === null
    ? 'bg-muted-foreground/30'
    : validation.valid
      ? 'bg-emerald-500'
      : 'bg-destructive';

  if (!open) return null;

  return (
    <div
      className="absolute top-0 z-[60] flex flex-col rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/15"
      style={{
        width: 600,
        maxHeight: '82vh',
        ...(flipToLeft ? { right: '100%', marginRight: 8 } : { left: '100%', marginLeft: 8 }),
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 rounded-t-2xl bg-gradient-to-r from-violet-500/[0.07] via-indigo-500/[0.04] to-violet-500/[0.07]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm shadow-violet-500/30">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground tracking-tight">Formula Builder</h4>
            <p className="text-[10px] text-muted-foreground">Click fields and functions to build your expression</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pt-3.5 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Expression
          </label>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${validationDot}`} />
            {validation === null && value.trim()
              ? <span className="text-[10px] text-muted-foreground">validating…</span>
              : validation?.valid
                ? <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1"><Check className="h-2.5 w-2.5" />Valid</span>
                : validation
                  ? <span className="text-[10px] text-destructive font-medium flex items-center gap-1"><AlertCircle className="h-2.5 w-2.5" />{validation.error}</span>
                  : <span className="text-[10px] text-muted-foreground/60">type or click below</span>
            }
          </div>
        </div>

        <div className="relative rounded-xl border border-border bg-background/80 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none px-3 py-2.5 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all select-none overflow-hidden"
            aria-hidden="true"
          >
            {highlighted.length > 0
              ? highlighted.map((seg, i) => (
                  <span key={i} className={tokenClassName(seg.type)}>
                    {seg.value}
                  </span>
                ))
              : null
            }
          </div>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            onClick={handleClick}
            rows={4}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="e.g. concatenate({product_name}, &quot; - &quot;, {region})"
            className="relative z-10 w-full bg-transparent resize-none px-3 py-2.5 text-sm font-mono leading-relaxed focus:outline-none placeholder:text-muted-foreground/30"
            style={{ color: 'transparent', caretColor: '#8b5cf6' }}
          />
        </div>
      </div>

      <div className="px-4 pb-1 shrink-0">
        <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setActivePanel('fields')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'fields'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Braces className="h-3 w-3" />
            Fields
            <span className="text-[10px] font-normal opacity-60">({filteredColumns.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePanel('functions')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'functions'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FunctionSquare className="h-3 w-3" />
            Functions
            <span className="text-[10px] font-normal opacity-60">({FORMULA_FUNCTIONS.length})</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 pt-2 pb-3">
        {activePanel === 'fields' && (
          <>
            <div className="relative mb-2 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search fields…"
                value={fieldSearch}
                onChange={e => setFieldSearch(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-muted/30 pl-8 pr-3 text-xs focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 -mx-1">
              {filteredColumns.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No fields found</p>
              ) : (
                <div className="flex flex-col gap-0.5 px-1">
                  {filteredColumns.map(col => {
                    const Icon = TYPE_ICONS[col.type] || Type;
                    const ref = col.dbFieldName || col.name;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => insertField(col)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border border-transparent hover:border-teal-200/60 dark:hover:border-teal-800/40 hover:bg-teal-50/60 dark:hover:bg-teal-950/20 group transition-all"
                      >
                        <div className="h-7 w-7 rounded-lg bg-muted/60 border border-border flex items-center justify-center shrink-0 group-hover:bg-teal-100/80 dark:group-hover:bg-teal-900/40 group-hover:border-teal-300/50 dark:group-hover:border-teal-700/50 transition-colors">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs font-semibold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                            {col.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono group-hover:text-teal-500/70 transition-colors truncate">
                            {'{' + ref + '}'}
                          </p>
                        </div>
                        <span className="shrink-0 text-[9px] font-semibold text-teal-500/0 group-hover:text-teal-500 bg-teal-50/0 group-hover:bg-teal-100/80 dark:group-hover:bg-teal-900/30 px-1.5 py-0.5 rounded-md transition-all border border-teal-200/0 group-hover:border-teal-200/60 dark:group-hover:border-teal-800/40 uppercase tracking-wide">
                          insert
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activePanel === 'functions' && (
          <>
            <div className="relative mb-2 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search functions…"
                value={fnSearch}
                onChange={e => setFnSearch(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-muted/30 pl-8 pr-3 text-xs focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
            <div className="overflow-y-auto flex-1 min-h-0 -mx-1 px-1">
              {fnSearch ? (
                filteredFunctions.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No functions found</p>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {filteredFunctions.map(fn => (
                      <FunctionCard key={fn.name} fn={fn} onInsert={insertFunction} />
                    ))}
                  </div>
                )
              ) : (
                FORMULA_CATEGORIES.map(cat => {
                  const catFns = FORMULA_FUNCTIONS.filter(f => f.category === cat);
                  const isExpanded = expandedCategories.has(cat);
                  const meta = CATEGORY_META[cat];
                  return (
                    <div key={cat} className="mb-1.5">
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors group mb-0.5"
                      >
                        <div className={`h-5 w-5 rounded-md flex items-center justify-center border ${meta.bg} ${meta.border}`}>
                          {isExpanded
                            ? <ChevronDown className={`h-3 w-3 ${meta.text}`} />
                            : <ChevronRight className={`h-3 w-3 ${meta.text}`} />
                          }
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${meta.text}`}>{cat}</span>
                        <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${meta.bg} ${meta.border} ${meta.text}`}>
                          {catFns.length}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="flex flex-col gap-0.5 pl-1">
                          {catFns.map(fn => (
                            <FunctionCard key={fn.name} fn={fn} onInsert={insertFunction} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between shrink-0 rounded-b-2xl bg-muted/10">
        <p className="text-[10px] text-muted-foreground">
          Reference fields with <code className="bg-muted px-1 py-0.5 rounded font-mono text-teal-600 dark:text-teal-400 text-[10px]">{'{field_name}'}</code>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!value.trim()}
            className="h-8 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm shadow-violet-500/20"
          >
            Apply Formula
          </button>
        </div>
      </div>
    </div>
  );
}
