import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import useSheet from "../../common-hooks/useSheet";
import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../../common-components/TabContainer";
import SheetRecord from "../common-components/SheetRecord";
import FIND_ALL_SHEET_RECORD_NODE from "./constant";
import SheetFilter from "../common-components/SheetFilter";

import { FIND_ALL_SHEET_RECORD_TYPE } from "../../constants/types";
import SheetFilterPlaceholder from "../common-components/SheetFilterPlaceholder";
import SheetOrderBy from "../common-components/SheetOrderBy";
import SheetGroupBy from "../common-components/SheetGroupBy";
import SheetLimitOffset from "../common-components/SheetLimitOffset";
import CommonTestModule from "../../common-components/CommonTestModule";

const FindAllRecord = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      parentId = "",
      variables,
      workspaceId = "",
      onSave = () => {},
      nodeData,
    },
    ref
  ) => {
    const testModuleRef = useRef();
    // const [nodeLabel, setNodeLabel] = useState(
    //   data?.label || FIND_ALL_RECORD_NODE.name
    // );
    // const [sheets, setSheets] = useState([]);
    // const [sheet, setSheet] = useState(data?.asset || null);
    // const [subSheets, setSubSheets] = useState([]);
    // const [subSheet, setSubSheet] = useState(data?.subSheet || null);
    // const [schemaFields, setSchemaFields] = useState([]);
    // const [orderedSchemaFields, setOrderedSchemaFields] = useState([]);
    const [record, setRecord] = useState(data?.record || []);
    const [filter, setFilter] = useState(data?.filter);
    const [whereClause, setWhereClause] = useState(data?.whereClause || "");
    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
    });

    // const [selectedView, setSelectedView] = useState(data?.view || null);
    // const [views, setViews] = useState([]);

    const [orderBy, setOrderBy] = useState(data?.orderBy || []);
    const [orderByClause, setOrderByClause] = useState(
      data?.orderByClause || ""
    );

    const [groupBy, setGroupBy] = useState(data?.groupBy || []);
    const [groupByClause, setGroupByClause] = useState(
      data?.groupByClause || ""
    );

    const [limit, setLimit] = useState(data?.limit || "");
    const [offset, setOffset] = useState(data?.offset || "");
    const [limitOffsetClause, setLimitOffsetClause] = useState(
      data?.limitOffsetClause || ""
    );

    const columnsToShow = useMemo(
      () => ["checked", "key", "type", "required"],
      []
    );

    // const getSheets = async (parentId, workspaceId) => {
    //   const response = await assetSDKServices.getSheets({
    //     ...(workspaceId && { workspace_id: workspaceId }),
    //     ...(parentId && { parent_id: parentId }),
    //   });
    //   if (response?.status === "success") {
    //     setSheets(response?.result || []);
    //   }
    // };
    // const getSubSheets = async (asset_id) => {
    //   const response = await sheetSDKServices.getSubSheetsByAssetId(asset_id);
    //   if (response?.status === "success") {
    //     setSubSheets(response?.result || []);
    //   }
    // };
    // const getSchemaFields = useCallback(async (tableId, baseId) => {
    //   const query = {
    //     tableId,
    //     baseId,
    //     is_field_required: true,
    //     is_view_required: true,
    //   };

    //   const response = await sheetSDKServices.getSubSheetById(query);
    //   if (response?.status === "success") {
    //     return response?.result;
    //   }
    // }, []);

    const onSheetChange = useCallback(async () => {
      // setSubSheets([]);
      // setSubSheet(null);
      // setSchemaFields([]);
      // setOrderedSchemaFields([]);
      setRecord([]);
      // setViews([]);
      // setSelectedView(null);

      // if (sheet) {
      //   getSubSheets(sheet?._id);
      //   setSheet({ ...sheet, id: sheet?._id });
      // } else {
      //   setSheet(null);
      // }
    }, []);
    const onSubSheetChange = useCallback(async () => {
      // setSchemaFields([]);
      // setOrderedSchemaFields([]);
      setRecord([]);
      // setViews([]);
      // setSelectedView(null);

      // if (subSheet) {
      //   const data = await getSchemaFields(subSheet.id, sheet?.id);
      //   const fields = data?.fields || [];
      //   setSchemaFields(appendFieldKey(fields));
      //   setViews(data?.views || []);
      //   setSubSheet({ ...subSheet });
      // } else {
      //   setSubSheet(null);
      // }
    }, []);

    const onViewChange = useCallback(async () => {
      setRecord([]);
      // if (view) {
      //   const orderedSchemaFields = sortSchemaFields(
      //     schemaFields,
      //     JSON.parse(view?.columnMeta)
      //   );
      //   setOrderedSchemaFields(orderedSchemaFields);
      //   setSelectedView(view);
      // } else {
      //   setOrderedSchemaFields([]);
      //   setSelectedView(null);
      // }
    }, []);

    const {
      sheet,
      table,
      viewList,
      sheetList,
      tableList,
      view,
      sortedFields,
      onSheetChangeHandler,
      onTableChangeHandler,
      onViewChangeHandler,
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

    const findAllRecordTabData = useMemo(() => {
      return [
        {
          label: "Data",
          panelComponent: SheetRecord,
          panelComponentProps: {
            fields: sortedFields,
            record,
            view: view,
            onChange: onRecordFieldChanged,
            variables,
            columnsToShow,
            rowSelection: "multiple",
            suppressRowClickSelection: true,
            type: FIND_ALL_SHEET_RECORD_TYPE,
          },
        },
        {
          label: "Filter",
          panelComponent:
            sortedFields?.length > 0 ? SheetFilter : SheetFilterPlaceholder,
          panelComponentProps: {
            schema: sortedFields,
            filter,
            onChange: (filterValue, whereClause) => {
              setFilter(filterValue);
              setWhereClause(whereClause);
            },
            variables,
          },
        },
        {
          label: "Sort By",
          panelComponent: SheetOrderBy,
          panelComponentProps: {
            schema: sortedFields,
            orderByRowData: orderBy,
            onChange: (orderByRowData, orderByClause) => {
              setOrderBy(orderByRowData);
              setOrderByClause(orderByClause);
            },
            rowSelection: "multiple",
            suppressRowClickSelection: true,
          },
        },
        {
          label: "Group By",
          panelComponent: SheetGroupBy,
          panelComponentProps: {
            schema: sortedFields,
            groupByRowData: groupBy,
            onChange: (groupByRowData, groupByClause) => {
              setGroupBy(groupByRowData);
              setGroupByClause(groupByClause);
            },
            rowSelection: "multiple",
            suppressRowClickSelection: true,
          },
        },
        {
          label: "Limit & Offset",
          panelComponent: SheetLimitOffset,
          panelComponentProps: {
            offset,
            limit,
            updateLimitOffsetData: ({ limit, offset, limitOffsetClause }) => {
              setOffset(offset);
              setLimit(limit);
              setLimitOffsetClause(limitOffsetClause);
            },
          },
        },
      ];
    }, [
      columnsToShow,
      record,
      filter,
      groupBy,
      limit,
      offset,
      onRecordFieldChanged,
      orderBy,
      sortedFields,
      view,
      variables,
    ]);

    // const initializeSchemaFieldsAndView = useCallback(async () => {
    //   const schemaFieldsData = await getSchemaFields(
    //     data?.subSheet?.id,
    //     data?.asset?.id
    //   );
    //   const fields = appendFieldKey(schemaFieldsData?.fields);
    //   setSchemaFields(fields);
    //   setViews(schemaFieldsData?.views || []);

    //   if (data?.view) {
    //     const updatedView = schemaFieldsData?.views.find(
    //       (view) => view?.id === data?.view?.id
    //     );
    //     const orderedSchemaFields = sortSchemaFields(
    //       fields,
    //       JSON.parse(updatedView?.columnMeta)
    //     );
    //     setOrderedSchemaFields(orderedSchemaFields);
    //     setSelectedView(updatedView);
    //   }
    // }, [data?.asset?.id, data?.subSheet?.id, data?.view, getSchemaFields]);

    useImperativeHandle(ref, () => {
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
            ...(limit && { limit }),
            ...(offset && { offset }),
            limitOffsetClause,
            view: view,
          };
        },
      };
    }, [
      filter,
      groupBy,
      groupByClause,
      limit,
      limitOffsetClause,
      offset,
      orderBy,
      orderByClause,
      record,
      view,
      sheet,
      table,
      whereClause,
    ]);

    // useEffect(() => {
    //   if (parentId || workspaceId) {
    //     getSheets(parentId, workspaceId);
    //   }
    // }, [parentId, workspaceId]);

    // useEffect(() => {
    //   if (data?.asset) {
    //     getSubSheets(data?.asset?.id);
    //   }
    // }, [data?.asset]);

    // useEffect(() => {
    //   if (data?.subSheet) {
    //     initializeSchemaFieldsAndView();
    //   }
    // }, [data?.subSheet, initializeSchemaFieldsAndView]);
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
            views: viewList,
            selectedView: view,
            onViewChange: onViewChangeHandler,
            setValidTabIndices,
            setErrorMessages,
          },
        },
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            configureTabData: findAllRecordTabData,
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
            node: nodeData || FIND_ALL_SHEET_RECORD_NODE,
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
      ];
    }, [
      data,
      findAllRecordTabData,
      nodeData,
      onSheetChangeHandler,
      onTableChangeHandler,
      onViewChangeHandler,
      sheet,
      sheetList,
      table,
      tableList,
      variables,
      view,
      viewList,
    ]);

    return (
      <TabContainer
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        hasTestTab={FIND_ALL_SHEET_RECORD_NODE.hasTestModule}
        tabs={tabs || []}
        colorPalette={{
          dark: FIND_ALL_SHEET_RECORD_NODE.dark,
          light: FIND_ALL_SHEET_RECORD_NODE.light,
          foreground: FIND_ALL_SHEET_RECORD_NODE.foreground,
        }}
        errorMessages={errorMessages}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default FindAllRecord;
