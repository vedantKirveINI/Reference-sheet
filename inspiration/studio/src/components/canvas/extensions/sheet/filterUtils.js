export const getFilterSummary = (filter) => {
  if (!filter?.childs?.length) {
    return null;
  }

  const formatCondition = (node) => {
    if (node.childs && node.childs.length > 0) {
      const parts = node.childs
        .map((child) => formatCondition(child))
        .filter(Boolean);
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0];
      const connector = node.condition === "or" ? " OR " : " AND ";
      return parts.length > 1 ? `(${parts.join(connector)})` : parts[0];
    }

    if (!node.key || !node.operator) return "";

    const field = node.label || node.key;
    const op = node.operator?.value || node.operator?.key || "";
    let value = "";

    if (node.value) {
      if (typeof node.value === "string") {
        value = node.value;
      } else if (node.value?.blocks?.length > 0) {
        value = node.value.blocks.map((b) => b.value || b.text || "").join("");
      }
    }
    value = value || node.valueStr || "";

    if (["is empty", "is not empty"].includes(op)) {
      return `${field} ${op}`;
    }

    return value ? `${field} ${op} ${value}` : `${field} ${op}`;
  };

  return formatCondition(filter);
};
