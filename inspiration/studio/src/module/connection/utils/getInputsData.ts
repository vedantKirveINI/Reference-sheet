type TInput = {
  key: string;
  valueStr: string;
};

const createKeyValueMap = (
  project_id?: string,
  parent_id?: string,
  workspace_id?: string,
  asset_id?: string
) => {
  return {
    project_id__: project_id,
    parent_id__: parent_id,
    workspace_id__: workspace_id,
    asset_id__: asset_id,
    access_token__: window.accessToken,
  };
};

export const getInputsData = (
  inputs: TInput[],
  project_id?: string,
  parent_id?: string,
  workspace_id?: string,
  asset_id?: string
) => {
  const resultData = {};
  inputs.forEach((input) => {
    const keyValueMap = createKeyValueMap(
      project_id,
      parent_id,
      workspace_id,
      asset_id
    );
    resultData[input.key] = keyValueMap[input.key] || input.valueStr;
  });
  return resultData;
};
