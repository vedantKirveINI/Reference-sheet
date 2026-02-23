import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Calendar } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ITableData, IColumn, IRecord, CellType } from "@/types";

dayjs.extend(customParseFormat);

interface GanttViewProps {
  data: ITableData;
  onCellChange: (recordId: string, columnId: string, value: any) => void;
  onAddRow: () => void;
  onDeleteRows: (rowIndices: number[]) => void;
  onDuplicateRow: (rowIndex: number) => void;
  onExpandRecord?: (recordId: string) => void;
}

type TimeScale = "day" | "week" | "month";

const ROW_HEIGHT = 36;
const HEADER_HEIGHT = 48;
const LEFT_PANEL_WIDTH = 250;

const DATE_FORMATS = [
  "YYYY-MM-DD",
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm:ssZ",
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "M/D/YYYY",
  "MM-DD-YYYY",
  "DD-MM-YYYY",
  "YYYY/MM/DD",
  "MMM D, YYYY",
  "MMMM D, YYYY",
  "D MMM YYYY",
  "D MMMM YYYY",
];

function parseDate(value: string | null | undefined): Dayjs | null {
  if (!value) return null;
  const str = typeof value === "string" ? value.trim() : String(value).trim();
  if (!str) return null;

  const iso = dayjs(str);
  if (iso.isValid()) return iso;

  for (const fmt of DATE_FORMATS) {
    const d = dayjs(str, fmt, true);
    if (d.isValid()) return d;
  }
  for (const fmt of DATE_FORMATS) {
    const d = dayjs(str, fmt, false);
    if (d.isValid()) return d;
  }

  return null;
}

function getDateColumns(columns: IColumn[]): IColumn[] {
  return columns.filter(
    (col) => col.type === CellType.DateTime || col.type === CellType.CreatedTime
  );
}

function getFirstStringColumn(columns: IColumn[]): IColumn | null {
  return columns.find((col) => col.type === CellType.String) ?? null;
}

function getRecordName(record: IRecord, nameColumn: IColumn | null): string {
  if (!nameColumn) return record.id.slice(0, 8);
  const cell = record.cells[nameColumn.id];
  if (!cell) return "";
  return cell.displayData || (typeof cell.data === "string" ? cell.data : "");
}

function getRecordDate(record: IRecord, columnId: string): Dayjs | null {
  const cell = record.cells[columnId];
  if (!cell) return null;
  return parseDate(cell.data as string | null);
}

function getCellWidth(scale: TimeScale): number {
  switch (scale) {
    case "day": return 40;
    case "week": return 120;
    case "month": return 160;
  }
}

function getTimelineDates(start: Dayjs, end: Dayjs, scale: TimeScale): Dayjs[] {
  const dates: Dayjs[] = [];
  let current = start.startOf(scale === "month" ? "month" : scale === "week" ? "week" : "day");
  const limit = end.endOf(scale === "month" ? "month" : scale === "week" ? "week" : "day");

  while (current.isBefore(limit) || current.isSame(limit, "day")) {
    dates.push(current);
    if (scale === "day") current = current.add(1, "day");
    else if (scale === "week") current = current.add(1, "week");
    else current = current.add(1, "month");
  }
  return dates;
}

function getBarPosition(
  startDate: Dayjs,
  endDate: Dayjs,
  timelineStart: Dayjs,
  scale: TimeScale,
  cellWidth: number
): { left: number; width: number } {
  const unit = scale === "month" ? "month" : "day";
  const startDiff = startDate.diff(timelineStart.startOf(unit), "day", true);
  const duration = endDate.diff(startDate, "day", true);

  if (scale === "day") {
    return { left: startDiff * cellWidth, width: Math.max(duration * cellWidth, 8) };
  } else if (scale === "week") {
    const pixelsPerDay = cellWidth / 7;
    return { left: startDiff * pixelsPerDay, width: Math.max(duration * pixelsPerDay, 8) };
  } else {
    const pixelsPerDay = cellWidth / 30;
    return { left: startDiff * pixelsPerDay, width: Math.max(duration * pixelsPerDay, 8) };
  }
}

function getTodayPosition(
  today: Dayjs,
  timelineStart: Dayjs,
  scale: TimeScale,
  cellWidth: number
): number {
  const unit = scale === "month" ? "month" : "day";
  const diff = today.diff(timelineStart.startOf(unit), "day", true);

  if (scale === "day") return diff * cellWidth;
  if (scale === "week") return diff * (cellWidth / 7);
  return diff * (cellWidth / 30);
}

function Dropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: { id: string; name: string }[];
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
      >
        <span className="text-xs text-muted-foreground mr-1">{label}:</span>
        {selected?.name ?? "Select"}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-md border border-border bg-card py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-accent ${
                  opt.id === value ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-foreground"
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Tooltip({
  children,
  content,
}: {
  children: React.ReactNode;
  content: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPos({ x: rect.left + rect.width / 2, y: rect.top });
        setShow(true);
      }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: pos.x, top: pos.y - 4 }}
        >
          <div className="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg whitespace-nowrap">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}

export function GanttView({
  data,
  onExpandRecord,
}: GanttViewProps) {
  const { t } = useTranslation(['common', 'views']);
  const dateColumns = useMemo(() => getDateColumns(data.columns), [data.columns]);
  const nameColumn = useMemo(() => getFirstStringColumn(data.columns), [data.columns]);
  const today = useMemo(() => dayjs(), []);

  const [startColId, setStartColId] = useState<string | null>(dateColumns[0]?.id ?? null);
  const [endColId, setEndColId] = useState<string | null>(dateColumns[1]?.id ?? dateColumns[0]?.id ?? null);
  const [scale, setScale] = useState<TimeScale>("day");

  const timelineRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  const columnOptions = useMemo(
    () => dateColumns.map((c) => ({ id: c.id, name: c.name })),
    [dateColumns]
  );

  const recordData = useMemo(() => {
    if (!startColId) return [];
    return data.records.map((record) => {
      const name = getRecordName(record, nameColumn);
      const startDate = getRecordDate(record, startColId);
      const endDate = endColId && endColId !== startColId
        ? getRecordDate(record, endColId)
        : startDate;
      const isPoint = !endColId || endColId === startColId || (startDate && endDate && startDate.isSame(endDate, "day"));
      return { record, name, startDate, endDate, isPoint };
    });
  }, [data.records, startColId, endColId, nameColumn]);

  const { timelineStart, timelineEnd } = useMemo(() => {
    let minDate: Dayjs | null = null;
    let maxDate: Dayjs | null = null;

    for (const rd of recordData) {
      if (rd.startDate) {
        if (!minDate || rd.startDate.isBefore(minDate)) minDate = rd.startDate;
        if (!maxDate || rd.startDate.isAfter(maxDate)) maxDate = rd.startDate;
      }
      if (rd.endDate) {
        if (!minDate || rd.endDate.isBefore(minDate)) minDate = rd.endDate;
        if (!maxDate || rd.endDate.isAfter(maxDate)) maxDate = rd.endDate;
      }
    }

    if (!minDate) minDate = today.subtract(1, "month");
    if (!maxDate) maxDate = today.add(1, "month");

    const padding = scale === "month" ? 2 : scale === "week" ? 2 : 7;
    const unit = scale === "month" ? "month" : scale === "week" ? "week" : "day";
    return {
      timelineStart: minDate.subtract(padding, unit).startOf(unit),
      timelineEnd: maxDate.add(padding, unit).endOf(unit),
    };
  }, [recordData, today, scale]);

  const timelineDates = useMemo(
    () => getTimelineDates(timelineStart, timelineEnd, scale),
    [timelineStart, timelineEnd, scale]
  );

  const cellWidth = getCellWidth(scale);
  const totalWidth = timelineDates.length * cellWidth;

  const todayPos = useMemo(
    () => getTodayPosition(today, timelineStart, scale, cellWidth),
    [today, timelineStart, scale, cellWidth]
  );

  const scrollToToday = useCallback(() => {
    if (timelineRef.current) {
      const scrollLeft = todayPos - timelineRef.current.clientWidth / 2;
      timelineRef.current.scrollLeft = Math.max(0, scrollLeft);
    }
  }, [todayPos]);

  useEffect(() => {
    scrollToToday();
  }, [scrollToToday]);

  const handleTimelineScroll = useCallback(() => {
    if (timelineRef.current && leftPanelRef.current) {
      leftPanelRef.current.scrollTop = timelineRef.current.scrollTop;
    }
  }, []);

  const handleLeftScroll = useCallback(() => {
    if (leftPanelRef.current && timelineRef.current) {
      timelineRef.current.scrollTop = leftPanelRef.current.scrollTop;
    }
  }, []);

  if (dateColumns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-8">
        <div className="text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">{t('views:gantt.noTasks')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('views:gantt.startDate')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2 flex-shrink-0">
        <Dropdown
          label={t('views:gantt.startDate')}
          value={startColId}
          options={columnOptions}
          onChange={setStartColId}
        />
        <Dropdown
          label={t('views:gantt.endDate')}
          value={endColId}
          options={columnOptions}
          onChange={setEndColId}
        />

        <div className="ml-2 flex items-center rounded-md border border-border bg-muted/50">
          {(["day", "week", "month"] as TimeScale[]).map((s) => (
            <button
              key={s}
              onClick={() => setScale(s)}
              className={`px-3 py-1 text-xs font-medium capitalize transition-colors ${
                scale === s
                  ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-sm rounded-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={scrollToToday}
          className="ml-2 flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
        >
          <Calendar className="h-3.5 w-3.5" />
          {t('views:calendar.today')}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-shrink-0" style={{ width: LEFT_PANEL_WIDTH }}>
          <div
            className="flex items-center border-b border-r border-border bg-muted px-3 text-xs font-medium text-muted-foreground"
            style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT }}
          >
            {t('common:name')}
          </div>
          <div
            ref={leftPanelRef}
            className="flex-1 overflow-y-auto overflow-x-hidden border-r border-border scrollbar-hide"
            onScroll={handleLeftScroll}
            style={{ scrollbarWidth: "none" }}
          >
            {recordData.map((rd) => (
              <div
                key={rd.record.id}
                className="flex items-center border-b border-border px-3 text-sm text-foreground truncate cursor-pointer hover:bg-accent/50"
                style={{ height: ROW_HEIGHT, minHeight: ROW_HEIGHT }}
                onClick={() => onExpandRecord?.(rd.record.id)}
                title={rd.name}
              >
                {rd.name || <span className="text-muted-foreground/70 italic">{t('common:header.untitled')}</span>}
              </div>
            ))}
          </div>
        </div>

        <div
          ref={timelineRef}
          className="flex-1 overflow-auto"
          onScroll={handleTimelineScroll}
        >
          <div style={{ width: totalWidth, minWidth: "100%" }}>
            <div
              className="flex border-b border-border bg-muted sticky top-0 z-10"
              style={{ height: HEADER_HEIGHT }}
            >
              {timelineDates.map((date, i) => {
                let label: string;
                if (scale === "day") {
                  label = date.format("D");
                } else if (scale === "week") {
                  label = `${date.format("MMM D")} – ${date.add(6, "day").format("D")}`;
                } else {
                  label = date.format("MMM YYYY");
                }

                const isFirstOfMonth = scale === "day" && (i === 0 || !date.isSame(timelineDates[i - 1], "month"));
                const isWeekend = scale === "day" && (date.day() === 0 || date.day() === 6);

                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center justify-center border-r border-border text-xs flex-shrink-0 ${
                      isWeekend ? "bg-muted/60" : "bg-muted"
                    }`}
                    style={{ width: cellWidth, minWidth: cellWidth }}
                  >
                    {scale === "day" && isFirstOfMonth && (
                      <span className="text-[10px] text-muted-foreground/70 leading-tight">
                        {date.format("MMM")}
                      </span>
                    )}
                    <span className={`font-medium ${
                      date.isSame(today, "day") ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}>
                      {label}
                    </span>
                    {scale === "day" && (
                      <span className="text-[10px] text-muted-foreground/70 leading-tight">
                        {date.format("dd")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative">
              {todayPos >= 0 && todayPos <= totalWidth && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{ left: todayPos }}
                />
              )}

              {recordData.map((rd) => {
                const isWeekendCol = (colIdx: number) => {
                  if (scale !== "day") return false;
                  const d = timelineDates[colIdx];
                  return d && (d.day() === 0 || d.day() === 6);
                };

                return (
                  <div
                    key={rd.record.id}
                    className="relative border-b border-border"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="absolute inset-0 flex">
                      {timelineDates.map((_, ci) => (
                        <div
                          key={ci}
                          className={`border-r border-border flex-shrink-0 ${
                            isWeekendCol(ci) ? "bg-muted/30" : ""
                          }`}
                          style={{ width: cellWidth, minWidth: cellWidth }}
                        />
                      ))}
                    </div>

                    {rd.startDate && rd.endDate && (() => {
                      const effectiveEnd = rd.isPoint ? rd.startDate : rd.endDate;
                      const { left, width } = getBarPosition(
                        rd.startDate,
                        effectiveEnd!,
                        timelineStart,
                        scale,
                        cellWidth
                      );

                      if (rd.isPoint) {
                        return (
                          <Tooltip
                            content={
                              <div>
                                <div className="font-medium">{rd.name}</div>
                                <div className="text-white/80 mt-0.5">
                                  {rd.startDate!.format("MMM D, YYYY")}
                                </div>
                              </div>
                            }
                          >
                            <div
                              className="absolute cursor-pointer z-10"
                              style={{
                                left: left - 5,
                                top: ROW_HEIGHT / 2 - 5,
                                width: 10,
                                height: 10,
                              }}
                              onClick={() => onExpandRecord?.(rd.record.id)}
                            >
                              <div
                                className="w-full h-full bg-emerald-500 rotate-45"
                                style={{ borderRadius: 2 }}
                              />
                            </div>
                          </Tooltip>
                        );
                      }

                      return (
                        <Tooltip
                          content={
                            <div>
                              <div className="font-medium">{rd.name}</div>
                              <div className="text-white/80 mt-0.5">
                                {rd.startDate!.format("MMM D, YYYY")} – {rd.endDate!.format("MMM D, YYYY")}
                              </div>
                            </div>
                          }
                        >
                          <div
                            className="absolute rounded-full cursor-pointer z-10 hover:brightness-110 transition-all"
                            style={{
                              left,
                              top: (ROW_HEIGHT - 16) / 2,
                              width: Math.max(width, 12),
                              height: 16,
                              background: "linear-gradient(90deg, #34d399, #10b981)",
                            }}
                            onClick={() => onExpandRecord?.(rd.record.id)}
                          />
                        </Tooltip>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
