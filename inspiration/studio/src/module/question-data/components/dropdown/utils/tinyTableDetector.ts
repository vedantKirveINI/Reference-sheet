export const TINY_TABLE_NODE_TYPES = [
  "FIND_ALL_SHEET_RECORD_V2",
  "FIND_ONE_SHEET_RECORD_V2",
  "FIND_ALL_SHEET_RECORD_V3",
  "FIND_ONE_SHEET_RECORD_V3",
];

export const DATABASE_NODE_TYPES = [
  "DB_FIND_ALL_V2",
  "DB_FIND_ONE_V2",
];

export interface SourceNodeInfo {
  nodeId: string;
  nodeType: string;
  nodeName: string;
  isTinyTable: boolean;
  isDatabase: boolean;
  schema?: any[];
}

export interface FieldOption {
  id: string;
  label: string;
  name: string;
  type?: string;
}

export const extractSourceNodeFromBlocks = (blocks: any[]): SourceNodeInfo | null => {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  let tinyTableNode: SourceNodeInfo | null = null;
  let firstVariableNode: SourceNodeInfo | null = null;

  for (const block of blocks) {
    const variableData = block?.variableData;
    if (variableData && variableData.nodeId) {
      const nodeType = variableData.nodeType || "";
      const nodeInfo: SourceNodeInfo = {
        nodeId: variableData.nodeId,
        nodeType,
        nodeName: variableData.nodeName || "",
        isTinyTable: TINY_TABLE_NODE_TYPES.includes(nodeType),
        isDatabase: DATABASE_NODE_TYPES.includes(nodeType),
        schema: variableData.schema,
      };

      if (!firstVariableNode) {
        firstVariableNode = nodeInfo;
      }

      if (nodeInfo.isTinyTable || nodeInfo.isDatabase) {
        tinyTableNode = nodeInfo;
        break;
      }
    }
  }

  return tinyTableNode || firstVariableNode;
};

export const findNodeInVariables = (
  variables: Record<string, any>,
  nodeId: string
): any | null => {
  if (!variables || !nodeId) return null;

  const nodes = variables?.nodes;
  if (Array.isArray(nodes)) {
    for (const node of nodes) {
      if (node?.nodeId === nodeId || node?._id === nodeId) {
        return node;
      }
    }
  }

  if (Array.isArray(variables)) {
    for (const node of variables) {
      if (node?.nodeId === nodeId || node?._id === nodeId) {
        return node;
      }
    }
  }

  if (typeof variables === "object" && !Array.isArray(variables)) {
    if (variables[nodeId]) {
      return variables[nodeId];
    }
    for (const key of Object.keys(variables)) {
      const node = variables[key];
      if (node?.nodeId === nodeId || node?._id === nodeId) {
        return node;
      }
    }
  }

  return null;
};

export const extractFieldsFromSchema = (schema: any[]): FieldOption[] => {
  if (!schema || !Array.isArray(schema)) return [];

  const fields: FieldOption[] = [];

  const processSchema = (schemaItems: any[], parentPath = "") => {
    for (const item of schemaItems) {
      const itemKey = item?.key || item?.id;
      const itemLabel = item?.label || item?.name || itemKey;
      const fullPath = parentPath ? `${parentPath}${itemKey}` : itemKey;

      if (itemKey && item?.type !== "object" && item?.type !== "array") {
        fields.push({
          id: fullPath,
          label: itemLabel,
          name: item?.name || itemLabel,
          type: item?.type,
        });
      }

      if (item?.schema && Array.isArray(item.schema)) {
        if (item?.type === "object") {
          processSchema(item.schema, `${fullPath}.`);
        } else if (item?.type === "array" && item.schema.length > 0) {
          const firstChild = item.schema[0];
          if (firstChild?.type === "object" && firstChild?.schema) {
            processSchema(firstChild.schema, `${fullPath}[0].`);
          }
        }
      }
    }
  };

  processSchema(schema);
  return fields;
};

export const extractFieldsFromSheetGoData = (goData: any): FieldOption[] => {
  if (!goData) return [];

  const record = goData?.record || [];
  if (!Array.isArray(record)) return [];

  return record
    .filter((field: any) => field?.id || field?.key)
    .map((field: any) => ({
      id: field.id || field.key,
      label: field.name || field.label || field.key || field.id,
      name: field.name || field.label || field.key || field.id,
      type: field.type,
    }));
};

export const getFieldOptionsFromSourceNode = (
  sourceNodeInfo: SourceNodeInfo | null,
  variables: Record<string, any>
): FieldOption[] => {
  if (!sourceNodeInfo || (!sourceNodeInfo.isTinyTable && !sourceNodeInfo.isDatabase)) {
    return [];
  }

  if (sourceNodeInfo.schema && Array.isArray(sourceNodeInfo.schema)) {
    const fieldsFromBlockSchema = extractFieldsFromSchema(sourceNodeInfo.schema);
    if (fieldsFromBlockSchema.length > 0) return fieldsFromBlockSchema;
  }

  const node = findNodeInVariables(variables, sourceNodeInfo.nodeId);
  if (node) {
    if (node.schema) {
      const fieldsFromNodeSchema = extractFieldsFromSchema(node.schema);
      if (fieldsFromNodeSchema.length > 0) return fieldsFromNodeSchema;
    }

    if (node.go_data) {
      const fieldsFromGoData = extractFieldsFromSheetGoData(node.go_data);
      if (fieldsFromGoData.length > 0) return fieldsFromGoData;
    }
  }

  return [];
};
