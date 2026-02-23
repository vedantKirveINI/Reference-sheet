import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { ITableData, IRecord, IColumn, CellType, ICell } from "@/types";

interface GalleryViewProps {
  data: ITableData;
  onCellChange?: (recordId: string, columnId: string, value: any) => void;
  onAddRow?: () => void;
  onDeleteRows?: (rowIndices: number[]) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  onExpandRecord?: (recordId: string) => void;
}

const COVER_COLORS = [
  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
  "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
  "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
  "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
  "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
];

function getPrimaryField(columns: IColumn[]): IColumn | null {
  return columns.find((c) => c.type === CellType.String) ?? null;
}

function getFileUploadField(columns: IColumn[]): IColumn | null {
  return columns.find((c) => c.type === CellType.FileUpload) ?? null;
}

function getCoverImageUrl(record: IRecord, fileField: IColumn | null): string | null {
  if (!fileField) return null;
  const cell = record.cells[fileField.id];
  if (!cell || cell.type !== CellType.FileUpload) return null;
  const data = cell.data;
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  if (first && first.mimeType && first.mimeType.startsWith("image/") && first.url) {
    return first.url;
  }
  return null;
}

function getRecordTitle(record: IRecord, primaryField: IColumn | null): string {
  if (!primaryField) return record.id.slice(0, 8);
  const cell = record.cells[primaryField.id];
  if (!cell) return record.id.slice(0, 8);
  if (cell.displayData) return cell.displayData;
  if (typeof cell.data === "string" && cell.data) return cell.data;
  return record.id.slice(0, 8);
}

function getDisplayValue(cell: ICell): string {
  if (cell.displayData) return cell.displayData;
  if (cell.data == null) return "";
  if (typeof cell.data === "string") return cell.data;
  if (typeof cell.data === "number") return String(cell.data);
  if (Array.isArray(cell.data)) return cell.data.map((d: any) => (typeof d === "object" && d?.label ? d.label : String(d))).join(", ");
  return String(cell.data);
}

function getColorIndex(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % COVER_COLORS.length;
}

export function GalleryView({
  data,
  onAddRow,
  onExpandRecord,
}: GalleryViewProps) {
  const { t } = useTranslation(['common', 'views']);
  const primaryField = useMemo(() => getPrimaryField(data.columns), [data.columns]);
  const fileField = useMemo(() => getFileUploadField(data.columns), [data.columns]);

  const additionalFields = useMemo(() => {
    const primaryId = primaryField?.id;
    const fileId = fileField?.id;
    return data.columns
      .filter((c) => c.id !== primaryId && c.id !== fileId)
      .slice(0, 4);
  }, [data.columns, primaryField, fileField]);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.records
            .filter((r) => !r.id?.startsWith("__group__"))
            .map((record) => {
              const title = getRecordTitle(record, primaryField);
              const coverUrl = getCoverImageUrl(record, fileField);
              const colorIdx = getColorIndex(record.id);
              const firstLetter = title.charAt(0).toUpperCase() || "?";

              return (
                <button
                  key={record.id}
                  onClick={() => onExpandRecord?.(record.id)}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center ${COVER_COLORS[colorIdx]}`}
                      >
                        <span className="text-4xl font-bold opacity-60">
                          {firstLetter}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1.5 p-3">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {title}
                    </h3>

                    {additionalFields.map((col) => {
                      const cell = record.cells[col.id];
                      if (!cell) return null;
                      const value = getDisplayValue(cell);
                      if (!value) return null;
                      return (
                        <div key={col.id} className="flex items-baseline gap-1.5 text-xs">
                          <span className="shrink-0 font-medium text-muted-foreground/70">
                            {col.name}:
                          </span>
                          <span className="truncate text-muted-foreground">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}

          <button
            onClick={() => onAddRow?.()}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-card text-muted-foreground transition-colors hover:border-emerald-400 hover:text-emerald-500 dark:hover:border-emerald-500 dark:hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
          >
            <Plus className="h-8 w-8" />
            <span className="text-sm font-medium">{t('common:records.newRecord')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
