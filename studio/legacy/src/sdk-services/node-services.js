export const nodeServices = {
  getNodeData: async (key) => {
    return await new Promise((resolve, reject) => {
      if (!!localStorage.getItem(key)) {
        return resolve(JSON.parse(localStorage.getItem(key)));
      }
      resolve();
    });
  },
  saveNodeData: async (key, data) => {
    return await new Promise((resolve, reject) => {
      localStorage.setItem(key, JSON.stringify(data));
      resolve({
        status: "success",
        result: "Node updated successfully.",
      });
    });
  },
  fetchModelForAsset: async (workspaceId, parentId, assetId) => {
    return await new Promise((resolve, reject) => {
      if (!!localStorage.getItem(assetId)) {
        return resolve(localStorage.getItem(assetId));
      }
      resolve();
    });
  },
  saveModelForAsset: async (asset_id, model) => {
    return await new Promise((resolve, reject) => {
      localStorage.setItem(asset_id, model);
      resolve({
        status: "success",
        result: "Model saved successfully.",
      });
    });
  },
  unlink: async (fromkey, toKey) => {
    return await new Promise((resolve, reject) => {
      resolve({
        status: "success",
        result: "Unlink successful",
      });
    });
  },
};
