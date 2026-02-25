import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  Upload,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  Table2,
  Loader2,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  FileSpreadsheet,
  Plus,
  Sparkles,
  Hash,
  Type,
  Calendar,
  ToggleLeft,
  Star,
  DollarSign,
  List,
  CircleDot,
  Pencil,
  TableProperties,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModalControlStore } from "@/stores";
import type { ImportModalMode } from "@/stores/modal-control-store";
import { ITableData, IRecord, ICell, IColumn, CellType } from "@/types";
import {
  importToExistingTable,
  importToNewTable,
  uploadCSVForImport,
  ColumnInfo,
} from "@/services/api";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ImportModalProps {
  data: ITableData;
  onImport: (records: IRecord[], mode: "append" | "replace") => void;
  baseId?: string;
  tableId?: string;
  viewId?: string;
}

const FIELD_TYPE_OPTIONS = [
  { value: "String", label: "Text", icon: Type },
  { value: "Number", label: "Number", icon: Hash },
  { value: "DateTime", label: "Date & Time", icon: Calendar },
  { value: "Currency", label: "Currency", icon: DollarSign },
  { value: "Rating", label: "Rating", icon: Star },
  { value: "YesNo", label: "Yes/No", icon: ToggleLeft },
  { value: "SCQ", label: "Single Select", icon: CircleDot },
  { value: "MCQ", label: "Multi Select", icon: List },
  { value: "DropDown", label: "Dropdown", icon: ChevronDown },
];

function getFieldIcon(type: string) {
  const found = FIELD_TYPE_OPTIONS.find((o) => o.value === type);
  return found ? found.icon : Type;
}

function getFieldLabel(type: string) {
  const found = FIELD_TYPE_OPTIONS.find((o) => o.value === type);
  return found ? found.label : type;
}

interface ColumnMapping {
  sourceHeader: string;
  sourceIndex: number;
  targetColumnId: string | null;
  targetColumnName: string | null;
  targetColumnType: string | null;
  matchType: "exact" | "fuzzy" | "none";
  confidence: number;
  createNew: boolean;
  newFieldType: string;
}

interface NewTableField {
  sourceIndex: number;
  name: string;
  type: string;
  included: boolean;
}

interface ValidationError {
  row: number;
  column: string;
  message: string;
  severity: "error" | "warning";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fuzzyMatch(a: string, b: string): number {
  const na = a.toLowerCase().trim().replace(/[_\-\s]+/g, "");
  const nb = b.toLowerCase().trim().replace(/[_\-\s]+/g, "");
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.8;
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  const score = matches / longer.length;
  return score > 0.6 ? score * 0.7 : 0;
}

function inferFieldType(values: string[]): string {
  const nonEmpty = values.filter((v) => v.trim() !== "");
  if (nonEmpty.length === 0) return "String";

  const allNumbers = nonEmpty.every((v) => !isNaN(Number(v)) && v.trim() !== "");
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

function validateValue(value: string, fieldType: string): { valid: boolean; message?: string } {
  if (value.trim() === "") return { valid: true };

  switch (fieldType) {
    case "Number":
    case "Rating":
    case "Currency":
      if (isNaN(Number(value))) return { valid: false, message: `"${value}" is not a valid number` };
      return { valid: true };
    case "DateTime": {
      const datePatterns = [/^\d{4}-\d{2}-\d{2}/, /^\d{2}\/\d{2}\/\d{4}/, /^\d{2}-\d{2}-\d{4}/];
      if (!datePatterns.some((p) => p.test(value))) {
        return { valid: false, message: `"${value}" is not a valid date` };
      }
      return { valid: true };
    }
    case "YesNo": {
      if (!["yes", "no", "true", "false", "1", "0"].includes(value.toLowerCase())) {
        return { valid: false, message: `"${value}" is not yes/no` };
      }
      return { valid: true };
    }
    default:
      return { valid: true };
  }
}

function FieldTypeSelect({ value, onChange, compact = false }: { value: string; onChange: (v: string) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = getFieldIcon(value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-md border bg-background text-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-1 focus:ring-ring ${compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5"}`}
      >
        <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="truncate">{getFieldLabel(value)}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-44 rounded-lg border bg-popover shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
          {FIELD_TYPE_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-sm transition-colors hover:bg-accent ${value === opt.value ? "bg-accent/50 font-medium" : ""}`}
              >
                <OptIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>{opt.label}</span>
                {value === opt.value && <Check className="h-3 w-3 ml-auto text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const EXISTING_STEPS = ["Upload", "Map Columns", "Validate", "Import"];
const NEW_TABLE_STEPS = ["Upload", "Configure Fields", "Import"];

export function ImportModal({ data, onImport, baseId, tableId, viewId }: ImportModalProps) {
  const { importModal, importModalMode, closeImportModal } = useModalControlStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [flowMode, setFlowMode] = useState<ImportModalMode | null>(null);
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isFirstRowHeader, setIsFirstRowHeader] = useState(true);

  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

  const [newTableName, setNewTableName] = useState("");
  const [newTableFields, setNewTableFields] = useState<NewTableField[]>([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validating, setValidating] = useState(false);
  const [skipErrorRows, setSkipErrorRows] = useState(true);
  const [importMode, setImportMode] = useState<"append" | "replace">("append");

  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<"success" | "error" | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const activeMode = flowMode ?? importModalMode;
  const stepLabels = activeMode === "new" ? NEW_TABLE_STEPS : EXISTING_STEPS;
  const totalSteps = stepLabels.length;

  const resetState = useCallback(() => {
    setFlowMode(null);
    setStep(0);
    setFile(null);
    setParsedHeaders([]);
    setParsedRows([]);
    setParsing(false);
    setDragOver(false);
    setIsFirstRowHeader(true);
    setColumnMappings([]);
    setNewTableName("");
    setNewTableFields([]);
    setEditingFieldIndex(null);
    setValidationErrors([]);
    setValidating(false);
    setSkipErrorRows(true);
    setImportMode("append");
    setImporting(false);
    setImportProgress(0);
    setImportResult(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setParsing(true);
    setNewTableName(f.name.replace(/\.(csv|xlsx|xls)$/i, ""));

    try {
      let headers: string[] = [];
      let rows: string[][] = [];

      if (f.name.endsWith(".xlsx") || f.name.endsWith(".xls")) {
        const buffer = await f.arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
        if (jsonData.length > 0) {
          headers = (jsonData[0] as string[]).map((h) => String(h));
          rows = jsonData.slice(1).map((r) => (r as string[]).map((c) => String(c)));
        }
      } else {
        const text = await f.text();
        const result = Papa.parse(text, { skipEmptyLines: true });
        const allRows = result.data as string[][];
        if (allRows.length > 0) {
          headers = allRows[0].map((h) => String(h).trim());
          rows = allRows.slice(1);
        }
      }

      setParsedHeaders(headers);
      setParsedRows(rows);
    } catch (err) {
      console.error("File parsing error:", err);
      setParsedHeaders([]);
      setParsedRows([]);
    } finally {
      setParsing(false);
    }
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
      if (f) {
        const ext = f.name.split(".").pop()?.toLowerCase();
        if (ext === "csv" || ext === "xlsx" || ext === "xls") {
          processFile(f);
        }
      }
    },
    [processFile]
  );

  const downloadTemplate = useCallback(() => {
    const headers = data.columns.map((c) => c.name);
    const csv = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [data.columns]);

  useEffect(() => {
    if (activeMode !== "existing" || step !== 1 || parsedHeaders.length === 0) return;

    const mappings: ColumnMapping[] = parsedHeaders.map((header, idx) => {
      let bestMatch: IColumn | null = null;
      let bestScore = 0;
      let matchType: "exact" | "fuzzy" | "none" = "none";

      for (const col of data.columns) {
        const score = fuzzyMatch(header, col.name);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = col;
          matchType = score === 1 ? "exact" : score >= 0.5 ? "fuzzy" : "none";
        }
      }

      if (bestScore < 0.5) {
        return {
          sourceHeader: header,
          sourceIndex: idx,
          targetColumnId: null,
          targetColumnName: null,
          targetColumnType: null,
          matchType: "none" as const,
          confidence: 0,
          createNew: true,
          newFieldType: inferFieldType(parsedRows.slice(0, 50).map((r) => r[idx] || "")),
        };
      }

      return {
        sourceHeader: header,
        sourceIndex: idx,
        targetColumnId: bestMatch!.id,
        targetColumnName: bestMatch!.name,
        targetColumnType: bestMatch!.type,
        matchType,
        confidence: Math.round(bestScore * 100),
        createNew: false,
        newFieldType: "String",
      };
    });

    setColumnMappings(mappings);
  }, [activeMode, step, parsedHeaders, data.columns, parsedRows]);

  useEffect(() => {
    if (activeMode !== "new" || step !== 1 || parsedHeaders.length === 0) return;

    const fields: NewTableField[] = parsedHeaders.map((header, idx) => ({
      sourceIndex: idx,
      name: header,
      type: inferFieldType(parsedRows.slice(0, 50).map((r) => r[idx] || "")),
      included: true,
    }));

    setNewTableFields(fields);
  }, [activeMode, step, parsedHeaders, parsedRows]);

  useEffect(() => {
    if (activeMode !== "existing" || step !== 2) return;
    setValidating(true);

    const errors: ValidationError[] = [];
    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      for (const mapping of columnMappings) {
        if (mapping.createNew) continue;
        const value = row[mapping.sourceIndex] || "";
        const fieldType = mapping.targetColumnType || "String";
        const result = validateValue(value, fieldType);
        if (!result.valid) {
          errors.push({
            row: i + 1,
            column: mapping.sourceHeader,
            message: result.message || "Invalid value",
            severity: "error",
          });
        }
      }
    }

    setValidationErrors(errors);
    setValidating(false);
  }, [activeMode, step, parsedRows, columnMappings]);

  const validationSummary = useMemo(() => {
    const errorRowSet = new Set(validationErrors.filter((e) => e.severity === "error").map((e) => e.row));
    const warningRowSet = new Set(validationErrors.filter((e) => e.severity === "warning").map((e) => e.row));
    const totalRows = parsedRows.length;
    const errorRows = errorRowSet.size;
    const warningRows = warningRowSet.size;
    const validRows = totalRows - errorRows;
    return { totalRows, validRows, errorRows, warningRows };
  }, [validationErrors, parsedRows.length]);

  const matchedCount = useMemo(
    () => columnMappings.filter((m) => !m.createNew).length,
    [columnMappings]
  );

  const rowsToImport = useMemo(() => {
    if (activeMode === "new") return parsedRows.length;
    if (!skipErrorRows) return parsedRows.length;
    const errorRowSet = new Set(validationErrors.filter((e) => e.severity === "error").map((e) => e.row));
    return parsedRows.length - errorRowSet.size;
  }, [activeMode, parsedRows.length, validationErrors, skipErrorRows]);

  const updateMapping = useCallback((sourceIndex: number, update: Partial<ColumnMapping>) => {
    setColumnMappings((prev) =>
      prev.map((m) => (m.sourceIndex === sourceIndex ? { ...m, ...update } : m))
    );
  }, []);

  const updateNewField = useCallback((sourceIndex: number, update: Partial<NewTableField>) => {
    setNewTableFields((prev) =>
      prev.map((f) => (f.sourceIndex === sourceIndex ? { ...f, ...update } : f))
    );
  }, []);

  const handleImport = async () => {
    setImporting(true);
    setImportProgress(0);
    setImportResult(null);
    setImportError(null);

    try {
      if (activeMode === "new" && baseId && file) {
        const csvUrl = await uploadCSVForImport(file);
        setImportProgress(40);

        const includedFields = newTableFields.filter((f) => f.included);
        const columnsInfo: ColumnInfo[] = includedFields.map((f, idx) => ({
          name: f.name,
          type: f.type,
          prev_index: f.sourceIndex,
          new_index: idx,
        }));

        await importToNewTable({
          table_name: newTableName || file.name.replace(/\.(csv|xlsx|xls)$/i, ""),
          baseId,
          user_id: "",
          is_first_row_header: isFirstRowHeader,
          url: csvUrl,
          columns_info: columnsInfo,
        });

        setImportProgress(100);
        setImportResult("success");
        return;
      }

      const errorRowSet = skipErrorRows
        ? new Set(validationErrors.filter((e) => e.severity === "error").map((e) => e.row))
        : new Set<number>();

      const filteredRows = parsedRows.filter((_, i) => !errorRowSet.has(i + 1));

      setImportProgress(10);

      if (importMode === "append" && baseId && file) {
        try {
          const csvUrl = await uploadCSVForImport(file);
          setImportProgress(40);

          const columnsInfo: ColumnInfo[] = columnMappings.map((m, idx) => ({
            name: m.sourceHeader,
            type: m.createNew ? m.newFieldType : (m.targetColumnType || "String"),
            field_id: m.targetColumnId ? Number(m.targetColumnId) : undefined,
            prev_index: idx,
            new_index: idx,
          }));

          if (tableId && viewId) {
            await importToExistingTable({
              tableId,
              baseId,
              viewId,
              is_first_row_header: isFirstRowHeader,
              url: csvUrl,
              columns_info: columnsInfo,
            });
          }

          setImportProgress(100);
          setImportResult("success");
          return;
        } catch (err) {
          console.warn("Backend import failed, falling back to client-side:", err);
        }
      }

      setImportProgress(50);

      const records: IRecord[] = filteredRows.map((row) => {
        const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const cells: Record<string, ICell> = {};

        for (const col of data.columns) {
          const mapping = columnMappings.find((m) => m.targetColumnId === col.id);
          if (mapping && row[mapping.sourceIndex] !== undefined) {
            cells[col.id] = createCellFromValue(row[mapping.sourceIndex], col);
          } else {
            cells[col.id] = createDefaultCell(col);
          }
        }

        return { id, cells };
      });

      setImportProgress(80);
      onImport(records, importMode);
      setImportProgress(100);
      setImportResult("success");
    } catch (err) {
      console.error("Import failed:", err);
      setImportResult("error");
      setImportError(err instanceof Error ? err.message : "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    closeImportModal();
    resetState();
  };

  const canProceed = useMemo(() => {
    const fileReady = file !== null && parsedHeaders.length > 0 && !parsing;

    if (activeMode === "new") {
      switch (step) {
        case 0: return fileReady;
        case 1: return newTableFields.some((f) => f.included) && newTableName.trim().length > 0;
        case 2: return true;
        default: return false;
      }
    }

    switch (step) {
      case 0: return fileReady;
      case 1: return columnMappings.length > 0;
      case 2: return !validating && rowsToImport > 0;
      case 3: return true;
      default: return false;
    }
  }, [activeMode, step, file, parsedHeaders.length, parsing, columnMappings.length, validating, rowsToImport, newTableFields, newTableName]);

  const goNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const previewRows = parsedRows.slice(0, 5);

  const isLastStep = step === totalSteps - 1;
  const showFooter = !(isLastStep && (importing || importResult));

  return (
    <Dialog open={importModal} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2.5 text-lg">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              {activeMode === "new" ? (
                <TableProperties className="h-4.5 w-4.5 text-primary" />
              ) : (
                <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
              )}
            </div>
            {activeMode === "new" ? "Import to New Table" : "Import to This Table"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {activeMode === "new"
              ? "Create a new table from a CSV or Excel file"
              : "Import CSV or Excel data into your existing table"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-3 border-b shrink-0">
          <div className="flex items-center gap-0">
            {stepLabels.map((label, idx) => (
              <div key={idx} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold shrink-0 transition-all duration-200 ${
                      idx < step
                        ? "bg-primary text-primary-foreground"
                        : idx === step
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/20 ring-offset-1"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx < step ? <Check className="h-3 w-3" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:inline whitespace-nowrap ${
                      idx <= step ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {idx < stepLabels.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 min-w-[20px] transition-colors ${
                      idx < step ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && renderUploadStep()}
          {activeMode === "existing" && step === 1 && renderColumnMappingStep()}
          {activeMode === "existing" && step === 2 && renderValidationStep()}
          {activeMode === "existing" && step === 3 && renderImportStep()}
          {activeMode === "new" && step === 1 && renderNewTableConfigStep()}
          {activeMode === "new" && step === 2 && renderNewTableImportStep()}
        </div>

        {showFooter && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30 shrink-0">
            <div>
              {step > 0 && !importing && !importResult && (
                <Button variant="ghost" size="sm" onClick={goBack} className="gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Cancel
              </Button>
              {!isLastStep && (
                <Button size="sm" onClick={goNext} disabled={!canProceed} className="gap-1.5">
                  Next
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  function renderUploadStep() {
    return (
      <div className="space-y-5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
            parsing
              ? "border-primary/40 bg-primary/5 pointer-events-none"
              : dragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : file
              ? "border-primary/50 bg-primary/5 hover:border-primary"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          } ${file ? "py-5" : "py-10"}`}
        >
          {parsing ? (
            <>
              <Loader2 className="h-9 w-9 text-primary animate-spin mb-3" />
              <span className="text-sm font-medium text-foreground">Processing file...</span>
              <span className="text-xs text-muted-foreground mt-1">This may take a moment for large files</span>
            </>
          ) : file ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} · {parsedRows.length.toLocaleString()} rows · {parsedHeaders.length} columns
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Click or drop to replace</span>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-muted mb-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Drop your file here, or <span className="text-primary">browse</span>
              </span>
              <span className="text-xs text-muted-foreground mt-1.5">
                Supports CSV, XLSX, and XLS files
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFirstRowHeader}
              onChange={(e) => setIsFirstRowHeader(e.target.checked)}
              className="rounded border-border accent-primary w-4 h-4"
            />
            <span className="text-sm text-foreground">First row contains headers</span>
          </label>

          {activeMode === "existing" && data.columns.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadTemplate();
              }}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              Download template
            </button>
          )}
        </div>

        {file && parsedHeaders.length > 0 && (
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/50 px-3 py-2 border-b">
              <span className="text-xs font-medium text-muted-foreground">Preview</span>
            </div>
            <div className="overflow-x-auto max-h-[180px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/30">
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground w-8">#</th>
                    {parsedHeaders.map((h, i) => (
                      <th key={i} className="px-3 py-1.5 text-left font-medium text-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className="border-b last:border-0">
                      <td className="px-2 py-1.5 text-muted-foreground">{ri + 1}</td>
                      {parsedHeaders.map((_, ci) => (
                        <td key={ci} className="px-3 py-1.5 whitespace-nowrap text-muted-foreground max-w-[180px] truncate">
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
      </div>
    );
  }

  function renderColumnMappingStep() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">Column Mapping</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Match imported columns to your table fields
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            <Check className="h-3 w-3" />
            {matchedCount} of {columnMappings.length} mapped
          </div>
        </div>

        <div className="space-y-2">
          {columnMappings.map((mapping) => (
            <div
              key={mapping.sourceIndex}
              className={`rounded-lg border p-3 transition-colors ${
                mapping.createNew
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                  : mapping.matchType === "exact"
                  ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium truncate">{mapping.sourceHeader}</span>
                    {mapping.matchType === "exact" && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                        <Check className="h-2.5 w-2.5" /> Exact
                      </span>
                    )}
                    {mapping.matchType === "fuzzy" && (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        <Sparkles className="h-2.5 w-2.5" /> {mapping.confidence}%
                      </span>
                    )}
                  </div>
                  {previewRows.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5">
                      {previewRows.slice(0, 3).map((row, ri) => (
                        <span
                          key={ri}
                          className="text-[10px] text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded max-w-[100px] truncate"
                        >
                          {row[mapping.sourceIndex] || "\u2014"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                <div className="flex-1 min-w-0">
                  {mapping.createNew ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <Plus className="h-3 w-3" />
                        <span className="font-medium">New field</span>
                      </div>
                      <FieldTypeSelect
                        value={mapping.newFieldType}
                        onChange={(v) => updateMapping(mapping.sourceIndex, { newFieldType: v })}
                        compact
                      />
                    </div>
                  ) : (
                    <select
                      value={mapping.targetColumnId || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__create_new__") {
                          updateMapping(mapping.sourceIndex, {
                            createNew: true,
                            targetColumnId: null,
                            targetColumnName: null,
                            targetColumnType: null,
                            matchType: "none",
                            confidence: 0,
                            newFieldType: inferFieldType(
                              parsedRows.slice(0, 50).map((r) => r[mapping.sourceIndex] || "")
                            ),
                          });
                        } else if (val === "") {
                          updateMapping(mapping.sourceIndex, {
                            targetColumnId: null,
                            targetColumnName: null,
                            targetColumnType: null,
                            matchType: "none",
                            confidence: 0,
                            createNew: false,
                          });
                        } else {
                          const col = data.columns.find((c) => c.id === val);
                          if (col) {
                            updateMapping(mapping.sourceIndex, {
                              targetColumnId: col.id,
                              targetColumnName: col.name,
                              targetColumnType: col.type,
                              matchType: "exact",
                              confidence: 100,
                              createNew: false,
                            });
                          }
                        }
                      }}
                      className="w-full text-sm rounded-md border bg-background px-2 py-1.5 outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Skip this column</option>
                      {data.columns.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({getFieldLabel(col.type)})
                        </option>
                      ))}
                      <option value="__create_new__">+ Create new field</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderValidationStep() {
    return (
      <div className="space-y-5">
        {validating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
            <span className="text-sm font-medium">Validating data...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {validationSummary.validRows.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-500">Valid rows</span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                    {validationSummary.warningRows.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-amber-600 dark:text-amber-500">Warnings</span>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-lg font-semibold text-red-700 dark:text-red-400">
                    {validationSummary.errorRows.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-red-600 dark:text-red-500">Errors</span>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Error Handling</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSkipErrorRows(true)}
                      className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                        skipErrorRows
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Skip error rows
                    </button>
                    <button
                      onClick={() => setSkipErrorRows(false)}
                      className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                        !skipErrorRows
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      Import all (empty on error)
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border max-h-[140px] overflow-y-auto">
                  {validationErrors.slice(0, 50).map((err, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs border-b last:border-0"
                    >
                      {err.severity === "error" ? (
                        <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                      )}
                      <span className="text-muted-foreground">Row {err.row}:</span>
                      <span className="truncate">
                        {err.message} in &apos;{err.column}&apos;
                      </span>
                    </div>
                  ))}
                  {validationErrors.length > 50 && (
                    <div className="px-3 py-1.5 text-xs text-muted-foreground text-center">
                      ...and {validationErrors.length - 50} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            {tableId && (
              <div>
                <span className="text-sm font-medium mb-2 block">Import Mode</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setImportMode("append")}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-2.5 text-sm transition-colors ${
                      importMode === "append"
                        ? "border-primary bg-primary/5 text-foreground font-medium"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    Append rows
                  </button>
                  <button
                    onClick={() => setImportMode("replace")}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 text-sm transition-colors ${
                      importMode === "replace"
                        ? "border-primary bg-primary/5 text-foreground font-medium"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table2 className="h-4 w-4" />
                      Replace all
                    </div>
                    <span className="text-[10px] text-muted-foreground font-normal">Replace will process data locally</span>
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-lg border overflow-hidden">
              <div className="bg-muted/50 px-3 py-2 border-b">
                <span className="text-xs font-medium text-muted-foreground">
                  Data Preview (first 10 rows)
                </span>
              </div>
              <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="px-2 py-1.5 text-left font-medium text-muted-foreground w-8">#</th>
                      {columnMappings.map((m) => (
                        <th key={m.sourceIndex} className="px-2 py-1.5 text-left font-medium whitespace-nowrap">
                          {m.sourceHeader}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 10).map((row, ri) => {
                      const hasError = validationErrors.some((e) => e.row === ri + 1);
                      return (
                        <tr key={ri} className={`border-b last:border-0 ${hasError ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}>
                          <td className="px-2 py-1 text-muted-foreground">{ri + 1}</td>
                          {columnMappings.map((m) => {
                            const cellError = validationErrors.find(
                              (e) => e.row === ri + 1 && e.column === m.sourceHeader
                            );
                            return (
                              <td
                                key={m.sourceIndex}
                                className={`px-2 py-1 whitespace-nowrap max-w-[150px] truncate ${
                                  cellError ? "text-red-600 dark:text-red-400" : "text-foreground"
                                }`}
                                title={cellError?.message}
                              >
                                {row[m.sourceIndex] ?? ""}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  function renderImportStep() {
    return (
      <div className="space-y-5">
        {importResult === "success" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Import Complete</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Successfully imported {rowsToImport.toLocaleString()} rows
            </p>
            <Button onClick={handleClose} className="gap-2">
              <Check className="h-4 w-4" />
              Done
            </Button>
          </div>
        ) : importResult === "error" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Import Failed</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              {importError}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportResult(null)}>
                Try Again
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : importing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-3">
              Importing {rowsToImport.toLocaleString()} rows...
            </h3>
            <div className="w-full max-w-xs">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {importProgress}% complete
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Import Summary
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                <div className="text-muted-foreground">File</div>
                <div className="font-medium truncate">{file?.name}</div>
                <div className="text-muted-foreground">Target</div>
                <div className="font-medium">Existing table</div>
                <div className="text-muted-foreground">Total rows</div>
                <div className="font-medium">{rowsToImport.toLocaleString()}</div>
                <div className="text-muted-foreground">Columns</div>
                <div className="font-medium">
                  {matchedCount} mapped
                  {columnMappings.filter((m) => m.createNew).length > 0 && (
                    <span className="text-amber-600 ml-1">
                      + {columnMappings.filter((m) => m.createNew).length} new
                    </span>
                  )}
                </div>
                {tableId && (
                  <>
                    <div className="text-muted-foreground">Mode</div>
                    <div className="font-medium">
                      {importMode === "append" ? "Append to existing" : "Replace all data"}
                    </div>
                  </>
                )}
                {validationSummary.errorRows > 0 && (
                  <>
                    <div className="text-muted-foreground">Skipped rows</div>
                    <div className="font-medium text-amber-600">
                      {skipErrorRows ? validationSummary.errorRows : 0}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">
                Field Mapping
              </span>
              <div className="space-y-1 max-h-[160px] overflow-y-auto">
                {columnMappings.map((m) => {
                  const Icon = m.createNew
                    ? getFieldIcon(m.newFieldType)
                    : getFieldIcon(m.targetColumnType || "String");
                  return (
                    <div
                      key={m.sourceIndex}
                      className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted/50"
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate flex-1">
                        {m.sourceHeader}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground text-xs truncate">
                        {m.createNew
                          ? `New (${getFieldLabel(m.newFieldType)})`
                          : m.targetColumnName || "Skipped"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleImport}
              className="w-full gap-2 h-11 text-sm font-medium"
              size="lg"
            >
              <Upload className="h-4 w-4" />
              Import {rowsToImport.toLocaleString()} rows
            </Button>
          </>
        )}
      </div>
    );
  }

  function renderNewTableConfigStep() {
    const includedCount = newTableFields.filter((f) => f.included).length;

    return (
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Table Name</label>
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Enter table name..."
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">Configure Fields</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set the name and type for each field in your new table
              </p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {includedCount} of {newTableFields.length} fields
            </span>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/50 px-3 py-2 border-b grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-5"></span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Field Name</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Type</span>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider w-16 text-center">Sample</span>
            </div>
            <div className="max-h-[280px] overflow-y-auto divide-y">
              {newTableFields.map((field) => {
                const samples = previewRows.slice(0, 3).map((r) => r[field.sourceIndex] || "");
                const isEditing = editingFieldIndex === field.sourceIndex;

                return (
                  <div
                    key={field.sourceIndex}
                    className={`px-3 py-2.5 grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center transition-colors ${
                      field.included ? "" : "opacity-40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={field.included}
                      onChange={(e) => updateNewField(field.sourceIndex, { included: e.target.checked })}
                      className="rounded border-border accent-primary w-3.5 h-3.5"
                    />

                    <div className="min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateNewField(field.sourceIndex, { name: e.target.value })}
                          onBlur={() => setEditingFieldIndex(null)}
                          onKeyDown={(e) => { if (e.key === "Enter") setEditingFieldIndex(null); }}
                          autoFocus
                          className="w-full text-sm rounded border bg-background px-2 py-1 outline-none focus:ring-1 focus:ring-ring"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingFieldIndex(field.sourceIndex)}
                          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary group w-full text-left"
                        >
                          <span className="truncate">{field.name}</span>
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      )}
                    </div>

                    <FieldTypeSelect
                      value={field.type}
                      onChange={(v) => updateNewField(field.sourceIndex, { type: v })}
                      compact
                    />

                    <div className="w-20 flex gap-1 overflow-hidden">
                      {samples.slice(0, 2).map((s, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-muted-foreground bg-muted/70 px-1 py-0.5 rounded max-w-[36px] truncate"
                        >
                          {s || "\u2014"}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {previewRows.length > 0 && (
          <div className="rounded-lg border overflow-hidden">
            <div className="bg-muted/50 px-3 py-2 border-b">
              <span className="text-xs font-medium text-muted-foreground">Data Preview</span>
            </div>
            <div className="overflow-x-auto max-h-[140px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b bg-muted/30">
                    <th className="px-2 py-1.5 text-left font-medium text-muted-foreground w-8">#</th>
                    {newTableFields.filter((f) => f.included).map((f) => {
                      const Icon = getFieldIcon(f.type);
                      return (
                        <th key={f.sourceIndex} className="px-2 py-1.5 text-left font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3 w-3 text-muted-foreground" />
                            <span>{f.name}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className="border-b last:border-0">
                      <td className="px-2 py-1 text-muted-foreground">{ri + 1}</td>
                      {newTableFields.filter((f) => f.included).map((f) => (
                        <td key={f.sourceIndex} className="px-2 py-1 whitespace-nowrap text-muted-foreground max-w-[150px] truncate">
                          {row[f.sourceIndex] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderNewTableImportStep() {
    const includedFields = newTableFields.filter((f) => f.included);

    return (
      <div className="space-y-5">
        {importResult === "success" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Table Created</h3>
            <p className="text-sm text-muted-foreground mb-1">
              &ldquo;{newTableName}&rdquo; has been created with {rowsToImport.toLocaleString()} rows
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {includedFields.length} fields configured
            </p>
            <Button onClick={handleClose} className="gap-2">
              <Check className="h-4 w-4" />
              Done
            </Button>
          </div>
        ) : importResult === "error" ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Import Failed</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              {importError}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setImportResult(null)}>
                Try Again
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : importing ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-3">
              Creating table and importing {rowsToImport.toLocaleString()} rows...
            </h3>
            <div className="w-full max-w-xs">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {importProgress}% complete
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border bg-muted/30 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TableProperties className="h-4 w-4 text-primary" />
                New Table Summary
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
                <div className="text-muted-foreground">Table Name</div>
                <div className="font-medium truncate">{newTableName}</div>
                <div className="text-muted-foreground">Source File</div>
                <div className="font-medium truncate">{file?.name}</div>
                <div className="text-muted-foreground">Total Rows</div>
                <div className="font-medium">{rowsToImport.toLocaleString()}</div>
                <div className="text-muted-foreground">Fields</div>
                <div className="font-medium">{includedFields.length}</div>
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-muted-foreground mb-2 block">
                Field Configuration
              </span>
              <div className="space-y-1 max-h-[160px] overflow-y-auto">
                {includedFields.map((f) => {
                  const Icon = getFieldIcon(f.type);
                  return (
                    <div
                      key={f.sourceIndex}
                      className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-muted/50"
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate flex-1">{f.name}</span>
                      <span className="text-muted-foreground text-xs">{getFieldLabel(f.type)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleImport}
              className="w-full gap-2 h-11 text-sm font-medium"
              size="lg"
            >
              <TableProperties className="h-4 w-4" />
              Create Table & Import {rowsToImport.toLocaleString()} rows
            </Button>
          </>
        )}
      </div>
    );
  }
}
