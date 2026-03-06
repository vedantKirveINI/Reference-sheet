import React, { useCallback, useState, useEffect } from "react";
import { ODSGrid } from "@src/module/ods";

import classes from "./DBOrderBy.module.css";
import _ from "lodash";

const options = ["ASCENDING", "DESCENDING"];

const DBOrderBy = ({
  schema,
  orderByRowData,
  onChange = () => {},
  ...gridProps
}) => {
  const [rowData, setRowData] = useState([]);

  const generateOrderByClause = useCallback((rowData) => {
    let clause = "ORDER BY";

    rowData?.forEach((row, index) => {
      if (row?.column && row?.sort_by && row?.checked) {
        if (index !== 0) {
          clause += ",";
        }
        clause += ` ${row.column} ${row.sort_by}`;
      }
    });
    return clause;
  }, []);

  const columnDefs = [
    {
      headerName: "",
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 50,
    },
    {
      field: "column",
      headerName: "COLUMNS",
      flex: 1,
    },
    {
      field: "sort_by",
      headerName: "SORT BY",
      flex: 1,
      editable: true,
      cellEditor: "ods-cell-autocomplete-editor",
      cellEditorParams: (params) => {
        return {
          editorProps: {
            isOptionEqualToValue: (option, value) => {
              return option === value;
            },
            getOptionLabel: (option) => option,
            options,
          },
          value: params?.data?.sort_by || options[0],
        };
      },
    },
    {
      headerName: "",
      rowDrag: true,
      width: 50,
    },
  ];

  const initializeRowData = useCallback((schema, orderByRowData) => {
    let orderByRowDataCopy = _.cloneDeep(orderByRowData);
    schema.forEach((schema_column) => {
      let found = orderByRowDataCopy.some(
        (item) => item.column === schema_column.name
      );
      if (!found) {
        orderByRowDataCopy.push({
          column: schema_column.name,
          sort_by: options[0],
          checked: false,
        });
      }
    });
    setRowData(orderByRowDataCopy);
  }, []);

  const onRowSelected = (params) => {
    if (rowData[params.node.rowIndex].checked === params.node.selected) return;
    setRowData((prev) => {
      prev[params.node.rowIndex].checked = params.node.selected;
      return [...prev];
    });
  };

  const onRowDataUpdated = (params) => {
    const nodesToSelect = [];
    params.api.forEachNode((node) => {
      if (node.data?.checked) {
        nodesToSelect.push(node);
      }
    });
    params.api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
  };

  const moveInArray = (arr, fromIndex, toIndex) => {
    var element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  };

  const onRowDragEnd = useCallback(
    (params) => {
      let movingNode = params?.node;
      let overNode = params?.overNode;
      let rowNeedsToMove = movingNode !== overNode;
      if (rowNeedsToMove) {
        // the list of rows we have is data, not row nodes, so extract the data
        let movingData = movingNode?.data;
        let overData = overNode?.data;
        let fromIndex = rowData.indexOf(movingData);
        let toIndex = rowData.indexOf(overData);
        let newRows = [...rowData]; // Create a copy of rowData
        moveInArray(newRows, fromIndex, toIndex);
        setRowData(newRows); // Update the rowData state
      }
    },
    [rowData]
  );

  useEffect(() => {
    if (!schema?.length && !orderByRowData?.length) {
      setRowData([]);
    }
  }, [orderByRowData?.length, schema?.length]);

  useEffect(() => {
    if (!rowData.length && schema?.length) {
      initializeRowData(schema, orderByRowData);
    }
  }, [initializeRowData, orderByRowData, rowData.length, schema]);

  useEffect(() => {
    const orderByClause = generateOrderByClause(rowData);
    onChange(rowData, orderByClause);
  }, [generateOrderByClause, onChange, rowData]);

  return (
    <div className={classes["db-order-by-container"]}>
      <ODSGrid
        style={{ height: "100%" }}
        rowData={rowData}
        columnDefs={columnDefs}
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
        onCellEditingStopped={(params) => {
          setRowData((prev) => {
            prev[params.rowIndex] = params.data;
            return [...prev];
          });
        }}
        onRowSelected={onRowSelected}
        onRowDataUpdated={onRowDataUpdated}
        onRowDragEnd={onRowDragEnd}
        {...gridProps}
      />
    </div>
  );
};

export default DBOrderBy;
