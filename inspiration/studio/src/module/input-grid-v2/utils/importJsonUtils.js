import isBoolean from "lodash/isBoolean";
import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";
import lowerCase from "lodash/lowerCase";
import capitalize from "lodash/capitalize";
import { PRIMITIVE } from "../constant/datatype";
import { jsonToSchema } from "oute-services-utility-sdk";

const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj);
const isArray = (obj) => Array.isArray(obj);

export const generateId = () => {
  return Date.now().toString() + Math.floor(Math.random() * 10000).toString();
};

export const getType = (value) => {
  if (!value) return "String";

  if (Array.isArray(value)) {
    return "Array";
  }
  if (typeof value === "string") {
    return "String";
  }
  if (typeof value === "number") {
    return "Number";
  }
  if (typeof value === "boolean") {
    return "Boolean";
  }
  if (value && typeof value === "object") {
    return "Object";
  }
  return "String";
};

export const isGridEmpty = (grid) => {
  if (grid.length !== 1) return false;

  const { key, type, value, default: defaultValue } = grid[0];

  if (
    type === "String" &&
    isEmpty(value) &&
    isEmpty(defaultValue) &&
    isEmpty(key)
  ) {
    return true;
  }
  return false;
};

function wrapDefault(value) {
  return {
    type: "fx",
    blocks: [
      {
        type: "PRIMITIVES",
        value: String(value),
      },
    ],
    blockStr: String(value),
  };
}

const convertSchemaToGridData = (schema = []) => {
  if (isEmpty(schema || [])) {
    return [];
  }

  return schema.map((item) => {
    const id = generateId();
    const base = {
      id,
      type: capitalize(item.type),
      isValueMode: false,
      isChecked: false,
    };

    if (item.key) {
      base.key = item.key;
    }

    if (
      item.default !== undefined &&
      item.type !== "array" &&
      item.type !== "object"
    ) {
      base.default = wrapDefault(item.default);
    }

    if (item.type === "array" && Array.isArray(item.schema)) {
      base.schema = convertSchemaToGridData(item.schema);
    }

    if (item.type === "object" && Array.isArray(item.schema)) {
      base.schema = convertSchemaToGridData(item.schema);
    }

    return base;
  });
};

const getArrayJsonToGridSchema = (json, isValueMode) => {
  const VALUE_KEY = isValueMode ? "value" : "default";

  const { schema } = jsonToSchema(json);

  if (isEmpty(schema[0]?.schema)) {
    return [
      {
        id: generateId(),
        type: "Any",
        [VALUE_KEY]: {
          type: "fx",
          blocks: [{ type: "PRIMITIVES", value: "" }],
          blockStr: "",
        },
      },
    ];
  }

  return convertSchemaToGridData(schema[0]?.schema || []);
};

const transformValue = (value, isValueMode, index) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";
  const VALUE_KEY = isValueMode ? "value" : "default";

  if (!value && !isBoolean(value)) return {};

  if (value?.[VALUE_KEY]?.type === "fx") {
    return value;
  }

  let type = getType(value);

  let result = {
    id: `${generateId()}${index}`,
    type: type,
    isValueMode,
  };

  if (type === "Array") {
    if (isValueMode) {
      result[CONFIG_KEY] = value.map((item, i) =>
        transformValue(item, isValueMode, i)
      );
    } else {
      result[CONFIG_KEY] = getArrayJsonToGridSchema(value, isValueMode);
    }

    return result;
  }

  if (type === "Object") {
    result[CONFIG_KEY] = Object.entries(value).map(([key, val], i) => {
      if (!value[key] && !isBoolean(value[key])) {
        return {
          key: key,
        };
      }

      let transformed = transformValue(val, isValueMode, i);
      transformed.key = key;
      return transformed;
    });
    return result;
  }

  result[VALUE_KEY] = {
    type: "fx",
    blocks: [
      {
        type: "PRIMITIVES",
        value: value?.toString() || "",
      },
    ],
    blockStr: value?.toString() || "",
  };

  return result;
};

const getGridSchemaValue = (field, isValueMode) => {
  const VALUE_KEY = isValueMode ? "value" : "default";

  return {
    key: field.key,
    id: field.id,
    type: field.type,
    [VALUE_KEY]: field?.value ||
      field?.default || { type: "fx", blocks: [], blockStr: "" },
  };
};

export const convertGridSchemaToJson = (schema, isValueMode) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";
  if (!schema) {
    return;
  }

  if (isGridEmpty(schema)) {
    return {};
  }

  const output = {};

  schema.forEach((item) => {
    if (item.type === "Object" && Array.isArray(item?.[CONFIG_KEY])) {
      output[item.key] = item[CONFIG_KEY].reduce((obj, field) => {
        obj[field.key] = getGridSchemaValue(field, isValueMode);
        return obj;
      }, {});
    } else if (item.type === "Array" && Array.isArray(item?.[CONFIG_KEY])) {
      output[item.key] = item[CONFIG_KEY].map((c) => {
        if (c.type === "String") {
          return getGridSchemaValue(c, isValueMode);
        } else if (c.type === "Object") {
          return c[CONFIG_KEY].reduce((obj, field) => {
            obj[field.key] = getGridSchemaValue(field, isValueMode);
            return obj;
          }, {});
        }
      });
    } else if (item?.key) {
      output[item.key] = getGridSchemaValue(item, isValueMode);
    } else {
      //   output[item.key || `key_${i}`] = getGridSchemaValue(item, isValueMode);
    }
  });
  return output;
};

export const convertJsonToGridSchema = (json, isValueMode) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";

  if (Array.isArray(json) || typeof json !== "object") {
    if (!isValueMode) {
      return getArrayJsonToGridSchema(json, isValueMode);
    }

    return json.map((data, index) => {
      if (PRIMITIVE.includes(typeof data)) {
        return transformValue(data, isValueMode, index);
      }

      if (Array.isArray(data)) {
        const transformedArr = convertJsonToGridSchema(data, isValueMode);

        return {
          id: `${generateId()}${index}`,
          type: "Array",
          [CONFIG_KEY]: transformedArr,
        };
      }

      const transformedObj = Object.entries(data).map(([key, value], i) => {
        let transformed = transformValue(value, isValueMode, i);
        transformed.key = key;
        return transformed;
      });

      return {
        id: `${generateId()}${index}`,
        type: "Object",
        [CONFIG_KEY]: transformedObj,
      };
    });
  }

  return Object.entries(json).map(([key, value], i) => {
    let transformed = transformValue(value, isValueMode, i);
    transformed.key = key;
    return transformed;
  });
};

export const compareJSONWithTrackingAndTypeCheck = (target, source) => {
  const newKeys = [];
  const changedTypeKeys = [];

  const getType = (value) => {
    if (value?.type) {
      return startCase(value.type);
    }
    if (isObject(value)) return "Object";
    if (isArray(value)) return "Array";
    return startCase(typeof value);
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

export const arrayGridToJson = ({ gridData, isValueMode }) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";
  const VALUE_KEY = isValueMode ? "value" : "default";

  function processNode(node) {
    if (Array.isArray(node)) {
      return node.map((n) => processNode(n));
    }

    if (PRIMITIVE.includes(lowerCase(node.type))) {
      return node?.[VALUE_KEY].blockStr;
    }

    if (node.type === "Object") {
      const result = {};

      node[CONFIG_KEY].forEach((child) => {
        result[child.key] = processNode(child);
      });

      return result;
    }

    if (node.type === "Array") {
      return node[CONFIG_KEY].map((child) => processNode(child));
    }

    return node;
  }

  return processNode(gridData);
};

export const convertDataToGridSchema = (data, isValueMode) => {
  if (!PRIMITIVE.includes(typeof data)) {
    return convertJsonToGridSchema(data, isValueMode);
  }

  const VALUE_KEY = isValueMode ? "value" : "default";

  return [
    {
      id: generateId(),
      type: startCase(typeof data),
      isValueMode,
      [VALUE_KEY]: {
        type: "fx",
        blocks: [{ type: "PRIMITIVES", value: data }],
        blockStr: data,
      },
    },
  ];
};
