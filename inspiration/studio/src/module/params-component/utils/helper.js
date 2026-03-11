import _ from "lodash";
import { STRING } from "../constants/dataTypesOptions";

export const paramsSanitizer = (hiddenParams = [], queryParams = []) => {
  const sanitizedHiddenParams = hiddenParams
    ?.map((param) => {
      if (_.isEmpty(param.name) || _.isEmpty(param.default)) return null;
      return {
        ...param,
        data_type: _.isEmpty(param.data_type) ? "STRING" : param.data_type,
      };
    })
    .filter((param) => param !== null);
  const sanitizedQueryParams = queryParams
    ?.map((param) => {
      if (_.isEmpty(param.name)) return null;
      return {
        ...param,
        data_type: _.isEmpty(param.data_type) ? "STRING" : param.data_type,
      };
    })
    .filter((param) => param !== null);
  return {
    HIDDEN_PARAMS: sanitizedHiddenParams,
    QUERY_PARAMS: sanitizedQueryParams,
  };
};

export const getParamsRowTemplate = (assetId, parentId, workspaceId, mode) => {
  return {
    rowid: _.uniqueId(Date.now()),
    name: "",
    // data_type: "",
    data_type: STRING, // check data type
    mode: mode,
    workspace_id: workspaceId,
    asset_id: assetId,
    parent_id: parentId,
    default: "",
  };
};

export const validateParams = (params) => {
  return params.every((param) => {
    if (!param.name && !param.default) {
      return true;
    }
    return param.name && param.default !== undefined && param.default !== "";
  });
};

export const checkForDuplicates = (params) => {
  const names = params
    .filter((param) => param.name)
    .map((param) => param.name.trim());
  const uniqueNames = new Set(names);
  return uniqueNames.size === names.length;
};
