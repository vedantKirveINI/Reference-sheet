import React, { useRef, useEffect, useCallback, Suspense } from "react";
import classes from "./index.module.css";
import { ODSIcon, ODSTooltip, ODSGrid } from "@src/module/ods";
import { paramsMode } from "../../constants/paramsMode";
import { getParamsRowTemplate } from "../../utils/helper";
const Grid = ODSGrid;
export const QueryParams = ({
  inputs,
  setQueryParams,
  assetId,
  parentId,
  workspaceId,
}) => {
  const gridRef = useRef();
  const defaultColDef = {
    autoHeight: true,
    flex: 1,
    singleClickEdit: true,
  };
  const columnDefs = [
    {
      headerName: "NAME",
      field: "name",
      editable: true,
      cellEditor: "ods-cell-text-editor",
      cellStyle: (params) => {
        return {
          border: params.data.isDuplicate ? "1px solid red" : "",
        };
      },
      cellRenderer: (params) => {
        const { data } = params;
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            data-testid={`query-params-name-col-${params?.node?.rowIndex}`}
          >
            {params.value}
            {params.data.isDuplicate && (
              <span>
                <ODSTooltip
                  title="Name already used. Please give another name."
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: "0.9em",
                      },
                    },
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <ODSIcon
                      outeIconName="OUTEInfoIcon"
                      outeIconProps={{
                        sx: {
                          "data-testid": `query-params-duplicate-icon-${params?.node?.rowIndex}`,
                          color: "var(--error)",
                          height: "24",
                          width: "24",
                        },
                      }}
                    />
                  </div>
                </ODSTooltip>
              </span>
            )}
          </div>
        );
      },
    },
    {
      headerName: "VALUE",
      field: "default",
      editable: true,
      cellEditor: "ods-cell-text-editor",
      singleClickEdit: true,
    },
    {
      maxWidth: 50,
      cellRenderer: (params) => {
        const { data, api, rowIndex } = params;
        const rowCount = api.getDisplayedRowCount();
        const isFirstRow = rowIndex === 0;
        const isLastRow = rowIndex === rowCount - 1;
        const hasData = data.name.length > 0 || data.default.length > 0;
        const isDeleteIconEnabled = hasData || (!isFirstRow && !isLastRow);
        return (
          <div
            style={{
              display: "grid",
              height: "100%",
              placeContent: "center",
              opacity: isDeleteIconEnabled ? 1 : 0.3,
              pointerEvents: isDeleteIconEnabled ? "auto" : "none",
            }}
          >
            <ODSIcon
              outeIconName="OUTETrashIcon"
              onClick={() => deleteRow(rowIndex)}
              outeIconProps={{
                "data-testid": `query-params-delete-${rowIndex}`,
              }}
            />
          </div>
        );
      },
    },
  ];
  const deleteRow = (rowIndex) => {
    setQueryParams((prevInputs) => {
      const updatedInputs = prevInputs.filter((_, i) => i !== rowIndex);
      updateDuplicateStatus(updatedInputs);
      return updatedInputs.length
        ? updatedInputs
        : [
            getParamsRowTemplate(
              assetId,
              parentId,
              workspaceId,
              paramsMode.QUERY_PARAMS
            ),
          ];
    });
  };
  const updateDuplicateStatus = (data) => {
    const nameCount = {};
    const updatedData = [...data];
    data.forEach((row) => {
      if (row.name.trim()) {
        nameCount[row.name] = (nameCount[row.name] || 0) + 1;
      }
    });

    // Traverse the data in reverse order to mark the last occurrence first
    for (let i = data.length - 1; i >= 0; i--) {
      const row = data[i];
      if (nameCount[row.name] > 1) {
        nameCount[row.name] -= 1;
        updatedData[i].isDuplicate = nameCount[row.name] > 0;
      } else {
        updatedData[i].isDuplicate = false;
      }
    }
    setQueryParams([...updatedData]);
  };
  const onCellEditingStarted = useCallback(
    (params) => {
      const { rowIndex, colDef } = params;
      if (colDef?.field === "name") {
        setQueryParams((prev) => {
          prev[rowIndex].isDuplicate = false;
          return [...prev];
        });
      }
    },
    [setQueryParams]
  );
  const onCellEditingStopped = useCallback(
    (params) => {
      const { rowIndex, colDef, newValue } = params;

      if (newValue.trim() === "") return;
      const updatedGridData = [...inputs];
      // Update the appropriate field based on what was edited
      if (colDef?.field === "name") {
        updatedGridData[rowIndex].name = newValue;
      } else if (colDef?.field === "default") {
        updatedGridData[rowIndex].default = newValue;
      }
      // Update duplicate status only when the "name" field is edited
      if (colDef?.field === "name") {
        updateDuplicateStatus(updatedGridData);
      }
      // Add a new row if the last row has data in either field
      const lastRow = updatedGridData[updatedGridData.length - 1];
      if (lastRow.name || lastRow.default) {
        updatedGridData.push(
          getParamsRowTemplate(
            assetId,
            parentId,
            workspaceId,
            paramsMode.QUERY_PARAMS
          )
        );
      }
      setQueryParams(updatedGridData);
    },
    [inputs, assetId, parentId, workspaceId, setQueryParams]
  );
  useEffect(() => {
    if (inputs?.length === 0) {
      const newRow = getParamsRowTemplate(
        assetId,
        parentId,
        workspaceId,
        paramsMode.QUERY_PARAMS
      );
      setQueryParams((prevInputs) => [...prevInputs, newRow]);
    } else {
      const lastRow = inputs[inputs.length - 1];
      if (lastRow?.name && lastRow?.default) {
        const newRow = getParamsRowTemplate(
          assetId,
          parentId,
          workspaceId,
          paramsMode.QUERY_PARAMS
        );
        setQueryParams((prevInputs) => [...prevInputs, newRow]);
      }
    }
  }, [assetId, inputs, parentId, setQueryParams, workspaceId]);
  return (
    <div
      className={classes["input-component-container"]}
      data-testid="query-params-table"
    >
      <div key="static" className={classes["gridContainer"]}>
        <Suspense fallback={<></>}>
          <Grid
            style={{ width: "100%", height: "100%" }}
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={inputs}
            defaultColDef={defaultColDef}
            onCellEditingStarted={onCellEditingStarted}
            onCellEditingStopped={onCellEditingStopped}
            domLayout="normal"
            getRowId={(params) => params.data?.rowid}
          />
        </Suspense>
      </div>
    </div>
  );
};
