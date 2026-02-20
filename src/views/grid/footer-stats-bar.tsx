import { useMemo, useState } from 'react';
import { ITableData, CellType } from '@/types';
import { useStatisticsStore, StatisticsFunction, getAvailableFunctions } from '@/stores/statistics-store';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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
  const [aiQuery, setAiQuery] = useState('');

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
    <div className="h-9 bg-gray-50/80 border-t border-gray-200 flex items-center px-3 gap-2 shrink-0 select-none backdrop-blur-sm">

      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
          {visibleRecordCount} record{visibleRecordCount !== 1 ? 's' : ''}
        </span>

        {hoveredColumn && (
          <div className="flex items-center gap-2 text-xs text-gray-600 border-l border-gray-300 pl-3 animate-in fade-in duration-150">
            <span className="font-medium text-gray-700 max-w-[120px] truncate">
              {hoveredColumn.name}
            </span>

            {quickStats && hoveredFn === StatisticsFunction.None && (
              <div className="flex items-center gap-2 text-gray-400">
                <span>Sum: {quickStats.sum}</span>
                <span className="text-gray-300">|</span>
                <span>Avg: {quickStats.avg}</span>
                <span className="text-gray-300">|</span>
                <span>Count: {quickStats.count}</span>
              </div>
            )}

            {hoveredFn !== StatisticsFunction.None && (
              <span className="text-blue-600 font-medium">
                {hoveredFn}: {hoveredValue}
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[10px] text-gray-400 hover:text-gray-600 border border-gray-300 rounded px-1.5 py-0.5 hover:bg-gray-100 transition-colors">
                  {hoveredFn === StatisticsFunction.None ? 'Σ' : hoveredFn}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="min-w-[140px]">
                {availableFns.map((fn) => (
                  <DropdownMenuItem
                    key={fn}
                    onClick={() => setColumnStatistic(hoveredColumn.id, fn)}
                    className={fn === hoveredFn ? 'font-medium text-blue-600 bg-blue-50' : ''}
                  >
                    {fn}
                    {fn === hoveredFn && fn !== StatisticsFunction.None && (
                      <span className="ml-auto text-xs text-blue-500">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex-1 flex justify-center px-4 min-w-0">
        <div className="relative w-full max-w-md">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm hover:shadow transition-shadow focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask AI anything about your data..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-gray-700 placeholder:text-gray-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && aiQuery.trim()) {
                  setAiQuery('');
                }
              }}
            />
            <Search className="w-3.5 h-3.5 text-gray-300 shrink-0" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {filterCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 rounded-full px-2 py-0.5">
            <Filter className="w-3 h-3" />
            <span>{filteredOutCount} filtered</span>
          </div>
        )}
        {sortCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
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
        {filterCount === 0 && sortCount === 0 && groupCount === 0 && (
          <span className="text-[10px] text-gray-400">No active filters</span>
        )}
      </div>
    </div>
  );
}
