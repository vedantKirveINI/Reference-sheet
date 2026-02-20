import { useState, useRef, useCallback } from "react";
import { Upload, FileText, FileJson, Check, Plus, ArrowRight } from "lucide-react";
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
import { ITableData, IRecord, ICell, IColumn, CellType } from "@/types";

interface ImportModalProps {
  data: ITableData;
  onImport: (records: IRecord[], mode: "append" | "replace") => void;
}

type ColumnMapping = {
  importedName: string;
  mappedColumnId: string | null;
  isNew: boolean;
};

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const result: string[][] = [];

  for (const line of lines) {
    if (line.trim() === "") continue;
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          row.push(current);
          current = "";
        } else {
          current += char;
        }
      }
    }
    row.push(current);
    result.push(row);
  }

  if (result.length === 0) return { headers: [], rows: [] };
  return { headers: result[0], rows: result.slice(1) };
}

function parseJSON(text: string): { headers: string[]; rows: string[][] } {
  const data = JSON.parse(text);
  if (!Array.isArray(data) || data.length === 0) return { headers: [], rows: [] };
  const headers = Array.from(
    new Set(data.flatMap((obj: Record<string, unknown>) => Object.keys(obj)))
  );
  const rows = data.map((obj: Record<string, unknown>) =>
    headers.map((h) => (obj[h] != null ? String(obj[h]) : ""))
  );
  return { headers, rows };
}

function createCellFromValue(value: string, column: IColumn): ICell {
  switch (column.type) {
    case CellType.Number: {
      const num = Number(value);
      return {
        type: CellType.Number,
        data: isNaN(num) ? null : num,
        displayData: isNaN(num) ? "" : String(num),
      };
    }
    case CellType.Rating: {
      const num = Number(value);
      return {
        type: CellType.Rating,
        data: isNaN(num) ? null : num,
        displayData: isNaN(num) ? "" : String(num),
      };
    }
    default:
      return {
        type: CellType.String,
        data: value,
        displayData: value,
      };
  }
}

function createDefaultCell(column: IColumn): ICell {
  switch (column.type) {
    case CellType.Number:
      return { type: CellType.Number, data: null, displayData: "" };
    case CellType.Rating:
      return { type: CellType.Rating, data: null, displayData: "" };
    case CellType.SCQ:
      return { type: CellType.SCQ, data: null, displayData: "", options: { options: (column.options?.options as string[]) ?? [] } };
    case CellType.MCQ:
      return { type: CellType.MCQ, data: [], displayData: "", options: { options: (column.options?.options as string[]) ?? [] } };
    case CellType.YesNo:
      return { type: CellType.YesNo, data: null, displayData: "", options: { options: ["Yes", "No"] } };
    case CellType.DateTime:
      return { type: CellType.DateTime, data: null, displayData: "", options: { dateFormat: "MM/DD/YYYY", separator: "/", includeTime: false, isTwentyFourHourFormat: false } };
    case CellType.Currency:
      return { type: CellType.Currency, data: null, displayData: "" };
    case CellType.DropDown:
      return { type: CellType.DropDown, data: null, displayData: "", options: { options: (column.options?.options as string[]) ?? [] } };
    default:
      return { type: CellType.String, data: "", displayData: "" };
  }
}

export function ImportModal({ data, onImport }: ImportModalProps) {
  const { importModal, closeImportModal } = useModalControlStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<"csv" | "json" | null>(null);

  const resetState = useCallback(() => {
    setParsedHeaders([]);
    setParsedRows([]);
    setColumnMappings([]);
    setFileName("");
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      const isJSON = file.name.toLowerCase().endsWith(".json");
      setFileType(isJSON ? "json" : "csv");

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        try {
          const { headers, rows } = isJSON ? parseJSON(text) : parseCSV(text);
          setParsedHeaders(headers);
          setParsedRows(rows);

          const mappings: ColumnMapping[] = headers.map((h) => {
            const match = data.columns.find(
              (col) => col.name.toLowerCase() === h.toLowerCase()
            );
            return {
              importedName: h,
              mappedColumnId: match ? match.id : null,
              isNew: !match,
            };
          });
          setColumnMappings(mappings);
        } catch {
          setParsedHeaders([]);
          setParsedRows([]);
          setColumnMappings([]);
        }
      };
      reader.readAsText(file);
    },
    [data.columns]
  );

  const handleImport = () => {
    const records: IRecord[] = parsedRows.map((row) => {
      const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const cells: Record<string, ICell> = {};

      for (const col of data.columns) {
        const mappingIndex = columnMappings.findIndex(
          (m) => m.mappedColumnId === col.id
        );
        if (mappingIndex >= 0 && row[mappingIndex] !== undefined) {
          cells[col.id] = createCellFromValue(row[mappingIndex], col);
        } else {
          cells[col.id] = createDefaultCell(col);
        }
      }

      return { id, cells };
    });

    onImport(records, importMode);
    closeImportModal();
    resetState();
  };

  const handleClose = () => {
    closeImportModal();
    resetState();
  };

  const previewRows = parsedRows.slice(0, 5);
  const mappedCount = columnMappings.filter((m) => !m.isNew).length;
  const newCount = columnMappings.filter((m) => m.isNew).length;

  return (
    <Dialog open={importModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to import data into the table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-20 border-dashed gap-2"
            >
              <Upload className="h-5 w-5" />
              {fileName ? fileName : "Click to select a CSV or JSON file"}
            </Button>
          </div>

          {parsedHeaders.length > 0 && (
            <>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  {fileType === "json" ? (
                    <FileJson className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  {fileName}
                </span>
                <span className="text-muted-foreground">
                  {parsedRows.length} row{parsedRows.length !== 1 ? "s" : ""} found
                </span>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Column Mapping
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {columnMappings.map((mapping, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm p-1.5 rounded bg-muted/50"
                    >
                      <span className="font-medium min-w-[120px] truncate">
                        {mapping.importedName}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      {mapping.isNew ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Plus className="h-3 w-3" />
                          Unmapped
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="h-3 w-3" />
                          {data.columns.find((c) => c.id === mapping.mappedColumnId)?.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="text-green-600">{mappedCount} mapped</span>
                  {newCount > 0 && (
                    <span className="text-amber-600">{newCount} unmapped</span>
                  )}
                </div>
              </div>

              {previewRows.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Preview (first {previewRows.length} rows)
                  </label>
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted">
                          {parsedHeaders.map((h, i) => (
                            <th
                              key={i}
                              className="px-2 py-1.5 text-left font-medium whitespace-nowrap border-b"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className="border-b last:border-0">
                            {parsedHeaders.map((_, ci) => (
                              <td
                                key={ci}
                                className="px-2 py-1 whitespace-nowrap max-w-[150px] truncate"
                              >
                                {row[ci] ?? ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Import Mode
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={importMode === "append" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImportMode("append")}
                    className="flex-1"
                  >
                    Append to existing
                  </Button>
                  <Button
                    variant={importMode === "replace" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImportMode("replace")}
                    className="flex-1"
                  >
                    Replace all
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedRows.length === 0}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import {parsedRows.length > 0 ? `${parsedRows.length} rows` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
