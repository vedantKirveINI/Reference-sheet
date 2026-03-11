import { createNodes } from "../utils/flowBuilder";
import canvasSDKServices from "../sdk-services/canvas-sdk-services";
import { FAILED, SUCCESS } from "../constants/keys";
import { NODE_TEMPLATES } from "../components/canvas/templates/nodeTemplates";
import { getNodeSrc } from "../components/canvas/extensions/extension-utils";

/**
 * Maps server-hydrated node format to canvas format
 * @param {Array} serverNodes - Nodes from server (with 'id' property)
 * @returns {Array} Canvas-ready nodes (with 'key' property)
 */
async function mapServerNodesToCanvas(serverNodes) {
  if (!Array.isArray(serverNodes)) {
    return [];
  }

  const mappedNodes = [];
  
  for (const node of serverNodes) {
    // Validate required fields
    if (!node?.id || !node?.type) {
      continue;
    }

    // Build the mapped node
    const mappedNode = {
      key: node.id,              // Map id → key
      type: node.type,
      go_data: node.go_data || {},
      position: node.position || { x: 0, y: 0 },
      template: NODE_TEMPLATES.ROUNDED_RECTANGLE, // Question nodes use rounded rectangle template
      module: "Question", // Mark as question node
      // Extract name from go_data.question (the question text shown to users)
      name: node.go_data?.question || '',
      // Extract description from go_data.description (optional help text)
      description: node.go_data?.description || null,
      ...(node.data && { data: node.data }),
    };

    // Get _src for the node icon
    try {
      const src = await getNodeSrc(mappedNode, true);
      if (src) {
        mappedNode._src = src;
      }
    } catch (error) {
    }

    mappedNodes.push(mappedNode);
  }

  return mappedNodes;
}

/**
 * Maps server link format to canvas format
 * @param {Array} serverLinks - Links from server
 * @param {Set} validNodeKeys - Set of valid node keys for filtering
 * @returns {Array} Canvas-ready links
 */
function mapServerLinksToCanvas(serverLinks, validNodeKeys) {
  if (!Array.isArray(serverLinks)) {
    return [];
  }

  return serverLinks
    .filter((link) => {
      // Handle both string IDs and object references
      const fromKey = typeof link.from === 'string' 
        ? link.from 
        : link.from?.toString();
      const toKey = typeof link.to === 'string' 
        ? link.to 
        : link.to?.toString();

      if (!fromKey || !toKey) {
        return false;
      }

      // Only include links between valid nodes
      return validNodeKeys.has(fromKey) && validNodeKeys.has(toKey);
    })
    .map((link) => {
      const fromKey = typeof link.from === 'string' 
        ? link.from 
        : link.from?.toString();
      const toKey = typeof link.to === 'string' 
        ? link.to 
        : link.to?.toString();

      return {
        from: fromKey,
        to: toKey,
        ...(link.condition !== undefined && { condition: link.condition }),
        ...(link.label && { label: link.label }),
      };
    });
}

export const useProcessAiCanvas = (canvasRef, checkReferences) => {
  const processFormData = async (data, saveNodeDataHandler) => {
    try {
      // Server already sends hydrated nodes - just map to canvas format
      const serverNodes = data?.nodes || data?.fields || [];
      const serverLinks = data?.links || [];

      // Map server format to canvas format (async to get _src)
      const canvasNodes = await mapServerNodesToCanvas(serverNodes);
      const validNodeKeys = new Set(canvasNodes.map((n) => n.key));
      const canvasLinks = mapServerLinksToCanvas(serverLinks, validNodeKeys);

      await createNodes({
        transformedNodes: canvasNodes,
        transformedLinkData: canvasLinks,
        saveNodeDataHandler,
        canvasRef,
        checkReferences, // Pass the callback
      });
    } catch (error) {
      throw error;
    }
  };

  const getPublishedByAssets = async (formId) => {
    if (!formId) {
      return {
        status: FAILED,
        result: null,
      };
    }

    const response = await canvasSDKServices.getPublishedByAsset({
      asset_id: formId,
      include_project_variable: true,
    });

    return response;
  };

  const processNode = async ({
    generatedNodeData,
    nodeIdMap,
    saveNodeDataHandler,
    onNodeCreated = () => {},
  }) => {
    // Check if this is already a server-hydrated node (has id, type, go_data)
    if (generatedNodeData?.id && generatedNodeData?.type && generatedNodeData?.go_data) {
      // Server-hydrated node - map to canvas format
      const newNodeData = {
        key: generatedNodeData.id,
        type: generatedNodeData.type,
        go_data: generatedNodeData.go_data,
        position: generatedNodeData.position || { x: 0, y: 0 },
        ...(generatedNodeData.data && { data: generatedNodeData.data }),
      };

      const newNode = canvasRef.current.createNode(newNodeData);
      await saveNodeDataHandler(
        newNode?.data,
        newNode?.data?.go_data,
        {
          warnings: ["Please configure this node."],
        },
        false,
      );

      onNodeCreated(generatedNodeData.id, newNode);
      return newNode;
    }

    // Legacy format - handle Integration nodes
    const generatedNodeType =
      generatedNodeData?.config?.type || generatedNodeData?.type;

    if (generatedNodeType === "Integration") {
      const node = nodeIdMap[generatedNodeData?.config?.id];
      if (!node || !node?.type === "Integration") return;
      const publishedByAsset = await getPublishedByAssets(node?.id);
      if (publishedByAsset?.status === SUCCESS) {
        const newNodeData = {
          ...(node || {}),
          go_data: {
            flow: {
              ...(publishedByAsset?.result || {}),
            },
          },
          key: generatedNodeData?.id,
          description: generatedNodeData?.config?.name,
          hoverDescription: generatedNodeData?.config?.description,
          name: generatedNodeData?.config?.integration,
        };

        const newNode = canvasRef.current.createNode(newNodeData);
        await saveNodeDataHandler(
          newNode?.data,
          newNode?.data?.go_data,
          {
            warnings: ["Please configure this node."],
          },
          false,
        );

        onNodeCreated(generatedNodeData?.id, newNode);
        return newNode;
      }
    }

    // If node doesn't match expected formats, skip it
    return undefined;
  };

  const processTriggerNode = async ({
    generatedNodeData,
    nodeIdMap,
    saveNodeDataHandler,
    onNodeCreated,
  }) => {
    // Check if this is already a server-hydrated node
    if (generatedNodeData?.id && generatedNodeData?.type && generatedNodeData?.go_data) {
      // Server-hydrated trigger node - map to canvas format
      const newNodeData = {
        key: generatedNodeData.id,
        type: generatedNodeData.type,
        go_data: generatedNodeData.go_data,
        position: generatedNodeData.position || { x: 0, y: 0 },
        ...(generatedNodeData.data && { data: generatedNodeData.data }),
      };

      const newNode = canvasRef.current.createNode(newNodeData);
      await saveNodeDataHandler(
        newNode?.data,
        newNode?.data?.go_data,
        {
          warnings: ["Please configure this node."],
        },
        false,
      );

      onNodeCreated(generatedNodeData.id, newNode);
      return newNode;
    }

    // Legacy format - try to find node in nodeIdMap
    const node = nodeIdMap[generatedNodeData?.config?.id];
    if (node && node.id && node.type && node.go_data) {
      // Node found in map - use it directly
      const newNodeData = {
        key: node.id,
        type: node.type,
        go_data: node.go_data,
        position: node.position || { x: 0, y: 0 },
        ...(node.data && { data: node.data }),
      };

      const newNode = canvasRef.current.createNode(newNodeData);
      await saveNodeDataHandler(
        newNode?.data,
        newNode?.data?.go_data,
        {
          warnings: ["Please configure this node."],
        },
        false,
      );

      onNodeCreated(generatedNodeData?.id || node.id, newNode);
      return newNode;
    }

    // If trigger node doesn't match expected formats, skip it
    return undefined;
  };

  const processActionNode = async ({
    generatedNodeData,
    nodeIdMap,
    saveNodeDataHandler,
    onNodeCreated,
  }) => {
    if (generatedNodeData?.length) {
      for (const action of generatedNodeData) {
        await processNode({
          generatedNodeData: action,
          nodeIdMap,
          saveNodeDataHandler,
          onNodeCreated,
        });
      }
    }
  };

  const processWorkflowData = async (data, saveNodeDataHandler, nodeIdMap) => {
    const hashSet = new Set();
    await processTriggerNode({
      generatedNodeData: data?.trigger,
      nodeIdMap,
      saveNodeDataHandler,
      onNodeCreated: (nodeId, newNode) => {
        hashSet.add(nodeId);
      },
    });

    if (data?.actions) {
      await processActionNode({
        generatedNodeData: data?.actions,
        nodeIdMap,
        saveNodeDataHandler,
        onNodeCreated: (nodeId, newNode) => {
          hashSet.add(nodeId);
        },
      });
    }

    if (data?.links?.length) {
      for (const link of data.links) {
        if (hashSet.has(link.from) && hashSet.has(link.to)) {
          canvasRef.current.createLink({
            from: link.from,
            to: link.to,
          });
        }
      }
    }
  };

  return { processFormData, processWorkflowData };
};
