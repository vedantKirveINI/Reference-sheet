import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../../common-components/TabContainer";

import FIND_ALL_SHEET_RECORD_NODE_V2, { ERROR_TABS_MAPPING } from "./constant";
import SheetFilter from "../common-components/SheetFilter";
import SheetFilterPlaceholder from "../common-components/SheetFilterPlaceholder";
import SheetOrderBy from "../common-components/SheetOrderBy";
import SheetLimitOffset from "../common-components/SheetLimitOffset";
import { convertFieldIdToName } from "../utils";
import CommonTestModule from "../../common-components/CommonTestModule";
import RefineData from "./tabs/refine-data/RefineData";
import CommonTestResponseModule from "../../common-components/CommonTestResponseModule";
import useSheet from "../../common-hooks/useSheet";
import assignErrorMessages from "../../../utils/assignErrorMessages";

import isValidLimit from "../../common-utils/validLimit";
import { DEFAULT_LIMIT } from "../../constants/limit";

const FindAllRecord = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      parentId = "",
      variables,
      workspaceId = "",
      assetId = "",
      projectId = "",
      nodeData,
      onSave = () => {},
    },
    ref
  ) => {
    const testModuleRef = useRef();

    const [record, setRecord] = useState(data?.record || []);
    const [filter, setFilter] = useState(data?.filter);
    const [whereClause, setWhereClause] = useState(data?.whereClause || "");
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

    const [orderBy, setOrderBy] = useState(data?.orderBy || []);
    const [orderByClause, setOrderByClause] = useState(
      data?.orderByClause || ""
    );

    const [groupBy, setGroupBy] = useState(data?.groupBy || []);
    const [groupByClause, setGroupByClause] = useState(
      data?.groupByClause || ""
    );

    const [limit, setLimit] = useState(
      isValidLimit(data?.limit) ? data?.limit : DEFAULT_LIMIT
    );
    const [offset, setOffset] = useState(data?.offset || "");
    const [limitOffsetClause, setLimitOffsetClause] = useState(
      data?.limitOffsetClause || ""
    );

    const initialDataRef = useRef(data);

    const columnsToShow = useMemo(
      () => ["checked", "key", "type", "required"],
      []
    );

    const handleSheetChange = useCallback(() => {
      setOrderBy([]);
      setOrderByClause("");
      setGroupBy([]);
      setGroupByClause("");
      setLimit(DEFAULT_LIMIT);
      setOffset("");
      setLimitOffsetClause("");
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

    const handleOrderByChange = useCallback((orderByRowData, orderByClause) => {
      setOrderBy(orderByRowData);
      setOrderByClause(orderByClause);
    }, []);

    const handleFilterChange = useCallback((filterValue, whereClause) => {
      setFilter(filterValue);
      setWhereClause(whereClause);
    }, []);

    const handleLimitOffsetChange = useCallback(
      ({ limit, offset, limitOffsetClause }) => {
        setLimit(limit);
        setOffset(offset);
        setLimitOffsetClause(limitOffsetClause);
      },
      []
    );

    const findAllRefineTabData = useMemo(() => {
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
        // {
        //   label: "GROUP BY",
        //   panelComponent: SheetGroupBy,
        //   panelComponentProps: {
        //     schema: orderedSchemaFields,
        //     groupByRowData: groupBy,
        //     onChange: (groupByRowData, groupByClause) => {
        //       setGroupBy(groupByRowData);
        //       setGroupByClause(groupByClause);
        //     },
        //     rowSelection: "multiple",
        //     suppressRowClickSelection: true,
        //   },
        // },
        {
          label: "LIMIT & OFFSET",
          panelComponent: SheetLimitOffset,
          panelComponentProps: {
            offset,
            limit,
            updateLimitOffsetData: handleLimitOffsetChange,
          },
        },
      ];
    }, [
      filter,
      handleFilterChange,
      handleLimitOffsetChange,
      handleOrderByChange,
      isSingleUpdate,
      limit,
      offset,
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
          (initialData?.record || []).length > 0 &&
          initialData?.record.some((item) => item?.checked)
        ) {
          validTabIndices.push(1);
        }

        if (
          Object.keys(initialData?.filter || {}).length > 0 ||
          (initialData?.orderBy || []).length > 0 ||
          initialData?.limitOffsetClause
        ) {
          validTabIndices.push(2);
        }

        setValidTabIndices(validTabIndices);
      }
    }, []);

    useImperativeHandle(
      ref,
      () => {
        const requiredFields = record
          .filter((item) => item.checked)
          .map((item) => ({ id: item.field }));

        return {
          getData: () => {
            return {
              asset: sheet,
              subSheet: table,
              record,
              filter,
              whereClause,
              orderBy,
              orderByClause,
              groupBy,
              groupByClause,
              limit: limit,
              ...(offset && { offset }),
              limitOffsetClause,
              view: view,
              isSingleUpdate,
              requiredFields,
              errorMessages,
            };
          },
          getError: () => {
            return errorMessages;
          },
        };
      },
      [
        errorMessages,
        filter,
        groupBy,
        groupByClause,
        isSingleUpdate,
        limit,
        limitOffsetClause,
        offset,
        orderBy,
        orderByClause,
        record,
        sheet,
        table,
        view,
        whereClause,
      ]
    );

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
            // views: viewList,
            // selectedView: view,
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
            selectedView: view,
            onChange: onRecordFieldChanged,
            setValidTabIndices,
            setErrorMessages,
            variables,
            columnsToShow,
            loading,
            // rowSelection: "multiple",
            // suppressRowClickSelection: true,
          },
        },
        {
          label: "REFINE DATA",
          panelComponent: RefineData,
          panelComponentProps: {
            refineTabData: findAllRefineTabData,
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
            node: nodeData || FIND_ALL_SHEET_RECORD_NODE_V2,
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
      findAllRefineTabData,
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
        loading={loading}
        tabs={tabs || []}
        colorPalette={{
          dark: FIND_ALL_SHEET_RECORD_NODE_V2.dark,
          light: FIND_ALL_SHEET_RECORD_NODE_V2.light,
          foreground: FIND_ALL_SHEET_RECORD_NODE_V2.foreground,
        }}
        errorMessages={errorMessages}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
        hasTestTab={FIND_ALL_SHEET_RECORD_NODE_V2.hasTestModule}
        beforePanelUnmount={() => onSave(true)}
        showBottomBorder={true}
      />
    );
  }
);

export default FindAllRecord;
