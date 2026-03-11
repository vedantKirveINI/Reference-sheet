export function computeConvexHull(points) {
  if (points.length < 3) return points;

  const sortedPoints = [...points].sort((a, b) => a.x - b.x || a.y - b.y);

  function cross(o, a, b) {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  }

  const lower = [];
  for (let i = 0; i < sortedPoints.length; i++) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], sortedPoints[i]) <= 0
    ) {
      lower.pop();
    }
    lower.push(sortedPoints[i]);
  }

  const upper = [];
  for (let i = sortedPoints.length - 1; i >= 0; i--) {
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], sortedPoints[i]) <= 0
    ) {
      upper.pop();
    }
    upper.push(sortedPoints[i]);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function getNodeCornerPoints(bounds, padding = 0) {
  return [
    { x: bounds.x - padding, y: bounds.y - padding },
    { x: bounds.x + bounds.width + padding, y: bounds.y - padding },
    { x: bounds.x + bounds.width + padding, y: bounds.y + bounds.height + padding },
    { x: bounds.x - padding, y: bounds.y + bounds.height + padding },
  ];
}

export function createRoundedHullPath(hullPoints, cornerRadius = 15) {
  if (!hullPoints || hullPoints.length < 2) return "M 0 0";

  const n = hullPoints.length;
  let path = "";

  for (let i = 0; i < n; i++) {
    const curr = hullPoints[i];
    const next = hullPoints[(i + 1) % n];
    const prev = hullPoints[(i - 1 + n) % n];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    if (len1 === 0 || len2 === 0) continue;

    const r = Math.min(cornerRadius, len1 / 2, len2 / 2);

    const corner1X = curr.x - (dx1 / len1) * r;
    const corner1Y = curr.y - (dy1 / len1) * r;
    const corner2X = curr.x + (dx2 / len2) * r;
    const corner2Y = curr.y + (dy2 / len2) * r;

    if (i === 0) {
      path += `M ${corner1X} ${corner1Y} `;
    }

    path += `L ${corner1X} ${corner1Y} Q ${curr.x} ${curr.y} ${corner2X} ${corner2Y} `;
  }

  path += "Z";
  return path;
}

export function createPillPath(bounds, cornerRadius = 50) {
  const x = isFinite(bounds.x) ? bounds.x : 0;
  const y = isFinite(bounds.y) ? bounds.y : 0;
  const width = isFinite(bounds.width) && bounds.width > 0 ? bounds.width : 200;
  const height = isFinite(bounds.height) && bounds.height > 0 ? bounds.height : 120;
  const r = Math.min(cornerRadius, height / 2, width / 2);

  return `M ${x + r} ${y} L ${x + width - r} ${y} Q ${x + width} ${y} ${x + width} ${y + r} L ${x + width} ${y + height - r} Q ${x + width} ${y + height} ${x + width - r} ${y + height} L ${x + r} ${y + height} Q ${x} ${y + height} ${x} ${y + height - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}

export function computeGroupBounds(memberNodes, padding = 24) {
  const defaultBounds = { x: 0, y: 0, width: 200, height: 120 };
  
  if (!memberNodes || memberNodes.length === 0) {
    return defaultBounds;
  }

  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  memberNodes.forEach((node) => {
    const b = node.actualBounds || node.bounds;
    if (!b) return;
    
    const bx = isFinite(b.x) ? b.x : 0;
    const by = isFinite(b.y) ? b.y : 0;
    const bw = isFinite(b.width) && b.width > 0 ? b.width : 100;
    const bh = isFinite(b.height) && b.height > 0 ? b.height : 100;
    
    minX = Math.min(minX, bx);
    minY = Math.min(minY, by);
    maxX = Math.max(maxX, bx + bw);
    maxY = Math.max(maxY, by + bh);
  });

  if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
    return defaultBounds;
  }

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return {
    x: minX - padding,
    y: minY - padding,
    width: isFinite(width) && width > 0 ? width : 200,
    height: isFinite(height) && height > 0 ? height : 120,
  };
}

export function computePathFollowingGeometry(memberNodes, padding = 24, cornerRadius = 20) {
  if (!memberNodes || memberNodes.length === 0) {
    return { path: createPillPath({ x: 0, y: 0, width: 200, height: 120 }, cornerRadius), bounds: { x: 0, y: 0, width: 200, height: 120 } };
  }

  const allPoints = [];

  memberNodes.forEach((node) => {
    const b = node.actualBounds || node.bounds;
    if (!b) return;
    const corners = getNodeCornerPoints(
      { x: b.x, y: b.y, width: b.width, height: b.height },
      padding
    );
    allPoints.push(...corners);
  });

  if (allPoints.length < 3) {
    const bounds = computeGroupBounds(memberNodes, padding);
    return { path: createPillPath(bounds, cornerRadius), bounds };
  }

  const hull = computeConvexHull(allPoints);
  const path = createRoundedHullPath(hull, cornerRadius);

  const minX = Math.min(...hull.map((p) => p.x));
  const minY = Math.min(...hull.map((p) => p.y));
  const maxX = Math.max(...hull.map((p) => p.x));
  const maxY = Math.max(...hull.map((p) => p.y));

  return {
    path,
    bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
  };
}
