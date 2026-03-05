import React, { useRef, useEffect } from "react";
import { FormulaBar, ODSGrid, FxCellRenderer, ODSAutocomplete, ODSIcon } from "@src/module/ods";
import { TKeyValueTableProps } from "./types";
import { getRowData } from "./utils/getRowData";
import { TableType, tableTypesOptions } from "./constants/table-type";
import { motion, AnimatePresence } from "framer-motion";

export function KeyValueTable({
  value = [],
  variables,
  onChange,
  question,
  isCreator,
  answers = {},
}: TKeyValueTableProps) {
  const gridRef: any = useRef();

  const tableType = question?.settings?.tableType;
  const allowAddRow = question?.settings?.allowAddRow;

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
        value.filter((_, i) => i !== rowIndex)
      );
    } else {
      onChange(value.filter((_, i) => i !== rowIndex));
    }
  };

  const addRow = () => {
    const newValue = [
      ...value,
      {
        key: "",
        value: undefined,
        ...(question?.settings?.withDefaultValue ? { default: undefined } : {}),
      },
    ];
    isCreator ? onChange("value", newValue) : onChange(newValue);
    setTimeout(() => {
      if (gridRef.current) {
        gridRef?.current?.api?.startEditingCell({
          rowIndex: gridRef?.current?.api?.getDisplayedRowCount() - 1,
          colKey: "key",
        });
      }
    }, 100);
  };

  const defaultColDef = {
    autoHeight: true,
    flex: 1,
  };

  const columnDefs: any = [
    {
      headerName: "NAME",
      field: "key",
      editable: isCreator || allowAddRow ? true : false,
      cellEditor: "ods-cell-text-editor",
      cellEditorParams: (params) => {
        return {
          editorProps: {
            multiline: params.data.expand,
          },
        };
      },
    },
    {
      headerName: "DATA",
      editable: !isCreator,
      cellEditor: "ods-cell-fx-editor",
      cellEditorParams: (params) => {
        return {
          showSeparatorAfterStartAdornment: false,
          showSeparatorAfterEndAdornment: false,
          showSeparatorBeforeEndAdornment: false,
          onInputContentChanged: (data, dataStr) => {
            params.api.getRowNode(params.rowIndex).setData({
              ...params.data,
              value: {
                type: "fx",
                blocks: data,
              },
            });
          },
          wrapContent: params?.data?.expand,
          value: params.data?.value?.blocks,
          variables: variables,
        };
      },
      cellRenderer: (params) => {
        return <FxCellRenderer data={params?.data?.value?.blocks} />;
      },
      valueFormatter: (params) => params.data?.value?.blocks,
    },
  ];

  if (question?.settings?.withDefaultValue) {
    const defaultColumnDef = {
      headerName: "DEFAULT VALUE",
      editable: !isCreator,
      cellEditor: "ods-cell-fx-editor",
      cellEditorParams: (params) => {
        return {
          showSeparatorAfterStartAdornment: false,
          showSeparatorAfterEndAdornment: false,
          showSeparatorBeforeEndAdornment: false,
          onInputContentChanged: (data, dataStr) => {
            params.api.getRowNode(params.rowIndex).setData({
              ...params.data,
              default: {
                type: "fx",
                blocks: data,
              },
            });
          },
          wrapContent: params?.data?.expand,
          value: params.data?.default?.blocks || {},
          variables: variables,
        };
      },
      cellRenderer: (params) => {
        return <FxCellRenderer data={params?.data?.default?.blocks || []} />;
      },
      valueFormatter: (params) => params.data?.default?.blocks || [],
    };

    columnDefs.push(defaultColumnDef);
  }

  if (isCreator || allowAddRow) {
    columnDefs.push({
      maxWidth: 75,
      cellRenderer: (params) => {
        return (
          <div
            style={{
              display: "grid",
              height: "100%",
              placeContent: "center",
            }}
          >
            <ODSIcon
              outeIconName="OUTETrashIcon"
              onClick={() => deleteRow(params?.rowIndex)}
              outeIconProps={{
                "data-testid": `delete-${params.rowIndex}`,
              }}
            />
          </div>
        );
      },
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
        <ODSAutocomplete
          id="dynamic-table-type"
          data-testid="keyValueTable-dynamic-table-type"
          className="w-full [&_.MuiInputBase-root]:bg-white [&_.MuiInputBase-root]:p-[10px]"
          value={tableType || null}
          onChange={async (e, newValue) => {
            onChange("settings", {
              ...question?.settings,
              tableType: newValue,
            });
          }}
          isOptionEqualToValue={(option, _value) => option === _value}
          getOptionLabel={(option) => option || ""}
          options={tableTypesOptions}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option}>
                {option}
              </li>
            );
          }}
        />
      )}
      <div
        data-testid="keyValueTable-root"
        className="w-full pt-2 box-border"
        style={{
          height: `calc(42px + ${value?.length > 0 ? value?.length * 42 : 200}px + 9px)`,
        }}
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
              <FormulaBar
                isReadOnly={false}
                defaultInputContent={question?.settings?.variables?.blocks}
                variables={variables}
                onInputContentChanged={(content) => {
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
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
              key="static"
              className="relative w-full h-full"
            >
              <ODSGrid
                style={{ height: "100%" }}
                ref={gridRef}
                columnDefs={columnDefs}
                domLayout="normal"
                rowData={value}
                defaultColDef={defaultColDef}
                onCellEditingStopped={(params) => {
                  const temp = [...value];
                  temp[params.rowIndex] = {
                    ...temp[params.rowIndex],
                    ...params.data,
                  };
                  onChange(temp);
                }}
                data-testid="keyValueTable-grid"
              />
              {/* Showing add button only when isCreator or allowAddRow is true */}
              {(isCreator || allowAddRow) && (
                <button
                  onClick={addRow}
                  className="absolute -bottom-[50px] right-0 font-bold text-base no-underline border-none bg-white text-black px-5 py-2.5 rounded-[10px] cursor-pointer"
                  data-testid="keyValueTable-add-row-button"
                >
                  Add Row
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
