import React from "react";
// import Grid, { ExpandCollapseRenderer, FxCellRenderer } from "oute-ds-grid";
// import Label from "oute-ds-label";
// import Button from "oute-ds-button";
// import ODSIcon from "oute-ds-icon";
// import default_theme from "oute-ds-shared-assets";
import { ODSGrid as Grid, ExpandCollapseRenderer, FxCellRenderer, ODSLabel as Label, ODSButton as Button, ODSIcon, sharedAssets as default_theme } from "@src/module/ods";
import { uniqueId } from "lodash";
import classes from "./IfElse.module.css";

const If = ({
  ifRowData,
  // ifConditionColDefs,
  defaultColDef,
  onGridReadyIf,
  ifGridApi,
  addRow,
  setIfRowData,
  variables,
  jumpToNodeOptions,
  elseRowData,
  deleteRow,
}) => {
  const ifConditionColDefs = [
    {
      field: "arrow",
      headerName: "",
      editable: false,
      maxWidth: 75,
      cellRenderer: (param) => {
        return <ExpandCollapseRenderer param={param} />;
      },
    },
    {
      field: "_condition",
      headerName: "Condition",
      cellEditor: "ods-cell-fx-editor",
      flex: 1,
      cellRenderer: (params) => {
        return (
          <FxCellRenderer
            data-testid={`if-condition-${params.rowIndex}`}
            data={params.data?.condition?.blocks}
            className={`${classes["normal_cell"]} ${
              params.data.expand ? `${classes["custom_cell"]}` : ""
            }`}
          />
        );
      },
      cellEditorParams: (params) => {
        return {
          showSeperatorAfterStartAdornment: false,
          showSeperatorAfterEndAdornment: false,
          showSeperatorBeforeEndAdornment: false,
          onInputContentChanged: (data, dataStr) => {
            setIfRowData((prev) => {
              prev[params.rowIndex] = {
                ...prev[params.rowIndex],
                condition: {
                  type: "fx",
                  blocks: data,
                },
                conditionStr: dataStr,
              };
              return [...prev];
            });
          },
          wrapContent: params?.data?.expand,
          value: params.data?.condition?.blocks,
          variables,
        };
      },
      valueFormatter: (params) => params.data?.condition?.blocks,
    },
    {
      field: "jumpTo",
      headerName: "Jump To",
      cellEditor: "ods-cell-autocomplete-editor",
      cellEditorParams: (params) => {
        return {
          editorProps: {
            isOptionEqualToValue: (option, value) => {
              return option.key === value.key;
            },
            getOptionLabel: (option) => {
              return `${option?.name ? option.name : ""} ${
                option?.description ? option.description : ""
              }`;
            },
            options: jumpToNodeOptions,
            renderOption: (props, option) => (
              <li {...props}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "40px",
                    gap: "0.5rem",
                  }}
                >
                  <ODSIcon
                    imageProps={{
                      src: option?._src,
                      width: 32,
                      height: 32,
                      style: {
                        border: "1px solid #E4E5E8",
                        borderRadius: "50%",
                      },
                    }}
                  />
                  {`${option?.name ? option.name : ""} ${
                    option?.description ? option.description : ""
                  }`}
                </div>
              </li>
            ),
            getOptionDisabled: (option) => {
              return (
                ifRowData?.findIndex((r) => r?.jumpTo?.key === option.key) !==
                  -1 || elseRowData[0]?.jumpTo?.key === option.key
              );
            },
            value: params?.data?.jumpTo || null,
            disableClearable: false,
            onChange: (value) => {
              setIfRowData((prev) => {
                prev[params.rowIndex].jumpTo = value;
                return [...prev];
              });
            },
          },
          textFieldProps: {
            size: "small",
            placeholder: "Select a node",
            InputProps: {
              startAdornment: params.data?.jumpTo?._src ? (
                <ODSIcon
                  imageProps={{
                    src: params.data.jumpTo._src,
                    width: 32,
                    height: 32,
                    style: {
                      border: "1px solid #E4E5E8",
                      borderRadius: "50%",
                    },
                  }}
                />
              ) : null,
            },
          },
        };
      },
      cellRenderer: (params) => {
        const jumpTo = params.data?.jumpTo;

        return jumpTo ? (
          <div
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            data-testid={`if-jumpto-${params.rowIndex}`}
          >
            <ODSIcon
              imageProps={{
                src: jumpTo._src,
                width: 30,
                height: 30,
              }}
            />
            {`${jumpTo?.name ? jumpTo.name : ""} ${
              jumpTo?.description ? jumpTo.description : ""
            }`}
          </div>
        ) : (
          <div
            style={{ color: "#7A7C8D", opacity: 0.4 }}
            data-testid={`if-jumpto-${params.rowIndex}`}
          >
            Select
          </div>
        );
      },
      valueGetter: (params) => {
        return params.data.jumpTo;
      },
      suppressKeyboardEvent: (params) => params.event.key === "Enter",
    },
    {
      field: "delete",
      headerName: "",
      flex: 0.15,
      editable: false,
      cellRenderer: (params) => {
        return (
          <>
            {params.api.getDisplayedRowCount() > 1 ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  data-testid={`delete-${params.rowIndex}`}
                  variant="text"
                  size="small"
                  startIcon={<ODSIcon outeIconName="OUTETrashIcon" />}
                  onClick={() => deleteRow(params.rowIndex)}
                />
              </div>
            ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];

  return (
    <div
      style={{
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* <Label variant="body2">IF...ELSE IF Conditions</Label> */}
      <div className={classes["if-container"]}>
        <Grid
          rowData={ifRowData}
          columnDefs={ifConditionColDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReadyIf}
          getRowHeight={(params) => {
            return params.data.expand ? 200 : 46;
          }}
          getRowId={(params) => {
            return params.data.key;
          }}
          onCellValueChanged={(params) => {
            if (params?.column?.colId === "jumpTo") {
              setIfRowData((prev) => {
                prev[params.rowIndex].jumpTo = params.newValue;
                return [...prev];
              });
            }
          }}
        />
      </div>
      <Button
        label="CONDITION"
        onClick={() => {
          addRow(
            { key: uniqueId(Date.now()), expand: false },
            ifGridApi?.getDisplayedRowCount()
          );
          setTimeout(() => {
            ifGridApi?.startEditingCell({
              rowIndex: ifGridApi?.getDisplayedRowCount() - 1,
              colKey: "_condition",
            });
          }, 100);
        }}
        sx={{ width: "120px", padding: "5px" }}
        variant="text"
        size="small"
        startIcon={
          <ODSIcon
            outeIconName="OUTEAddIcon"
            outeIconProps={{
              sx: {
                color: default_theme.palette["primary"]["main"],
              },
            }}
          />
        }
      />
    </div>
  );
};

export default If;
