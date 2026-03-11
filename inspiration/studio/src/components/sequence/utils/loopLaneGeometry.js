import * as go from "gojs";

const LANE_HEIGHT = 48;
const LANE_PADDING = 16;

export function sortNodesByFlow(memberNodes) {
  if (!memberNodes || memberNodes.length === 0) return [];
  
  const nodes = [...memberNodes];
  nodes.sort((a, b) => {
    const ax = a.location?.x ?? a.actualBounds?.x ?? 0;
    const bx = b.location?.x ?? b.actualBounds?.x ?? 0;
    return ax - bx;
  });
  
  return nodes;
}

export function getNodeCenter(node) {
  if (!node) return { x: 0, y: 0 };
  
  const bounds = node.actualBounds || node.bounds;
  if (!bounds) {
    const loc = node.location;
    return { x: loc?.x ?? 0, y: loc?.y ?? 0 };
  }
  
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

export function getNodeBounds(node) {
  if (!node) return { x: 0, y: 0, width: 100, height: 80 };
  
  const bounds = node.actualBounds || node.bounds;
  if (!bounds) {
    const loc = node.location;
    return { 
      x: (loc?.x ?? 0) - 50, 
      y: (loc?.y ?? 0) - 40, 
      width: 100, 
      height: 80 
    };
  }
  
  return {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width || 100,
    height: bounds.height || 80,
  };
}

export function computeLanePath(memberNodes, laneHeight = LANE_HEIGHT, padding = LANE_PADDING) {
  const sortedNodes = sortNodesByFlow(memberNodes);
  
  if (sortedNodes.length === 0) {
    return {
      path: createCapsulePath(0, 0, 200, laneHeight),
      bounds: { x: 0, y: 0, width: 200, height: laneHeight },
      nodeCenters: [],
    };
  }
  
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  sortedNodes.forEach((node) => {
    const bounds = getNodeBounds(node);
    minX = Math.min(minX, bounds.x);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    minY = Math.min(minY, bounds.y);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  });
  
  const x = minX - padding;
  const width = maxX - minX + padding * 2;
  const y = minY - padding;
  const height = maxY - minY + padding * 2;
  
  const r = Math.min(laneHeight / 2, height / 2, 24);
  
  const path = createRoundedRectPath(x, y, width, height, r);
  
  const nodeCenters = sortedNodes.map(getNodeCenter);
  
  return {
    path,
    bounds: { x, y, width, height },
    nodeCenters,
  };
}

function createCapsulePath(x, y, width, height) {
  const r = Math.min(height / 2, width / 2);
  
  return `
    M ${x + r} ${y}
    L ${x + width - r} ${y}
    A ${r} ${r} 0 0 1 ${x + width - r} ${y + height}
    L ${x + r} ${y + height}
    A ${r} ${r} 0 0 1 ${x + r} ${y}
    Z
  `.replace(/\s+/g, " ").trim();
}

function createRoundedRectPath(x, y, width, height, r) {
  const radius = Math.min(r, height / 2, width / 2);
  
  return `
    M ${x + radius} ${y}
    L ${x + width - radius} ${y}
    Q ${x + width} ${y} ${x + width} ${y + radius}
    L ${x + width} ${y + height - radius}
    Q ${x + width} ${y + height} ${x + width - radius} ${y + height}
    L ${x + radius} ${y + height}
    Q ${x} ${y + height} ${x} ${y + height - radius}
    L ${x} ${y + radius}
    Q ${x} ${y} ${x + radius} ${y}
    Z
  `.replace(/\s+/g, " ").trim();
}

export function computeLaneInsertPoints(memberNodes, laneHeight = LANE_HEIGHT) {
  const sortedNodes = sortNodesByFlow(memberNodes);
  const insertPoints = [];
  
  if (sortedNodes.length < 2) return insertPoints;
  
  for (let i = 0; i < sortedNodes.length - 1; i++) {
    const nodeA = sortedNodes[i];
    const nodeB = sortedNodes[i + 1];
    const centerA = getNodeCenter(nodeA);
    const centerB = getNodeCenter(nodeB);
    
    insertPoints.push({
      x: (centerA.x + centerB.x) / 2,
      y: (centerA.y + centerB.y) / 2,
      fromKey: nodeA.key,
      toKey: nodeB.key,
    });
  }
  
  return insertPoints;
}

export const LANE_DEFAULTS = {
  height: LANE_HEIGHT,
  padding: LANE_PADDING,
};
