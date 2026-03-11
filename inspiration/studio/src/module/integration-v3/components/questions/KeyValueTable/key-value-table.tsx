import { useEffect, lazy, Suspense } from "react";
import { TKeyValueTableProps } from "./types";
import { getRowData } from "./utils/getRowData";
import { TableType, tableTypesOptions } from "./constants/table-type";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { ComponentType } from "react";
import {
  KeyValueGrid,
  TKeyValueRow,
  TKeyValueGridColumn,
} from "@src/module/key-value-table/key-value-grid";
import {
  FormulaCellEditor,
  FormulaCellRenderer,
} from "@src/module/key-value-table/key-value-grid/formula-cell";

type FormulaBarComponent = ComponentType<Record<string, unknown>>;

const FormulaBar = lazy<FormulaBarComponent>(() =>
  import("@src/components/formula-fx/src").then((module) => ({
    default: module.FormulaBar as FormulaBarComponent,
  }))
);

export function KeyValueTable({
  value = [],
  variables,
  onChange,
  question,
  isCreator,
  answers = {},
}: TKeyValueTableProps) {
  const tableType = question?.settings?.tableType;
  const allowAddRow = question?.settings?.allowAddRow;
  const withDefaultValue = question?.settings?.withDefaultValue;

  useEffect(() => {
    if (!isCreator && Object.keys(answers)?.length) {
      const rowData = getRowData({
        settings: question?.settings,
        answers,
        isCreator: isCreator,
        creatorValue: question?.value,
        defaultValue: value,
      });
      onChange(rowData);
    }
  }, []);

  const deleteRow = (rowIndex: number) => {
    if (isCreator) {
      onChange(
        "value",
        value.filter((_: any, i: number) => i !== rowIndex)
      );
    } else {
      onChange(value.filter((_: any, i: number) => i !== rowIndex));
    }
  };

  const addRow = () => {
    const newValue = [
      ...value,
      {
        key: "",
        value: undefined,
        ...(withDefaultValue ? { default: undefined } : {}),
      },
    ];
    isCreator ? onChange("value", newValue) : onChange(newValue);
  };

  const handleRowChange = (rowIndex: number, newData: TKeyValueRow) => {
    const temp = [...value];
    temp[rowIndex] = {
      ...temp[rowIndex],
      ...newData,
    };
    onChange(temp);
  };

  const columns: TKeyValueGridColumn[] = [
    {
      field: "key",
      headerName: "FIELD",
      editable: isCreator || allowAddRow,
      cellType: "text",
      width: "30%",
      highlighted: true,
      maxLines: 3,
    },
    {
      field: "value",
      headerName: "MAP TO",
      editable: !isCreator,
      cellType: "formula",
      width: withDefaultValue ? "30%" : "60%",
      placeholder: "Select a value to map...",
      cellRenderer: ({ data }) => (
        <FormulaCellRenderer data={data?.value?.blocks} placeholder="Select a value to map..." />
      ),
      cellEditor: ({ data, rowIndex, onValueChange, onBlur, autoFocus, placeholder }) => (
        <FormulaCellEditor
          value={data?.value?.blocks}
          rowIndex={rowIndex}
          fieldName={data?.key || "value"}
          variables={variables}
          wrapContent={data?.expand}
          isReadOnly={isCreator}
          onBlur={onBlur}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onInputContentChanged={(content) => {
            onValueChange({
              type: "fx",
              blocks: content,
            });
          }}
        />
      ),
    },
  ];

  if (withDefaultValue) {
    columns.push({
      field: "default",
      headerName: "FALLBACK",
      editable: !isCreator,
      cellType: "formula",
      width: "30%",
      placeholder: "Default if empty...",
      cellRenderer: ({ data }) => (
        <FormulaCellRenderer data={data?.default?.blocks || []} placeholder="Default if empty..." />
      ),
      cellEditor: ({ data, rowIndex, onValueChange, onBlur, autoFocus, placeholder }) => (
        <FormulaCellEditor
          value={data?.default?.blocks}
          rowIndex={rowIndex}
          fieldName={data?.key || "default"}
          variables={variables}
          wrapContent={data?.expand}
          isReadOnly={isCreator}
          onBlur={onBlur}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onInputContentChanged={(content) => {
            onValueChange({
              type: "fx",
              blocks: content,
            });
          }}
        />
      ),
    });
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  if (!Array.isArray(value)) return null;

  return (
    <section>
      {isCreator && (
        <Select
          value={tableType || ""}
          onValueChange={(newValue) => {
            onChange("settings", {
              ...question?.settings,
              tableType: newValue,
            });
          }}
        >
          <SelectTrigger
            id="dynamic-table-type"
            data-testid="keyValueTable-dynamic-table-type"
            className="w-full bg-white"
          >
            <SelectValue placeholder="Select table type" />
          </SelectTrigger>
          <SelectContent>
            {tableTypesOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div
        data-testid="keyValueTable-root"
        className="w-full pt-2 box-border"
      >
        <AnimatePresence>
          {tableType === TableType.DYNAMIC && isCreator ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
              key="dynamic"
            >
              <Suspense fallback={<div>Loading...</div>}>
                <FormulaBar
                  isReadOnly={false}
                  defaultInputContent={question?.settings?.variables?.blocks}
                  variables={variables}
                  onInputContentChanged={(content: any) => {
                    onChange("settings", {
                      ...question?.settings,
                      variables: {
                        type: "fx",
                        blocks: content,
                      },
                    });
                  }}
                  wrapContent={true}
                  data-testid="keyValueTable-formula-bar"
                />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
              key="static"
              className="relative w-full"
            >
              <KeyValueGrid
                rowData={value}
                columns={columns}
                onRowChange={handleRowChange}
                onRowDelete={deleteRow}
                showDeleteColumn={isCreator || allowAddRow}
                data-testid="keyValueTable-grid"
              />
              {(isCreator || allowAddRow) && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={addRow}
                    variant="outline"
                    className="gap-2"
                    data-testid="keyValueTable-add-row-button"
                  >
                    <Plus className="h-4 w-4" />
                    Add Row
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
