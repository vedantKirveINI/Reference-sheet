import React, { useCallback, useEffect, useState, useRef } from "react";
import { icons } from "@/components/icons";
import { generateUUID } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FORM_DATA_ROW_TYPE_TEXT, FORM_DATA_ROW_TYPE_FILE } from "../constants";

const ROW_HEIGHT_CLASS = "h-9";
const INPUT_BORDER_CLASS =
  "rounded-md border border-border/40 hover:border-border/60 focus:border-border focus-visible:ring-1 focus-visible:ring-ring transition-colors";

const createEmptyRow = (supportFileType = false) => ({
  rowid: generateUUID(),
  key: "",
  value: supportFileType ? "" : { type: "fx", blocks: [] },
  valueStr: "",
  ...(supportFileType ? { type: FORM_DATA_ROW_TYPE_TEXT } : {}),
});

const isEmptyRow = (row, supportFileType = false) => {
  if (supportFileType && row?.type === FORM_DATA_ROW_TYPE_FILE) {
    return (
      (!row.key || row.key.trim() === "") &&
      (!row.value || (typeof row.value === "string" && row.value.trim() === ""))
    );
  }
  return (
    (!row.key || row.key.trim() === "") &&
    (!row.value?.blocks ||
      row.value.blocks.length === 0 ||
      (row.value.blocks.length === 1 &&
        !row.value.blocks[0].value &&
        !row.value.blocks[0].text))
  );
};

const ensureRowIds = (rows, supportFileType = false) => {
  return rows.map((row) => ({
    ...row,
    rowid: row.rowid || generateUUID(),
    ...(supportFileType && row.type === undefined
      ? { type: FORM_DATA_ROW_TYPE_TEXT }
      : {}),
  }));
};

const areRowsEquivalent = (propsRows, localRows, supportFileType = false) => {
  if (!propsRows || propsRows.length === 0) {
    if (localRows.length === 1 && isEmptyRow(localRows[0], supportFileType)) {
      return true;
    }
    return false;
  }

  const nonEmptyLocal = localRows.filter(
    (row) => !isEmptyRow(row, supportFileType),
  );
  if (propsRows.length !== nonEmptyLocal.length) return false;

  return propsRows.every((propRow, i) => {
    const localRow = nonEmptyLocal[i];
    if (!localRow) return false;
    if (propRow.key !== localRow.key) return false;
    if (propRow.type !== localRow.type) return false;
    if (propRow.type === FORM_DATA_ROW_TYPE_FILE) {
      return (
        (propRow.value || propRow.valueStr || "") ===
        (localRow.value || localRow.valueStr || "")
      );
    }
    const propBlocks = JSON.stringify(propRow.value?.blocks || []);
    const localBlocks = JSON.stringify(localRow.value?.blocks || []);
    return propBlocks === localBlocks;
  });
};

const KeyValueFormulaGrid = ({
  rows = [],
  onChange,
  variables = {},
  keyPlaceholder = "Enter key",
  valuePlaceholder = "Enter value",
  testIdPrefix = "kv",
  valueInputMode = "text",
  formulaBarContainerClassName,
  formulaBarSlotProps,
  supportFileType = false,
  uploadingRowIndex = null,
  onFileUpload,
  onFileDelete,
}) => {
  const debounceTimerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const fileInputRefsRef = useRef({});
  onChangeRef.current = onChange;

  const createEmpty = useCallback(
    () => createEmptyRow(supportFileType),
    [supportFileType],
  );

  const isEmpty = useCallback(
    (row) => isEmptyRow(row, supportFileType),
    [supportFileType],
  );

  const prepareRows = useCallback(
    (inputRows) => {
      if (!inputRows || inputRows.length === 0) {
        return [createEmpty()];
      }
      const rowsWithIds = ensureRowIds(inputRows, supportFileType);
      const hasEmpty = rowsWithIds.some((r) => isEmpty(r));
      return hasEmpty ? rowsWithIds : [...rowsWithIds, createEmpty()];
    },
    [supportFileType, createEmpty, isEmpty],
  );

  const [localRows, setLocalRows] = useState(() => prepareRows(rows));

  useEffect(() => {
    const equivalent = areRowsEquivalent(rows, localRows, supportFileType);
    if (equivalent) {
      return;
    }
    setLocalRows(prepareRows(rows));
  }, [rows, prepareRows, supportFileType]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const notifyChange = useCallback(
    (newRows) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        const filtered = newRows.filter((row) => !isEmpty(row));
        onChangeRef.current?.(filtered);
      }, 150);
    },
    [isEmpty],
  );

  const handleKeyChange = useCallback(
    (rowIndex, value) => {
      setLocalRows((prev) => {
        const newRows = [...prev];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          key: value,
        };
        if (rowIndex === newRows.length - 1 && value) {
          newRows.push(createEmpty());
        }
        notifyChange(newRows);
        return newRows;
      });
    },
    [notifyChange, createEmpty],
  );

  const handleTypeChange = useCallback(
    (rowIndex, newType) => {
      setLocalRows((prev) => {
        const newRows = [...prev];
        const row = newRows[rowIndex];
        if (newType === FORM_DATA_ROW_TYPE_FILE) {
          newRows[rowIndex] = {
            ...row,
            type: FORM_DATA_ROW_TYPE_FILE,
            value: "",
            valueStr: "",
            fileData: null,
          };
        } else {
          newRows[rowIndex] = {
            ...row,
            type: FORM_DATA_ROW_TYPE_TEXT,
            value: { type: "fx", blocks: [] },
            valueStr: "",
            fileData: undefined,
          };
        }
        notifyChange(newRows);
        return newRows;
      });
    },
    [notifyChange],
  );

  const handleValueChange = useCallback(
    (rowIndex, blocks, text) => {
      setLocalRows((prev) => {
        const newRows = [...prev];
        newRows[rowIndex] = {
          ...newRows[rowIndex],
          value: { type: "fx", blocks },
          valueStr: text,
        };
        if (rowIndex === newRows.length - 1 && blocks.length > 0) {
          newRows.push(createEmpty());
        }
        notifyChange(newRows);
        return newRows;
      });
    },
    [notifyChange, createEmpty],
  );

  const handleFileInputChange = useCallback(
    (rowIndex, e) => {
      const files = e.target?.files;
      if (!files || files.length === 0 || !onFileUpload) return;
      onFileUpload(rowIndex, files[0]);
      e.target.value = "";
    },
    [onFileUpload],
  );

  const handleFileDeleteClick = useCallback(
    (rowIndex) => {
      if (!onFileDelete) return;
      onFileDelete(rowIndex);
    },
    [onFileDelete],
  );

  const deleteRow = useCallback(
    (rowIndex) => {
      setLocalRows((prev) => {
        const newRows = [...prev];
        newRows.splice(rowIndex, 1);
        if (newRows.length === 0) {
          newRows.push(createEmpty());
        }
        notifyChange(newRows);
        return newRows;
      });
    },
    [notifyChange, createEmpty],
  );

  const TABLE_HEADER = supportFileType ? (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-3 w-[30%]">
          Key
        </th>
        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-3 w-[90px]">
          Type
        </th>
        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-3">
          Value
        </th>
        <th className="w-10 py-2.5 px-2" />
      </tr>
    </thead>
  ) : (
    <thead>
      <tr className="border-b border-border bg-muted/40">
        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-3 w-[35%]">
          Key
        </th>
        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2.5 px-3">
          Value
        </th>
        <th className="w-10 py-2.5 px-2" />
      </tr>
    </thead>
  );

  return (
    <TooltipProvider>
      <div className="w-full rounded-lg border border-border overflow-hidden">
        <table className="w-full border-collapse">
          {TABLE_HEADER}
          <tbody>
            {localRows.map((row, rowIndex) => {
              const isFileRow =
                supportFileType && row?.type === FORM_DATA_ROW_TYPE_FILE;
              const hasFile = isFileRow && (row.value || row.fileData?.cdn);
              const isOddRow = rowIndex % 2 === 1;

              return (
                <tr
                  key={row.rowid}
                  className={cn(
                    "border-b border-border/50 last:border-b-0 group transition-colors",
                    isOddRow ? "bg-muted/20" : "bg-background",
                    "hover:bg-muted/10",
                  )}
                >
                  <td className="py-2 px-2 align-top">
                    <Input
                      value={row.key || ""}
                      placeholder={keyPlaceholder}
                      onChange={(e) =>
                        handleKeyChange(rowIndex, e.target.value)
                      }
                      className={cn(
                        ROW_HEIGHT_CLASS,
                        "text-sm bg-background",
                        INPUT_BORDER_CLASS,
                      )}
                      data-testid={`${testIdPrefix}-key-${rowIndex}`}
                    />
                  </td>
                  {supportFileType && (
                    <td className="py-2 px-2 align-top">
                      <Select
                        value={row.type || FORM_DATA_ROW_TYPE_TEXT}
                        onValueChange={(v) => handleTypeChange(rowIndex, v)}
                        data-testid={`${testIdPrefix}-type-${rowIndex}`}
                      >
                        <SelectTrigger
                          className={cn(
                            ROW_HEIGHT_CLASS,
                            "text-sm w-full",
                            INPUT_BORDER_CLASS,
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={FORM_DATA_ROW_TYPE_TEXT}>
                            Text
                          </SelectItem>
                          <SelectItem value={FORM_DATA_ROW_TYPE_FILE}>
                            File
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  )}
                  <td className="py-2 px-2 align-top">
                    {isFileRow ? (
                      <div className="flex items-center gap-2 min-h-9">
                        <input
                          ref={(el) => {
                            fileInputRefsRef.current[rowIndex] = el;
                          }}
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileInputChange(rowIndex, e)}
                          data-testid={`${testIdPrefix}-file-input-${rowIndex}`}
                        />
                        {uploadingRowIndex === rowIndex ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(
                              ROW_HEIGHT_CLASS,
                              "gap-2 pointer-events-none opacity-70",
                            )}
                            data-testid={`${testIdPrefix}-file-uploading-${rowIndex}`}
                          >
                            {icons.loaderCircle && (
                              <icons.loaderCircle className="h-4 w-4 animate-spin" />
                            )}
                            Uploading…
                          </Button>
                        ) : hasFile ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={row.fileData?.cdn || row.value}
                                download={row.fileData?.fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1.5 text-sm min-h-9 max-w-[200px]"
                                data-testid={`${testIdPrefix}-file-link-${rowIndex}`}
                              >
                                {icons.fileText && (
                                  <icons.fileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                                <span className="truncate font-medium text-primary hover:underline">
                                  {row.fileData?.fileName || row.value}
                                </span>
                              </a>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[280px] break-all"
                            >
                              {row.fileData?.fileName || row.value}
                            </TooltipContent>
                          </Tooltip>
                        ) : null}
                        {hasFile ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => handleFileDeleteClick(rowIndex)}
                                aria-label="Remove file"
                                data-testid={`${testIdPrefix}-file-delete-${rowIndex}`}
                              >
                                {icons.x && <icons.x className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove file</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(
                              ROW_HEIGHT_CLASS,
                              "gap-2 border-primary/30 text-primary hover:bg-primary/5",
                            )}
                            onClick={() =>
                              fileInputRefsRef.current[rowIndex]?.click()
                            }
                            data-testid={`${testIdPrefix}-file-upload-${rowIndex}`}
                          >
                            {icons.upload && (
                              <icons.upload className="h-4 w-4" />
                            )}
                            Upload file
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="min-h-9">
                        <FormulaBar
                          key={row.rowid}
                          wrapContent={false}
                          inputMode={valueInputMode}
                          placeholder={valuePlaceholder}
                          defaultInputContent={row.value?.blocks || []}
                          variables={variables}
                          onInputContentChanged={(blocks) => {
                            const text = blocks
                              .map((b) => b.text || b.value || "")
                              .join("");
                            handleValueChange(rowIndex, blocks, text);
                          }}
                          slotProps={{
                            ...formulaBarSlotProps,
                            container: formulaBarSlotProps?.container,
                            content: {
                              ...formulaBarSlotProps?.content,
                              "data-testid": `${testIdPrefix}-value-${rowIndex}`,
                            },
                          }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center align-top">
                    {rowIndex !== localRows.length - 1 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                            onClick={() => deleteRow(rowIndex)}
                            aria-label="Delete row"
                            data-testid={`${testIdPrefix}-delete-${rowIndex}`}
                          >
                            {icons.trash2 && (
                              <icons.trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete row</TooltipContent>
                      </Tooltip>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
};

export default KeyValueFormulaGrid;
