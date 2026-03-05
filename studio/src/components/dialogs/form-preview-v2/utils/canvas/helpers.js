import _ from "lodash";

export function findOneNodeById(canvasData, nodeId) {
  try {
    let canvas = canvasData || {};
    if (!_.isObject(canvas)) {
      canvas = JSON.parse(canvas || "{}");
    }
    if (_.isEmpty(canvas)) return { status: "failed", result: null };
    if (!nodeId) return { status: "failed", result: null };
    
    const currentNode = _.find(canvas?.nodeDataArray || [], (ele) => {
      return ele?.key && ele?.key === nodeId;
    });
    return { status: "success", result: currentNode };
  } catch (error) {
    return { status: "failed", result: null };
  }
}

export function getLinkStatsForId(canvasData, nodeId) {
  try {
    let canvas = canvasData || {};
    if (!_.isObject(canvas)) {
      canvas = JSON.parse(canvas || "{}");
    }
    if (_.isEmpty(canvas) || !nodeId) {
      return { status: "failed", result: null };
    }
    
    const currentNode = findOneNodeById(canvas, nodeId)?.result;
    if (_.isEmpty(currentNode?.key)) {
      return { status: "failed", result: null };
    }
    
    const linkDataArray = canvas?.linkDataArray || [];
    const inLinks = { counts: { all: 0 }, nodes: [] };
    const outLinks = { counts: { all: 0 }, nodes: [] };
    
    for (const link of linkDataArray) {
      if (link?.from && link?.from === nodeId) {
        outLinks.counts.all += 1;
        const outNode = findOneNodeById(canvas, link?.to)?.result;
        if (outNode) {
          if (outLinks.counts[outNode?.type] === undefined) {
            outLinks.counts[outNode?.type] = 0;
          }
          outLinks.counts[outNode?.type] += 1;
          outLinks.nodes.push(outNode);
        }
      }
      if (link?.to && link?.to === nodeId) {
        inLinks.counts.all += 1;
        const inNode = findOneNodeById(canvas, link?.from)?.result;
        if (inNode) {
          if (inLinks.counts[inNode?.type] === undefined) {
            inLinks.counts[inNode?.type] = 0;
          }
          inLinks.counts[inNode?.type] += 1;
          inLinks.nodes.push(inNode);
        }
      }
    }
    
    return { status: "success", result: { in_links: inLinks, out_links: outLinks } };
  } catch (error) {
    return { status: "failed", result: null };
  }
}

const SKIP_NODE_TYPES = ["Success Setup", "SUCCESS", "FAILED"];

export function predictStartNode(payload) {
  try {
    let canvasData = payload?._r || "{}";
    if (!_.isObject(canvasData)) {
      canvasData = JSON.parse(canvasData);
    }
    
    if (!canvasData?.nodeDataArray?.length) {
      return { status: "failed", result: null, error: "No nodes found" };
    }
    
    const startNodes = [];
    let skippedExecutable = 0;
    let skippedHasInLinks = 0;
    let skippedType = 0;

    for (const node of canvasData.nodeDataArray) {
      if (
        node?.tf_data?.config?.is_executable === false ||
        node?.go_data?.is_executable === false ||
        node?.is_executable === false
      ) {
        skippedExecutable += 1;
        continue;
      }
      if (SKIP_NODE_TYPES.includes(node?.type)) {
        skippedType += 1;
        continue;
      }

      const nodeStats = getLinkStatsForId(canvasData, node?.key)?.result;

      if (nodeStats?.in_links?.counts?.all !== 0) {
        skippedHasInLinks += 1;
        continue;
      }
      startNodes.push(node);
    }

    console.log("[FormPreview] predictStartNode:", "candidates (in_links=0):", startNodes.length, "skipped is_executable=false:", skippedExecutable, "skipped has in_links:", skippedHasInLinks, "skipped type:", skippedType, "startNode keys:", startNodes.map((n) => ({ key: n?.key, type: n?.type })));

    if (startNodes.length === 0) {
      return { status: "failed", result: null, error: "No start node found" };
    }

    if (startNodes.length > 1) {
      return {
        status: "failed",
        result: null,
        error: "MULTIPLE_START_NODES",
        errorNodes: startNodes.map((n) => ({
          nodeKey: n?.key?.toString(),
          nodeType: n?.type,
          nodeName: n?.tf_data?.config?.settings?.title || n?.tf_data?.name || n?.text || n?.type,
        })),
      };
    }
    
    return { status: "success", result: startNodes[0] };
  } catch (error) {
    return { status: "failed", result: null, error: error?.message || "Error predicting start node" };
  }
}
