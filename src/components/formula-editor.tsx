import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Hash,
  Type,
  GitBranch,
  Calendar,
  Search,
  ChevronRight,
  ChevronDown,
  X,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FORMULA_FUNCTIONS,
  FORMULA_FUNCTION_CATEGORIES,
  FORMULA_EXAMPLES,
  getFunctionByName,
  type FormulaFunctionDef,
} from "@/lib/formula-functions";

export interface ExpressionBlock {
  type: "FUNCTIONS" | "FIELDS" | "PRIMITIVES" | "OPERATORS";
  value?: string;
  displayValue?: string;
  category?: string;
  tableData?: {
    id?: string;
    fieldId?: string;
    dbFieldName: string;
    name?: string;
  };
}

export interface FormulaExpression {
  type: "FX";
  blocks: ExpressionBlock[];
}

export interface FieldInfo {
  id: string;
  name: string;
  dbFieldName: string;
  type: string;
}

interface FormulaEditorProps {
  fields: FieldInfo[];
  value?: ExpressionBlock[];
  onChange: (blocks: ExpressionBlock[]) => void;
  error?: string;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Numeric: Hash,
  Text: Type,
  Logical: GitBranch,
  Date: Calendar,
};

const FIELD_TYPE_ICONS: Record<string, React.ElementType> = {
  String: Type,
  Number: Hash,
  DateTime: Calendar,
  Formula: Hash,
  Currency: Hash,
};

interface TokenSpan {
  text: string;
  type: "field" | "function" | "operator" | "primitive" | "text" | "string";
  fieldInfo?: FieldInfo;
}

function tokenizeDisplayText(text: string, fields: FieldInfo[]): TokenSpan[] {
  if (!text) return [];
  const tokens: TokenSpan[] = [];
  const fieldPattern = fields
    .map((f) => f.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
    .join("|");
  const funcNames = FORMULA_FUNCTIONS.map((f) => f.name).join("|");
  const regexParts = [];
  if (fieldPattern) regexParts.push(`\\{(${fieldPattern})\\}`);
  regexParts.push(`(${funcNames})(?=\\s*\\()`);
  regexParts.push(`("(?:[^"\\\\]|\\\\.)*")`);
  regexParts.push(`('(?:[^'\\\\]|\\\\.)*')`);
  regexParts.push(`(\\d+\\.?\\d*)`);
  regexParts.push(`([+\\-*/=!<>&;(),]|!=|>=|<=)`);
  const regex = new RegExp(regexParts.join("|"), "gi");
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const gap = text.slice(lastIndex, match.index);
      if (gap.trim()) tokens.push({ text: gap, type: "text" });
    }
    const fullMatch = match[0];
    if (match[1]) {
      const field = fields.find(
        (f) => f.name.toLowerCase() === match[1].toLowerCase()
      );
      tokens.push({ text: match[1], type: "field", fieldInfo: field });
    } else if (match[2]) {
      tokens.push({ text: match[2].toUpperCase(), type: "function" });
    } else if (match[3] || match[4]) {
      tokens.push({ text: fullMatch, type: "string" });
    } else if (match[5]) {
      tokens.push({ text: fullMatch, type: "primitive" });
    } else if (match[6]) {
      tokens.push({ text: fullMatch, type: "operator" });
    } else {
      tokens.push({ text: fullMatch, type: "text" });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    const remainder = text.slice(lastIndex);
    if (remainder.trim()) tokens.push({ text: remainder, type: "text" });
  }
  return tokens;
}

function detectCurrentFunction(
  text: string,
  cursorPos: number
): { funcName: string; paramIndex: number } | null {
  let depth = 0;
  let paramIndex = 0;
  let funcStart = -1;
  for (let i = cursorPos - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ")") {
      depth++;
    } else if (ch === "(") {
      if (depth === 0) {
        funcStart = i;
        break;
      }
      depth--;
    } else if (ch === ";" && depth === 0) {
      paramIndex++;
    }
  }
  if (funcStart < 0) return null;
  let nameEnd = funcStart;
  let nameStart = nameEnd - 1;
  while (nameStart >= 0 && /[A-Za-z_]/.test(text[nameStart])) nameStart--;
  nameStart++;
  const funcName = text.slice(nameStart, nameEnd).toUpperCase();
  if (!funcName) return null;
  const fn = getFunctionByName(funcName);
  if (!fn) return null;
  return { funcName, paramIndex };
}

function parseDisplayTextToBlocks(
  text: string,
  fields: FieldInfo[]
): ExpressionBlock[] {
  if (!text.trim()) return [];
  const blocks: ExpressionBlock[] = [];
  const fieldPattern = fields
    .map((f) => f.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
    .join("|");
  const funcNames = FORMULA_FUNCTIONS.map((f) => f.name).join("|");
  const regexParts: string[] = [];
  if (fieldPattern) regexParts.push(`\\{(${fieldPattern})\\}`);
  regexParts.push(`(${funcNames})(?=\\s*\\()`);
  regexParts.push(`("(?:[^"\\\\]|\\\\.)*")`);
  regexParts.push(`('(?:[^'\\\\]|\\\\.)*')`);
  regexParts.push(`(\\d+\\.?\\d*)`);
  regexParts.push(`([+\\-*/;])`);
  regexParts.push(`([()=!<>&]|!=|>=|<=)`);
  const regex = new RegExp(regexParts.join("|"), "gi");
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      const field = fields.find(
        (f) => f.name.toLowerCase() === match[1].toLowerCase()
      );
      if (field) {
        blocks.push({
          type: "FIELDS",
          displayValue: field.name,
          tableData: {
            id: field.id,
            fieldId: field.id,
            dbFieldName: field.dbFieldName,
            name: field.name,
          },
        });
      }
    } else if (match[2]) {
      blocks.push({ type: "FUNCTIONS", value: match[2].toUpperCase() });
    } else if (match[3] || match[4]) {
      const raw = match[3] || match[4];
      const inner = raw.slice(1, -1);
      blocks.push({ type: "PRIMITIVES", value: inner });
    } else if (match[5]) {
      blocks.push({ type: "PRIMITIVES", value: match[5] });
    } else if (match[6]) {
      const op = match[6];
      if (op === ";") {
        blocks.push({ type: "OPERATORS", value: ";" });
      } else {
        blocks.push({
          type: "OPERATORS",
          value: op,
          category: "arithmetic",
        });
      }
    } else if (match[7]) {
      const op = match[7];
      if (op === "(" || op === ")") {
        blocks.push({ type: "OPERATORS", value: op });
      } else {
        blocks.push({
          type: "OPERATORS",
          value: op,
          category: "comparison",
        });
      }
    }
  }
  return blocks;
}

function blocksToDisplayText(
  blocks: ExpressionBlock[],
  _fields: FieldInfo[]
): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "FIELDS":
          return `{${b.tableData?.name || b.displayValue || b.tableData?.dbFieldName || ""}}`;
        case "FUNCTIONS":
          return b.value || "";
        case "PRIMITIVES": {
          const v = b.value || "";
          if (/^\d+\.?\d*$/.test(v)) return v;
          return `"${v}"`;
        }
        case "OPERATORS":
          return b.value || "";
        default:
          return "";
      }
    })
    .join(" ");
}

export default function FormulaEditor({
  fields,
  value,
  onChange,
  error,
}: FormulaEditorProps) {
  const initialText = value ? blocksToDisplayText(value, fields) : "";
  const [expressionText, setExpressionText] = useState(initialText);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(FORMULA_FUNCTION_CATEGORIES.map((c) => c.id))
  );
  const [selectedFunction, setSelectedFunction] =
    useState<FormulaFunctionDef | null>(null);
  const [hoveredField, setHoveredField] = useState<FieldInfo | null>(null);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentFuncInfo = useMemo(
    () => detectCurrentFunction(expressionText, cursorPos),
    [expressionText, cursorPos]
  );

  const currentFuncDef = useMemo(() => {
    if (!currentFuncInfo) return null;
    return getFunctionByName(currentFuncInfo.funcName) || null;
  }, [currentFuncInfo]);

  const filteredFields = useMemo(() => {
    if (!searchQuery) return fields;
    const q = searchQuery.toLowerCase();
    return fields.filter((f) => f.name.toLowerCase().includes(q));
  }, [fields, searchQuery]);

  const filteredFunctions = useMemo(() => {
    if (!searchQuery) return FORMULA_FUNCTIONS;
    const q = searchQuery.toLowerCase();
    return FORMULA_FUNCTIONS.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleTextChange = useCallback(
    (newText: string) => {
      setExpressionText(newText);
      const blocks = parseDisplayTextToBlocks(newText, fields);
      onChange(blocks);
    },
    [fields, onChange]
  );

  const insertAtCursor = useCallback(
    (insertText: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        handleTextChange(expressionText + insertText);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = expressionText.slice(0, start);
      const after = expressionText.slice(end);
      const needsSpaceBefore =
        before.length > 0 && !/[\s(;]$/.test(before);
      const prefix = needsSpaceBefore ? " " : "";
      const newText = before + prefix + insertText + after;
      handleTextChange(newText);
      requestAnimationFrame(() => {
        const newPos = start + prefix.length + insertText.length;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
        setCursorPos(newPos);
      });
    },
    [expressionText, handleTextChange]
  );

  const insertField = useCallback(
    (field: FieldInfo) => {
      insertAtCursor(`{${field.name}}`);
    },
    [insertAtCursor]
  );

  const insertFunction = useCallback(
    (func: FormulaFunctionDef) => {
      const textarea = textareaRef.current;
      const insertText = `${func.name}()`;
      if (!textarea) {
        handleTextChange(expressionText + insertText);
        return;
      }
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = expressionText.slice(0, start);
      const after = expressionText.slice(end);
      const needsSpaceBefore =
        before.length > 0 && !/[\s(;]$/.test(before);
      const prefix = needsSpaceBefore ? " " : "";
      const newText = before + prefix + insertText + after;
      handleTextChange(newText);
      requestAnimationFrame(() => {
        const newPos = start + prefix.length + insertText.length - 1;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
        setCursorPos(newPos);
      });
    },
    [expressionText, handleTextChange]
  );

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  const tokens = useMemo(
    () => tokenizeDisplayText(expressionText, fields),
    [expressionText, fields]
  );

  useEffect(() => {
    if (value && !expressionText) {
      const text = blocksToDisplayText(value, fields);
      if (text) setExpressionText(text);
    }
  }, []);

  const guideContent = selectedFunction || hoveredField;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-background overflow-hidden island">
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
          Formula Editor
        </span>
      </div>

      <div className="relative border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 px-3 py-2.5 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden"
          aria-hidden="true"
        >
          {tokens.length > 0
            ? tokens.map((token, i) => {
                switch (token.type) {
                  case "field":
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 text-xs font-medium mx-0.5"
                      >
                        {token.text}
                      </span>
                    );
                  case "function":
                    return (
                      <span
                        key={i}
                        className="text-blue-600 dark:text-blue-400 font-semibold"
                      >
                        {token.text}
                      </span>
                    );
                  case "operator":
                    return (
                      <span
                        key={i}
                        className="text-amber-600 dark:text-amber-400 font-bold"
                      >
                        {token.text}
                      </span>
                    );
                  case "string":
                    return (
                      <span
                        key={i}
                        className="text-green-600 dark:text-green-400"
                      >
                        {token.text}
                      </span>
                    );
                  case "primitive":
                    return (
                      <span
                        key={i}
                        className="text-orange-600 dark:text-orange-400"
                      >
                        {token.text}
                      </span>
                    );
                  default:
                    return (
                      <span key={i} className="text-foreground">
                        {token.text}
                      </span>
                    );
                }
              })
            : null}
        </div>
        <textarea
          ref={textareaRef}
          value={expressionText}
          onChange={(e) => handleTextChange(e.target.value)}
          onSelect={(e) =>
            setCursorPos((e.target as HTMLTextAreaElement).selectionStart)
          }
          onClick={(e) =>
            setCursorPos((e.target as HTMLTextAreaElement).selectionStart)
          }
          onKeyUp={(e) =>
            setCursorPos((e.target as HTMLTextAreaElement).selectionStart)
          }
          placeholder="Enter formula expression..."
          className="relative w-full bg-transparent font-mono text-sm leading-relaxed text-transparent caret-foreground resize-none outline-none px-3 py-2.5 min-h-[5rem] max-h-[12rem] overflow-y-auto"
          style={{ caretColor: "var(--foreground)" }}
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20 min-h-[2.25rem]">
        <div className="flex-1 min-w-0">
          {currentFuncDef ? (
            <code className="flex items-center gap-0.5 text-xs text-muted-foreground font-mono flex-wrap">
              <span className="font-semibold text-foreground">
                {currentFuncDef.name}
              </span>
              <span>(</span>
              {currentFuncDef.params.map((param, idx) => (
                <span key={idx} className="flex items-center">
                  {idx > 0 && <span className="mr-0.5">,</span>}
                  <span
                    className={`px-1 py-0.5 rounded ${
                      currentFuncInfo?.paramIndex === idx
                        ? "bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 font-medium"
                        : ""
                    } ${!param.required ? "italic opacity-70" : ""}`}
                  >
                    {!param.required ? `[${param.name}]` : param.name}
                  </span>
                </span>
              ))}
              <span>)</span>
            </code>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Type a function name to see parameter hints
            </span>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-1 text-xs text-destructive ml-2 shrink-0">
            <AlertCircle className="w-3 h-3" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex min-h-[14rem] max-h-[18rem]">
        <div className="w-[13rem] border-r border-border flex flex-col shrink-0">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 pl-7 text-xs bg-muted/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredFields.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Fields
                </div>
                {filteredFields.map((field) => {
                  const Icon = FIELD_TYPE_ICONS[field.type] || Type;
                  return (
                    <button
                      key={field.id}
                      onClick={() => insertField(field)}
                      onMouseEnter={() => {
                        setHoveredField(field);
                        setSelectedFunction(null);
                      }}
                      onMouseLeave={() => setHoveredField(null)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-left hover:bg-accent/50 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{field.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="py-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Functions
              </div>
              {FORMULA_FUNCTION_CATEGORIES.map((cat) => {
                const catFunctions = filteredFunctions.filter(
                  (f) => f.category === cat.id
                );
                if (catFunctions.length === 0) return null;
                const isExpanded = expandedCategories.has(cat.id);
                const Icon = CATEGORY_ICONS[cat.id] || Hash;
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/60">
                        {catFunctions.length}
                      </span>
                    </button>
                    {isExpanded &&
                      catFunctions.map((func) => (
                        <button
                          key={func.name}
                          onClick={() => insertFunction(func)}
                          onMouseEnter={() => {
                            setSelectedFunction(func);
                            setHoveredField(null);
                          }}
                          className="flex items-center w-full pl-8 pr-2.5 py-1.5 text-xs text-left hover:bg-accent/50 transition-colors"
                        >
                          <span className="font-mono text-blue-600 dark:text-blue-400">
                            {func.name}
                          </span>
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          {selectedFunction ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-foreground font-mono">
                  {selectedFunction.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {selectedFunction.description}
                </p>
              </div>
              <div>
                <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Syntax
                </h5>
                <code className="block text-xs font-mono bg-muted/50 px-2 py-1.5 rounded text-foreground">
                  {selectedFunction.syntax}
                </code>
              </div>
              <div>
                <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Example
                </h5>
                <code className="block text-xs font-mono bg-muted/50 px-2 py-1.5 rounded text-foreground">
                  {selectedFunction.example}
                </code>
              </div>
              {selectedFunction.params.length > 0 && (
                <div>
                  <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Parameters
                  </h5>
                  <div className="space-y-1">
                    {selectedFunction.params.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs"
                      >
                        <code className="font-mono text-foreground shrink-0 mt-px">
                          {p.name}
                        </code>
                        <span className="text-muted-foreground">
                          {p.description}
                          {!p.required && (
                            <span className="italic ml-1">(optional)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : hoveredField ? (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-foreground">
                {hoveredField.name}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">
                  {hoveredField.type}
                </span>
                <span>{hoveredField.dbFieldName}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click to insert this field reference into your formula. Field
                references are shown as{" "}
                <span className="inline-flex items-center px-1 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-medium">
                  pills
                </span>{" "}
                in the editor.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <Lightbulb className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hover over a function or field to see its documentation.
                Click to insert it into your formula.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-muted/20 overflow-x-auto">
        <span className="text-[10px] font-medium text-muted-foreground shrink-0 uppercase tracking-wider">
          Examples:
        </span>
        {FORMULA_EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => handleTextChange(ex)}
            className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-border/50"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
