import { useMemo } from 'react';
import { ITableData, CellType } from '@/types';
import { useStatisticsStore, StatisticsFunction } from '@/stores/statistics-store';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface FooterStatsBarProps {
  data: ITableData;
  hiddenColumnIds: Set<string>;
  scrollLeft: number;
  zoomScale: number;
  frozenColumnCount: number;
  columnWidths: number[];
  visibleColumns: Array<{ id: string; name: string; type: string }>;
}

const NUMERIC_TYPES = new Set<string>([CellType.Number, CellType.Currency]);

function isNumericType(type: string): boolean {
  return NUMERIC_TYPES.has(type);
}

function getAvailableStats(type: string): StatisticsFunction[] {
  if (isNumericType(type)) {
    return [
      StatisticsFunction.None,
      StatisticsFunction.Count,
      StatisticsFunction.Sum,
      StatisticsFunction.Average,
      StatisticsFunction.Min,
      StatisticsFunction.Max,
    ];
  }
  return [StatisticsFunction.None, StatisticsFunction.Count];
}

function computeStatistic(
  data: ITableData,
  columnId: string,
  columnType: string,
  fn: StatisticsFunction
): string {
  if (fn === StatisticsFunction.None) return '';

  const values: number[] = [];
  let nonEmptyCount = 0;

  for (const record of data.records) {
    if (record.id?.startsWith('__group__')) continue;
    const cell = record.cells[columnId];
    if (!cell) continue;

    const isEmpty =
      cell.data === null ||
      cell.data === undefined ||
      cell.data === '' ||
      (Array.isArray(cell.data) && cell.data.length === 0);

    if (!isEmpty) {
      nonEmptyCount++;
    }

    if (isNumericType(columnType)) {
      let numVal: number | null = null;
      if (columnType === CellType.Currency && cell.data && typeof cell.data === 'object' && 'currencyValue' in cell.data) {
        numVal = (cell.data as { currencyValue: number }).currencyValue;
      } else if (columnType === CellType.Number && typeof cell.data === 'number') {
        numVal = cell.data;
      }
      if (numVal !== null && !isNaN(numVal)) {
        values.push(numVal);
      }
    }
  }

  switch (fn) {
    case StatisticsFunction.Count:
      return String(nonEmptyCount);
    case StatisticsFunction.Sum:
      return values.length > 0 ? formatNum(values.reduce((a, b) => a + b, 0)) : '0';
    case StatisticsFunction.Average:
      return values.length > 0 ? formatNum(values.reduce((a, b) => a + b, 0) / values.length) : '-';
    case StatisticsFunction.Min:
      return values.length > 0 ? formatNum(Math.min(...values)) : '-';
    case StatisticsFunction.Max:
      return values.length > 0 ? formatNum(Math.max(...values)) : '-';
    default:
      return '';
  }
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

const ROW_HEADER_WIDTH = 60;

export function FooterStatsBar({
  data,
  scrollLeft,
  zoomScale,
  frozenColumnCount,
  columnWidths,
  visibleColumns,
}: FooterStatsBarProps) {
  const { columnStatisticConfig, setColumnStatistic } = useStatisticsStore();

  const frozenWidth = useMemo(() => {
    let w = 0;
    for (let i = 0; i < frozenColumnCount && i < columnWidths.length; i++) {
      w += columnWidths[i] * zoomScale;
    }
    return w;
  }, [frozenColumnCount, columnWidths, zoomScale]);

  const frozenCells = visibleColumns.slice(0, frozenColumnCount);
  const scrollableCells = visibleColumns.slice(frozenColumnCount);
  const frozenWidths = columnWidths.slice(0, frozenColumnCount);
  const scrollableWidths = columnWidths.slice(frozenColumnCount);

  return (
    <div
      style={{
        height: 28,
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: ROW_HEADER_WIDTH * zoomScale,
          minWidth: ROW_HEADER_WIDTH * zoomScale,
          height: '100%',
          borderRight: '1px solid #e5e7eb',
        }}
      />

      {frozenColumnCount > 0 && (
        <div
          style={{
            display: 'flex',
            width: frozenWidth,
            minWidth: frozenWidth,
            height: '100%',
            zIndex: 2,
            position: 'relative',
          }}
        >
          {frozenCells.map((col, i) => (
            <StatCell
              key={col.id}
              column={col}
              width={frozenWidths[i] * zoomScale}
              data={data}
              currentFn={columnStatisticConfig[col.id] ?? StatisticsFunction.None}
              onSelect={(fn) => setColumnStatistic(col.id, fn)}
            />
          ))}
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            transform: `translateX(${-scrollLeft * zoomScale}px)`,
            height: '100%',
          }}
        >
          {scrollableCells.map((col, i) => (
            <StatCell
              key={col.id}
              column={col}
              width={scrollableWidths[i] * zoomScale}
              data={data}
              currentFn={columnStatisticConfig[col.id] ?? StatisticsFunction.None}
              onSelect={(fn) => setColumnStatistic(col.id, fn)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCell({
  column,
  width,
  data,
  currentFn,
  onSelect,
}: {
  column: { id: string; name: string; type: string };
  width: number;
  data: ITableData;
  currentFn: StatisticsFunction;
  onSelect: (fn: StatisticsFunction) => void;
}) {
  const availableStats = useMemo(() => getAvailableStats(column.type), [column.type]);
  const computedValue = useMemo(
    () => computeStatistic(data, column.id, column.type, currentFn),
    [data, column.id, column.type, currentFn]
  );

  const hasActiveStat = currentFn !== StatisticsFunction.None;

  return (
    <div
      style={{
        width,
        minWidth: width,
        height: '100%',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 4,
        boxSizing: 'border-box',
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              color: hasActiveStat ? '#3b82f6' : '#6b7280',
              fontFamily: 'inherit',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {hasActiveStat ? (
              <span>{currentFn}: {computedValue}</span>
            ) : (
              <span style={{ opacity: 0 }}>—</span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="min-w-[120px]">
          {availableStats.map((fn) => (
            <DropdownMenuItem
              key={fn}
              onClick={() => onSelect(fn)}
              className={fn === currentFn ? 'font-medium text-blue-500' : ''}
            >
              {fn}
              {fn !== StatisticsFunction.None && fn === currentFn && (
                <span className="ml-auto text-xs text-blue-500">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
