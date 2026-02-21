import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { ITableData, CellType } from '@/types';
import { useStatisticsStore, StatisticsFunction, getAvailableFunctions } from '@/stores/statistics-store';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Search, Sparkles, Filter, ArrowUpDown, Layers, Send, X, Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AI_RESPONSES = [
  "I can help with sorting, filtering, and analyzing your data. This feature is coming soon!",
  "Great question! I'm working on understanding your data better. Full AI capabilities are on the way.",
  "I'd love to help with that! AI-powered data analysis is coming in a future update.",
  "That's an interesting query. Soon I'll be able to sort, filter, group, and summarize your data automatically.",
  "I'm here to assist! Advanced AI features for data manipulation are being developed.",
  "Thanks for trying the AI assistant! I'll soon be able to create formulas, suggest filters, and generate insights.",
];

interface FooterStatsBarProps {
  data: ITableData;
  totalRecordCount: number;
  visibleRecordCount: number;
  sortCount: number;
  filterCount: number;
  groupCount: number;
}

const NUMERIC_TYPES = new Set<string>([
  CellType.Number, CellType.Currency, CellType.Slider,
  CellType.Rating, CellType.OpinionScale,
]);

const DATE_TYPES = new Set<string>([
  CellType.DateTime, CellType.CreatedTime, CellType.Time,
]);

function extractNumericValue(cell: any, columnType: string): number | null {
  if (!cell || cell.data === null || cell.data === undefined) return null;
  if (columnType === CellType.Currency && cell.data && typeof cell.data === 'object' && 'currencyValue' in cell.data) {
    const v = (cell.data as { currencyValue: number }).currencyValue;
    return typeof v === 'number' && !isNaN(v) ? v : null;
  }
  if (typeof cell.data === 'number' && !isNaN(cell.data)) return cell.data;
  return null;
}

function extractDateTimestamp(cell: any): number | null {
  if (!cell || cell.data === null || cell.data === undefined || cell.data === '') return null;
  const val = cell.data;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const ts = new Date(val).getTime();
    return isNaN(ts) ? null : ts;
  }
  if (val instanceof Date) return val.getTime();
  return null;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function computeStatistic(
  data: ITableData,
  columnId: string,
  columnType: string,
  fn: StatisticsFunction
): string {
  if (fn === StatisticsFunction.None) return '';

  const values: number[] = [];
  let filledCount = 0;
  let totalCount = 0;
  const uniqueSet = new Set<string>();

  for (const record of data.records) {
    if (record.id?.startsWith('__group__')) continue;
    totalCount++;
    const cell = record.cells[columnId];
    if (!cell) continue;

    const isEmpty =
      cell.data === null ||
      cell.data === undefined ||
      cell.data === '' ||
      (Array.isArray(cell.data) && cell.data.length === 0);

    if (!isEmpty) {
      filledCount++;
      const strVal = typeof cell.data === 'object' ? JSON.stringify(cell.data) : String(cell.data);
      uniqueSet.add(strVal);
    }

    if (NUMERIC_TYPES.has(columnType)) {
      const numVal = extractNumericValue(cell, columnType);
      if (numVal !== null) values.push(numVal);
    } else if (DATE_TYPES.has(columnType)) {
      const ts = extractDateTimestamp(cell);
      if (ts !== null) values.push(ts);
    }
  }

  const emptyCount = totalCount - filledCount;
  const isDate = DATE_TYPES.has(columnType);

  switch (fn) {
    case StatisticsFunction.Count:
      return String(totalCount);
    case StatisticsFunction.Filled:
      return String(filledCount);
    case StatisticsFunction.Empty:
      return String(emptyCount);
    case StatisticsFunction.PercentFilled:
      return totalCount > 0 ? `${Math.round((filledCount / totalCount) * 100)}%` : '0%';
    case StatisticsFunction.Unique:
      return String(uniqueSet.size);
    case StatisticsFunction.Sum:
      return values.length > 0 ? formatNum(values.reduce((a, b) => a + b, 0)) : '0';
    case StatisticsFunction.Average:
      return values.length > 0 ? formatNum(values.reduce((a, b) => a + b, 0) / values.length) : '-';
    case StatisticsFunction.Min:
      if (values.length === 0) return '-';
      return isDate ? formatDate(Math.min(...values)) : formatNum(Math.min(...values));
    case StatisticsFunction.Max:
      if (values.length === 0) return '-';
      return isDate ? formatDate(Math.max(...values)) : formatNum(Math.max(...values));
    case StatisticsFunction.Range:
      return values.length > 0 ? formatNum(Math.max(...values) - Math.min(...values)) : '-';
    case StatisticsFunction.Median: {
      if (values.length === 0) return '-';
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      return isDate ? formatDate(median) : formatNum(median);
    }
    default:
      return '';
  }
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function FooterStatsBar({
  data,
  totalRecordCount,
  visibleRecordCount,
  sortCount,
  filterCount,
  groupCount,
}: FooterStatsBarProps) {
  const { columnStatisticConfig, setColumnStatistic, hoveredColumnId } = useStatisticsStore();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndexRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  }, [chatOpen]);

  const handleSendMessage = useCallback(() => {
    const text = chatInput.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');

    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: AI_RESPONSES[responseIndexRef.current % AI_RESPONSES.length],
        timestamp: new Date(),
      };
      responseIndexRef.current++;
      setMessages(prev => [...prev, aiMessage]);
    }, 500);
  }, [chatInput]);

  const hoveredColumn = useMemo(() => {
    if (!hoveredColumnId) return null;
    return data.columns.find(c => c.id === hoveredColumnId) ?? null;
  }, [hoveredColumnId, data.columns]);

  const hoveredFn = hoveredColumnId ? (columnStatisticConfig[hoveredColumnId] ?? StatisticsFunction.None) : StatisticsFunction.None;
  const hoveredValue = useMemo(() => {
    if (!hoveredColumn || hoveredFn === StatisticsFunction.None) return '';
    return computeStatistic(data, hoveredColumn.id, hoveredColumn.type, hoveredFn);
  }, [data, hoveredColumn, hoveredFn]);

  const quickStats = useMemo(() => {
    if (!hoveredColumn) return null;
    const type = hoveredColumn.type;
    const isNumeric = NUMERIC_TYPES.has(type);
    if (!isNumeric) return null;

    const sum = computeStatistic(data, hoveredColumn.id, type, StatisticsFunction.Sum);
    const avg = computeStatistic(data, hoveredColumn.id, type, StatisticsFunction.Average);
    const count = computeStatistic(data, hoveredColumn.id, type, StatisticsFunction.Count);
    return { sum, avg, count };
  }, [data, hoveredColumn]);

  const availableFns = useMemo(() => {
    if (!hoveredColumn) return [];
    return getAvailableFunctions(hoveredColumn.type);
  }, [hoveredColumn]);

  const filteredOutCount = totalRecordCount - visibleRecordCount;

  return (
    <div 
      className="h-9 border-t flex items-center px-3 gap-2 shrink-0 select-none backdrop-blur-sm"
      style={{
        background: `linear-gradient(135deg, var(--color-background, white) 0%, var(--color-theme-accent-subtle, #f0fdf4) 100%)`,
        borderColor: `var(--color-theme-accent-light, #d1fae5)`
      }}
    >

      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded whitespace-nowrap">
          {visibleRecordCount} record{visibleRecordCount !== 1 ? 's' : ''}
        </span>
        {!hoveredColumn && (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            ← hover to select summary
          </span>
        )}

        {hoveredColumn && (
          <div className="flex items-center gap-2 text-xs text-foreground/70 border-l border-border pl-3 animate-in fade-in duration-150">
            <span className="font-medium text-foreground/80 max-w-[120px] truncate">
              {hoveredColumn.name}
            </span>

            {quickStats && hoveredFn === StatisticsFunction.None && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Sum: {quickStats.sum}</span>
                <span className="text-border">|</span>
                <span>Avg: {quickStats.avg}</span>
                <span className="text-border">|</span>
                <span>Count: {quickStats.count}</span>
              </div>
            )}

            {hoveredFn !== StatisticsFunction.None && (
              <span className="text-brand-700 font-medium">
                {hoveredFn}: {hoveredValue}
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[10px] text-muted-foreground hover:text-foreground/70 border border-border rounded px-1.5 py-0.5 hover:bg-muted transition-colors">
                  {hoveredFn === StatisticsFunction.None ? 'Σ' : hoveredFn}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="min-w-[140px]">
                {availableFns.map((fn) => (
                  <DropdownMenuItem
                    key={fn}
                    onClick={() => setColumnStatistic(hoveredColumn.id, fn)}
                    className={fn === hoveredFn ? 'font-medium text-brand-700 bg-brand-50' : ''}
                  >
                    {fn}
                    {fn === hoveredFn && fn !== StatisticsFunction.None && (
                      <span className="ml-auto text-xs text-brand-500">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center px-4 min-w-0">
        <Popover open={chatOpen} onOpenChange={setChatOpen}>
          <PopoverTrigger asChild>
            <button className="relative w-full max-w-md">
              <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-1.5 shadow-sm hover:shadow transition-shadow cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="flex-1 text-left text-xs text-muted-foreground truncate">
                  Ask AI anything about your data...
                </span>
                <Search className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            sideOffset={8}
            className="w-[380px] p-0 rounded-xl shadow-xl border border-border"
          >
            <div className="flex flex-col" style={{ maxHeight: '350px' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-semibold text-foreground">AI Assistant</span>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '200px', maxHeight: '260px' }}>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center mb-3">
                      <Bot className="w-5 h-5 text-brand-600" />
                    </div>
                    <p className="text-sm font-medium text-foreground/80">How can I help?</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      Ask me about sorting, filtering, or analyzing your data.
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-brand-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-muted text-foreground/80 rounded-bl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border px-3 py-2.5">
                <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-300">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="p-1.5 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {(filterCount > 0 || sortCount > 0 || groupCount > 0) && (
        <div className="flex items-center gap-2 shrink-0">
          {filterCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 rounded-full px-2 py-0.5">
              <Filter className="w-3 h-3" />
              <span>{filteredOutCount} filtered</span>
            </div>
          )}
          {sortCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortCount} sort{sortCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {groupCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5">
              <Layers className="w-3 h-3" />
              <span>{groupCount} group{groupCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
