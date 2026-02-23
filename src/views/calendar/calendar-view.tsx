import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import { ITableData, IColumn, IRecord, CellType } from "@/types";

interface CalendarViewProps {
  data: ITableData;
  onCellChange: (recordId: string, columnId: string, value: any) => void;
  onAddRow: () => void;
  onDeleteRows: (rowIndices: number[]) => void;
  onDuplicateRow: (rowIndex: number) => void;
  onExpandRecord?: (recordId: string) => void;
}

const MAX_VISIBLE_RECORDS = 3;

const DATE_FORMATS = [
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
  "YYYY-MM-DDTHH:mm:ssZ",
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DD",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "MM-DD-YYYY",
  "DD-MM-YYYY",
  "YYYY/MM/DD",
  "MMM DD, YYYY",
  "DD MMM YYYY",
  "MMMM DD, YYYY",
];

function getDateColumns(columns: IColumn[]): IColumn[] {
  return columns.filter(
    (col) => col.type === CellType.DateTime || col.type === CellType.CreatedTime
  );
}

function parseDate(value: string | null | undefined): dayjs.Dayjs | null {
  if (!value) return null;

  const d = dayjs(value);
  if (d.isValid()) return d;

  for (const fmt of DATE_FORMATS) {
    const parsed = dayjs(value, fmt);
    if (parsed.isValid()) return parsed;
  }

  return null;
}

function getRecordLabel(record: IRecord, columns: IColumn[]): string {
  const textCol = columns.find(
    (c) => c.type === CellType.String
  );
  if (textCol) {
    const cell = record.cells[textCol.id];
    if (cell && cell.displayData) return cell.displayData;
    if (cell && typeof cell.data === "string" && cell.data) return cell.data;
  }
  for (const col of columns) {
    const cell = record.cells[col.id];
    if (cell && cell.displayData) return cell.displayData;
  }
  return record.id.slice(0, 8);
}

function getCalendarDays(year: number, month: number) {
  const firstDay = dayjs().year(year).month(month).startOf("month");
  const lastDay = firstDay.endOf("month");

  const startDayOfWeek = firstDay.day();
  const daysInMonth = lastDay.date();

  const prevMonth = firstDay.subtract(1, "month");
  const daysInPrevMonth = prevMonth.endOf("month").date();

  const days: { date: dayjs.Dayjs; isCurrentMonth: boolean }[] = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: prevMonth.date(daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: firstDay.date(i),
      isCurrentMonth: true,
    });
  }

  const remaining = 42 - days.length;
  const nextMonth = firstDay.add(1, "month");
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: nextMonth.date(i),
      isCurrentMonth: false,
    });
  }

  return days;
}

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({
  data,
  onExpandRecord,
}: CalendarViewProps) {
  const dateColumns = useMemo(() => getDateColumns(data.columns), [data.columns]);

  const [dateFieldId, setDateFieldId] = useState<string | null>(
    dateColumns[0]?.id ?? null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentDate, setCurrentDate] = useState(dayjs());

  const currentYear = currentDate.year();
  const currentMonth = currentDate.month();

  const dateColumn = useMemo(
    () => data.columns.find((c) => c.id === dateFieldId) ?? null,
    [data.columns, dateFieldId]
  );

  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const recordsByDate = useMemo(() => {
    const map: Record<string, { record: IRecord; label: string }[]> = {};
    if (!dateFieldId) return map;

    for (const record of data.records) {
      const cell = record.cells[dateFieldId];
      if (!cell) continue;

      const dateValue = typeof cell.data === "string" ? cell.data : null;
      const parsed = parseDate(dateValue);
      if (!parsed) continue;

      const key = parsed.format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push({
        record,
        label: getRecordLabel(record, data.columns),
      });
    }

    return map;
  }, [dateFieldId, data.records, data.columns]);

  const today = dayjs();

  if (dateColumns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-3 text-lg font-medium text-foreground">
            No date fields available
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a Date/Time or Created Time field to use Calendar view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Date field:</span>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
            {dateColumn?.name ?? "Select field"}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
          </button>
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-md border border-border bg-card py-1 shadow-lg">
                {dateColumns.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => {
                      setDateFieldId(col.id);
                      setShowDropdown(false);
                    }}
                    className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                      col.id === dateFieldId
                        ? "font-medium text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {col.name}
                    <span className="ml-auto text-[10px] text-muted-foreground/70">
                      {col.type === CellType.DateTime ? "Date" : "Created"}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setCurrentDate(dayjs())}
            className="rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center text-sm font-semibold text-foreground">
            {currentDate.format("MMMM YYYY")}
          </span>
          <button
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-7 rounded-t-lg border border-b-0 border-border bg-card">
          {WEEKDAY_HEADERS.map((day, idx) => (
            <div
              key={day}
              className={`border-b border-border px-2 py-1.5 text-center text-xs font-medium text-muted-foreground ${
                idx < 6 ? "border-r" : ""
              } ${idx === 0 || idx === 6 ? "bg-muted/50" : ""}`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 border border-t-0 border-border bg-card rounded-b-lg">
          {calendarDays.map((day, idx) => {
            const dateKey = day.date.format("YYYY-MM-DD");
            const records = recordsByDate[dateKey] || [];
            const isToday = day.date.isSame(today, "day");
            const isWeekend = day.date.day() === 0 || day.date.day() === 6;
            const visibleRecords = records.slice(0, MAX_VISIBLE_RECORDS);
            const overflowCount = records.length - MAX_VISIBLE_RECORDS;
            const row = Math.floor(idx / 7);
            const col = idx % 7;
            const isLastRow = row === 5;
            const isLastCol = col === 6;

            return (
              <div
                key={dateKey + (day.isCurrentMonth ? "" : "-ext")}
                className={`min-h-[100px] border-t border-border ${
                  !isLastCol ? "border-r" : ""
                } ${
                  isWeekend && day.isCurrentMonth ? "bg-muted/50" : ""
                } ${!day.isCurrentMonth ? "bg-muted/30" : ""} ${
                  isLastRow ? "" : ""
                } flex flex-col`}
              >
                <div className="flex items-center justify-end px-1.5 pt-1">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      isToday
                        ? "bg-brand-400 font-semibold text-white"
                        : day.isCurrentMonth
                        ? "font-medium text-foreground"
                        : "text-muted-foreground/70"
                    }`}
                  >
                    {day.date.date()}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-0.5 px-1 pb-1">
                  {visibleRecords.map(({ record, label }) => (
                    <button
                      key={record.id}
                      onClick={() => onExpandRecord?.(record.id)}
                      className="w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      title={label}
                    >
                      {label}
                    </button>
                  ))}
                  {overflowCount > 0 && (
                    <span className="px-1.5 text-[10px] font-medium text-muted-foreground">
                      +{overflowCount} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
