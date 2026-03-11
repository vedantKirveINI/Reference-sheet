import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ChevronDown,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import InputGridV3 from "@src/module/input-grid-v3/components";
import KeyValueFormulaGrid from "./KeyValueFormulaGrid";
import {
  HTTP_METHODS,
  BODY_TYPES,
  BODY_TYPE_OPTIONS,
  RAW_TYPES,
  AUTH_TYPES,
  AUTH_TYPE_OPTIONS,
  THEME,
  CONTENT_TYPES,
  BINARY_SOURCE_UPLOAD,
  BINARY_SOURCE_FORMULA,
  FORM_DATA_ROW_TYPE_FILE,
  FORM_DATA_ROW_TYPE_TEXT,
} from "../constants";
import { JSON_INPUT_MODES } from "../hooks/useHttpState";
import { isCurlCommand, parseCurlCommand, createFxValue } from "../utils";
import {
  convertJsonToFields,
  convertFieldsToJson,
} from "@src/module/input-grid-v3/input-grid/utils";
import storageSDKServices from "../../../services/storageSDKServices";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JsonDialogContent from "../../common-components/jsonDialog/jsonDialogContent";

const MethodSelector = ({ value, onChange }) => {
  const currentMethod =
    HTTP_METHODS.find((m) => m.value === value) || HTTP_METHODS[0];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className="w-[100px] h-9 rounded-lg font-bold text-white border-0 shrink-0 gap-1"
        style={{ backgroundColor: currentMethod.color }}
      >
        <span className="font-bold">{currentMethod.label}</span>
      </SelectTrigger>
      <SelectContent>
        {HTTP_METHODS.map((method) => (
          <SelectItem key={method.value} value={method.value}>
            <span className="font-semibold" style={{ color: method.color }}>
              {method.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const CollapsibleSection = ({
  title,
  count,
  defaultOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2">
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
          <span className="font-medium text-sm">{title}</span>
          {count > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-muted rounded-md">
              {count}
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">{children}</CollapsibleContent>
    </Collapsible>
  );
};

const substituteBlocksForValidation = (blocks) => {
  if (!blocks || blocks.length === 0) return "";

  let result = "";
  for (const block of blocks) {
    if (block.type === "PRIMITIVES" || block.type === "text") {
      result += block.value || block.text || "";
    } else {
      const beforeTrimmed = result.trimEnd();
      const lastChar = beforeTrimmed[beforeTrimmed.length - 1];
      const isInsideQuotes = lastChar === '"';
      if (isInsideQuotes) {
        result += "sample_value";
      } else {
        result += "null";
      }
    }
  }
  return result;
};

const JsonValidationPreview = ({ blocks, rawText }) => {
  const validation = useMemo(() => {
    // In Raw mode, validate the actual raw string the user is editing so we don't
    // get false "Invalid JSON" from substituteBlocksForValidation when block types
    // differ (e.g. non-PRIMITIVES blocks get replaced with "null", breaking the string).
    const resolvedText =
      rawText !== undefined && rawText !== null
        ? String(rawText)
        : substituteBlocksForValidation(blocks ?? []);

    if (!resolvedText.trim()) return null;

    try {
      JSON.parse(resolvedText);
      return { valid: true, resolvedText };
    } catch (e) {
      return { valid: false, error: e.message, resolvedText };
    }
  }, [blocks, rawText]);

  if (!validation) return null;

  return (
    <div
      className={cn(
        "mt-2 px-3 py-2 rounded-lg border text-xs flex items-start gap-2",
        validation.valid
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-red-50 border-red-200 text-red-700",
      )}
    >
      {validation.valid ? (
        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      ) : (
        <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      )}
      <div className="min-w-0">
        <span className="font-medium">
          {validation.valid ? "Valid JSON" : "Invalid JSON"}
        </span>
        {!validation.valid && validation.error && (
          <span className="ml-1 opacity-80">— {validation.error}</span>
        )}
      </div>
    </div>
  );
};

const JsonInputModeToggle = ({ mode, onChange }) => {
  return (
    <div className="flex items-center bg-muted rounded-lg p-0.5">
      <button
        type="button"
        onClick={() => onChange(JSON_INPUT_MODES.GRID)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
          mode === JSON_INPUT_MODES.GRID
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Grid
      </button>
      <button
        type="button"
        onClick={() => onChange(JSON_INPUT_MODES.RAW)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all",
          mode === JSON_INPUT_MODES.RAW
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Code2 className="w-3.5 h-3.5" />
        Raw
      </button>
    </div>
  );
};

const BodySection = ({ state, variables }) => {
  const {
    body,
    setBodyType,
    setBody,
    setRawSubType,
    setBinaryData,
    setBinaryFxData,
    setJsonInputMode,
    setJsonGridData,
  } = state;
  const fileInputRef = useRef(null);
  const inputGridRef = useRef(null);
  const pendingImportGridRef = useRef(null);
  const [showImportJsonDialog, setShowImportJsonDialog] = useState(false);
  const [bodyGridKey, setBodyGridKey] = useState(0);
  const [formDataUploadingRowIndex, setFormDataUploadingRowIndex] =
    useState(null);
  const binarySource = body?.binarySource || BINARY_SOURCE_UPLOAD;
  const isFormulaMode = binarySource === BINARY_SOURCE_FORMULA;
  const isJsonMode = body?.type === BODY_TYPES.RAW && body?.sub_type === "json";
  const jsonInputMode = body?.jsonInputMode || JSON_INPUT_MODES.GRID;

  useEffect(() => {
    if (bodyGridKey > 0 && pendingImportGridRef.current != null) {
      pendingImportGridRef.current = null;
    }
  }, [bodyGridKey]);

  const handleBodyDataChange = (data) => {
    setBody({ ...body, data });
  };

  const handleFormDataFileUpload = useCallback(
    async (rowIndex, file) => {
      let data = body?.data || [];
      console.log("[ConfigureTab] handleFormDataFileUpload called", {
        rowIndex,
        fileName: file?.name,
        dataLength: data.length,
        bodyDataType: body?.type,
      });
      if (rowIndex < 0) {
        console.warn("[ConfigureTab] handleFormDataFileUpload early return: invalid rowIndex", {
          rowIndex,
        });
        return;
      }
      // Grid may show more rows than body.data (e.g. trailing empty row not yet flushed by debounce).
      // Pad data so we have a row at rowIndex, then set the file on it.
      while (data.length <= rowIndex) {
        data = [
          ...data,
          {
            key: "",
            value: { type: "fx", blocks: [] },
            valueStr: "",
            type: FORM_DATA_ROW_TYPE_TEXT,
          },
        ];
      }
      setFormDataUploadingRowIndex(rowIndex);
      const fileName = file.name;
      const fileType = file.type || CONTENT_TYPES.BINARY;
      const reader = new FileReader();
      reader.onerror = (err) => {
        console.error("[ConfigureTab] FileReader error", err);
        setFormDataUploadingRowIndex(null);
      };
      reader.onload = async (event) => {
        console.log("[ConfigureTab] FileReader onload fired", { fileName });
        const arrayBuffer = event.target.result;
        const file_obj = new Blob([arrayBuffer], { type: fileType });
        try {
          console.log("[ConfigureTab] calling storageSDKServices.uploadFile", {
            fileName,
            fileType,
            blobSize: file_obj.size,
          });
          const response = await storageSDKServices.uploadFile({
            fileName,
            fileType,
            file_obj,
          });
          console.log("[ConfigureTab] uploadFile response", {
            status: response?.status,
            result: response?.result,
          });
          if (response?.status === "success") {
            const newData = [...data];
            newData[rowIndex] = {
              ...newData[rowIndex],
              type: FORM_DATA_ROW_TYPE_FILE,
              value: response.result?.cdn || "",
              valueStr: response.result?.cdn || "",
              fileData: {
                fileName,
                fileType,
                ...response.result,
              },
            };
            setBody({ ...body, data: newData });
            toast.success("File uploaded successfully");
          } else {
            throw new Error("Upload failed");
          }
        } catch (err) {
          console.error("[ConfigureTab] handleFormDataFileUpload catch", err);
          toast.error(
            "An error occurred while uploading the file. Please try again.",
          );
        } finally {
          setFormDataUploadingRowIndex(null);
        }
      };
      console.log("[ConfigureTab] starting reader.readAsArrayBuffer", { fileName });
      reader.readAsArrayBuffer(file);
    },
    [body, setBody],
  );

  const handleFormDataFileDelete = useCallback(
    async (rowIndex) => {
      const data = body?.data || [];
      if (rowIndex < 0 || rowIndex >= data.length) return;
      const row = data[rowIndex];
      const fileData = row?.fileData;
      if (!fileData?.filePath && !fileData?.cdn) return;
      try {
        const response = await storageSDKServices.getUploadSignedUrl({
          ...fileData,
          op: "delete",
        });
        if (response?.status === "success") {
          const newData = [...data];
          newData[rowIndex] = {
            ...newData[rowIndex],
            value: "",
            valueStr: "",
            fileData: null,
          };
          setBody({ ...body, data: newData });
          toast.success("File removed");
        } else {
          throw new Error("Delete failed");
        }
      } catch {
        toast.error("Failed to delete file.");
      }
    },
    [body, setBody],
  );

  // When isJsonMode, store FX content (blocks + text) in body.data and body.jsonFxData so the FormulaBar prefills from jsonFxData.blocks / data.blocks.
  const handleRawContentChange = (blocks, text) => {
    const fxData = { type: "fx", blocks, text };
    setBody({
      ...body,
      data: fxData,
      jsonFxData: isJsonMode ? fxData : body?.jsonFxData,
    });
  };

  const handleImportJson = useCallback(
    (parsedObject) => {
      const isPlainObjectOrArray =
        parsedObject !== null &&
        typeof parsedObject === "object" &&
        (Array.isArray(parsedObject) ||
          Object.prototype.toString.call(parsedObject) === "[object Object]");
      if (!isPlainObjectOrArray) {
        toast.error("JSON must be an object or array");
        return;
      }
      if (jsonInputMode === JSON_INPUT_MODES.GRID) {
        const gridData = convertJsonToFields(parsedObject, true);
        const formatted = JSON.stringify(parsedObject, null, 2);
        pendingImportGridRef.current = gridData;
        setBody({
          ...body,
          jsonGridData: gridData,
          jsonFxData: createFxValue(formatted),
        });
        setJsonInputMode(JSON_INPUT_MODES.GRID);
        setBodyGridKey((k) => k + 1);
      } else {
        const formatted = JSON.stringify(parsedObject, null, 2);
        const fxData = createFxValue(formatted);
        setBody({
          ...body,
          data: fxData,
          jsonFxData: fxData,
        });
        setJsonInputMode(JSON_INPUT_MODES.RAW);
      }
      setShowImportJsonDialog(false);
    },
    [body, jsonInputMode, setBody, setJsonInputMode],
  );

  const handleFileUpload = useCallback(
    (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const file = files[0];
      const fileName = file.name;
      const fileType = file.type || CONTENT_TYPES.BINARY;
      const binaryData = body?.type === BODY_TYPES.BINARY ? body?.data : null;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        const file_obj = new Blob([arrayBuffer], { type: fileType });
        const payload = { fileName, fileType, file_obj };
        if (binaryData?.filePath) {
          payload.op = "update";
          payload.filePath = binaryData.filePath;
        }
        try {
          const response = await storageSDKServices.uploadFile(payload);
          if (response?.status === "success") {
            setBinaryData({ fileName, fileType, ...response.result });
            toast.success("File uploaded successfully");
          } else {
            throw new Error("Upload failed");
          }
        } catch {
          toast.error(
            "An error occurred while uploading the file. Please try again.",
          );
          setBinaryData(null);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
      };
      reader.readAsArrayBuffer(file);
    },
    [body?.type, body?.data, setBinaryData],
  );

  const handleDeleteBinary = useCallback(async () => {
    const binaryData = body?.data;
    if (!binaryData) return;
    try {
      const response = await storageSDKServices.getUploadSignedUrl({
        ...binaryData,
        op: "delete",
      });
      if (response?.status === "success") {
        setBinaryData(null);
        toast.success("File removed");
      } else {
        throw new Error("Delete failed");
      }
    } catch {
      toast.error("Failed to delete file.");
    }
  }, [body?.data, setBinaryData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {BODY_TYPE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setBodyType(option.id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-colors",
              body?.type === option.id
                ? "bg-[#C800C8]/10 text-[#C800C8] font-medium"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {body?.type === BODY_TYPES.RAW && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {RAW_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setRawSubType(type.id)}
                  className={cn(
                    "px-2 py-1 text-xs rounded transition-colors",
                    body?.sub_type === type.id
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {isJsonMode && (
              <div className="flex items-center gap-2">
                <JsonInputModeToggle
                  mode={jsonInputMode}
                  onChange={setJsonInputMode}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportJsonDialog(true)}
                  className="text-xs border-[var(--theme-icon-border)] hover:bg-[var(--theme-icon-bg)]"
                  style={
                    THEME?.iconColor
                      ? {
                          ["--theme-icon-border"]: THEME.iconBorder,
                          ["--theme-icon-bg"]: THEME.iconBg,
                        }
                      : undefined
                  }
                  data-testid="import-json-button"
                >
                  Import JSON
                </Button>
              </div>
            )}
          </div>

          {isJsonMode && jsonInputMode === JSON_INPUT_MODES.GRID ? (
            <div className="border border-border rounded-lg overflow-hidden">
              <InputGridV3
                key={bodyGridKey}
                ref={inputGridRef}
                initialValue={
                  pendingImportGridRef.current != null
                    ? pendingImportGridRef.current
                    : (body?.jsonGridData || [])
                }
                variables={variables}
                onGridDataChange={setJsonGridData}
                isValueMode={true}
                hideColumnType={false}
              />
            </div>
          ) : (
            <>
              <FormulaBar
                wrapContent={true}
                inputMode={isJsonMode ? "formula" : "text"}
                placeholder={
                  isJsonMode ? '{"key": "value"}' : "Enter body content..."
                }
                variables={variables}
                defaultInputContent={
                  isJsonMode
                    ? (body?.jsonFxData?.blocks ?? body?.data?.blocks ?? [])
                    : (body?.data?.blocks ?? [])
                }
                onInputContentChanged={(blocks) => {
                  const text = blocks
                    .map((b) => b.text ?? b.value ?? "")
                    .join("");
                  handleRawContentChange(blocks, text);
                }}
              />
              {isJsonMode && (
                <JsonValidationPreview
                  blocks={body?.data?.blocks}
                  rawText={body?.data?.text}
                />
              )}
            </>
          )}
        </div>
      )}

      <Dialog
        open={showImportJsonDialog}
        onOpenChange={setShowImportJsonDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-4 p-6 overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Import JSON</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <JsonDialogContent
              initialValue=""
              onClose={() => setShowImportJsonDialog(false)}
              onModify={handleImportJson}
              accentColor={THEME?.iconColor}
            />
          </div>
        </DialogContent>
      </Dialog>

      {(body?.type === BODY_TYPES.FORM_DATA ||
        body?.type === BODY_TYPES.URL_ENCODED) && (
        <KeyValueFormulaGrid
          rows={body?.data || []}
          onChange={handleBodyDataChange}
          variables={variables}
          keyPlaceholder="Field name"
          valuePlaceholder="Field value"
          testIdPrefix="http-body-field"
          supportFileType={body?.type === BODY_TYPES.FORM_DATA}
          uploadingRowIndex={
            body?.type === BODY_TYPES.FORM_DATA
              ? formDataUploadingRowIndex
              : undefined
          }
          onFileUpload={
            body?.type === BODY_TYPES.FORM_DATA
              ? handleFormDataFileUpload
              : undefined
          }
          onFileDelete={
            body?.type === BODY_TYPES.FORM_DATA
              ? handleFormDataFileDelete
              : undefined
          }
        />
      )}

      {body?.type === BODY_TYPES.BINARY && (
        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: BINARY_SOURCE_UPLOAD, label: "Upload file" },
              // { id: BINARY_SOURCE_FORMULA, label: "Formula (URL)" }, // TODO: uncomment when formula mode is ready
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  if (option.id === BINARY_SOURCE_FORMULA) {
                    setBinaryFxData(
                      body?.binaryFxData || {
                        type: "fx",
                        blocks: [],
                        text: "",
                      },
                    );
                  } else {
                    setBinaryData(body?.data ?? null);
                  }
                }}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  binarySource === option.id
                    ? "bg-[#C800C8]/10 text-[#C800C8] font-medium"
                    : "text-muted-foreground hover:bg-muted",
                )}
                data-testid={`http-configure-body-binary-source-${option.id}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-3">
            {/* TODO: uncomment when formula mode is ready
            {isFormulaMode ? (
              <div className="space-y-2">
                <FormulaBar
                  wrapContent
                  placeholder="Enter URL or formula (e.g. from a variable)..."
                  variables={variables}
                  defaultInputContent={body?.binaryFxData?.blocks ?? []}
                  onInputContentChanged={(blocks) => {
                    const text = blocks
                      .map((b) => b?.text ?? b?.value ?? "")
                      .join("");
                    setBinaryFxData({ type: "fx", blocks, text });
                  }}
                  slotProps={{
                    container: {
                      style: {
                        border: "2px solid var(--border) !important",
                        borderRadius: "0.5rem",
                      },
                    },
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Resolves at run time; the request body will be fetched from
                  this URL.
                </p>
              </div>
            ) : (
            */}
            {!isFormulaMode && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleFileUpload}
                  data-testid="http-configure-body-binary-input"
                />
                <div className="flex gap-3 items-center flex-wrap">
                  {body?.data?.fileName ? (
                    <>
                      <a
                        href={body.data.cdn}
                        download={body.data.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate max-w-[200px]"
                        data-testid="http-configure-body-binary-filename"
                      >
                        {body.data.fileName}
                      </a>
                      <button
                        type="button"
                        onClick={handleDeleteBinary}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove file"
                        data-testid="http-configure-body-binary-delete"
                      >
                        {icons.trash2 && <icons.trash2 className="w-4 h-4" />}
                      </button>
                    </>
                  ) : null}
                  {!body?.data?.fileName && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                      data-testid="http-configure-body-binary-upload"
                    >
                      {icons.upload && <icons.upload className="w-4 h-4" />}
                      Upload File
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AuthSection = ({ state, variables }) => {
  const { authorization, setAuthType, setAuthorization } = state;

  const handleCredentialChange = (key, blocks, text) => {
    console.log("=== [AuthSection.handleCredentialChange] ===");
    console.log("key:", key);
    console.log("blocks:", JSON.stringify(blocks, null, 2));
    console.log("text:", text);
    console.log("current authorization:", JSON.stringify(authorization, null, 2));
    const newData = (authorization?.data || []).map((item) =>
      item.key === key
        ? { ...item, value: { type: "fx", blocks }, valueStr: text }
        : item,
    );
    console.log("newData being set:", JSON.stringify(newData, null, 2));
    console.log("full auth object being set:", JSON.stringify({ ...authorization, data: newData }, null, 2));
    console.log("=== End handleCredentialChange ===");
    setAuthorization({ ...authorization, data: newData });
  };

  return (
    <div className="space-y-4">
      <Select
        value={authorization?.type || AUTH_TYPES.NONE}
        onValueChange={setAuthType}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AUTH_TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {authorization?.type === AUTH_TYPES.BASIC && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Username
            </label>
            <FormulaBar
              wrapContent={true}
              placeholder="Enter username"
              variables={variables}
              showArrayStructure={true}
              defaultInputContent={
                authorization?.data?.find((d) => d.key === "username")?.value
                  ?.blocks || []
              }
              onInputContentChanged={(blocks) => {
                const text = blocks
                  .map((b) => b.text || b.value || "")
                  .join("");
                handleCredentialChange("username", blocks, text);
              }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Password
            </label>
            <FormulaBar
              wrapContent={true}
              placeholder="Enter password"
              variables={variables}
              defaultInputContent={
                authorization?.data?.find((d) => d.key === "password")?.value
                  ?.blocks || []
              }
              onInputContentChanged={(blocks) => {
                const text = blocks
                  .map((b) => b.text || b.value || "")
                  .join("");
                handleCredentialChange("password", blocks, text);
              }}
            />
          </div>
        </div>
      )}

      {authorization?.type === AUTH_TYPES.BEARER && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Token
          </label>
          <FormulaBar
            wrapContent={true}
            placeholder="Enter bearer token"
            variables={variables}
            defaultInputContent={
              authorization?.data?.find((d) => d.key === "token")?.value
                ?.blocks || []
            }
            onInputContentChanged={(blocks) => {
              const text = blocks.map((b) => b.text || b.value || "").join("");
              handleCredentialChange("token", blocks, text);
            }}
          />
        </div>
      )}
    </div>
  );
};

const ConfigureTab = ({ state, variables }) => {
  const urlFormulaBarRef = useRef();

  const handleUrlChange = useCallback(
    async (blocks, text) => {
      if (isCurlCommand(text)) {
        try {
          const parsedData = await parseCurlCommand(text);
          state.applyCurlData(parsedData);
          const urlBlocks = parsedData.url?.blocks || [];
          setTimeout(() => {
            if (urlFormulaBarRef.current?.updateInputContent) {
              urlFormulaBarRef.current.updateInputContent(urlBlocks, true);
            }
          }, 0);
        } catch (error) {}
        return;
      }

      state.setUrl({ type: "fx", blocks, text });
    },
    [state],
  );

  const paramsCount = state.query_params?.filter((p) => p.key)?.length || 0;
  const headersCount = state.headers?.filter((h) => h.key)?.length || 0;

  return (
    <div className="space-y-4">
      <div
        className="p-3 rounded-xl border border-border bg-muted/30"
        style={{ borderColor: `${THEME.accentColor}30` }}
      >
        <div className="flex items-center gap-2">
          <MethodSelector value={state.method} onChange={state.setMethod} />
          <div className="flex-1">
            <FormulaBar
              ref={urlFormulaBarRef}
              wrapContent={true}
              inputMode="formula"
              placeholder="https://api.example.com/endpoint"
              variables={variables}
              defaultInputContent={state.url?.blocks || []}
              onInputContentChanged={(blocks) => {
                const text = blocks
                  .map((b) => b.text || b.value || "")
                  .join("");
                handleUrlChange(blocks, text);
              }}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 ml-1">
          Tip: Paste a cURL command to auto-configure
        </p>
      </div>

      <div className="border border-border rounded-xl divide-y divide-border">
        {state.showBody && (
          <CollapsibleSection
            title="Body"
            count={state.body?.type !== BODY_TYPES.NONE ? 1 : 0}
            defaultOpen={state.body?.type !== BODY_TYPES.NONE}
          >
            <BodySection state={state} variables={variables} />
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Query Parameters" count={paramsCount}>
          <KeyValueFormulaGrid
            rows={state.query_params || []}
            onChange={state.setQueryParams}
            variables={variables}
            keyPlaceholder="Parameter name"
            valuePlaceholder="Parameter value"
            testIdPrefix="http-configure-param"
          />
        </CollapsibleSection>

        <CollapsibleSection title="Headers" count={headersCount}>
          <KeyValueFormulaGrid
            rows={state.headers || []}
            onChange={state.setHeaders}
            variables={variables}
            keyPlaceholder="Header name"
            valuePlaceholder="Header value"
            testIdPrefix="http-configure-header"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Authorization"
          count={state.authorization?.type !== AUTH_TYPES.NONE ? 1 : 0}
        >
          <AuthSection state={state} variables={variables} />
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default ConfigureTab;
