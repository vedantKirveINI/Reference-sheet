/**
 * Validates NODE type variables in formula content blocks
 * Checks if referenced nodes exist and validates their paths
 * @param {Array} content - Array of block objects
 * @param {Array} nodeVariables - Array of available node variables
 * @returns {Array} - Updated content blocks with error states if validation fails
 */
export const validateNodeVariables = (content, nodeVariables) => {
  if (!content || !Array.isArray(content)) return content;

  return content.map((block) => {
    if (block.type === "NODE") {
      const nodeVariable = nodeVariables?.find(
        (n) => n.key === block.variableData?.nodeId,
      );

      if (!nodeVariable) {
        // Node not found - set error
        return {
          ...block,
          error: true,
          errorMessage: `Node ${block.variableData?.nodeName || "Unknown"} not found. Please check connected nodes.`,
          errorType: "NODE_NOT_FOUND",
        };
      }

      // Node found - validate path and clear any previous errors
      const pathToTraverse = block.variableData?.originalPath || block.variableData?.path || [];
      const currentSchema = nodeVariable?.go_data?.output?.schema?.schema?.[0]?.schema;

      // Validate path exists
      let prev = null;
      let index = 0;
      let hasPathError = false;
      // Same node name logic as SchemaList: Question → label|description|name|key, others → label|name|description|key
      const nodeName =
        nodeVariable.module === "Question"
          ? nodeVariable.label || nodeVariable.description || nodeVariable.name || nodeVariable.key
          : nodeVariable.label || nodeVariable.name || nodeVariable.description || nodeVariable.key;
      let newLabel = nodeName || block.variableData?.nodeName || "";

      while (index < pathToTraverse.length && !hasPathError) {
        const currentPath = pathToTraverse[index];

        // Skip array indices during validation
        if (currentPath === "0" || currentPath === "[]") {
          // Navigate into array element's schema when skipping array indices
          const schemaToNavigate = index === 0 ? currentSchema : prev;
          if (Array.isArray(schemaToNavigate) && schemaToNavigate.length > 0) {
            const arrayElement = schemaToNavigate[0];
            if (arrayElement?.type === "object" && Array.isArray(arrayElement.schema)) {
              // Array of objects - navigate to object's schema
              prev = arrayElement.schema;
            } else if (arrayElement?.schema) {
              // Array element has schema property
              prev = arrayElement.schema;
            }
          }

          index++;
          continue;
        }

        const schemaToSearch = index === 0 ? currentSchema : prev;
        const temp = schemaToSearch?.find((s) => s.key === currentPath);

        if (!temp) {
          hasPathError = true;
          break;
        }

        if (index === 0 && temp.key !== "response") {
          newLabel = newLabel + "." + (temp.label || temp.key);
        } else if (index > 0) {
          newLabel = newLabel + "." + (temp.label || temp.key);
        }

        prev = temp.schema;

        // If prev is an array containing an object schema (array of objects),
        // only add [0] and navigate into the object's schema when we are traversing
        // *through* the array to reach a child field, not when the selected node is
        // the array itself (last path segment).
        const hasMoreSegments = index + 1 < pathToTraverse.length;
        if (
          hasMoreSegments &&
          Array.isArray(prev) &&
          prev.length > 0 &&
          prev[0]?.type === "object" &&
          Array.isArray(prev[0]?.schema)
        ) {
          newLabel = newLabel + "[0]";
          prev = prev[0].schema;
        }

        index++;
      }

      if (hasPathError) {
        return {
          ...block,
          error: true,
          errorMessage: `Missing path, please check connected nodes. This could be due to a change in the response structure of ${block.variableData?.nodeName || "Unknown"}.`,
          errorType: "PATH_NOT_FOUND",
        };
      }

      // No error - clear any previous error state and update label
      const { error, errorMessage, errorType, ...clearedBlock } = block;
      return {
        ...clearedBlock,
        subType: newLabel,
        value: newLabel,
        variableData: {
          ...clearedBlock.variableData,
          nodeName: newLabel,
        },
      };
    }

    return block;
  });
};

