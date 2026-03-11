import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import SheetRecord from "../common-components/SheetRecord";
import SheetFilter from "../common-components/SheetFilter";
import SheetFilterPlaceholder from "../common-components/SheetFilterPlaceholder";

import UPDATE_SHEET_RECORD_NODE from "./constant";
import { UPDATE_SHEET_RECORD_TYPE } from "../../constants/types";

import TabContainer from "../../common-components/TabContainer";
import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import CommonTestModule from "../../common-components/CommonTestModule";
import useSheet from "../../common-hooks/useSheet";

const UpdateRecord = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      parentId = "",
      workspaceId = "",
      variables,
      onSave = () => {},
      nodeData,
    },
    ref
  ) => {
    const testModuleRef = useRef();
    // const [nodeLabel, setNodeLabel] = useState(
    //   data?.label || UPDATE_SHEET_RECORD_NODE.name
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

    // const [selectedView, setSelectedView] = useState(data?.view || null);
    // const [views, setViews] = useState([]);

    const [isSingleUpdate, setIsSingleUpdate] = useState(
      !data?.isSingleUpdate?.toString ? true : data?.isSingleUpdate
    );

    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
    });
    const [validTabIndices, setValidTabIndices] = useState([0]);

    const columnsToShow = useMemo(
      () => ["checked", "key", "type", "required", "value"],
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
      setFilter({});
      setWhereClause("");
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
      setFilter({});
      setWhereClause("");
      //     if (view) {
      //       const orderedSchemaFields = sortSchemaFields(
      //         schemaFields,
      //         JSON.parse(view?.columnMeta)
      //       );
      //       setOrderedSchemaFields(orderedSchemaFields);
      //       setSelectedView(view);
      //     } else {
      //       setOrderedSchemaFields([]);
      //       setSelectedView(null);
      //     }
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

    const updateRecordTabData = useMemo(() => {
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
            type: UPDATE_SHEET_RECORD_TYPE,
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
            isSingleUpdate,
            setIsSingleUpdate,
          },
        },
      ];
    }, [
      sortedFields,
      record,
      view,
      onRecordFieldChanged,
      variables,
      columnsToShow,
      filter,
      isSingleUpdate,
    ]);

    // const
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

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            sheets: sheetList,
            subSheets: tableList,
            views: viewList,
            sheet,
            subSheet: table,
            selectedView: view,
            onSheetChange: onSheetChangeHandler,
            onSubSheetChange: onTableChangeHandler,
            onViewChange: onViewChangeHandler,
            setValidTabIndices,
            setErrorMessages,
          },
        },
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            configureTabData: updateRecordTabData,
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
            node: nodeData || UPDATE_SHEET_RECORD_NODE,
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
      nodeData,
      onSheetChangeHandler,
      onTableChangeHandler,
      onViewChangeHandler,
      sheet,
      sheetList,
      table,
      tableList,
      updateRecordTabData,
      variables,
      view,
      viewList,
    ]);

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
          }; //Update data to be returned from here
        },
      };
    }, [filter, isSingleUpdate, record, view, sheet, table, whereClause]);

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

    return (
      <TabContainer
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        hasTestTab={UPDATE_SHEET_RECORD_NODE.hasTestModule}
        tabs={tabs || []}
        colorPalette={{
          dark: UPDATE_SHEET_RECORD_NODE.dark,
          light: UPDATE_SHEET_RECORD_NODE.light,
          foreground: UPDATE_SHEET_RECORD_NODE.foreground,
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

export default UpdateRecord;
