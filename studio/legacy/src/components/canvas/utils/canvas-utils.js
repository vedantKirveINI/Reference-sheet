export const generateKey = (prefix = "") => {
  return `${prefix ? prefix + "_" : ""}${Date.now()}`;
};

export const updateIfElseNodeLinks = (ifElseRowData) => {
  const linksToBeUpdated = ifElseRowData.ifData
    .concat(ifElseRowData.elseData)
    .map((rowData) => ({
      label: rowData?.conditionStr || "",
      to: rowData?.jumpTo?.key,
      key: rowData?.key,
    }));

  return linksToBeUpdated;
};

const generateId = () => {
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString();
};

const getType = (value) => {
  if (Array.isArray(value)) {
    return "array";
  } else if (typeof value === "string") {
    return "string";
  } else if (typeof value === "number") {
    return "int";
  } else if (typeof value === "boolean") {
    return "boolean";
  } else if (value && typeof value === "object") {
    return "object";
  } else {
    return "UNKNOWN";
  }
};

const transformValue = (value) => {
  if (value?.value?.type === "fx") {
    return value;
  }
  let type = getType(value);
  let result = {
    id: generateId(),
    type: type,
  };
  if (type === "array") {
    result.config = value.map((item) => transformValue(item));
  } else if (type === "object") {
    result.config = Object.entries(value).map(([key, val]) => {
      let transformed = transformValue(val);
      transformed.key = key;
      return transformed;
    });
  } else {
    result.valueStr = value?.toString() || "";
    result.value = {
      type: "fx",
      blocks: [
        {
          type: "PRIMITIVES",
          value: value?.toString() || "",
        },
      ],
    };
  }

  return result;
};

export const convertJsonToGridSchema = (json) => {
  if (Array.isArray(json) || typeof json !== "object") {
    console.error("invalid json schema");
    return;
  }
  return Object.entries(json).map(([key, value]) => {
    let transformed = transformValue(value);
    transformed.key = key;
    return transformed;
  });
};

const getGridSchemaValue = (field) => ({
  key: field.key,
  id: field.id,
  type: field.type,
  valueStr: field.valueStr,
  value: field.value,
});

export const convertGridSchemaToJson = (schema) => {
  if (!schema) {
    return;
  }
  const output = {};
  schema.forEach((item) => {
    if (item.type === "object" && Array.isArray(item.config)) {
      output[item.key] = item.config.reduce((obj, field) => {
        obj[field.key] = getGridSchemaValue(field);
        return obj;
      }, {});
    } else if (item.type === "array" && Array.isArray(item.config)) {
      output[item.key] = item.config.map((c) => {
        if (c.type === "string") {
          return getGridSchemaValue(c);
        } else if (c.type === "object") {
          return c.config.reduce((obj, field) => {
            obj[field.key] = getGridSchemaValue(field);
            return obj;
          }, {});
        }
      });
    } else {
      output[item.key] = getGridSchemaValue(item);
    }
  });
  return output;
};

export const compareJSONWithTrackingAndTypeCheck = (target, source) => {
  const isObject = (obj) =>
    obj && typeof obj === "object" && !Array.isArray(obj);
  const isArray = (obj) => Array.isArray(obj);
  const newKeys = [];
  const changedTypeKeys = [];

  const getType = (value) => {
    if (value?.type) {
      return value.type === "int" ? "number" : value.type;
    }
    if (isObject(value)) return "object";
    if (isArray(value)) return "array";
    return typeof value;
  };

  const merge = (target, source, path = []) => {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];
      const currentPath = path.concat(key);

      if (!(key in target)) {
        // New key found
        if (isObject(sourceValue)) {
          target[key] = {};
          merge(target[key], sourceValue, currentPath);
        } else if (isArray(sourceValue)) {
          target[key] = [];
          merge(target[key], sourceValue, currentPath);
        } else {
          target[key] = sourceValue;
        }
        newKeys.push(currentPath.join("."));
      } else {
        const targetType = getType(targetValue);
        const sourceType = getType(sourceValue);

        if (targetType !== sourceType) {
          // Type change detected
          changedTypeKeys.push({
            key: currentPath.join("."),
            prevType: targetType,
            newType: sourceType,
          });
        } else if (isObject(targetValue) && isObject(sourceValue)) {
          // Recursively merge nested objects
          merge(targetValue, sourceValue, currentPath);
        } else if (isArray(targetValue) && isArray(sourceValue)) {
          // Concatenate arrays if both are arrays
          target[key] = targetValue.concat(sourceValue);
        }
      }
    });

    return target;
  };

  const mergedResult = merge(Object.assign({}, target), source);
  return { mergedResult, newKeys, changedTypeKeys };
};
