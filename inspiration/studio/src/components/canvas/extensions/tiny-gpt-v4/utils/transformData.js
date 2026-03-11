const extractBlocksText = (fxData, stateValues = {}) => {
  if (!fxData) return "";
  if (typeof fxData === "string") return fxData;

  const blocks = fxData.blocks || [];
  if (blocks.length === 0) return "";

  return blocks
    .map((block) => {
      if (block.type === "PRIMITIVES") {
        return block.value || "";
      }
      if (block.type === "VARIABLE" || block.type === "REF") {
        const varKey = block.value || block.key || "";
        if (stateValues[varKey] !== undefined) {
          return String(stateValues[varKey]);
        }
        return `{{${varKey}}}`;
      }
      return block.value || "";
    })
    .join("");
};

const buildOutputFormat = (format, originalOutputFormat) => {
  if (originalOutputFormat === "text" || !format || format.length === 0) {
    return { response: "string" };
  }

  const outputFormat = {};
  const fields = Array.isArray(format) ? format : [];

  fields.forEach((field) => {
    const key = field.key || field.label || "";
    if (!key.trim()) return;

    const rawType = (field.type || "string").toLowerCase();
    const typeMap = {
      string: "string",
      number: "number",
      int: "number",
      boolean: "boolean",
      object: "object",
      array: "array",
    };
    outputFormat[key] = typeMap[rawType] || "string";
  });

  if (Object.keys(outputFormat).length === 0) {
    return { response: "string" };
  }

  return outputFormat;
};

export const transformTinyGPTDataForAPI = (goData, stateValues = {}) => {
  const persona = extractBlocksText(goData.persona || goData.systemPrompt, stateValues);
  const query = extractBlocksText(goData.query || goData.prompt, stateValues);

  const originalOutputFormat =
    goData._originalOutputFormat || 
    (typeof goData.outputFormat === "string" ? goData.outputFormat : "json");

  const formatArray = goData.format || goData.outputSchema || [];
  const outputFormat = buildOutputFormat(formatArray, originalOutputFormat);

  return {
    persona,
    query,
    outputFormat,
  };
};

export default transformTinyGPTDataForAPI;
