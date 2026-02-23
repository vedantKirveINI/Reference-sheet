import { useMemo } from 'react';
import { ITableData, CellType } from '@/types';
import { useStatisticsStore, StatisticsFunction, getAvailableFunctions } from '@/stores/statistics-store';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useAIChatStore } from '@/stores/ai-chat-store';
import { Search, Sparkles, Filter, ArrowUpDown, Layers } from 'lucide-react';

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
      className="h-8 border-t border-border/40 flex items-center px-3 gap-2 shrink-0 select-none bg-background"
    >

      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <span className="text-[11px] font-medium text-foreground/70 whitespace-nowrap">
          {visibleRecordCount} record{visibleRecordCount !== 1 ? 's' : ''}
        </span>
        {!hoveredColumn && (
          <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">
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
                    className={fn === hoveredFn ? 'font-medium text-foreground bg-accent' : ''}
                  >
                    {fn}
                    {fn === hoveredFn && fn !== StatisticsFunction.None && (
                      <span className="ml-auto text-xs text-muted-foreground">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center px-4 min-w-0">
        <button
          onClick={() => useAIChatStore.getState().setIsOpen(true)}
          className="relative w-full max-w-md"
        >
          <div className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-1.5 shadow-sm hover:shadow transition-shadow cursor-pointer">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
            <span className="flex-1 text-left text-xs text-muted-foreground truncate">
              Ask AI anything about your data...
            </span>
            <Search className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" strokeWidth={1.5} />
          </div>
        </button>
      </div>

      {(filterCount > 0 || sortCount > 0 || groupCount > 0) && (
        <div className="flex items-center gap-2 shrink-0">
          {filterCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
              <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{filteredOutCount} filtered</span>
            </div>
          )}
          {sortCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
              <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{sortCount} sort{sortCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {groupCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
              <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>{groupCount} group{groupCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
