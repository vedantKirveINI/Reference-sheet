import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
} from "react";
import TabContainer from "../../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";
import Initialize from "./tabs/initialize/Initialize";

import useSheet from "../../common-hooks/useSheet";
import CREATE_SHEET_RECORD_NODE from "./constant";
import CommonTestModule from "../../common-components/CommonTestModule";

const CreateRecord = forwardRef(
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
    const [nodeLabel, setNodeLabel] = useState(
      data?.label || CREATE_SHEET_RECORD_NODE.name
    );
    const [validTabIndices, setValidTabIndices] = useState([0, 1, 2]);
    // const [sheets, setSheets] = useState([]);
    // const [sheet, setSheet] = useState(data?.asset || null);
    // const [subSheets, setSubSheets] = useState([]);
    // const [subSheet, setSubSheet] = useState(data?.subSheet || null);
    // const [orderedSchemaFields, setOrderedSchemaFields] = useState([]);
    // const [schemaFields, setSchemaFields] = useState([]);
    const [record, setRecord] = useState(data?.record || []);

    // const [selectedView, setSelectedView] = useState(data?.view || null);
    // const [views, setViews] = useState([]);
    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
    });

    const columnsToShow = useMemo(() => ["key", "type", "value"], []);

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
    //     return response.result;
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
      //   const fields = appendFieldKey(data?.fields);
      //   setSchemaFields(fields);
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
            view,
            subSheet: table,
            record,
            label: nodeLabel,
          }; //Create data to be returned from here
        },
      };
    }, [nodeLabel, record, sheet, table, view]);
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
            nodeLabel,
            setNodeLabel,
            sheets: sheetList,
            onSheetChange: onSheetChangeHandler,
            sheet,
            subSheets: tableList,
            onSubSheetChange: onTableChangeHandler,
            subSheet: table,
            selectedView: view,
            views: viewList,
            onViewChange: onViewChangeHandler,
            setValidTabIndices,
            setErrorMessages,
          },
        },
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            orderedSchemaFields: sortedFields,
            record,
            selectedView: view,
            onRecordFieldChanged,
            variables,
            columnsToShow,
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
            node: nodeData || CREATE_SHEET_RECORD_NODE,
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
      columnsToShow,
      data,
      nodeData,
      nodeLabel,
      onRecordFieldChanged,
      onSheetChangeHandler,
      onTableChangeHandler,
      onViewChangeHandler,
      record,
      sheet,
      sheetList,
      sortedFields,
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
        tabs={tabs || []}
        colorPalette={{
          dark: CREATE_SHEET_RECORD_NODE.dark,
          light: CREATE_SHEET_RECORD_NODE.light,
          foreground: CREATE_SHEET_RECORD_NODE.foreground,
        }}
        hasTestTab={CREATE_SHEET_RECORD_NODE.hasTestModule}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default CreateRecord;
