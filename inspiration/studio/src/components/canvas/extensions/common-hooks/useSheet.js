import { useCallback, useEffect, useState } from "react";
import assetSDKServices from "../../services/assetSDKServices";
import sheetSDKServices from "../../services/sheetSDKServices";
import { appendFieldKey, sortSchemaFields } from "../sheet/utils";
// import { serverConfig, base64Encode } from "oute-ds-utils";
import { serverConfig, base64Encode } from "@src/module/ods";

const QUERY_PARAM_KEY = "q";
const WORKSPACE_ID_KEY = "w";
// const PARENT_ID_KEY = "pa";

const openAsset = (url, asset) => {
  window.open(
    `${url}?${QUERY_PARAM_KEY}=${base64Encode(JSON.stringify(asset))}`
  );
};

const useSheet = ({
  data,
  // parentId = "",
  workspaceId = "",
  isViewRequired = true,
  onSheetChange,
  onTableChange,
  onViewChange,
  isFieldRequired = false,
}) => {
  const [sheet, setSheet] = useState(data?.asset || null);
  const [sheetList, setSheetList] = useState([]);
  const [table, setTable] = useState(data?.subSheet || null);
  const [tableList, setTableList] = useState([]);
  const [view, setView] = useState(data?.view || null);
  const [viewList, setViewList] = useState([]);
  const [fields, setFields] = useState([]);
  const [sortedFields, setSortedFields] = useState([]);

  const [tableLoading, setTableLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [sheetLoading, setSheetLoading] = useState(false);

  const [eventType, setEventType] = useState(data?.eventType || []);

  // to get view list
  const getViewList = useCallback(async (baseId, tableId) => {
    const payload = {
      baseId: baseId,
      tableId,
      is_field_required: true,
      is_view_required: true,
    };

    try {
      setViewLoading(true);
      const response = await sheetSDKServices.getSubSheetById(payload);
      if (response?.status === "success") {
        return response?.result;
      }
    } finally {
      setViewLoading(false);
    }
  }, []);


  const onViewChangeHandler = useCallback(
    ({ viewValue, updatedFields }) => {
      if (onViewChange) {
        onViewChange(viewValue);
      }

      if (viewValue) {
        const orderedFields = sortSchemaFields(
          updatedFields,
          JSON.parse(viewValue?.columnMeta)
        );
        setSortedFields(orderedFields);
        setView(viewValue);
      } else {
        setView(null);
        setSortedFields([]);
      }
    },
    [onViewChange]
  );

  const onTableChangeHandler = useCallback(
    async (_, tableValue, assetId = null) => {
      setView(null);
      setViewList([]);
      setFields([]);
      setSortedFields([]);

      if (onTableChange) {
        onTableChange(tableValue);
      }

      if (tableValue) {
        setTable(tableValue);

        if (isViewRequired) {
          const data = await getViewList(assetId, tableValue?.id);

          const fields = appendFieldKey(data?.fields);
          // setViewList(data?.views || []);
          onViewChangeHandler({
            viewValue: data?.views?.[0],
            updatedFields: fields,
          });

          setFields(fields);
        }
      } else {
        setTable(null);
      }
    },
    [getViewList, isViewRequired, onTableChange, onViewChangeHandler]
  );

  // to get sheet list
  const getSheetList = useCallback(async () => {
    try {
      setSheetLoading(true);
      const response = await assetSDKServices.getSheets({
        ...(workspaceId && { workspace_id: workspaceId }),
        // commented parentid because we want to fetch all sheets present in user workspace
        // ...(parentId && { parent_id: parentId }),
        sort_by: "created_at",
        sort_type: "desc",
      });

      if (response?.status === "success") {
        setSheetList(response?.result || []);
      }
    } finally {
      setSheetLoading(false);
    }
  }, [workspaceId]);

  //to get table list
  const getTableList = useCallback(
    async (asset_id, shouldAutoSelectTable = true) => {
      try {
        setTableLoading(true);

        const response = await sheetSDKServices.getSubSheetsByAssetId({
          baseId: asset_id,
          is_field_required: isFieldRequired,
          orderByField: "createdTime",
          orderByDirection: "desc",
        });

        if (response?.status === "success") {
          setTableList(response?.result || []);

          if (shouldAutoSelectTable && response?.result.length === 1) {
            onTableChangeHandler(null, response?.result?.[0], asset_id);
          }
        }
      } finally {
        setTableLoading(false);
      }
    },
    [isFieldRequired, onTableChangeHandler]
  );



  const createSheet = useCallback(() => {
    openAsset(serverConfig.SHEET_URL, {
      [WORKSPACE_ID_KEY]: workspaceId,
      // [PARENT_ID_KEY]: parentId,
    });
  }, [workspaceId]);

  const onSheetChangeHandler = useCallback(
    (_, sheetValue) => {
      setTable(null);
      setTableList([]);
      setView(null);
      setViewList([]);
      setFields([]);
      setSortedFields([]);

      if (onSheetChange) {
        onSheetChange(sheetValue);
      }

      if (sheetValue) {
        setSheet({ ...sheetValue, id: sheetValue?._id });
        getTableList(sheetValue?._id);
      } else {
        setSheet(null);
      }
    },
    [getTableList, onSheetChange]
  );

  const onEventTypeChangeHandler = useCallback((_, eventTypeValue) => {
    setEventType(eventTypeValue);
  }, []);

  const initializeFieldsAndView = useCallback(async () => {
    const viewsData = await getViewList(data?.asset?.id, data?.subSheet?.id);
    setViewList(viewsData?.views || []);

    const updatedFields = appendFieldKey(viewsData?.fields);
    setFields(updatedFields);

    if (data?.view?.id) {
      const updatedView = viewsData?.views.find(
        (view) => view?.id === data?.view?.id
      );

      const sortedFields = sortSchemaFields(
        updatedFields,
        JSON.parse(updatedView?.columnMeta)
      );

      setSortedFields(sortedFields);
      setView(updatedView);
    }
  }, [data?.asset?.id, data?.subSheet?.id, data?.view?.id, getViewList]);

  useEffect(() => {
    if (workspaceId) {
      getSheetList();
    }
  }, [getSheetList, workspaceId]);

  useEffect(() => {
    if (data?.asset?.id) {
      getTableList(data?.asset?.id, false);
    }
  }, [data?.asset?.id, getTableList]);

  useEffect(() => {
    if (data?.subSheet?.id && isViewRequired) {
      initializeFieldsAndView();
    }
  }, [data?.subSheet?.id, initializeFieldsAndView, isViewRequired]);

  return {
    sheet,
    table,
    eventType,
    viewList,
    sheetList,
    tableList,
    view,
    fields,
    sortedFields,
    onSheetChangeHandler,
    onTableChangeHandler,
    onEventTypeChangeHandler,
    onViewChangeHandler,
    getSheetList,
    createSheet,
    loading: sheetLoading || tableLoading || viewLoading,
    sheetLoading,
    tableLoading,
    viewLoading,
  };
};

export default useSheet;
