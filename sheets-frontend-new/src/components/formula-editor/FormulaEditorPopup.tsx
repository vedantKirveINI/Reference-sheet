import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X, Code2, ChevronDown, ChevronRight, Type, Hash, CircleDot, CheckSquare,
  ToggleLeft, Calendar, DollarSign, Phone, MapPin, Paperclip, Clock, Star,
  FunctionSquare, List, Sparkles, Link2, Eye, Sigma, CheckCircle,
  Check, AlertCircle, Search, Braces,
} from 'lucide-react';
import { CellType } from '@/types';
import type { IExtendedColumn } from '@/stores/fields-store';
import { FORMULA_FUNCTIONS, FORMULA_CATEGORIES, type FormulaDef } from '@/config/formula-functions';
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

const CATEGORY_TEXT: Record<string, string> = {
  Text: 'text-sky-500 dark:text-sky-400',
  Math: 'text-violet-500 dark:text-violet-400',
  Logical: 'text-amber-500 dark:text-amber-400',
};

const OPERATORS = [
  { label: '+',   insert: ' + ',  title: 'Add' },
  { label: '−',   insert: ' - ',  title: 'Subtract' },
  { label: '×',   insert: ' * ',  title: 'Multiply' },
  { label: '÷',   insert: ' / ',  title: 'Divide' },
  { label: '(',   insert: '(',    title: 'Open paren' },
  { label: ')',   insert: ')',    title: 'Close paren' },
  { label: ',',   insert: ', ',   title: 'Argument separator' },
  { label: '" "', insert: '""',   title: 'Text literal' },
];

interface HighlightedToken {
  type: FormulaToken['type'] | 'whitespace';
  value: string;
}

function buildHighlightedSegments(
  expr: string,
  tokens: ReturnType<typeof parseFormulaTokens>,
  nameMap: Record<string, string>,
): HighlightedToken[] {
  if (!expr) return [];
  const segments: HighlightedToken[] = [];
  let cursor = 0;
  for (const token of tokens) {
    if (token.start > cursor) {
      segments.push({ type: 'whitespace', value: expr.slice(cursor, token.start) });
    }
    if (token.type === 'field') {
      const inner = token.value.slice(1, -1).toLowerCase();
      const display = nameMap[inner] || token.value;
      segments.push({ type: 'field', value: display });
    } else {
      segments.push({ type: token.type, value: token.value });
    }
    cursor = token.end;
  }
  if (cursor < expr.length) {
    segments.push({ type: 'whitespace', value: expr.slice(cursor) });
  }
  return segments;
}

function tokenClassName(type: HighlightedToken['type']): string {
  switch (type) {
    case 'field':    return 'text-teal-700 dark:text-teal-300 font-semibold bg-teal-500/10 dark:bg-teal-400/10 rounded-sm';
    case 'function': return 'text-violet-600 dark:text-violet-400 font-bold italic';
    case 'string':   return 'text-amber-600 dark:text-amber-500';
    case 'number':   return 'text-blue-600 dark:text-blue-400 font-medium';
    case 'operator': return 'text-rose-500 dark:text-rose-400 font-semibold';
    case 'paren':    return 'text-orange-500 dark:text-orange-400 font-bold';
    case 'separator': return 'text-muted-foreground font-semibold';
    default:         return 'text-foreground';
  }
}

function FunctionSignature({ fn, size = 'sm' }: { fn: FormulaDef; size?: 'sm' | 'base' }) {
  const catText = CATEGORY_TEXT[fn.category];
  const cls = size === 'base' ? 'text-sm' : 'text-xs';
  return (
    <span className={`font-mono ${cls}`}>
      <span className="text-violet-600 dark:text-violet-400 font-bold">{fn.name}</span>
      <span className="text-orange-500 dark:text-orange-400 font-bold">(</span>
      {fn.args.map((arg, i) => (
        <span key={arg.name}>
          {i > 0 && <span className="text-muted-foreground/60">, </span>}
          <span className={`italic ${catText}`}>{arg.name}{arg.variadic ? '…' : ''}</span>
        </span>
      ))}
      <span className="text-orange-500 dark:text-orange-400 font-bold">)</span>
    </span>
  );
}

function FunctionCard({ fn, onInsert }: { fn: FormulaDef; onInsert: (fn: FormulaDef) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onInsert(fn)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full text-left px-3 py-2 rounded-xl hover:bg-muted/60 transition-colors"
      >
        <FunctionSignature fn={fn} />
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1 leading-relaxed">
          {fn.description}
        </p>
      </button>
      {hovered && (
        <div className="absolute left-full top-0 ml-2 z-[100] w-72 rounded-2xl border border-border bg-popover shadow-2xl shadow-black/20 overflow-hidden pointer-events-none">
          <div className="px-4 pt-3.5 pb-3 border-b border-border/60 bg-muted/20">
            <FunctionSignature fn={fn} size="base" />
            <p className={`mt-1.5 text-[10px] font-bold uppercase tracking-widest ${CATEGORY_TEXT[fn.category]}`}>
              {fn.category} · returns {fn.returnType}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-foreground/80 leading-relaxed mb-3">{fn.description}</p>
            {fn.args.length > 0 && (
              <div className="mb-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Arguments</p>
                <div className="space-y-1.5">
                  {fn.args.map(arg => (
                    <div key={arg.name} className="flex items-center gap-2">
                      <code className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted font-mono text-foreground shrink-0">
                        {arg.name}{arg.variadic ? '…' : ''}
                      </code>
                      <span className="text-[10px] text-muted-foreground">
                        {arg.type}{!arg.required ? ' · optional' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {fn.example && (
              <div className="rounded-xl bg-muted/60 border border-border/60 px-3 py-2.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Example</p>
                <code className="text-xs text-foreground font-mono break-all leading-relaxed">{fn.example}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface CursorToken {
  query: string;
  replaceFrom: number;
  replaceTo: number;
  insideFieldRef: boolean;
}

function extractCursorToken(value: string, cursor: number): CursorToken | null {
  let i = cursor - 1;
  while (i >= 0 && value[i] !== '{' && value[i] !== '}' && value[i] !== '(' && value[i] !== ')') i--;
  if (i >= 0 && value[i] === '{') {
    const query = value.slice(i + 1, cursor);
    if (!query.includes('{') && !query.includes('}')) {
      return { query, replaceFrom: i, replaceTo: cursor, insideFieldRef: true };
    }
  }
  let j = cursor - 1;
  while (j >= 0 && /[a-zA-Z_0-9]/.test(value[j])) j--;
  const word = value.slice(j + 1, cursor);
  if (word.length >= 2) return { query: word, replaceFrom: j + 1, replaceTo: cursor, insideFieldRef: false };
  return null;
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
  const [autoSearchQuery, setAutoSearchQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTokenRef = useRef<CursorToken | null>(null);

  const dbNameMap = useMemo<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    columns.forEach(c => {
      if (c.dbFieldName) m[c.dbFieldName.toLowerCase()] = `{${c.name}}`;
      m[(c.name || '').toLowerCase()] = `{${c.name}}`;
    });
    return m;
  }, [columns]);

  useEffect(() => {
    if (open) {
      setValue(initialExpression ?? '');
      setValidation(null);
      setFieldSearch('');
      setFnSearch('');
      setAutoSearchQuery('');
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

  const syncAutoSearch = useCallback((val: string, pos: number) => {
    const token = extractCursorToken(val, pos);
    cursorTokenRef.current = token;
    if (!token || !token.query.trim()) {
      setAutoSearchQuery('');
      setFieldSearch('');
      setFnSearch('');
      return;
    }
    const q = token.query.toLowerCase().trim();
    setAutoSearchQuery(q);
    setFieldSearch(q);
    setFnSearch(q);

    const fieldHits = columns.filter(c =>
      c.name?.toLowerCase().includes(q) || c.dbFieldName?.toLowerCase().includes(q)
    ).length;
    const fnHits = FORMULA_FUNCTIONS.filter(f =>
      f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
    ).length;

    if (fieldHits >= fnHits && fieldHits > 0) {
      setActivePanel('fields');
    } else if (fnHits > 0) {
      setActivePanel('functions');
    }
  }, [columns]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart ?? val.length;
    setValue(val);
    setCursorPos(pos);
    runValidation(val);
    syncAutoSearch(val, pos);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const pos = e.currentTarget.selectionStart ?? value.length;
    setCursorPos(pos);
    syncAutoSearch(value, pos);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const pos = e.currentTarget.selectionStart ?? value.length;
    setCursorPos(pos);
    syncAutoSearch(value, pos);
  };

  const applyInsertion = useCallback((newValue: string, selStart: number, selEnd: number) => {
    setValue(newValue);
    setCursorPos(selEnd);
    cursorTokenRef.current = null;
    setFieldSearch('');
    setFnSearch('');
    setAutoSearchQuery('');
    runValidation(newValue);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selStart, selEnd);
      }
    }, 10);
  }, [runValidation]);

  const insertText = useCallback((insertion: string) => {
    const result = insertAtCursor(value, insertion, cursorPos);
    applyInsertion(result.newValue, result.selectionStart, result.selectionEnd);
  }, [value, cursorPos, applyInsertion]);

  const insertField = useCallback((col: IExtendedColumn) => {
    const insertion = `{${col.dbFieldName || col.name}}`;
    const token = cursorTokenRef.current;
    if (token) {
      const from = token.replaceFrom;
      const newValue = value.slice(0, from) + insertion + value.slice(token.replaceTo);
      const pos = from + insertion.length;
      applyInsertion(newValue, pos, pos);
    } else {
      insertText(insertion);
    }
  }, [value, applyInsertion, insertText]);

  const insertFunction = useCallback((fn: FormulaDef) => {
    const token = cursorTokenRef.current;
    if (token && !token.insideFieldRef) {
      const newValue = value.slice(0, token.replaceFrom) + fn.template + value.slice(token.replaceTo);
      const parenIdx = fn.template.indexOf('(');
      let selStart = token.replaceFrom + fn.template.length;
      let selEnd = selStart;
      if (parenIdx !== -1) {
        const commaIdx = fn.template.indexOf(',', parenIdx);
        const closeIdx = fn.template.indexOf(')', parenIdx);
        selStart = token.replaceFrom + parenIdx + 1;
        selEnd = commaIdx !== -1
          ? token.replaceFrom + commaIdx
          : closeIdx !== -1
          ? token.replaceFrom + closeIdx
          : selStart;
      }
      applyInsertion(newValue, selStart, selEnd);
    } else {
      insertText(fn.template);
    }
  }, [value, applyInsertion, insertText]);

  const tokens = useMemo(() => parseFormulaTokens(value), [value]);
  const highlighted = useMemo(() => buildHighlightedSegments(value, tokens, dbNameMap), [value, tokens, dbNameMap]);

  const filteredColumns = useMemo(() => {
    const q = fieldSearch.toLowerCase();
    return columns.filter(c =>
      !q || c.name?.toLowerCase().includes(q) || c.dbFieldName?.toLowerCase().includes(q)
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

  const switchPanel = (panel: 'fields' | 'functions') => {
    setActivePanel(panel);
    setFieldSearch('');
    setFnSearch('');
    setAutoSearchQuery('');
  };

  const validationStatus =
    validation === null && value.trim() ? 'checking'
    : validation?.valid ? 'valid'
    : validation ? 'error'
    : 'idle';

  if (!open) return null;

  const fieldCount = filteredColumns.length;
  const fnCount = filteredFunctions.length;
  const totalColumns = columns.length;

  return (
    <div
      className="absolute top-0 z-[60] flex flex-col rounded-2xl border border-border/80 bg-popover text-popover-foreground shadow-2xl shadow-black/20"
      style={{
        width: 580,
        maxHeight: '84vh',
        ...(flipToLeft ? { right: '100%', marginRight: 8 } : { left: '100%', marginLeft: 8 }),
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0 rounded-t-2xl bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md shadow-violet-500/25">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Formula Builder</h4>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Click fields and functions to compose</p>
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

      <div className="px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expression</p>
          <div className="h-4 flex items-center">
            {validationStatus === 'checking' && (
              <span className="text-[10px] text-muted-foreground">validating…</span>
            )}
            {validationStatus === 'valid' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check className="h-3 w-3" />valid
              </span>
            )}
            {validationStatus === 'error' && (
              <span className="flex items-center gap-1 text-[10px] text-destructive font-semibold max-w-[260px] truncate">
                <AlertCircle className="h-3 w-3 shrink-0" />{validation!.error}
              </span>
            )}
          </div>
        </div>

        <div className="relative rounded-xl border border-border/80 bg-background shadow-sm focus-within:border-violet-400/70 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none px-3 py-2.5 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all select-none overflow-hidden"
            aria-hidden="true"
          >
            {highlighted.map((seg, i) => (
              <span key={i} className={tokenClassName(seg.type)}>{seg.value}</span>
            ))}
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
            placeholder={`e.g.  concatenate({Product Name}, " - ", {Region})`}
            className="relative z-10 w-full bg-transparent resize-none px-3 py-2.5 text-sm font-mono leading-relaxed focus:outline-none placeholder:text-muted-foreground/25"
            style={{ color: 'transparent', caretColor: '#8b5cf6' }}
          />
        </div>

      </div>

      <div className="px-4 pb-1.5 shrink-0">
        <div className="flex items-center gap-0.5 bg-muted/40 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => switchPanel('fields')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'fields'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Braces className="h-3 w-3" />
            Fields
            {autoSearchQuery ? (
              <span className={`text-[10px] font-bold tabular-nums ${fieldCount > 0 ? 'text-teal-500' : 'text-muted-foreground/50'}`}>
                {fieldCount}/{totalColumns}
              </span>
            ) : (
              <span className="text-[10px] font-normal opacity-40">{totalColumns}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => switchPanel('functions')}
            className={`flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-semibold transition-all ${
              activePanel === 'functions'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FunctionSquare className="h-3 w-3" />
            Functions
            {autoSearchQuery ? (
              <span className={`text-[10px] font-bold tabular-nums ${fnCount > 0 ? 'text-violet-500' : 'text-muted-foreground/50'}`}>
                {fnCount}/{FORMULA_FUNCTIONS.length}
              </span>
            ) : (
              <span className="text-[10px] font-normal opacity-40">{FORMULA_FUNCTIONS.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 pb-3">
        {activePanel === 'fields' && (
          <>
            <div className="relative mb-2 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search fields…"
                value={fieldSearch}
                onChange={e => { setFieldSearch(e.target.value); setAutoSearchQuery(''); setFnSearch(''); }}
                className="w-full h-7 rounded-lg border border-border/60 bg-muted/20 pl-7 pr-3 text-xs focus:outline-none focus:border-violet-400/50 placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              {filteredColumns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-1.5">
                  <Braces className="h-6 w-6 text-muted-foreground/20" />
                  <p className="text-xs text-muted-foreground/50">No fields match</p>
                </div>
              ) : (
                <div className="flex flex-col gap-px">
                  {filteredColumns.map(col => {
                    const Icon = TYPE_ICONS[col.type] || Type;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => insertField(col)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="h-6 w-6 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-medium text-foreground truncate">{col.name}</span>
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
            <div className="mb-2 shrink-0">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 shrink-0">Operators</span>
                <span className="flex-1 h-px bg-border/40" />
              </div>
              <div className="flex flex-wrap gap-1">
                {OPERATORS.map(op => (
                  <button
                    key={op.label}
                    type="button"
                    title={op.title}
                    onClick={() => insertText(op.insert)}
                    className="h-6 min-w-[26px] px-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted hover:border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mb-2 shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search functions…"
                value={fnSearch}
                onChange={e => { setFnSearch(e.target.value); setAutoSearchQuery(''); setFieldSearch(''); }}
                className="w-full h-7 rounded-lg border border-border/60 bg-muted/20 pl-7 pr-3 text-xs focus:outline-none focus:border-violet-400/50 placeholder:text-muted-foreground/30"
              />
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              {fnSearch ? (
                filteredFunctions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-1.5">
                    <FunctionSquare className="h-6 w-6 text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground/50">No functions match</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-px">
                    {filteredFunctions.map(fn => (
                      <FunctionCard key={fn.name} fn={fn} onInsert={insertFunction} />
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col">
                  {FORMULA_CATEGORIES.map((cat, ci) => {
                    const catFns = FORMULA_FUNCTIONS.filter(f => f.category === cat);
                    const isExpanded = expandedCategories.has(cat);
                    return (
                      <div key={cat} className={ci > 0 ? 'mt-2' : ''}>
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="w-full flex items-center gap-2 px-1 py-1 mb-0.5 hover:bg-muted/40 rounded-lg transition-colors"
                        >
                          {isExpanded
                            ? <ChevronDown className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                            : <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                          }
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${CATEGORY_TEXT[cat]}`}>{cat}</span>
                          <span className="flex-1 h-px bg-border/50 ml-1" />
                          <span className="text-[10px] text-muted-foreground/40 tabular-nums">{catFns.length}</span>
                        </button>
                        {isExpanded && (
                          <div className="flex flex-col gap-px pl-1">
                            {catFns.map(fn => (
                              <FunctionCard key={fn.name} fn={fn} onInsert={insertFunction} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border/60 flex items-center justify-between shrink-0 rounded-b-2xl bg-muted/20">
        <p className="text-[10px] text-muted-foreground/50">
          Fields insert as <code className="font-mono text-teal-600 dark:text-teal-400/80 text-[10px]">{'{db_field_name}'}</code>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-7 px-3 rounded-xl border border-border/70 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { const t = value.trim(); if (t) onApply(t); }}
            disabled={!value.trim()}
            className="h-7 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm shadow-violet-500/25"
          >
            Apply Formula
          </button>
        </div>
      </div>
    </div>
  );
}
