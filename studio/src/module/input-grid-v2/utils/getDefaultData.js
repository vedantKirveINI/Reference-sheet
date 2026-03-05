export const getDefaultRowData = ({ isValueMode = false }) => {
  return {
    id: `${Date.now()}`,
    type: "String",
    isMap: false,
    isValueMode,
  };
};

export const getDefaultData = ({ isValueMode = false }) => {
  const configValue = getDefaultRowData({ isValueMode });
  const configKey = isValueMode ? "value" : "schema";
  return [
    {
      id: `_${Date.now()}`,
      type: "Object",
      isValueMode,
      [configKey]: [configValue],
    },
  ];
};
