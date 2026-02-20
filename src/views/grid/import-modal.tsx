import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Check, ArrowRight, ArrowLeft, Table2, Loader2 } from "lucide-react";
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
import { importCSV as importCSVAPI } from "@/services/api";

interface ImportModalProps {
  data: ITableData;
  onImport: (records: IRecord[], mode: "append" | "replace") => void;
  baseId?: string;
  tableId?: string;
}

const FIELD_TYPE_OPTIONS = [
  { value: "String", label: "String" },
  { value: "Number", label: "Number" },
  { value: "DateTime", label: "DateTime" },
  { value: "Currency", label: "Currency" },
  { value: "Rating", label: "Rating" },
  { value: "YesNo", label: "Yes/No" },
  { value: "SCQ", label: "Single Choice" },
  { value: "MCQ", label: "Multiple Choice" },
  { value: "DropDown", label: "Dropdown" },
];

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

function inferFieldType(values: string[]): string {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return "String";

  const allNumbers = nonEmpty.every((v) => !isNaN(Number(v)));
  if (allNumbers) return "Number";

  const datePatterns = [/^\d{4}-\d{2}-\d{2}/, /^\d{2}\/\d{2}\/\d{4}/, /^\d{2}-\d{2}-\d{4}/];
  const allDates = nonEmpty.every((v) => datePatterns.some((p) => p.test(v)));
  if (allDates) return "DateTime";

  const allYesNo = nonEmpty.every((v) =>
    ["yes", "no", "true", "false", "1", "0"].includes(v.toLowerCase())
  );
  if (allYesNo) return "YesNo";

  return "String";
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

const STEP_LABELS = ["Import Type", "Upload File", "Configure Fields", "Confirm & Import"];

export function ImportModal({ data, onImport, baseId, tableId }: ImportModalProps) {
  const { importModal, closeImportModal } = useModalControlStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [importType, setImportType] = useState<"new" | "existing">("existing");
  const [tableName, setTableName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<{ headers: string[]; rows: string[][] }>({ headers: [], rows: [] });
  const [fieldTypes, setFieldTypes] = useState<Record<string, string>>({});
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const resetState = useCallback(() => {
    setStep(0);
    setImportType("existing");
    setTableName("");
    setFile(null);
    setCsvData({ headers: [], rows: [] });
    setFieldTypes({});
    setImportMode("append");
    setImporting(false);
    setDragOver(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const processFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      try {
        const parsed = parseCSV(text);
        setCsvData(parsed);
        const types: Record<string, string> = {};
        parsed.headers.forEach((header, idx) => {
          const colValues = parsed.rows.map((row) => row[idx] || "");
          types[header] = inferFieldType(colValues);
        });
        setFieldTypes(types);
      } catch {
        setCsvData({ headers: [], rows: [] });
        setFieldTypes({});
      }
    };
    reader.readAsText(f);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) processFile(f);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f && (f.name.endsWith(".csv") || f.type === "text/csv")) {
        processFile(f);
      }
    },
    [processFile]
  );

  const handleImport = async () => {
    setImporting(true);

    if (baseId && tableId && file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("tableName", tableName || "Imported Table");
        formData.append("fieldTypes", JSON.stringify(fieldTypes));
        formData.append("importType", importType);
        await importCSVAPI({ baseId, tableId, data: formData });
        closeImportModal();
        resetState();
        return;
      } catch {
      }
    }

    const columnMappings = csvData.headers.map((h) => {
      const match = data.columns.find(
        (col) => col.name.toLowerCase() === h.toLowerCase()
      );
      return {
        importedName: h,
        mappedColumnId: match ? match.id : null,
        isNew: !match,
      };
    });

    const records: IRecord[] = csvData.rows.map((row) => {
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
    setImporting(false);
    closeImportModal();
    resetState();
  };

  const handleClose = () => {
    closeImportModal();
    resetState();
  };

  const canProceedToNext = () => {
    switch (step) {
      case 0:
        return importType === "existing" || tableName.trim().length > 0;
      case 1:
        return file !== null && csvData.headers.length > 0;
      case 2:
        return csvData.headers.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const previewRows = csvData.rows.slice(0, 5);
  const mappedCount = csvData.headers.filter((h) =>
    data.columns.some((col) => col.name.toLowerCase() === h.toLowerCase())
  ).length;
  const unmappedCount = csvData.headers.length - mappedCount;

  return (
    <Dialog open={importModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </DialogTitle>
          <DialogDescription>
            {STEP_LABELS[step]} — Step {step + 1} of {STEP_LABELS.length}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1 mb-4">
          {STEP_LABELS.map((label, idx) => (
            <div key={idx} className="flex items-center gap-1 flex-1">
              <div
                className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium shrink-0 ${
                  idx < step
                    ? "bg-primary text-primary-foreground"
                    : idx === step
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {idx < step ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                {label}
              </span>
              {idx < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${idx < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4 min-h-[200px]">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Import into</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setImportType("existing")}
                    className={`flex-1 flex items-center gap-2 rounded-md border p-3 text-sm transition-colors ${
                      importType === "existing"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Table2 className="h-4 w-4" />
                    Existing Table
                  </button>
                  <button
                    onClick={() => setImportType("new")}
                    className={`flex-1 flex items-center gap-2 rounded-md border p-3 text-sm transition-colors ${
                      importType === "new"
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    New Table
                  </button>
                </div>
              </div>

              {importType === "new" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Table Name</label>
                  <input
                    type="text"
                    placeholder="Enter table name"
                    value={tableName}
                    onChange={(e) => setTableName(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              {importType === "existing" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Import Mode</label>
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
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center h-40 rounded-md border-2 border-dashed cursor-pointer transition-colors ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : file
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-border hover:border-muted-foreground hover:bg-muted/50"
                }`}
              >
                {file ? (
                  <>
                    <Check className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {csvData.rows.length} rows · {csvData.headers.length} columns
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">Click to change file</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">Drop CSV file here</span>
                    <span className="text-xs text-muted-foreground mt-1">or click to browse</span>
                  </>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Field Configuration
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Review and adjust the field type for each column.
                </p>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted">
                        {csvData.headers.map((h, i) => (
                          <th key={i} className="px-2 py-1.5 text-left border-b min-w-[120px]">
                            <div className="font-medium whitespace-nowrap mb-1">{h}</div>
                            <select
                              value={fieldTypes[h] || "String"}
                              onChange={(e) =>
                                setFieldTypes((prev) => ({ ...prev, [h]: e.target.value }))
                              }
                              className="w-full rounded border bg-background px-1 py-0.5 text-xs outline-none"
                            >
                              {FIELD_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, ri) => (
                        <tr key={ri} className="border-b last:border-0">
                          {csvData.headers.map((_, ci) => (
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
                {csvData.rows.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing first 5 of {csvData.rows.length} rows
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4 space-y-3">
                <h3 className="text-sm font-medium">Import Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Import to:</div>
                  <div>{importType === "new" ? `New table: ${tableName}` : "Existing table"}</div>
                  <div className="text-muted-foreground">File:</div>
                  <div>{file?.name}</div>
                  <div className="text-muted-foreground">Rows:</div>
                  <div>{csvData.rows.length}</div>
                  <div className="text-muted-foreground">Columns:</div>
                  <div>{csvData.headers.length}</div>
                  {importType === "existing" && (
                    <>
                      <div className="text-muted-foreground">Mode:</div>
                      <div>{importMode === "append" ? "Append to existing" : "Replace all"}</div>
                      <div className="text-muted-foreground">Mapped columns:</div>
                      <div>
                        <span className="text-green-600">{mappedCount} mapped</span>
                        {unmappedCount > 0 && (
                          <span className="text-amber-600 ml-2">{unmappedCount} unmapped</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Field Types</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {csvData.headers.map((h) => (
                    <div key={h} className="flex items-center gap-2 text-sm px-2 py-1 rounded bg-muted/50">
                      <span className="font-medium flex-1 truncate">{h}</span>
                      <span className="text-muted-foreground text-xs">{fieldTypes[h] || "String"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {step < STEP_LABELS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceedToNext()}
                className="gap-1"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleImport}
                disabled={importing || csvData.rows.length === 0}
                className="gap-2"
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {importing ? "Importing..." : `Import ${csvData.rows.length} rows`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
