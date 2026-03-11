import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import useSheet from "../../common-hooks/useSheet";

import DELETE_SHEET_RECORD_NODE from "./constant";
import TabContainer from "../../common-components/TabContainer";
import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import CommonTestModule from "../../common-components/CommonTestModule";

const DeleteRecord = forwardRef(
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
      onSave,
      nodeData,
    },
    ref
  ) => {
    const testModuleRef = useRef();

    const [filter, setFilter] = useState(data?.filter);
    const [whereClause, setWhereClause] = useState(data?.whereClause || "");

    const [isSingleUpdate, setIsSingleUpdate] = useState(
      !data?.isSingleUpdate?.toString ? true : data?.isSingleUpdate
    );

    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
    });
    const [validTabIndices, setValidTabIndices] = useState([]);

    const initialDataRef = useRef(data);

    const onTableChange = useCallback(async () => {
      setFilter({});
      setWhereClause("");
      setIsSingleUpdate(true);
    }, []);

    const {
      sheet,
      table,
      sheetList,
      tableList,
      view,
      fields,
      onSheetChangeHandler,
      onTableChangeHandler,
      getSheetList,
      createSheet,
      loading,
    } = useSheet({
      data,
      parentId,
      workspaceId,
      onTableChange,
    });

    const tabs = useMemo(
      () => [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            sheets: sheetList,
            subSheets: tableList,
            // views: viewList,
            sheet,
            subSheet: table,
            // selectedView: view,
            onSheetChange: onSheetChangeHandler,
            onSubSheetChange: onTableChangeHandler,
            // onViewChange: onViewChangeHandler,
            setValidTabIndices,
            setErrorMessages,
            getSheetList,
            createSheet,
          },
        },
        {
          label: "REFINE DATA",
          panelComponent: Configure,
          panelComponentProps: {
            schemaFields: fields,
            filter,
            variables,
            setFilter,
            setWhereClause,
            isSingleUpdate,
            setIsSingleUpdate,
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
            node: nodeData || DELETE_SHEET_RECORD_NODE,
            onTestComplete: () => {
              setValidTabIndices([0, 1, 2]);
            },
            // onTestComplete: (output_schema) => {
            //   setParentData((prev) => {
            //     return {
            //       ...prev,
            //       output: { schema: output_schema },
            //     };
            //   });
            // },
          },
        },
      ],
      [
        annotation,
        assetId,
        canvasRef,
        createSheet,
        data,
        fields,
        filter,
        getSheetList,
        isSingleUpdate,
        loading,
        nodeData,
        onSheetChangeHandler,
        onTableChangeHandler,
        parentId,
        projectId,
        sheet,
        sheetList,
        table,
        tableList,
        variables,
        workspaceId,
      ]
    );

    useEffect(() => {
      if (initialDataRef.current) {
        const initialData = initialDataRef.current;

        let validTabIndices = [];

        if (initialData?.asset && initialData?.subSheet && initialData?.view) {
          validTabIndices.push(0);
        }

        if (Object.keys(initialData?.filter || {}).length > 0) {
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
            subSheet: table,
            filter,
            whereClause,
            // label: nodeLabel,
            view: view,
            isSingleUpdate,
          };
        },
        getError: () => {
          return errorMessages;
        },
      };
    }, [
      sheet,
      table,
      filter,
      whereClause,
      view,
      isSingleUpdate,
      errorMessages,
    ]);

    return (
      <TabContainer
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        loading={loading}
        hasTestTab={DELETE_SHEET_RECORD_NODE.hasTestModule}
        tabs={tabs || []}
        colorPalette={{
          dark: DELETE_SHEET_RECORD_NODE.dark,
          light: DELETE_SHEET_RECORD_NODE.light,
          foreground: DELETE_SHEET_RECORD_NODE.foreground,
        }}
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

export default DeleteRecord;
