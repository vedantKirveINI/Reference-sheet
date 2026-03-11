import { VARIABLES } from '../constants/categories.jsx';
import {
  FIELDS,
  FUNCTIONS,
  GLOBAL_VARIABLES,
  HIDDEN_PARAMS,
  KEYWORDS,
  LOCAL_VARIABLES,
  NODE_VARIABLES,
  OPERATORS,
  QUERY_PARAMS,
} from '../constants/types.jsx';

const filterNestedSchemaBySearchKey = (nodeDataArray = [], searchKey) => {
  const lowerSearchKey = searchKey?.toLowerCase();
  const searchSchema = (schemaArray) => {
    return schemaArray.reduce((filtered, item) => {
      if (item.schema) {
        // Recursively filter the child schema
        item.schema = searchSchema(item.schema);
      }

      // Include the item if it matches or it has any child that matches
      if (
        item?.key?.toLowerCase()?.includes(lowerSearchKey) ||
        (item?.schema && item?.schema?.length > 0)
      ) {
        filtered.push(item);
      }

      return filtered;
    }, []);
  };

  return nodeDataArray
    .map((node) => {
      if (
        node?.name?.toLowerCase()?.includes(lowerSearchKey) ||
        node?.description?.toLowerCase()?.includes(lowerSearchKey)
      ) {
        return node;
      }
      if (node?.data?.schema?.schema) {
        const filteredSchema = searchSchema(node.data.schema.schema);
        return {
          ...node,
          data: {
            ...node.data,
            schema: { ...node.data.schema, schema: filteredSchema },
          },
        };
      }
      return node;
    })
    ?.filter((node) => node.data.schema.schema.length > 0); // Filter out nodes with empty schemas
};
export const searchAndConsolidate = (data, searchText) => {
  if (!searchText || Object.keys(data).length === 0) return [];
  const result = {
    [VARIABLES]: [],
    [FUNCTIONS]: [],
    [KEYWORDS]: [],
    [OPERATORS]: [],
    [LOCAL_VARIABLES]: [],
    [GLOBAL_VARIABLES]: [],
    [QUERY_PARAMS]: [],
    [HIDDEN_PARAMS]: [],
    [NODE_VARIABLES]: [],
    [FIELDS]: [],
  };
  const filterArray = (arr = [], searchKey) => {
    return arr.filter(
      (item) =>
        item?.value?.toLowerCase()?.includes(searchKey) ||
        item?.displayValue?.toLowerCase()?.includes(searchKey) ||
        item?.name?.toLowerCase()?.includes(searchKey)
    );
  };

  for (const [key, value] of Object.entries(data)) {
    if (key === VARIABLES) {
      result[LOCAL_VARIABLES].push(
        ...filterArray(value?.LOCAL, searchText.toLowerCase())
      );
      result[GLOBAL_VARIABLES].push(
        ...filterArray(value?.GLOBAL, searchText.toLowerCase())
      );
      result[QUERY_PARAMS].push(
        ...filterArray(value?.QUERY_PARAMS, searchText.toLowerCase())
      );
      result[HIDDEN_PARAMS].push(
        ...filterArray(value?.HIDDEN_PARAMS, searchText.toLowerCase())
      );
      result[NODE_VARIABLES].push(
        ...filterNestedSchemaBySearchKey(value?.NODE, searchText.toLowerCase())
      );
    } else {
      result[VARIABLES].push(
        ...filterArray(value[VARIABLES], searchText.toLowerCase())
      );
      result[FUNCTIONS].push(
        ...filterArray(value[FUNCTIONS], searchText.toLowerCase())
      );
      result[KEYWORDS].push(
        ...filterArray(value[KEYWORDS], searchText.toLowerCase())
      );
      result[OPERATORS].push(
        ...filterArray(value[OPERATORS], searchText.toLowerCase())
      );
      result[FIELDS].push(
        ...filterArray(value[FIELDS], searchText.toLowerCase())
      );
    }
  }
  return result;
};
