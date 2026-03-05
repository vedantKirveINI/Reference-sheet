import _ from "lodash";
import { findOneNodeById, getLinkStatsForId, predictStartNode } from "./helpers";
import { validateNode } from "../../../../canvas/extensions/validation/registry";
import "../../../../canvas/extensions/validation/validators";
import extensionIcons from "../../../../canvas/assets/extensions";

const QUESTION_TYPES = [
  "SHORT_TEXT", "LONG_TEXT", "MCQ", "SCQ", "PHONE_NUMBER", "ZIP_CODE",
  "DROP_DOWN", "DROP_DOWN_STATIC", "YES_NO", "RANKING", "EMAIL",
  "AUTHORIZATION", "QUESTION_FX", "WELCOME", "WELCOME_SCREEN", "QUOTE", "ENDING", "DATE",
  "CURRENCY", "KEY_VALUE_TABLE", "NUMBER", "FILE_PICKER", "TIME",
  "SIGNATURE", "LOADING", "ADDRESS", "PDF_VIEWER", "TEXT_PREVIEW",
  "AUTOCOMPLETE", "CLOUD_FILE_EXPLORER", "MULTI_QUESTION_PAGE",
  "QUESTIONS_GRID", "PICTURE", "QUESTION_REPEATER", "COLLECT_PAYMENT",
  "RATING", "SLIDER", "OPINION_SCALE", "TERMS_OF_USE", "STRIPE_PAYMENT",
];

const CONTROL_NODE_TYPES = ["Start", "Start Setup", "End", "Success Setup", "SUCCESS", "FAILED"];

const NODE_TYPE_LABELS = {
  "CREATE_RECORD_V2": "Create Record",
  "Create Record": "Create Record",
  "CREATE_SHEET_RECORD_V2": "Create Sheet Record",
  "CREATE_SHEET_RECORD_V3": "Create Sheet Record",
  "UPDATE_RECORD_V2": "Update Record",
  "Update Record": "Update Record",
  "UPDATE_SHEET_RECORD_V2": "Update Sheet Record",
  "UPDATE_SHEET_RECORD_V3": "Update Sheet Record",
  "DELETE_RECORD_V2": "Delete Record",
  "Delete Record": "Delete Record",
  "DELETE_SHEET_RECORD_V2": "Delete Sheet Record",
  "DB_FIND_ALL": "Find All Records",
  "DB_FIND_ONE": "Find One Record",
  "DB_FIND_ALL_V2": "Find All Records",
  "DB_FIND_ONE_V2": "Find One Record",
  "FIND_ALL_SHEET_RECORD_V2": "Find All Records",
  "FIND_ONE_SHEET_RECORD_V2": "Find One Record",
  "Integration": "Integration",
  "HTTP": "HTTP Request",
  "HTTP_V5": "HTTP Request",
  "GPT": "AI Node",
  "GPT_V3": "AI Node",
  "TINYGPT": "AI Node",
  "TINYGPT_V2": "AI Node",
  "HITL": "Human Approval",
  "HITL_V2": "Human Approval",
  "SELF_EMAIL": "Send Email",
  "SELF_EMAIL_V2": "Send Email",
  "If Else": "Conditional Logic",
  "IFELSE_V2": "Conditional Logic",
  "IF_ELSE_V4": "Conditional Logic",
  "Transformer": "Data Transform",
  "TRANSFORMER_V3": "Data Transform",
  "FORMULA_FX": "Formula",
  "WEBHOOK_V2": "Webhook",
  "TIME_BASED_TRIGGER_V2": "Scheduled Trigger",
  "SHEET_TRIGGER_V2": "Sheet Trigger",
  "SHEET_DATE_FIELD_TRIGGER": "Date Field Trigger",
  "Delay": "Delay",
  "DELAY_V2": "Delay",
};

const NODE_TYPE_ICONS = {
  "CREATE_RECORD_V2": extensionIcons.tinyTablesCreate,
  "Create Record": extensionIcons.tinyTablesCreate,
  "CREATE_SHEET_RECORD_V2": extensionIcons.tinyTablesCreate,
  "CREATE_SHEET_RECORD_V3": extensionIcons.tinyTablesCreate,
  "UPDATE_RECORD_V2": extensionIcons.tinyTablesUpdate,
  "Update Record": extensionIcons.tinyTablesUpdate,
  "UPDATE_SHEET_RECORD_V2": extensionIcons.tinyTablesUpdate,
  "UPDATE_SHEET_RECORD_V3": extensionIcons.tinyTablesUpdate,
  "DELETE_RECORD_V2": extensionIcons.tinyTablesDelete,
  "Delete Record": extensionIcons.tinyTablesDelete,
  "DELETE_SHEET_RECORD_V2": extensionIcons.tinyTablesDelete,
  "DB_FIND_ALL": extensionIcons.tinyTablesFindAll,
  "DB_FIND_ONE": extensionIcons.tinyTablesFindOne,
  "DB_FIND_ALL_V2": extensionIcons.tinyTablesFindAll,
  "DB_FIND_ONE_V2": extensionIcons.tinyTablesFindOne,
  "FIND_ALL_SHEET_RECORD_V2": extensionIcons.tinyTablesFindAll,
  "FIND_ONE_SHEET_RECORD_V2": extensionIcons.tinyTablesFindOne,
  "SHEET_TRIGGER_V2": extensionIcons.sheetTrigger,
  "SHEET_DATE_FIELD_TRIGGER": extensionIcons.dateFieldTriggerIcon,
  "GPT": extensionIcons.tinyGPTIcon,
  "GPT_V3": extensionIcons.tinyGPTIcon,
  "TINYGPT": extensionIcons.tinyGPTIcon,
  "TINYGPT_V2": extensionIcons.tinyGPTIcon,
  "Delay": extensionIcons.delayIcon,
  "DELAY_V2": extensionIcons.delayIcon,
};

function isQuestionType(nodeType) {
  return QUESTION_TYPES.includes(nodeType);
}

function isControlNode(nodeType) {
  return CONTROL_NODE_TYPES.includes(nodeType);
}

function isActionNode(nodeType) {
  return !isQuestionType(nodeType) && !isControlNode(nodeType);
}

function getNodeIcon(nodeType) {
  return NODE_TYPE_ICONS[nodeType] || null;
}

function getFriendlyNodeName(nodeType) {
  if (!nodeType) return "Step";
  return NODE_TYPE_LABELS[nodeType] || nodeType.replace(/_/g, " ").replace(/V\d+$/i, "").trim() || "Step";
}

const NODE_SETUP_GUIDANCE = {
  "CREATE_RECORD_V2": "Select a table and map the fields you want to populate when a new record is created.",
  "Create Record": "Select a table and map the fields you want to populate when a new record is created.",
  "CREATE_SHEET_RECORD_V2": "Connect to a sheet and configure which columns to populate with data.",
  "CREATE_SHEET_RECORD_V3": "Connect to a sheet and configure which columns to populate with data.",
  "UPDATE_RECORD_V2": "Choose which record to update and specify the new values for each field.",
  "Update Record": "Choose which record to update and specify the new values for each field.",
  "UPDATE_SHEET_RECORD_V2": "Select the sheet and specify which record to update.",
  "UPDATE_SHEET_RECORD_V3": "Select the sheet and specify which record to update.",
  "DELETE_RECORD_V2": "Specify which record should be deleted based on your criteria.",
  "Delete Record": "Specify which record should be deleted based on your criteria.",
  "DELETE_SHEET_RECORD_V2": "Select the sheet and specify which record to delete.",
  "DB_FIND_ALL": "Set up filters to find matching records from your database.",
  "DB_FIND_ALL_V2": "Set up filters to find matching records from your database.",
  "DB_FIND_ONE": "Configure the criteria to find a specific record.",
  "DB_FIND_ONE_V2": "Configure the criteria to find a specific record.",
  "FIND_ALL_SHEET_RECORD_V2": "Set up filters to find matching records from your sheet.",
  "FIND_ONE_SHEET_RECORD_V2": "Configure the criteria to find a specific record from your sheet.",
  "Integration": "Connect to your external service and configure the action settings.",
  "HTTP": "Enter the URL and configure the request method, headers, and body.",
  "HTTP_V5": "Enter the URL and configure the request method, headers, and body.",
  "GPT": "Set up your AI prompt and configure the response format.",
  "GPT_V3": "Set up your AI prompt and configure the response format.",
  "TINYGPT": "Set up your AI prompt and configure the response format.",
  "TINYGPT_V2": "Set up your AI prompt and configure the response format.",
  "HITL": "Configure when and how to pause for human review.",
  "HITL_V2": "Configure when and how to pause for human review.",
  "SELF_EMAIL": "Enter the email details and message content.",
  "SELF_EMAIL_V2": "Enter the email details and message content.",
  "If Else": "Set up the conditions that determine which path to take.",
  "IFELSE_V2": "Set up the conditions that determine which path to take.",
  "IF_ELSE_V4": "Set up the conditions that determine which path to take.",
  "Transformer": "Configure how to transform your data between steps.",
  "TRANSFORMER_V3": "Configure how to transform your data between steps.",
  "FORMULA_FX": "Write the formula to calculate or transform values.",
  "WEBHOOK_V2": "Configure the webhook endpoint and payload.",
  "TIME_BASED_TRIGGER_V2": "Set up the schedule for when this workflow should run.",
  "SHEET_TRIGGER_V2": "Configure which sheet events should trigger this workflow.",
  "Delay": "Set how long to wait before continuing.",
  "DELAY_V2": "Set how long to wait before continuing.",
};

function getSetupGuidance(nodeType) {
  return NODE_SETUP_GUIDANCE[nodeType] || "Complete the configuration for this step to continue.";
}

function checkNodeConfiguration(node) {
  const nodeType = node?.type || "";
  const nodeKey = node?.key?.toString() || "";
  const nodeName = node?.name || node?.text || nodeType;
  const tfData = node?.tf_data || {};
  const goData = node?.go_data || {};

  if (isControlNode(nodeType)) {
    return { isConfigured: true };
  }

  if (isQuestionType(nodeType)) {
    return { isConfigured: true };
  }

  // Use both tf_data and go_data for validation. DB/CRUD nodes often have
  // configuration in go_data (e.g. from the drawer) before tf_data is
  // populated by the server after save. Treat as unconfigured only when
  // both are empty, so preview doesn't show a false error until the user
  // opens and closes the node.
  const hasTfData = !_.isEmpty(tfData);
  const hasGoData = !_.isEmpty(goData);
  if (!hasTfData && !hasGoData) {
    return {
      isConfigured: false,
      nodeKey,
      nodeName,
      nodeType,
      nodeIcon: getNodeIcon(nodeType),
      friendlyName: getFriendlyNodeName(nodeType),
      error: "Node is not configured",
    };
  }

  const validation = validateNode({
    nodeKey,
    nodeType,
    nodeName,
    tfData,
    goData,
  });

  if (validation && validation.isValid === false) {
    return {
      isConfigured: false,
      nodeKey,
      nodeName,
      nodeType,
      nodeIcon: getNodeIcon(nodeType),
      friendlyName: getFriendlyNodeName(nodeType),
      validation,
      error: validation.message || "Node needs configuration",
    };
  }

  return { isConfigured: true };
}

function getNodeIds(nodes) {
  const ids = [];
  for (const node of nodes || []) {
    const id = node?.tf_data?._id || node?.tf_data?.id || node?.key?.toString();
    if (id) {
      ids.push(id);
    }
  }
  return ids;
}

function buildFlowWithBoundaries(canvasData, startNode) {
  const flow = {};
  const taskGraph = [];
  const unconfiguredNodes = [];
  let firstUnconfiguredBoundary = null;
  const visited = new Set();
  
  console.log("[FormPreview] buildFlowWithBoundaries: start", "startNode:", startNode?.key, startNode?.type, "hasTfData:", !!startNode?.tf_data, "hasGoData:", !!startNode?.go_data);
  
  function traverse(currNode, prevNode) {
    if (!currNode || visited.has(currNode?.key)) {
      return;
    }
    
    visited.add(currNode?.key);
    
    const configCheck = checkNodeConfiguration(currNode);
    
    console.log("[FormPreview] buildFlowWithBoundaries: visit", "key:", currNode?.key, "type:", currNode?.type, "configured:", configCheck.isConfigured, "isAction:", isActionNode(currNode?.type), "hasTfData:", !!currNode?.tf_data, "hasGoData:", !!currNode?.go_data);
    
    if (!configCheck.isConfigured && isActionNode(currNode?.type)) {
      console.log("[FormPreview] buildFlowWithBoundaries: unconfigured boundary", currNode?.key, currNode?.type, configCheck.error);
      unconfiguredNodes.push({
        nodeKey: configCheck.nodeKey,
        nodeName: configCheck.nodeName,
        nodeType: configCheck.nodeType,
        nodeIcon: configCheck.nodeIcon,
        friendlyName: configCheck.friendlyName,
        validation: configCheck.validation,
        error: configCheck.error,
      });
      
      if (!firstUnconfiguredBoundary) {
        firstUnconfiguredBoundary = {
          nodeKey: configCheck.nodeKey,
          nodeName: configCheck.nodeName,
          nodeType: configCheck.nodeType,
          nodeIcon: configCheck.nodeIcon,
          friendlyName: configCheck.friendlyName,
          validation: configCheck.validation,
          error: configCheck.error,
        };
      }
      
      return;
    }

    // Include node in flow when it has tf_data or go_data (e.g. DB nodes before server tf_data)
    const nodePayload = currNode?.tf_data || currNode?.go_data || {};
    if (_.isEmpty(nodePayload) && !isControlNode(currNode?.type)) {
      console.log("[FormPreview] buildFlowWithBoundaries: skip (empty tf_data/go_data, not control)", currNode?.key, currNode?.type);
      return;
    }

    const nodeId = currNode?.tf_data?._id || currNode?.tf_data?.id || currNode?.key?.toString();
    if (!nodeId) return;

    const nodeStats = getLinkStatsForId(canvasData, currNode?.key)?.result;
    const prevNodeId = prevNode?.tf_data?._id || prevNode?.tf_data?.id || prevNode?.key?.toString();

    flow[nodeId] = {
      ...nodePayload,
      _id: nodeId,
      id: nodeId,
      prev_node_ids: getNodeIds(nodeStats?.in_links?.nodes),
      next_node_ids: getNodeIds(nodeStats?.out_links?.nodes),
    };

    if (nodeStats?.in_links?.nodes?.length === 0) {
      flow[nodeId].node_marker = "START";
    } else if (nodeStats?.out_links?.nodes?.length === 0) {
      flow[nodeId].node_marker = "END";
    } else {
      flow[nodeId].node_marker = "MIDDLE";
    }

    taskGraph.push([nodeId, prevNodeId ? [prevNodeId] : []]);

    const childNodes = nodeStats?.out_links?.nodes || [];
    
    for (const childNode of childNodes) {
      traverse(childNode, currNode);
    }
  }
  
  traverse(startNode, null);
  
  // Filter out next_node_ids that reference nodes not in the flow
  // This ensures the form ends naturally when hitting a boundary
  for (const nodeId of Object.keys(flow)) {
    const node = flow[nodeId];
    if (node.next_node_ids) {
      const validNextIds = node.next_node_ids.filter(id => flow[id]);
      if (validNextIds.length !== node.next_node_ids.length) {
        console.log("[FormPreview] buildFlowWithBoundaries: filter next_node_ids", nodeId, node.next_node_ids, "->", validNextIds);
        node.next_node_ids = validNextIds;
        if (validNextIds.length === 0) {
          node.node_marker = "END";
        }
      }
    }
  }
  
  console.log("[FormPreview] buildFlowWithBoundaries: done", "flowNodes:", Object.keys(flow).length, "unconfiguredCount:", unconfiguredNodes.length, "flowKeys:", Object.keys(flow));
  if (unconfiguredNodes.length > 0) {
    console.log("[FormPreview] buildFlowWithBoundaries: unconfigured list", unconfiguredNodes.map((n) => ({ key: n.nodeKey, type: n.nodeType, name: n.nodeName, error: n.error })));
  }

  return {
    flow,
    taskGraph,
    unconfiguredNodes,
    firstUnconfiguredBoundary,
  };
}

function scanAllUnconfiguredNodes(canvasData) {
  const unconfiguredNodes = [];
  const nodeDataArray = canvasData?.nodeDataArray || [];
  
  for (const node of nodeDataArray) {
    const nodeType = node?.type || "";
    
    if (isControlNode(nodeType) || isQuestionType(nodeType)) {
      continue;
    }
    
    const configCheck = checkNodeConfiguration(node);
    
    if (!configCheck.isConfigured) {
      unconfiguredNodes.push({
        nodeKey: configCheck.nodeKey,
        nodeName: configCheck.nodeName,
        nodeType: configCheck.nodeType,
        nodeIcon: configCheck.nodeIcon,
        friendlyName: configCheck.friendlyName,
        validation: configCheck.validation,
        error: configCheck.error,
      });
    }
  }
  
  return unconfiguredNodes;
}

export function canvasToPreviewFlow(payload) {
  try {
    if (_.isEmpty(payload)) {
      return {
        status: "failed",
        error: "No canvas data provided",
      };
    }
    
    let canvasData = payload?._r || "{}";
    if (!_.isObject(canvasData)) {
      canvasData = JSON.parse(canvasData);
    }
    
    const allUnconfiguredNodes = scanAllUnconfiguredNodes(canvasData);
    if (allUnconfiguredNodes.length > 0) {
      console.log("[FormPreview] canvasToPreviewFlow: scanAllUnconfiguredNodes", allUnconfiguredNodes.length, allUnconfiguredNodes.map((n) => ({ key: n.nodeKey, type: n.nodeType, name: n.nodeName, error: n.error })));
    }

    const startNodeResult = predictStartNode(payload);
    console.log("[FormPreview] canvasToPreviewFlow: predictStartNode", startNodeResult.status, startNodeResult.result ? { key: startNodeResult.result?.key, type: startNodeResult.result?.type } : null, "error:", startNodeResult.error, "errorNodes:", startNodeResult.errorNodes?.length);

    if (startNodeResult.status === "failed") {
      if (startNodeResult.error === "MULTIPLE_START_NODES") {
        return {
          status: "error",
          errorType: "MULTIPLE_ENTRY_POINTS",
          errorMessage: "Your form has multiple starting points. Please connect your questions so there's only one first question.",
          errorNodes: startNodeResult.errorNodes || [],
        };
      }
      
      return {
        status: "failed",
        error: startNodeResult.error || "Could not find start node",
      };
    }
    
    const startNode = startNodeResult.result;
    
    const { flow, taskGraph, unconfiguredNodes, firstUnconfiguredBoundary } = buildFlowWithBoundaries(
      canvasData,
      startNode
    );
    
    if (_.isEmpty(flow)) {
      if (allUnconfiguredNodes.length > 0) {
        return {
          status: "partial",
          flow: null,
          allUnconfiguredNodes,
          firstUnconfiguredBoundary: allUnconfiguredNodes[0],
        };
      }
      
      return {
        status: "failed",
        error: "No renderable content found",
      };
    }
    
    const canvasId = payload?._id || payload?.id || new Date().getTime().toString();
    
    return {
      status: "success",
      result: {
        canvas_id: canvasId,
        flow,
        task_graph: taskGraph,
        name: payload?.name || payload?.publish_name,
        project_id: payload?.project_id,
        workspace_id: payload?.workspace_id,
        asset_id: payload?.asset_id,
      },
      allUnconfiguredNodes,
      firstUnconfiguredBoundary,
      hasUnconfiguredNodes: allUnconfiguredNodes.length > 0,
    };
  } catch (error) {
    return {
      status: "failed",
      error: error?.message || "Error transforming canvas",
    };
  }
}

export { getFriendlyNodeName, getNodeIcon, getSetupGuidance, isQuestionType, isActionNode };
