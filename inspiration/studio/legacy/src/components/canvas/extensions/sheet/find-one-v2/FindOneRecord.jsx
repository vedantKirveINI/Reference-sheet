import React, {
  forwardRef,
  useImperativeHandle,
  // useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import TabContainer from "../../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";
import Initialize from "./tabs/initialize/Initialize";
import SheetFilter from "../common-components/SheetFilter";

import FIND_ONE_SHEET_RECORD_NODE_V2, { ERROR_TABS_MAPPING } from "./constant";
import SheetFilterPlaceholder from "../common-components/SheetFilterPlaceholder";
import { convertFieldIdToName } from "../utils";
import CommonTestModule from "../../common-components/CommonTestModule";
import SheetOrderBy from "../common-components/SheetOrderBy";
import RefineData from "./tabs/refine-data/RefineData";
import CommonTestResponseModule from "../../common-components/CommonTestResponseModule";

import useSheet from "../../common-hooks/useSheet";
import assignErrorMessages from "../../../utils/assignErrorMessages";

const FindOneRecord = forwardRef(
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
    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [errorMessages, setErrorMessages] = useState(() => {
      return assignErrorMessages({
        errors: nodeData?.errors,
        errorTabsMapping: ERROR_TABS_MAPPING,
      });
    });

    const [isSingleUpdate, setIsSingleUpdate] = useState(
      !data?.isSingleUpdate?.toString ? true : data?.isSingleUpdate
    );

    const [record, setRecord] = useState(data?.record || []);
    const [filter, setFilter] = useState(data?.filter);
    const [whereClause, setWhereClause] = useState(data?.whereClause || "");

    const [orderBy, setOrderBy] = useState(data?.orderBy || []);
    const [orderByClause, setOrderByClause] = useState(
      data?.orderByClause || ""
    );

    const initialDataRef = useRef(data);

    const columnsToShow = useMemo(
      () => ["checked", "key", "type", "required"],
      []
    );

    const handleSheetChange = useCallback(async () => {
      setOrderBy([]);
      setOrderByClause("");
      setRecord([]);
    }, []);

    const handleTableChange = useCallback(() => {
      setRecord([]);
      setFilter({});
      setWhereClause("");
    }, []);

    const onRecordFieldChanged = useCallback((recordData) => {
      setRecord(recordData);
    }, []);

    const handleViewChange = useCallback(() => {
      setRecord([]);
      setFilter({});
      setWhereClause("");
    }, []);

    const handleOrderByChange = useCallback((orderByRowData, orderByClause) => {
      setOrderBy(orderByRowData);
      setOrderByClause(orderByClause);
    }, []);

    const handleFilterChange = useCallback((filterValue, whereClause) => {
      setFilter(filterValue);
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
      onSheetChange: handleSheetChange,
      onTableChange: handleTableChange,
      onViewChange: handleViewChange,
    });

    const findOneRefineTabData = useMemo(() => {
      return [
        {
          label: "FILTER",
          panelComponent:
            sortedFields?.length > 0 ? SheetFilter : SheetFilterPlaceholder,
          panelComponentProps: {
            schema: sortedFields,
            filter,
            onChange: handleFilterChange,
            variables,
            isSingleUpdate,
            setIsSingleUpdate,
          },
        },
        {
          label: "SORT BY",
          panelComponent: SheetOrderBy,
          panelComponentProps: {
            schema: sortedFields,
            orderByRowData: orderBy,
            onChange: handleOrderByChange,
            rowSelection: "multiple",
            suppressRowClickSelection: true,
          },
        },
      ];
    }, [
      filter,
      handleFilterChange,
      handleOrderByChange,
      isSingleUpdate,
      orderBy,
      sortedFields,
      variables,
    ]);

    useEffect(() => {
      if (initialDataRef.current) {
        const initialData = initialDataRef.current;
        let validTabIndices = [];

        if (initialData?.asset && initialData?.subSheet && initialData?.view) {
          validTabIndices.push(0);
        }
        if (
          initialData?.record?.length > 0 &&
          initialData?.record.some((item) => item?.checked)
        ) {
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
      const requiredFields = record
        ?.filter((item) => item?.checked)
        .map((item) => ({ id: item?.field }));

      return {
        getData: () => {
          return {
            asset: sheet,
            view: view,
            subSheet: table,
            record,
            filter,
            orderBy,
            orderByClause,
            whereClause,
            isSingleUpdate,
            requiredFields,
          };
        },
        getError: () => {
          return errorMessages;
        },
      };
    }, [
      errorMessages,
      filter,
      isSingleUpdate,
      orderBy,
      orderByClause,
      record,
      sheet,
      table,
      view,
      whereClause,
    ]);

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
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
            createSheet,
            getSheetList,
          },
        },
        {
          label: "SELECT COLUMNS",
          panelComponent: Configure,
          panelComponentProps: {
            fields: sortedFields,
            record,
            selectedView: view,
            onChange: onRecordFieldChanged,
            variables,
            columnsToShow,
            setValidTabIndices,
            setErrorMessages,
            loading,
            // rowSelection: "multiple",
            // suppressRowClickSelection: true,
          },
        },
        {
          label: "REFINE DATA",
          panelComponent: RefineData,
          panelComponentProps: {
            refineTabData: findOneRefineTabData,
            setValidTabIndices,
          },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModule,
          panelComponentProps: {
            canvasRef,
            annotation,
            go_data: data,
            ref: testModuleRef,
            variables,
            workspaceId: workspaceId,
            parentId: parentId,
            assetId: assetId,
            projectId: projectId,
            node: nodeData || FIND_ONE_SHEET_RECORD_NODE_V2,
            allowShowSchema: false,
            onTestComplete: () => {
              setValidTabIndices([0, 1, 2, 3]);
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
      columnsToShow,
      createSheet,
      data,
      findOneRefineTabData,
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
        tabs={tabs || []}
        colorPalette={{
          dark: FIND_ONE_SHEET_RECORD_NODE_V2.dark,
          light: FIND_ONE_SHEET_RECORD_NODE_V2.light,
          foreground: FIND_ONE_SHEET_RECORD_NODE_V2.foreground,
        }}
        errorMessages={errorMessages}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        loading={loading}
        validateTabs={true}
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        hasTestTab={FIND_ONE_SHEET_RECORD_NODE_V2.hasTestModule}
        beforePanelUnmount={() => onSave(true)}
        showBottomBorder={true}
      />
    );
  }
);

export default FindOneRecord;
