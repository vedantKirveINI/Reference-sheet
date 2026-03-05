import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X, Code2, ChevronDown, ChevronRight, Type, Hash, CircleDot, CheckSquare,
  ToggleLeft, Calendar, DollarSign, Phone, MapPin, Paperclip, Clock, Star,
  FunctionSquare, List, Sparkles, Link2, Eye, Sigma, CheckCircle, Check,
  AlertCircle, Info,
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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Text: { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800' },
  Math: { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-800' },
  Logical: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
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
    case 'field':
      return 'text-teal-600 dark:text-teal-400 font-medium';
    case 'function':
      return 'text-violet-600 dark:text-violet-400 font-semibold';
    case 'string':
      return 'text-amber-600 dark:text-amber-400';
    case 'number':
      return 'text-blue-600 dark:text-blue-400';
    case 'operator':
      return 'text-rose-500 dark:text-rose-400 font-medium';
    case 'paren':
      return 'text-orange-500 dark:text-orange-400 font-medium';
    case 'separator':
      return 'text-muted-foreground font-medium';
    default:
      return 'text-foreground';
  }
}

interface FunctionTooltipProps {
  fn: FormulaFunction;
}

function FunctionTooltip({ fn }: FunctionTooltipProps) {
  const colors = CATEGORY_COLORS[fn.category];
  return (
    <div className="absolute left-full top-0 ml-2 z-[100] w-64 rounded-xl border border-border bg-popover/95 backdrop-blur-sm shadow-xl p-4 pointer-events-none">
      <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold mb-2 ${colors.bg} ${colors.text} border ${colors.border}`}>
        {fn.category}
      </div>
      <p className="text-xs font-semibold text-foreground mb-1">{fn.name}({fn.args.map(a => a.name).join(', ')})</p>
      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{fn.description}</p>
      {fn.example && (
        <div className="rounded-md bg-muted/60 border border-border px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Example</p>
          <code className="text-xs text-foreground font-mono break-all">{fn.example}</code>
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
  const [hoveredFn, setHoveredFn] = useState<string | null>(null);
  const [fieldSearch, setFieldSearch] = useState('');
  const [fnSearch, setFnSearch] = useState('');
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
    const { newValue, newCursorPos } = insertAtCursor(value, insertion, pos);
    setValue(newValue);
    setCursorPos(newCursorPos);
    runValidation(newValue);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  }, [value, cursorPos, runValidation]);

  const insertField = useCallback((col: IExtendedColumn) => {
    const ref = `{${col.dbFieldName || col.name}}`;
    insertText(ref);
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
      (!q || c.name?.toLowerCase().includes(q))
    );
  }, [columns, fieldSearch]);

  const filteredFunctions = useMemo(() => {
    const q = fnSearch.toLowerCase();
    if (!q) return FORMULA_FUNCTIONS;
    return FORMULA_FUNCTIONS.filter(f =>
      f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
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

  if (!open) return null;

  return (
    <div
      className="absolute top-0 z-[60] w-[640px] max-w-[90vw] rounded-2xl border border-border bg-popover/98 backdrop-blur-sm text-popover-foreground shadow-2xl shadow-black/10 animate-in fade-in-0 slide-in-from-left-2 duration-200 flex flex-col"
      style={flipToLeft ? { right: '100%', marginRight: 8 } : { left: '100%', marginLeft: 8 }}
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0 bg-gradient-to-r from-violet-500/[0.06] via-sky-500/[0.04] to-violet-500/[0.06] rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-gradient-to-br from-violet-100 to-sky-100 dark:from-violet-900/60 dark:to-sky-900/40 border border-violet-200/60 dark:border-violet-700/40 shadow-sm">
            <Code2 className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-tight">Formula Builder</h4>
            <p className="text-[10px] text-muted-foreground">Build expressions with fields and functions</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 pt-4 pb-3 shrink-0">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Formula Expression
        </label>
        <div className="relative rounded-xl border border-border bg-background shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-400/20 transition-all overflow-hidden">
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
              : <span className="text-muted-foreground/40">Type a formula or click fields &amp; functions below...</span>
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
            placeholder="Type a formula or click fields & functions below..."
            className="relative z-10 w-full bg-transparent resize-none px-3 py-2.5 text-sm font-mono leading-relaxed text-transparent caret-foreground focus:outline-none placeholder:text-muted-foreground/40"
            style={{ caretColor: 'var(--foreground)' }}
          />
        </div>

        <div className="mt-2 min-h-[20px] flex items-center gap-1.5">
          {validation === null && value.trim() && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              Validating...
            </span>
          )}
          {validation?.valid && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="h-3 w-3" />
              Formula looks valid
            </span>
          )}
          {validation && !validation.valid && (
            <span className="flex items-center gap-1 text-xs text-destructive font-medium">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {validation.error}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0 border-t border-border" style={{ maxHeight: 280 }}>
        <div className="flex-1 min-w-0 border-r border-border flex flex-col">
          <div className="px-3 pt-3 pb-2 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Fields</p>
            <div className="relative">
              <input
                type="text"
                placeholder="Search fields..."
                value={fieldSearch}
                onChange={e => setFieldSearch(e.target.value)}
                className="w-full h-7 rounded-lg border border-border bg-muted/40 px-2.5 text-xs focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 px-2 pb-3">
            {filteredColumns.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No fields found</p>
            )}
            {filteredColumns.map(col => {
              const Icon = TYPE_ICONS[col.type] || Type;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => insertField(col)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-teal-50/80 dark:hover:bg-teal-950/30 hover:border-teal-200/50 border border-transparent group transition-all"
                  title={`Insert {${col.dbFieldName || col.name}}`}
                >
                  <div className="h-6 w-6 rounded-md bg-muted/60 border border-border flex items-center justify-center shrink-0 group-hover:bg-teal-100/80 dark:group-hover:bg-teal-900/40 group-hover:border-teal-300/50 dark:group-hover:border-teal-700/50 transition-colors">
                    <Icon className="h-3 w-3 text-muted-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                  </div>
                  <span className="text-xs text-foreground truncate flex-1 group-hover:text-teal-700 dark:group-hover:text-teal-300 font-medium transition-colors">
                    {col.name}
                  </span>
                  <span className="text-[9px] text-teal-500/0 group-hover:text-teal-500 font-mono transition-colors shrink-0">
                    insert
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-3 pt-3 pb-2 shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Functions</p>
            <div className="relative">
              <input
                type="text"
                placeholder="Search functions..."
                value={fnSearch}
                onChange={e => setFnSearch(e.target.value)}
                className="w-full h-7 rounded-lg border border-border bg-muted/40 px-2.5 text-xs focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/20"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 px-2 pb-3">
            {fnSearch ? (
              filteredFunctions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No functions found</p>
              ) : (
                filteredFunctions.map(fn => (
                  <FunctionRow
                    key={fn.name}
                    fn={fn}
                    hovered={hoveredFn === fn.name}
                    onHover={setHoveredFn}
                    onInsert={insertFunction}
                  />
                ))
              )
            ) : (
              FORMULA_CATEGORIES.map(cat => {
                const catFns = FORMULA_FUNCTIONS.filter(f => f.category === cat);
                const isExpanded = expandedCategories.has(cat);
                const colors = CATEGORY_COLORS[cat];
                return (
                  <div key={cat} className="mb-1">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors group"
                    >
                      <div className={`h-4 w-4 rounded flex items-center justify-center ${colors.bg} ${colors.border} border`}>
                        {isExpanded
                          ? <ChevronDown className={`h-2.5 w-2.5 ${colors.text}`} />
                          : <ChevronRight className={`h-2.5 w-2.5 ${colors.text}`} />
                        }
                      </div>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider ${colors.text}`}>{cat}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground">{catFns.length}</span>
                    </button>
                    {isExpanded && catFns.map(fn => (
                      <FunctionRow
                        key={fn.name}
                        fn={fn}
                        hovered={hoveredFn === fn.name}
                        onHover={setHoveredFn}
                        onInsert={insertFunction}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-border flex items-center justify-between shrink-0 rounded-b-2xl bg-muted/20">
        <p className="text-[10px] text-muted-foreground">
          Use <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{'{Field Name}'}</code> to reference fields
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!value.trim()}
            className="h-8 px-4 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all shadow-sm shadow-violet-500/20"
          >
            Apply Formula
          </button>
        </div>
      </div>
    </div>
  );
}

interface FunctionRowProps {
  fn: FormulaFunction;
  hovered: boolean;
  onHover: (name: string | null) => void;
  onInsert: (fn: FormulaFunction) => void;
}

function FunctionRow({ fn, hovered, onHover, onInsert }: FunctionRowProps) {
  const colors = CATEGORY_COLORS[fn.category];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onInsert(fn)}
        onMouseEnter={() => onHover(fn.name)}
        onMouseLeave={() => onHover(null)}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-violet-50/80 dark:hover:bg-violet-950/30 border border-transparent hover:border-violet-200/50 group transition-all"
      >
        <div className={`h-6 w-6 rounded-md border flex items-center justify-center shrink-0 ${colors.bg} ${colors.border}`}>
          <FunctionSquare className={`h-3 w-3 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
            {fn.name}
          </span>
          <span className="text-[10px] text-muted-foreground ml-1">
            ({fn.args.map(a => a.name).join(', ')})
          </span>
        </div>
      </button>
      {hovered && <FunctionTooltip fn={fn} />}
    </div>
  );
}
