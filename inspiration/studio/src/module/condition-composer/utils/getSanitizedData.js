import { cloneDeep, isEmpty } from "lodash";

function sanitizeAndProcessData(val) {
  const { childs } = val || {};

  if (!isEmpty(childs)) {
    const sanitizedData = sanitizeData(val);
    const { childs } = sanitizedData || {};

    if (!isEmpty(childs)) {
      return sanitizedData;
    }
  }
}

function sanitizeData(val) {
  const data = cloneDeep(val);
  const { childs } = data || {};

  if (!childs) {
    if (!data?.key || data?.key === "") return {};

    return data;
  }

  if (isEmpty(childs)) return {};

  const updatedChild = childs.map(sanitizeData).filter((ele) => {
    if (isEmpty(ele) || (ele?.childs && isEmpty(ele.childs))) return false;

    return true;
  });

  data.childs = updatedChild;

  return data;
}

export default sanitizeAndProcessData;
