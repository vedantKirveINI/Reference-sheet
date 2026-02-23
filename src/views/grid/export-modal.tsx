import { useState, useMemo, useCallback } from "react";
import {
  Download,
  FileText,
  FileJson,
  Sheet,
  Loader2,
  Check,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModalControlStore } from "@/stores";
import { ITableData, CellType } from "@/types";
import { exportData } from "@/services/api";
import * as XLSX from "xlsx";

type ExportFormat = "csv" | "xlsx" | "json";

type CSVEncoding = "utf8" | "utf8bom";
type ExportStatus = "idle" | "exporting" | "success" | "error";

interface ExportModalProps {
  data: ITableData;
  hiddenColumnIds: Set<string>;
  baseId?: string;
  tableId?: string;
  viewId?: string;
  tableName?: string;
}

function escapeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getCellDisplayValue(cell: any): string {
  if (cell == null) return "";
  if (cell.displayData != null && cell.displayData !== "") return String(cell.displayData);
  if (cell.data == null) return "";
  if (typeof cell.data === "object") return JSON.stringify(cell.data);
  return String(cell.data);
}

const FORMAT_CONFIG: Record<ExportFormat, { label: string; ext: string; icon: typeof FileText; description: string }> = {
  csv: { label: "CSV", ext: "csv", icon: FileText, description: "Comma-separated values" },
  xlsx: { label: "Excel", ext: "xlsx", icon: Sheet, description: "Microsoft Excel (.xlsx)" },
  json: { label: "JSON", ext: "json", icon: FileJson, description: "Structured data format" },
};

const CELL_TYPE_LABELS: Record<string, string> = {
  [CellType.String]: "Text",
  [CellType.Number]: "Number",
  [CellType.MCQ]: "Multi Select",
  [CellType.SCQ]: "Single Select",
  [CellType.YesNo]: "Checkbox",
  [CellType.DateTime]: "Date",
  [CellType.Currency]: "Currency",
  [CellType.Formula]: "Formula",
  [CellType.FileUpload]: "Attachment",
  [CellType.Rating]: "Rating",
  [CellType.PhoneNumber]: "Phone",
  [CellType.CreatedTime]: "Created Time",
  [CellType.List]: "List",
};

function getDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportModal({ data, hiddenColumnIds, baseId, tableId, viewId, tableName }: ExportModalProps) {
  const { exportModal, closeExportModal } = useModalControlStore();

  const [format, setFormat] = useState<ExportFormat>("csv");

  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [includeHidden, setIncludeHidden] = useState(false);
  const [csvEncoding, setCsvEncoding] = useState<CSVEncoding>("utf8");
  const [selectedColumnIds, setSelectedColumnIds] = useState<Set<string>>(() => new Set(data.columns.map((c) => c.id)));
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const [lastFilename, setLastFilename] = useState("");

  const visibleColumns = useMemo(
    () => (includeHidden ? data.columns : data.columns.filter((c) => !hiddenColumnIds.has(c.id))),
    [data.columns, hiddenColumnIds, includeHidden]
  );

  const exportColumns = useMemo(
    () => visibleColumns.filter((c) => selectedColumnIds.has(c.id)),
    [visibleColumns, selectedColumnIds]
  );

  const records = data.records;
  const rowCount = records.length;
  const colCount = exportColumns.length;

  const toggleColumn = useCallback((id: string) => {
    setSelectedColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const previewRows = useMemo(() => {
    const rows = records.slice(0, 5);
    return rows.map((record) =>
      exportColumns.map((col) => getCellDisplayValue(record.cells[col.id]))
    );
  }, [records, exportColumns]);

  const filename = useMemo(() => {
    const name = tableName || "export";
    const safe = name.replace(/[^a-zA-Z0-9_\- ]/g, "").trim() || "export";
    return `${safe}-${getDateString()}.${FORMAT_CONFIG[format].ext}`;
  }, [tableName, format]);

  const generateCSV = useCallback((): Blob => {
    const lines: string[] = [];
    if (includeHeaders) {
      lines.push(exportColumns.map((col) => escapeCSVValue(col.name)).join(","));
    }
    for (const record of records) {
      lines.push(exportColumns.map((col) => escapeCSVValue(getCellDisplayValue(record.cells[col.id]))).join(","));
    }
    const content = lines.join("\n");
    if (csvEncoding === "utf8bom") {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      return new Blob([bom, content], { type: "text/csv;charset=utf-8;" });
    }
    return new Blob([content], { type: "text/csv;charset=utf-8;" });
  }, [exportColumns, records, includeHeaders, csvEncoding]);

  const generateExcel = useCallback((): Blob => {
    const wsData: string[][] = [];
    if (includeHeaders) {
      wsData.push(exportColumns.map((col) => col.name));
    }
    for (const record of records) {
      wsData.push(exportColumns.map((col) => getCellDisplayValue(record.cells[col.id])));
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tableName || "Sheet1");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }, [exportColumns, records, includeHeaders, tableName]);

  const generateJSON = useCallback((): Blob => {
    const jsonData = records.map((record) => {
      const obj: Record<string, string> = {};
      for (const col of exportColumns) {
        obj[col.name] = getCellDisplayValue(record.cells[col.id]);
      }
      return obj;
    });
    const content = JSON.stringify(jsonData, null, 2);
    return new Blob([content], { type: "application/json;charset=utf-8;" });
  }, [exportColumns, records]);

  const handleExport = async () => {
    if (colCount === 0) return;
    setStatus("exporting");
    setErrorMessage("");

    try {
      const allColumnsSelected = visibleColumns.length > 0 && visibleColumns.every((c) => selectedColumnIds.has(c.id));
      if (format === "csv" && baseId && tableId && viewId && includeHeaders && allColumnsSelected && !includeHidden) {
        try {
          const res = await exportData({ baseId, tableId, viewId });
          const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
          downloadBlob(blob, filename);
          setLastBlob(blob);
          setLastFilename(filename);
          setStatus("success");
          return;
        } catch (apiErr: any) {
          console.warn("Backend export failed, falling back to client-side:", apiErr?.message || apiErr);
        }
      }

      let blob: Blob;
      switch (format) {
        case "csv":
          blob = generateCSV();
          break;
        case "xlsx":
          blob = generateExcel();
          break;
        case "json":
          blob = generateJSON();
          break;
      }

      downloadBlob(blob, filename);
      setLastBlob(blob);
      setLastFilename(filename);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err?.message || "Export failed. Please try again.");
      setStatus("error");
    }
  };

  const handleDownloadAgain = () => {
    if (lastBlob) {
      downloadBlob(lastBlob, lastFilename);
    }
  };

  const handleClose = () => {
    closeExportModal();
    setTimeout(() => {
      setStatus("idle");
      setErrorMessage("");
      setLastBlob(null);
    }, 200);
  };

  const formatLabel = FORMAT_CONFIG[format].label;

  return (
    <Dialog open={exportModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[560px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2.5 text-base font-semibold">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Download className="h-4 w-4 text-primary" />
            </div>
            Export Data
          </DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Export Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {lastFilename} has been downloaded
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={handleDownloadAgain}>
                Download again
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        ) : status === "error" ? (
          <div className="px-6 py-10 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-7 w-7 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">Export Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => { setStatus("idle"); setErrorMessage(""); }}>Try Again</Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[calc(80vh-140px)]">
              <div className="px-6 py-5 space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Format</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(FORMAT_CONFIG) as [ExportFormat, typeof FORMAT_CONFIG["csv"]][]).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const selected = format === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setFormat(key)}
                          className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all cursor-pointer hover:bg-muted/50 ${
                            selected ? "border-primary bg-primary/5" : "border-border"
                          }`}
                        >
                          {selected && (
                            <div className="absolute top-1.5 right-1.5">
                              <Check className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                          <Icon className={`h-5 w-5 ${selected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${selected ? "text-primary" : ""}`}>{cfg.label}</span>
                          <span className="text-[11px] text-muted-foreground leading-tight">{cfg.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">
                      Columns
                      <span className="text-muted-foreground font-normal ml-1.5">
                        {exportColumns.length} of {visibleColumns.length} selected
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedColumnIds(new Set(visibleColumns.map((c) => c.id)))}
                        className="text-xs text-primary hover:underline cursor-pointer"
                      >
                        Select all
                      </button>
                      <span className="text-xs text-muted-foreground">·</span>
                      <button
                        onClick={() => setSelectedColumnIds(new Set())}
                        className="text-xs text-muted-foreground hover:underline cursor-pointer"
                      >
                        Deselect all
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border divide-y max-h-[180px] overflow-y-auto">
                    {visibleColumns.map((col) => {
                      const checked = selectedColumnIds.has(col.id);
                      return (
                        <label
                          key={col.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleColumn(col.id)}
                            className="h-3.5 w-3.5 rounded border-border accent-primary"
                          />
                          <span className="text-sm flex-1 truncate">{col.name}</span>
                          <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                            {CELL_TYPE_LABELS[col.type] || col.type}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {hiddenColumnIds.size > 0 && (
                    <div className="flex items-center justify-between mt-3">
                      <label htmlFor="include-hidden" className="text-sm text-muted-foreground cursor-pointer">
                        Include {hiddenColumnIds.size} hidden column{hiddenColumnIds.size !== 1 ? "s" : ""}
                      </label>
                      <Switch
                        id="include-hidden"
                        size="sm"
                        checked={includeHidden}
                        onCheckedChange={(v) => {
                          setIncludeHidden(v);
                          if (v) {
                            setSelectedColumnIds((prev) => {
                              const next = new Set(prev);
                              data.columns.forEach((c) => next.add(c.id));
                              return next;
                            });
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
                  <p className="text-sm text-muted-foreground">
                    Exporting {rowCount} row{rowCount !== 1 ? "s" : ""} from current view
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Options</p>
                  <div className="flex items-center justify-between">
                    <label htmlFor="include-headers" className="text-sm cursor-pointer">Include headers</label>
                    <Switch id="include-headers" size="sm" checked={includeHeaders} onCheckedChange={setIncludeHeaders} />
                  </div>
                  {format === "csv" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Encoding</span>
                      <div className="flex rounded-md border overflow-hidden text-xs">
                        <button
                          onClick={() => setCsvEncoding("utf8")}
                          className={`px-3 py-1.5 transition-colors cursor-pointer ${
                            csvEncoding === "utf8" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          UTF-8
                        </button>
                        <button
                          onClick={() => setCsvEncoding("utf8bom")}
                          className={`px-3 py-1.5 border-l transition-colors cursor-pointer ${
                            csvEncoding === "utf8bom" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }`}
                        >
                          UTF-8 BOM
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {exportColumns.length > 0 && previewRows.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-3">
                      Preview
                      <span className="text-muted-foreground font-normal ml-1.5">
                        First {previewRows.length} row{previewRows.length !== 1 ? "s" : ""}
                      </span>
                    </p>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          {includeHeaders && (
                            <thead>
                              <tr className="bg-muted/60">
                                {exportColumns.map((col) => (
                                  <th key={col.id} className="px-2.5 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap border-r last:border-r-0">
                                    {col.name}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {previewRows.map((row, i) => (
                              <tr key={i} className="border-t">
                                {row.map((cell, j) => (
                                  <td key={j} className="px-2.5 py-1.5 whitespace-nowrap max-w-[150px] truncate border-r last:border-r-0">
                                    {cell || <span className="text-muted-foreground/40">—</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">
                  Exporting {rowCount} row{rowCount !== 1 ? "s" : ""} × {colCount} column{colCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground truncate ml-4">{filename}</p>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleClose} disabled={status === "exporting"}>
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={status === "exporting" || colCount === 0}
                  className="min-w-[140px] gap-2"
                >
                  {status === "exporting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Exporting…
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export as {formatLabel}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
