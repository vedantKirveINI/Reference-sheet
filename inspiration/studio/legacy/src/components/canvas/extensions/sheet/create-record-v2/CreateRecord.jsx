import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import TabContainer from "../../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";
import Initialize from "./tabs/initialize/Initialize";

import CREATE_SHEET_RECORD_NODE from "./constant";
import CommonTestModule from "../../common-components/CommonTestModule";
import useSheet from "../../common-hooks/useSheet";
import { convertFieldIdToName } from "../utils";

import CommonTestResponseModule from "../../common-components/CommonTestResponseModule";

const CreateRecord = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      parentId = "",
      workspaceId = "",
      assetId = "",
      projectId = "",
      variables,
      nodeData,
      onSave = () => {},
    },
    ref
  ) => {
    const testModuleRef = useRef();
    // const [nodeLabel, setNodeLabel] = useState(
    //   data?.label || CREATE_SHEET_RECORD_NODE.name
    // );

    const [validTabIndices, setValidTabIndices] = useState([]);

    const [record, setRecord] = useState(data?.record || []);
    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
    });

    const initialDataRef = useRef(data);

    const onSheetChange = useCallback(async () => {
      setRecord([]);
    }, []);
    const onSubSheetChange = useCallback(async () => {
      setRecord([]);
    }, []);

    const onViewChange = useCallback(async () => {
      setRecord([]);
    }, []);

    const {
      sheet,
      table,
      sheetList,
      tableList,
      view,
      sortedFields,
      onSheetChangeHandler,
      onTableChangeHandler,
      getSheetList,
      createSheet,
      loading,
    } = useSheet({
      data,
      parentId,
      workspaceId,
      onSheetChange,
      onTableChange: onSubSheetChange,
      onViewChange,
    });

    const onRecordFieldChanged = useCallback((recordData) => {
      setRecord(recordData);
    }, []);

    useEffect(() => {
      if (initialDataRef.current) {
        let validTabIndices = [];
        const initialData = initialDataRef.current;

        if (initialData?.asset && initialData?.subSheet && initialData?.view) {
          validTabIndices.push(0);
        }

        if ((initialData?.record || []).length > 0) {
          validTabIndices.push(1);
        }

        setValidTabIndices(validTabIndices);
      }
    }, []);

    useImperativeHandle(ref, () => {
      return {
        getData: () => {
          return {
            asset: sheet,
            view,
            subSheet: table,
            record,
            // label: nodeLabel,
          }; //Create data to be returned from here
        },
        getError: () => {
          return errorMessages;
        },
      };
    }, [errorMessages, record, sheet, table, view]);

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            // nodeLabel,
            // setNodeLabel,
            sheets: sheetList,
            onSheetChange: onSheetChangeHandler,
            sheet,
            subSheets: tableList,
            onSubSheetChange: onTableChangeHandler,
            subSheet: table,
            // selectedView: view,
            // views: viewList,
            // onViewChange: onViewChangeHandler,
            setValidTabIndices,
            setErrorMessages,
            getSheetList,
            createSheet,
          },
        },
        {
          label: "MAP COLUMNS",
          panelComponent: Configure,
          panelComponentProps: {
            orderedSchemaFields: sortedFields,
            record,
            selectedView: view,
            onRecordFieldChanged,
            variables,
            setValidTabIndices,
            loading,
          },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModule,
          panelComponentProps: {
            canvasRef,
            annotation,
            ref: testModuleRef,
            go_data: data,
            variables,
            workspaceId: workspaceId,
            parentId: parentId,
            assetId: assetId,
            projectId: projectId,
            node: nodeData || CREATE_SHEET_RECORD_NODE,
            onTestComplete: () => {
              setValidTabIndices([0, 1, 2]);
            },
            responseModule: (output) => {
              const updatedOutput = convertFieldIdToName({
                fields: sortedFields,
                output,
              });
              return <CommonTestResponseModule data={updatedOutput} />;
            },
          },
        },
      ];
    }, [
      annotation,
      assetId,
      canvasRef,
      createSheet,
      data,
      getSheetList,
      loading,
      nodeData,
      onRecordFieldChanged,
      onSheetChangeHandler,
      onTableChangeHandler,
      parentId,
      projectId,
      record,
      sheet,
      sheetList,
      sortedFields,
      table,
      tableList,
      variables,
      view,
      workspaceId,
    ]);

    return (
      <TabContainer
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        tabs={tabs || []}
        colorPalette={{
          dark: CREATE_SHEET_RECORD_NODE.dark,
          light: CREATE_SHEET_RECORD_NODE.light,
          foreground: CREATE_SHEET_RECORD_NODE.foreground,
        }}
        loading={loading}
        hasTestTab={CREATE_SHEET_RECORD_NODE.hasTestModule}
        errorMessages={errorMessages}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
        beforePanelUnmount={() => onSave(true)}
        showBottomBorder={true}
      />
    );
  }
);

export default CreateRecord;
