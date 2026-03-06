import React, { useRef, useEffect, useCallback, Suspense } from "react";
import classes from "./index.module.css";
import { ODSIcon, ODSTooltip as Tooltip, ODSGrid } from "@src/module/ods";
import { paramsMode } from "../../constants/paramsMode";
import { getParamsRowTemplate } from "../../utils/helper";
const Grid = ODSGrid;

export const HiddenParams = ({
  inputs,
  setHiddenParams,
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
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
              height: "100%",
            }}
            data-testid={`hidden-params-name-col-${params?.node?.rowIndex}`}
          >
            {params.value}
            {params.data.isDuplicate && (
              <span>
                <Tooltip
                  title="Name already used. Please give another name."
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        fontSize: "0.8em",
                      },
                    },
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <ODSIcon
                      outeIconName="OUTEInfoIcon"
                      outeIconProps={{
                        "data-testid": `hidden-params-duplicate-icon-${params?.node?.rowIndex}`,
                        sx: {
                          color: "var(--error)",
                          height: "24",
                          width: "24",
                        },
                      }}
                    />
                  </div>
                </Tooltip>
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
                "data-testid": `hidden-params-delete-${rowIndex}`,
              }}
            />
          </div>
        );
      },
    },
  ];
  const deleteRow = (rowIndex) => {
    setHiddenParams((prevInputs) => {
      const updatedInputs = prevInputs.filter((_, i) => i !== rowIndex);
      updateDuplicateStatus(updatedInputs);
      return updatedInputs.length
        ? updatedInputs
        : [
            getParamsRowTemplate(
              assetId,
              parentId,
              workspaceId,
              paramsMode.HIDDEN_PARAMS
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
        // Set `isDuplicate` to true for the last occurrence and subsequent ones
        nameCount[row.name] -= 1; // Decrease the count for each occurrence
        updatedData[i].isDuplicate = nameCount[row.name] > 0;
      } else {
        updatedData[i].isDuplicate = false;
      }
    }
    // Update the state with the modified data
    setHiddenParams([...updatedData]);
  };
  const onCellEditingStarted = useCallback(
    (params) => {
      const { rowIndex, colDef } = params;
      if (colDef?.field === "name") {
        setHiddenParams((prev) => {
          prev[rowIndex].isDuplicate = false;
          return [...prev];
        });
      }
    },
    [setHiddenParams]
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
            paramsMode.HIDDEN_PARAMS
          )
        );
      }
      setHiddenParams(updatedGridData);
    },
    [inputs, assetId, parentId, workspaceId, setHiddenParams]
  );
  useEffect(() => {
    if (inputs?.length === 0) {
      const newRow = getParamsRowTemplate(
        assetId,
        parentId,
        workspaceId,
        paramsMode.HIDDEN_PARAMS
      );
      setHiddenParams((prevInputs) => [...prevInputs, newRow]);
    } else {
      const lastRow = inputs[inputs.length - 1];
      if (lastRow?.name && lastRow?.default) {
        const newRow = getParamsRowTemplate(
          assetId,
          parentId,
          workspaceId,
          paramsMode.HIDDEN_PARAMS
        );
        setHiddenParams((prevInputs) => [...prevInputs, newRow]);
      }
    }
  }, [assetId, inputs, parentId, setHiddenParams, workspaceId]);

  return (
    <div
      className={classes["input-component-container"]}
      data-testid="hidden-params-table"
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
