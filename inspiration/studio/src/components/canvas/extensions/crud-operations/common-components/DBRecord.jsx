import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ODSGrid as Grid, FxCellRenderer, ODSLabel as Label } from "@src/module/ods";
import classes from "./DBRecord.module.css";
import {
  FIND_ALL_TYPE,
  FIND_ONE_TYPE,
  DELETE_TYPE,
} from "../../constants/types";

const DBRecord = ({
  fields = [],
  record = [],
  table = {},
  columnsToShow = ["checked", "key", "type", "required", "alias", "value"],
  onChange = () => {},
  variables,
  type,
  ...gridProps
}) => {
  const [recordData, setRecordData] = useState(record);
  const [localTable, setLocalTable] = useState(table);

  const showRequired = useMemo(() => {
    return ![FIND_ALL_TYPE, FIND_ONE_TYPE, DELETE_TYPE].includes(type);
  }, [type]);

  const columnDefs = [
    {
      headerName: "",
      headerCheckboxSelection: columnsToShow.indexOf("checked") !== -1,
      checkboxSelection: columnsToShow.indexOf("checked") !== -1,
      hide: columnsToShow.indexOf("checked") === -1,
      width: 50,
    },
    {
      field: "key",
      headerName: "Column Name",
      hide: columnsToShow.indexOf("key") === -1,
      minWidth: 8 * 16,
      flex: 1,
      cellRenderer: (params) => {
        return (
          <div
            style={{ display: "flex", alignItems: "center", height: "100%" }}
          >
            <Label variant="body1">
              {params.data.key}
              {showRequired && params.data.required && (
                <span style={{ color: "red" }}>*</span>
              )}
            </Label>
          </div>
        );
      },
    },
    {
      field: "type",
      headerName: "Column Type",
      hide: columnsToShow.indexOf("type") === -1,
      minWidth: 6 * 16,
      flex: 1,
    },
    {
      headerName: "Alias",
      field: "alias",
      editable: true,
      hide: columnsToShow.indexOf("alias") === -1,
      flex: 1,
      minWidth: 8 * 16,
      cellEditor: "ods-cell-text-editor",
      cellEditorParams: (params) => {
        return {
          editorProps: {
            placeholder: "Enter alias",
            onChange: (e) => {
              setRecordData((prev) => {
                prev[params.rowIndex].alias = e.target.value;
                return [...prev];
              });
            },
          },
        };
      },
    },
    {
      field: "_value",
      headerName: "Value",
      editable: true,
      flex: 1,
      minWidth: 8 * 16,
      cellRenderer: (params) => {
        return (
          <FxCellRenderer
            data={params.data?.value?.blocks}
            className={classes["fx-cell-renderer"]}
          />
        );
      },
      cellEditor: "ods-cell-fx-editor",
      cellEditorParams: (params) => {
        return {
          showSeparatorAfterStartAdornment: false,
          showSeparatorAfterEndAdornment: false,
          showSeparatorBeforeEndAdornment: false,
          // eslint-disable-next-line no-unused-vars
          onInputContentChanged: (data, dataStr) => {
            setRecordData((prev) => {
              prev[params.rowIndex] = {
                ...prev[params.rowIndex],
                value: {
                  type: "fx",
                  blocks: data,
                },
                checked: !!data?.length,
              };
              return [...prev];
            });
          },
          value: params.data?.value?.blocks,
          variables,
        };
      },
      valueFormatter: (params) => params.data?.value?.blocks,
      hide: columnsToShow.indexOf("value") === -1,
    },
  ];
  const onRowDataUpdated = (params) => {
    const nodesToSelect = [];
    params.api.forEachNode((node) => {
      if (node.data?.checked) {
        nodesToSelect.push(node);
      }
    });
    params.api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
  };
  const onRowSelected = (params) => {
    if (recordData[params.node.rowIndex].checked === params.node.selected)
      return;
    setRecordData((prev) => {
      prev[params.node.rowIndex].checked = params.node.selected;
      return [...prev];
    });
  };
  const initializeRowData = useCallback(() => {
    let rowData = [];
    fields.forEach((field) => {
      rowData.push({
        ...field,
        checked:
          type === FIND_ALL_TYPE || type === FIND_ONE_TYPE ? true : false,
        key: field.name,
        type: field.type,
        required: field.field_indicator === "REQUIRED",
        value: {
          type: "fx",
          blocks: record[field.name] || [],
        },
        alias: "",
      });
    });
    setRecordData(rowData);
  }, [fields, record, type]);
  useEffect(() => {
    if (!fields.length && table?.table_id !== localTable?.table_id) {
      setRecordData([]);
      setLocalTable(table);
    }
  }, [fields.length, localTable, table]);
  useEffect(() => {
    if (!recordData?.length && fields?.length) initializeRowData();
  }, [fields, initializeRowData, recordData?.length]);
  useEffect(() => {
    onChange(recordData);
  }, [onChange, recordData]);
  return (
    <div className={classes["db-record"]}>
      <Grid
        style={{ height: "100%" }}
        rowData={recordData}
        columnDefs={columnDefs}
        suppressHorizontalScroll={false}
        sizeColumnsToFit={false}
        noRowsOverlayComponent={() => {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              Please select a table.
            </div>
          );
        }}
        onRowSelected={onRowSelected}
        onRowDataUpdated={onRowDataUpdated}
        getRowHeight={(params) => {
          return params.data.expand ? 200 : null;
        }}
        getRowId={(params) => {
          return params.data.key;
        }}
        {...gridProps}
      />
    </div>
  );
};

export default DBRecord;
