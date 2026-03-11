import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
// import ODSButton from "oute-ds-button";
// import ODSIcon from "oute-ds-icon";
// import ODSLabel from "oute-ds-label";
import { ODSButton, ODSIcon, ODSLabel } from "@src/module/ods";

import { IF_ELSE_TYPE } from "../constants/types";

import _ from "lodash";
import TabContainer from "../common-components/TabContainer";
import IF_ELSE_NODE from "./constant";
import Configure from "./tabs/configure/Configure";
import classes from "./IfElse.module.css";
import If from "./If";
import Else from "./Else";

const IfElse = forwardRef(
  (
    { data = {}, jumpToNodeOptions = [], variables, onSave = () => {} },
    ref
  ) => {
    const DefaultCellRenderer = ({ params }) => {
      const val = params.data?.[params.column.colId];
      return (
        <div
          className={`${classes["normal_cell"]} ${
            params.data.expand ? `${classes["custom_cell"]}` : ""
          }`}
        >
          {val?._label || val}
        </div>
      );
    };

    const [ifRowData, setIfRowData] = useState([]);
    const [elseRowData, setElseRowData] = useState([
      {
        key: _.uniqueId(Date.now()),
        conditionStr: "ELSE",
        condition: "ELSE",
      },
    ]);
    const [nodeLabel, setNodeLabel] = useState("");

    const [errorMessages, setErrorMessages] = useState({
      0: [],
    });

    const [validTabIndices, setValidTabIndices] = useState([]);

    const [ifGridApi, setIfGridApi] = useState(null);

    const defaultColDef = useMemo(() => {
      return {
        flex: 1,
        editable: true,
        cellRenderer: (params) => {
          return <DefaultCellRenderer params={params} />;
        },
      };
    }, []);

    const elseConditionColDefs = useMemo(
      () => [
        {
          field: "conditionStr",
          headerName: "Condition",
          editable: false,
          cellStyle: () => {
            return { background: "#CFD8DC" };
          },
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
                    ifRowData?.findIndex(
                      (r) => r?.jumpTo?.key === option.key
                    ) !== -1 || elseRowData[0]?.jumpTo?.key === option.key
                  );
                },
                value: params.data.jumpTo,
                disableClearable: false,
                onChange: (value) => {
                  setElseRowData((prev) => {
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
                data-testid={`else-jumpto-${params.rowIndex}`}
              >
                <ODSIcon
                  imageProps={{
                    src: jumpTo?._src,
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
                data-testid={`else-jumpto-${params.rowIndex}`}
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
      ],
      [elseRowData, ifRowData, jumpToNodeOptions]
    );
    const onGridReadyIf = (params) => setIfGridApi(params.api);

    const addRow = (data, rowIndex) => {
      setIfRowData((prev) => {
        prev.splice(rowIndex, 0, data);
        return [...prev];
      });
    };

    const deleteRow = (rowIndex) => {
      setIfRowData((prev) => {
        prev.splice(rowIndex, 1);
        return [...prev];
      });
    };
    const initializeIfRows = useCallback((data) => {
      if (data?.ifData) {
        setIfRowData(JSON.parse(JSON.stringify(data.ifData)));
      } else {
        setIfRowData([{ key: _.uniqueId(Date.now()) }]);
      }
    }, []);
    const initializeElseRow = useCallback((data) => {
      if (data?.elseData) {
        setElseRowData(JSON.parse(JSON.stringify(data.elseData)));
      }
    }, []);

    const getIfRowData = useCallback(() => {
      // Filter the ifRowData array to include only rows that have either
      // a 'jumpTo' property or a 'condition' property with non-empty 'blocks' array
      const filteredData = ifRowData?.filter(
        (row) => row?.jumpTo || row?.condition?.blocks?.length > 0
      );

      // If no rows are left after filtering, check the length of data.ifData
      if (!filteredData || filteredData.length === 0) {
        // If data.ifData has exactly one item, return the original ifRowData
        if (data?.ifData?.length === 1) {
          return ifRowData;
        } else {
          // Otherwise, return a new array with a single object having a unique key and expand set to false
          return [{ key: _.uniqueId(Date.now()), expand: false }];
        }
      }

      // Return the filtered data if it is not empty
      return filteredData;
    }, [ifRowData, data?.ifData]);

    const tabs = useMemo(
      () => [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            IfComponent: If,
            ifProps: {
              ifRowData,
              defaultColDef,
              onGridReadyIf,
              ifGridApi,
              addRow,
              deleteRow,
              // ifConditionColDefs,
              setIfRowData,
              variables,
              elseRowData,
              jumpToNodeOptions,
            },
            ElseComponent: Else,
            elseProps: {
              elseRowData,
              setElseRowData,
              elseConditionColDefs,
              defaultColDef,
            },
            setErrorMessages,
            setValidTabIndices,
          },
        },
      ],
      [
        defaultColDef,
        elseConditionColDefs,
        elseRowData,
        ifGridApi,
        ifRowData,
        jumpToNodeOptions,
        variables,
      ]
    );

    useImperativeHandle(ref, () => {
      return {
        getData: () => {
          return {
            ifData: getIfRowData(),
            elseData: elseRowData,
            label: nodeLabel,
          };
        },
      };
    }, [elseRowData, getIfRowData, nodeLabel]);

    useEffect(() => {
      initializeIfRows(data);
    }, [data, initializeIfRows]);

    useEffect(() => {
      initializeElseRow(data);
    }, [data, initializeElseRow]);

    useEffect(() => {
      setNodeLabel(data?.label || IF_ELSE_TYPE);
    }, [data?.label]);

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: IF_ELSE_NODE.dark,
          light: IF_ELSE_NODE.light,
          foreground: IF_ELSE_NODE.foreground,
        }}
        hasTestTab={IF_ELSE_NODE.hasTestModule}
        errorMessages={errorMessages}
        validTabIndices={validTabIndices}
        onSave={onSave}
        // onTest={() => {
        //   testModuleRef?.current.beginTest();
        // }}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default IfElse;
