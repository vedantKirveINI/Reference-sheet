import { useState } from "react";
import { Download, FileText, FileJson, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModalControlStore } from "@/stores";
import { ITableData, IColumn } from "@/types";
import { exportData } from "@/services/api";

interface ExportModalProps {
  data: ITableData;
  hiddenColumnIds: Set<string>;
  baseId?: string;
  tableId?: string;
  viewId?: string;
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

export function ExportModal({ data, hiddenColumnIds, baseId, tableId, viewId }: ExportModalProps) {
  const { exportModal, closeExportModal } = useModalControlStore();
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [includeHidden, setIncludeHidden] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    if (baseId && tableId && viewId) {
      try {
        const res = await exportData({ baseId, tableId, viewId, format });
        const blob = new Blob([res.data], {
          type: format === "csv" ? "text/csv;charset=utf-8;" : "application/json;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `table-export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setExporting(false);
        closeExportModal();
        return;
      } catch {
      }
    }

    const columns = includeHidden
      ? data.columns
      : data.columns.filter((col) => !hiddenColumnIds.has(col.id));

    if (format === "csv") {
      exportCSV(columns, data.records);
    } else {
      exportJSON(columns, data.records);
    }
    setExporting(false);
    closeExportModal();
  };

  const exportCSV = (columns: IColumn[], records: typeof data.records) => {
    const headerRow = columns.map((col) => escapeCSVValue(col.name)).join(",");
    const dataRows = records.map((record) =>
      columns
        .map((col) => escapeCSVValue(getCellDisplayValue(record.cells[col.id])))
        .join(",")
    );
    const csvContent = [headerRow, ...dataRows].join("\n");
    downloadFile(csvContent, "table-export.csv", "text/csv;charset=utf-8;");
  };

  const exportJSON = (columns: IColumn[], records: typeof data.records) => {
    const jsonData = records.map((record) => {
      const obj: Record<string, string> = {};
      for (const col of columns) {
        obj[col.name] = getCellDisplayValue(record.cells[col.id]);
      }
      return obj;
    });
    const jsonContent = JSON.stringify(jsonData, null, 2);
    downloadFile(jsonContent, "table-export.json", "application/json;charset=utf-8;");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={exportModal} onOpenChange={(open) => !open && closeExportModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>
            Export your table data as CSV or JSON format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <div className="flex gap-2">
              <Button
                variant={format === "csv" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat("csv")}
                className="flex-1 gap-2"
              >
                <FileText className="h-4 w-4" />
                CSV
              </Button>
              <Button
                variant={format === "json" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat("json")}
                className="flex-1 gap-2"
              >
                <FileJson className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="include-hidden"
              checked={includeHidden}
              onChange={(e) => setIncludeHidden(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="include-hidden" className="text-sm">
              Include hidden columns
            </label>
          </div>

          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            {data.records.length} row{data.records.length !== 1 ? "s" : ""} will be exported
            {" · "}
            {includeHidden
              ? `${data.columns.length} columns`
              : `${data.columns.filter((c) => !hiddenColumnIds.has(c.id)).length} columns`}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={closeExportModal}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting} className="gap-2">
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
