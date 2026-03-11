import { isEmpty } from "lodash";
import { getDataTypeOperator } from "../constant/dataOperator";
import { getOperatorsByColumnInfo } from "./getOption";

const getCollector = (index, collector = "") => {
  return `${collector}${collector ? "." : ""}childs[${index}]`;
};

function setValueByAccessor({ rootObj, accessor, newValue, property }) {
  let currentObj = rootObj;
  const accessorArr = accessor.split("."); // Split the accessor string by the separator

  // Iterate through the keys to access the nested objects
  for (let i = 0; i < accessorArr.length; i += 1) {
    const currAccessor = accessorArr[i];

    // If the key contains an index in brackets (e.g., 'childs[3]'), extract the index
    const match = currAccessor.match(/([^[]+)\[(\d+)\]/);

    if (match) {
      const propertyName = match[1]; // Extract the property name
      const index = +match[2]; // Extract the index
      currentObj = currentObj[propertyName][index]; // Access the nested object at the given index
    } else {
      currentObj = currentObj[currAccessor]; // Access the nested object using the key
    }
  }

  if (["value", "valueStr"].includes(property)) {
    currentObj[property] = newValue;
    return;
  }

  if (property === "operator") {
    currentObj[property] = newValue;

    if (["is empty", "is not empty"].includes(newValue?.value)) {
      currentObj.value = undefined;
    }
    return;
  }

  if (property === "key") {
    const { fieldInfo, nestedField } = newValue;

    const operatorArr = getOperatorsByColumnInfo({
      columnInfo: fieldInfo,
      nestedKey: nestedField,
    });

    const defaultOption = operatorArr[0];

    currentObj.key = fieldInfo?.name;
    currentObj.type = fieldInfo?.type;
    currentObj.field = fieldInfo?.field;
    currentObj.operator = defaultOption;
    currentObj.nested_key = nestedField;
    currentObj.value = undefined;
    return;
  }

  currentObj[property] = newValue;
}

function changeConditionByAccessor({ rootObj, accessor, updatedCondition }) {
  let currentObj = rootObj;
  const accessorArr = accessor.split("."); // Split the accessor string by the separator

  for (let i = 0; i < accessorArr.length - 1; i += 1) {
    const currAccessor = accessorArr[i];
    const match = currAccessor.match(/([^\[]+)\[(\d+)\]/);

    if (match) {
      const propertyName = match[1]; // Extract the property name
      const index = +match[2]; // Extract the index
      currentObj = currentObj?.[propertyName]?.[index]; // Access the nested object at the given index
    } else {
      currentObj = currentObj[currAccessor]; // Access the nested object using the key
    }
  }

  currentObj.condition = updatedCondition;
}

function deleteChildByAccessor(obj, accessor) {
  let currentObj = obj;
  let deleteIndex;

  const accessorArr = accessor.split(".");
  const accessorLength = accessorArr.length;

  for (let i = 0; i < accessorLength; i += 1) {
    const currAccessor = accessorArr[i];
    const match = currAccessor.match(/([^\[]+)\[(\d+)\]/);

    if (match) {
      const propertyName = match[1];
      const index = +match[2];

      if (i === accessorLength - 1) {
        currentObj = currentObj[propertyName];
        deleteIndex = index;
      } else {
        currentObj = currentObj[propertyName][index];
      }
    } else {
      currentObj = currentObj[currAccessor];
    }
  }

  if (currentObj.length === 1) {
    currentObj.splice(deleteIndex, 1, {
      id: `${Date.now()}`,
    });

    return;
  }

  currentObj.splice(deleteIndex, 1);
}

function addChildElement({ currentObj, isGroup, schema, accessor }) {
  const firstCol = schema[0];
  const operatorArr = getDataTypeOperator(firstCol?.type?.toUpperCase());

  const childObj = {
    id: `${Date.now()}`,
    key: firstCol?.name,
    field: firstCol?.field,
    type: firstCol?.type,
    operator: operatorArr[0],
    value: "",
  };

  if (accessor === "" && isEmpty(currentObj)) {
    const newObj = currentObj;

    newObj.id = `${Date.now()}_`;
    newObj.condition = "and";

    if (isGroup) {
      newObj.childs = [
        {
          id: `${Date.now()}__`,
          condition: "or",
          childs: [childObj],
        },
      ];
      return;
    }

    newObj.childs = [childObj];

    return;
  }

  if (!isGroup) {
    currentObj.childs.push(childObj);
    return;
  }

  currentObj.childs.push({
    id: `${Date.now()}_`,
    condition: currentObj?.condition === "and" ? "or" : "and",
    childs: [childObj],
  });
}

function addChildByAccessor(obj, accessor, isGroup, schema) {
  let currentObj = obj;

  if (accessor === "") {
    addChildElement({ currentObj, isGroup, schema, accessor });
    return;
  }

  const accessorArr = accessor?.split(".");

  for (let i = 0; i < accessorArr.length; i += 1) {
    const currAccessor = accessorArr[i];
    const match = currAccessor.match(/([^\[]+)\[(\d+)\]/);

    if (match) {
      const propertyName = match[1]; // Extract the property name
      const index = +match[2]; // Extract the index
      currentObj = currentObj[propertyName][index]; // Access the nested object at the given index
    } else {
      currentObj = currentObj[currAccessor]; // Access the nested object using the key
    }
  }

  addChildElement({ currentObj, isGroup, schema });
}

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

function regenerateIds(node) {
  if (!node || typeof node !== 'object') return node;
  if (node.id) {
    node.id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  if (Array.isArray(node.childs)) {
    node.childs.forEach(regenerateIds);
  }
  return node;
}

function cloneChildByAccessor(obj, accessor) {
  let currentObj = obj;
  let cloneIndex;

  const accessorArr = accessor.split(".");
  const accessorLength = accessorArr.length;

  for (let i = 0; i < accessorLength; i += 1) {
    const currAccessor = accessorArr[i];
    const match = currAccessor.match(/([^\[]+)\[(\d+)\]/);

    if (match) {
      const propertyName = match[1];
      const index = +match[2];

      if (i === accessorLength - 1) {
        currentObj = currentObj[propertyName];
        cloneIndex = index;
      } else {
        currentObj = currentObj[propertyName][index];
      }
    } else {
      currentObj = currentObj[currAccessor];
    }
  }

  const nodeToClone = currentObj[cloneIndex];
  const clonedNode = regenerateIds(deepClone(nodeToClone));
  currentObj.splice(cloneIndex + 1, 0, clonedNode);
}

export {
  getCollector,
  setValueByAccessor,
  deleteChildByAccessor,
  addChildByAccessor,
  changeConditionByAccessor,
  cloneChildByAccessor,
};
