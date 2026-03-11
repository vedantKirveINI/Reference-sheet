// import { serverConfig } from '@src/module/ods';
import { serverConfig } from "@src/module/ods";
import { encodeParameters } from "../../../../../utils/utils";
import {
  PARENT_KEY,
  PROJECT_KEY,
  QUERY_KEY,
  SHEET_BASE_KEY,
  SHEET_TABLE_KEY,
  SHEET_VIEW_KEY,
  WORKSPACE_KEY,
} from "../../../../../constants/keys";

export const getSheetURL = ({ assetDetails }) => {
  const workspaceID = assetDetails?.workspace_id;
  const projectID = assetDetails?.project_id;
  const parentID = assetDetails?.asset?.parent_id;
  const tableID = assetDetails?.meta?.sheet?.table?.id;
  const viewID = assetDetails?.meta?.sheet?.view?.id;
  const baseID = assetDetails?.meta?.sheet?.base?.id;
  return `${serverConfig.SHEET_URL}/?${QUERY_KEY}=${encodeParameters({
    [WORKSPACE_KEY]: workspaceID,
    [PROJECT_KEY]: projectID,
    [PARENT_KEY]: parentID,
    [SHEET_BASE_KEY]: baseID,
    [SHEET_TABLE_KEY]: tableID,
    [SHEET_VIEW_KEY]: viewID,
  })}`;
};

export const sanitizeFormSettingsBeforeSave = (settings) => {
  if (
    settings?.max_responses === null ||
    settings?.max_responses === undefined
  ) {
    settings.is_max_responses_enabled = false;
    settings.max_responses = null;
  }
  if (!settings?.close_at) {
    settings.is_close_at_enabled = false;
    settings.close_at = null;
  }

  return settings;
};

export const sheetMappingToFormMapping = (sheetMappings) => {
  return sheetMappings.map((mapping) => {
    return {
      name: mapping?.name,
      type: mapping?.type,
      columnType: "question",
      value: mapping?.nodeId?.[0],
      type: mapping?.type,
      id: mapping?.id,
    };
  });
};
