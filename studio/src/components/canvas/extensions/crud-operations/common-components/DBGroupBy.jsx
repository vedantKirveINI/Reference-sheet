import React, { useState, useCallback, useEffect } from "react";
import classes from "./DBGroupBy.module.css";
import { ODSGrid } from "@src/module/ods";
import _ from "lodash";

const DBGroupBy = ({
  schema,
  groupByRowData,
  onChange = () => {},
  ...gridProps
}) => {
  const [rowData, setRowData] = useState([]);

  const generateGroupByClause = useCallback((rowData) => {
    let clause = "GROUP BY";

    rowData?.forEach((row, index) => {
      if (row?.column && row?.checked) {
        clause += `${index === 0 ? " " : ","} ${row.column}`;
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
      headerName: "",
      rowDrag: true,
      width: 50,
    },
  ];

  const initializeRowData = useCallback((schema, groupByRowData) => {
    let groupByRowDataCopy = _.cloneDeep(groupByRowData);
    schema.forEach((schema_column) => {
      let found = groupByRowDataCopy.some(
        (item) => item.column === schema_column.name
      );
      if (!found) {
        groupByRowDataCopy.push({
          column: schema_column.name,
          checked: false,
        });
      }
    });
    setRowData(groupByRowDataCopy);
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
    if (!schema?.length && !groupByRowData?.length) {
      setRowData([]);
    }
  }, [groupByRowData?.length, schema?.length]);

  useEffect(() => {
    if (!rowData.length && schema?.length) {
      initializeRowData(schema, groupByRowData);
    }
  }, [groupByRowData, initializeRowData, rowData.length, schema]);

  useEffect(() => {
    const groupByClause = generateGroupByClause(rowData);
    onChange(rowData, groupByClause);
  }, [generateGroupByClause, onChange, rowData]);

  return (
    <div className={classes["db-group-by-container"]}>
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

export default DBGroupBy;
