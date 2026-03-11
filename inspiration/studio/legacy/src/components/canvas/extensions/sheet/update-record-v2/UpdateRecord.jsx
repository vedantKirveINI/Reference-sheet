import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";

import SheetFilter from "../common-components/SheetFilter";
import SheetFilterPlaceholder from "../common-components/SheetFilterPlaceholder";

import UPDATE_SHEET_RECORD_NODE from "./constant";

import TabContainer from "../../common-components/TabContainer";
import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import CommonTestModule from "../../common-components/CommonTestModule";
import useSheet from "../../common-hooks/useSheet";
import RefineData from "./tabs/refine-data/RefineData";
// import SheetOrderBy from "../common-components/SheetOrderBy";
import { convertFieldIdToName } from "../utils";
import CommonTestResponseModule from "../../common-components/CommonTestResponseModule";

const UpdateRecord = forwardRef(
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
      onSave = () => {},
      nodeData,
    },
    ref
  ) => {
    const testModuleRef = useRef();

    const [record, setRecord] = useState(data?.record || []);
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
    const [orderBy, setOrderBy] = useState(data?.orderBy || []);
    const [orderByClause, setOrderByClause] = useState(
      data?.orderByClause || ""
    );

    const initialDataRef = useRef(data);

    const onSheetChange = useCallback(async () => {
      setRecord([]);
      setOrderBy([]);
      setOrderByClause("");
    }, []);

    const onSubSheetChange = useCallback(async () => {
      setRecord([]);
      setFilter({});
      setWhereClause("");
    }, []);

    const onViewChange = useCallback(async () => {
      setRecord([]);
      setFilter({});
      setWhereClause("");
    }, []);

    // const handleOrderByChange = useCallback((orderByRowData, orderByClause) => {
    //   setOrderBy(orderByRowData);
    //   setOrderByClause(orderByClause);
    // }, []);

    const handleFilterChange = useCallback((filter, whereClause) => {
      setFilter(filter);
      setWhereClause(whereClause);
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

    const updateRecordRefineTabData = useMemo(() => {
      return [
        {
          label: "FILTER",
          panelComponent:
            sortedFields?.length > 0 ? SheetFilter : SheetFilterPlaceholder,
          panelComponentProps: {
            schema: sortedFields,
            filter,
            onChange: handleFilterChange,
            showFilterSwitch: true,
            variables,
            isSingleUpdate,
            setIsSingleUpdate,
          },
        },
        // remove sort from refine data tab, because it is redundant for update record
        // {
        //   label: "SORT BY",
        //   panelComponent: SheetOrderBy,
        //   panelComponentProps: {
        //     schema: sortedFields,
        //     orderByRowData: orderBy,
        //     onChange: handleOrderByChange,
        //   },
        // },
      ];
    }, [sortedFields, filter, handleFilterChange, variables, isSingleUpdate]);

    const tabs = useMemo(() => {
      return [
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
          label: "SELECT COLUMNS",
          panelComponent: Configure,
          panelComponentProps: {
            fields: sortedFields,
            record,
            view: view,
            onChange: onRecordFieldChanged,
            variables,
            enableCheckbox: true,
            setValidTabIndices,
            loading,
          },
        },
        {
          label: "REFINE DATA",
          panelComponent: RefineData,
          panelComponentProps: {
            refineTabData: updateRecordRefineTabData,
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
            node: nodeData || UPDATE_SHEET_RECORD_NODE,
            onTestComplete: () => {
              setValidTabIndices([0, 1, 2, 3]);
            },
            // onTestComplete: (output_schema) => {
            //   setParentData((prev) => {
            //     return {
            //       ...prev,
            //       output: { schema: output_schema },
            //     };
            //   });
            // },
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
      updateRecordRefineTabData,
      variables,
      view,
      workspaceId,
    ]);

    useEffect(() => {
      if (initialDataRef.current) {
        const initialData = initialDataRef.current;

        let validTabIndices = [];

        if (initialData?.asset && initialData?.subSheet && initialData?.view) {
          validTabIndices.push(0);
        }

        if ((initialData?.record || []).length > 0) {
          validTabIndices.push(1);
        }

        if (
          Object.keys(initialData?.filter || {}).length > 0 ||
          (initialData?.orderBy || []).length > 0
        ) {
          validTabIndices.push(2);
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
            record,
            // label: nodeLabel,
            filter,
            whereClause,
            view: view,
            isSingleUpdate,
            orderBy,
            orderByClause,
          }; //Update data to be returned from here
        },
        getError: () => {
          return errorMessages;
        },
      };
    }, [
      sheet,
      table,
      record,
      filter,
      whereClause,
      view,
      isSingleUpdate,
      orderBy,
      orderByClause,
      errorMessages,
    ]);

    return (
      <TabContainer
        tabs={tabs || []}
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        loading={loading}
        colorPalette={{
          dark: UPDATE_SHEET_RECORD_NODE.dark,
          light: UPDATE_SHEET_RECORD_NODE.light,
          foreground: UPDATE_SHEET_RECORD_NODE.foreground,
        }}
        hasTestTab={UPDATE_SHEET_RECORD_NODE.hasTestModule}
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

export default UpdateRecord;
