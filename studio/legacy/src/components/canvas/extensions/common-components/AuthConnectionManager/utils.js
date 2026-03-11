import { AUTH_TYPES } from "../../../utils/constants";
import { isEmpty } from "lodash";
// import { serverConfig } from "oute-ds-utils";
import { serverConfig } from "@src/module/ods";
import { componentSDKServices } from "../../../services/componentSDKServices";

export function getConfigObjectByKey(configs, key) {
  if (isEmpty(configs) || isEmpty(key)) return null;
  const config = configs.find((config) => config?.key === key);
  if (config) return config?.value;

  return null;
}

// export const getFormID = (question) => {
//   const authType = question?.authorization_type;
//   const configs = question?.configs;

//   if (authType === AUTH_TYPES.APIKEY) return serverConfig.API_KEY_AUTH_FORM_ID;

//   if (authType === AUTH_TYPES.CUSTOM)
//     return getConfigObjectByKey(configs, "form_id");

//   if (authType === AUTH_TYPES.BASIC) return serverConfig.BASIC_AUTH_FORM_ID;

//   return null;
// };

const postHookFetch = async (url, body) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to post hook: ${res?.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(`Error in post hook: ${error?.message}`);
  }
};

export const getPostHookMeta = async (question = {}, body = {}) => {
  const authType = question?.authorization_type;
  const configs = question?.configs;

  if (!authType || !configs) return Promise.resolve(null);

  const postHookUrl = getConfigObjectByKey(configs, "post_auth_url");

  if (!postHookUrl) return Promise.resolve(null);

  if (authType === AUTH_TYPES.CUSTOM) {
    return await postHookFetch(postHookUrl, body);
  }

  if (authType === AUTH_TYPES.APIKEY) {
    return await postHookFetch(postHookUrl, body);
  }

  if (authType === AUTH_TYPES.BASIC) {
    return await postHookFetch(postHookUrl, body);
  }

  return null;
};

const createNodes = (node) => {
  const allNodes = {
    [node?.id]: {
      ...node,
    },
  };
  return allNodes;
};

const createKeyValueMap = (
  project_id,
  parent_id,
  workspace_id,
  asset_id,
  value = {},
  nodeData = {},
  assetName = ""
) => {
  return {
    project_id__: project_id,
    parent_id__: parent_id,
    workspace_id__: workspace_id,
    asset_id__: asset_id,
    access_token__: window.accessToken,
    authorized_data_id__: value?._id,
    node_key__: nodeData?.key,
    asset_name__: assetName,
    node_name__: nodeData?.name,
  };
};

const getInputsData = (
  inputs,
  project_id,
  parent_id,
  workspace_id,
  asset_id,
  value = {},
  nodeData = {},
  assetName = ""
) => {
  const resultData = {};
  inputs.forEach((input) => {
    const keyValueMap = createKeyValueMap(
      project_id,
      parent_id,
      workspace_id,
      asset_id,
      value,
      nodeData,
      assetName
    );
    if (keyValueMap[input?.key]) {
      resultData[input?.key] = keyValueMap[input?.key] || input?.valueStr;
    }
  });
  return resultData;
};

export async function executeNode({
  node,
  value,
  parent_id,
  project_id,
  workspace_id,
  asset_id,
  _id,
  canvasId,
  nodeData = {},
  assetName = "",
}) {
  const allNodes = createNodes(node);

  const payload = {
    flow: {
      _id: _id,
      canvas_id: canvasId,
      project_id: project_id,
      workspace_id: workspace_id,
      asset_id: asset_id,
      flow: allNodes,
      taskGraph: [],
    },
    state: { [node?.id]: value },
    type: node?.type,
    task_id: node?.id,
    options: {
      src: {
        type: "INTEGRATION", // To inform sattu this is integration node so don't debit credits
      },
      nested_logs: false, // To inform sattu that don't show logs in execution history
    },
  };

  const res = await componentSDKServices.executeTransformedNode(payload);
  if (res?.status === "failed") {
    return null;
  }
  const inputs = getInputsData(
    node?.inputs,
    project_id,
    parent_id,
    workspace_id,
    asset_id,
    value,
    nodeData,
    assetName
  );

  return {
    ...value,
    ...(res?.result?.response || {}),
    ...(inputs || {}),
  };
}
