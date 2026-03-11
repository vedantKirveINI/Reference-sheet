const NODE_TYPE_ALIASES = {
  "WELCOME": "WELCOME_SCREEN",
  "ENDING": "END_SCREEN",
  "PHONE_NUMBER": "PHONE",
  "FILE_PICKER": "FILE_UPLOAD",
  "DROP_DOWN": "DROPDOWN",
};

const normalizeNodeType = (type) => {
  if (!type) return type;
  return NODE_TYPE_ALIASES[type] || type;
};

const VALID_NODE_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "URL",
  "DATE",
  "FILE_UPLOAD",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
  "MCQ",
  "SCQ",
  "YES_NO",
  "RATING",
  "OPINION_SCALE",
  "RANKING",
  "MATRIX",
  "SLIDER",
  "COLOR_PICKER",
  "SIGNATURE",
  "PAYMENT",
  "WELCOME_SCREEN",
  "END_SCREEN",
  "STATEMENT",
  "GROUP",
  "PICTURE_CHOICE",
  "LEGAL",
  "NPS",
  "CONTACT_INFO",
  "ADDRESS",
  "CALENDAR",
  "HIDDEN_FIELD",
];

const VERTICAL_SPACING = 180;

const transformNodesToGoJS = (nodes) => {
  if (!nodes || !Array.isArray(nodes)) return [];

  return nodes.map((node, index) => {
    const type = normalizeNodeType(node.type);
    const isQuestion = VALID_NODE_TYPES.includes(type);
    return {
      key: node.id,
      type,
      name: node.question || "",
      text: node.question || "",
      required: node.required || false,
      template: "roundedRectangle",
      loc: `0 ${index * VERTICAL_SPACING}`,
      nodeNumber: index + 1,
      question: node.question || "",
      ...(isQuestion ? { category: "Question", module: "Question" } : {}),
      ...(node.options ? { options: node.options } : {}),
      ...(node.validation ? { validation: node.validation } : {}),
      ...(node.settings ? { settings: node.settings } : {}),
    };
  });
};

const transformEdgesToLinks = (edges) => {
  if (!edges || !Array.isArray(edges)) return [];

  return edges.map((edge) => ({
    from: edge.from,
    to: edge.to,
    ...(edge.label ? { label: edge.label } : {}),
    ...(edge.condition ? { condition: edge.condition } : {}),
  }));
};

export const mapAssetDataToGoJSModel = (type, data) => {
  if (!data) {
    return {
      class: "GraphLinksModel",
      nodeDataArray: [],
      linkDataArray: [],
    };
  }

  if (data.nodeDataArray) {
    return {
      class: "GraphLinksModel",
      nodeDataArray: (data.nodeDataArray || []).map((node) => {
        const type = normalizeNodeType(node.type);
        const needsCategory = VALID_NODE_TYPES.includes(type) && !node.category;
        return {
          ...node,
          type,
          ...(needsCategory ? { category: "Question", module: "Question" } : {}),
        };
      }),
      linkDataArray: data.linkDataArray || [],
    };
  }

  if (data.canvasData && data.canvasData.nodes) {
    return {
      class: "GraphLinksModel",
      nodeDataArray: transformNodesToGoJS(data.canvasData.nodes),
      linkDataArray: transformEdgesToLinks(data.canvasData.edges),
    };
  }

  return {
    class: "GraphLinksModel",
    nodeDataArray: [],
    linkDataArray: [],
  };
};

export const validateAssetData = (data) => {
  const errors = [];

  if (!data) {
    return { valid: false, errors: ["Data is null or undefined"] };
  }

  if (data.nodeDataArray) {
    if (!Array.isArray(data.nodeDataArray)) {
      errors.push("nodeDataArray must be an array");
    } else {
      data.nodeDataArray.forEach((node, i) => {
        if (!node.key) {
          errors.push(`Node at index ${i} is missing required field 'key'`);
        }
      });
    }

    if (data.linkDataArray && Array.isArray(data.linkDataArray)) {
      const nodeKeys = new Set(
        (data.nodeDataArray || []).map((n) => n.key)
      );
      data.linkDataArray.forEach((link, i) => {
        if (!link.from) {
          errors.push(`Link at index ${i} is missing 'from' field`);
        } else if (!nodeKeys.has(link.from)) {
          errors.push(`Link at index ${i} references non-existent node '${link.from}'`);
        }
        if (!link.to) {
          errors.push(`Link at index ${i} is missing 'to' field`);
        } else if (!nodeKeys.has(link.to)) {
          errors.push(`Link at index ${i} references non-existent node '${link.to}'`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  }

  if (data.canvasData) {
    if (!data.canvasData.nodes) {
      errors.push("canvasData is missing 'nodes' field");
    } else if (!Array.isArray(data.canvasData.nodes)) {
      errors.push("canvasData.nodes must be an array");
    } else {
      const nodeIds = new Set();

      data.canvasData.nodes.forEach((node, i) => {
        if (!node.id) {
          errors.push(`Node at index ${i} is missing required field 'id'`);
        } else {
          nodeIds.add(node.id);
        }
        if (!node.type) {
          errors.push(`Node at index ${i} is missing required field 'type'`);
        } else {
          const normalized = normalizeNodeType(node.type);
          if (!VALID_NODE_TYPES.includes(normalized)) {
            errors.push(`Node at index ${i} has invalid type '${node.type}'`);
          }
        }
      });

      if (data.canvasData.edges && Array.isArray(data.canvasData.edges)) {
        data.canvasData.edges.forEach((edge, i) => {
          if (!edge.from) {
            errors.push(`Edge at index ${i} is missing 'from' field`);
          } else if (!nodeIds.has(edge.from)) {
            errors.push(`Edge at index ${i} references non-existent node '${edge.from}'`);
          }
          if (!edge.to) {
            errors.push(`Edge at index ${i} is missing 'to' field`);
          } else if (!nodeIds.has(edge.to)) {
            errors.push(`Edge at index ${i} references non-existent node '${edge.to}'`);
          }
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  return { valid: false, errors: ["Data must contain either 'nodeDataArray' or 'canvasData'"] };
};

export const extractModelJSON = (canvasRef) => {
  if (!canvasRef || !canvasRef.current) {
    return null;
  }

  try {
    const json = canvasRef.current.getModelJSON();
    return typeof json === "string" ? JSON.parse(json) : json;
  } catch (e) {
    return null;
  }
};
