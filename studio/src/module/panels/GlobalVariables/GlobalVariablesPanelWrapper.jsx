import React, { useState, useMemo, useCallback } from "react";
import GlobalVariablesPanelBody from "./GlobalVariablesPanelBody";
import {
  getParamsRowTemplate,
  paramsSanitizer,
  checkForDuplicates,
} from "@src/module/params-component/utils/helper";
import { paramsMode } from "@src/module/params-component/constants/paramsMode";
import { toast } from "sonner";

function paramRowToGridRow(r) {
  return {
    ...r,
    key: r.name ?? "",
    value: r.default ?? "",
    _id: r.rowid,
  };
}

function gridRowToParamRow(row, assetId, parentId, workspaceId) {
  const base = {
    rowid: row.rowid ?? row._id,
    name: (row.key ?? row.name ?? "").trim(),
    default: row.value ?? row.default ?? "",
    data_type: row.data_type ?? "STRING",
    mode: row.mode ?? paramsMode.QUERY_PARAMS,
    workspace_id: row.workspace_id ?? workspaceId,
    asset_id: row.asset_id ?? assetId,
    parent_id: row.parent_id ?? parentId,
  };
  if (!base.rowid || !base.mode) {
    const template = getParamsRowTemplate(
      assetId,
      parentId,
      workspaceId,
      paramsMode.QUERY_PARAMS
    );
    return { ...template, ...base, rowid: base.rowid || template.rowid };
  }
  return base;
}

const GlobalVariablesPanelWrapper = ({
  onSave,
  onClose,
  initialData,
  assetId,
  parentId,
  workspaceId,
}) => {
  const initialQueryParams = useMemo(() => {
    const queryParams = initialData?.QUERY_PARAMS || [];
    if (queryParams.length === 0) {
      return [
        getParamsRowTemplate(
          assetId,
          parentId,
          workspaceId,
          paramsMode.QUERY_PARAMS
        ),
      ];
    }
    return queryParams;
  }, [initialData, assetId, parentId, workspaceId]);

  const [queryParams, setQueryParams] = useState(initialQueryParams);

  const variablesForBody = useMemo(
    () => queryParams.map(paramRowToGridRow),
    [queryParams]
  );

  const handleChange = useCallback(
    (updatedGridRows) => {
      const nextParams = updatedGridRows.map((row) =>
        gridRowToParamRow(row, assetId, parentId, workspaceId)
      );
      setQueryParams(nextParams);
    },
    [assetId, parentId, workspaceId]
  );

  const handleSave = useCallback(() => {
    if (!checkForDuplicates(queryParams)) {
      toast.error("Query parameter Names must be unique. Please fix duplicates.");
      return;
    }
    const data = paramsSanitizer([], queryParams);
    onSave?.(data);
    toast.success("Data saved successfully");
    onClose?.();
  }, [queryParams, onSave, onClose]);

  return (
    <GlobalVariablesPanelBody
      variables={variablesForBody}
      onChange={handleChange}
      onSave={handleSave}
      title="Global Params"
    />
  );
};

export default GlobalVariablesPanelWrapper;
