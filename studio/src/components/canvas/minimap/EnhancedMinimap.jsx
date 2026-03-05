import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, MapPin } from "lucide-react";
import * as go from "gojs";
import { cn } from "@/lib/utils";

const NODE_STATUS_COLORS = {
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  running: "#3B82F6",
  pending: "#9CA3AF",
  configured: "#6366F1",
  needsSetup: "#F97316",
};

function getNodeStatusColor(nodeData) {
  if (nodeData._state === "running") return NODE_STATUS_COLORS.running;
  if (nodeData.errors?.length > 0) return NODE_STATUS_COLORS.error;
  if (nodeData.warnings?.length > 0) return NODE_STATUS_COLORS.warning;
  if (nodeData._executionResult?.success) return NODE_STATUS_COLORS.success;
  if (nodeData._executionResult?.success === false) return NODE_STATUS_COLORS.error;
  if (nodeData.go_data) return NODE_STATUS_COLORS.configured;
  if (!nodeData.type) return NODE_STATUS_COLORS.pending;
  return NODE_STATUS_COLORS.needsSetup;
}

export function EnhancedMinimap({
  diagramRef,
  className,
  defaultCollapsed = false,
  showLegend = true,
}) {
  const overviewRef = useRef(null);
  const overviewDivRef = useRef(null);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [nodeStats, setNodeStats] = useState({
    total: 0,
    success: 0,
    error: 0,
    running: 0,
  });

  const initOverview = useCallback(() => {
    if (!overviewDivRef.current || overviewRef.current) return;

    const diagram = diagramRef.current?.getDiagram?.();
    if (!diagram) {
      setTimeout(initOverview, 200);
      return;
    }

    const $ = go.GraphObject.make;

    const overview = $(go.Overview, overviewDivRef.current, {
      observed: diagram,
      contentAlignment: go.Spot.Center,
    });

    overview.box = $(go.Part, { selectable: false }).add(
      $(go.Shape, "RoundedRectangle", {
        fill: "rgba(59, 130, 246, 0.1)",
        stroke: "#3B82F6",
        strokeWidth: 2,
        parameter1: 4,
      })
    );

    overviewRef.current = overview;
  }, [diagramRef]);

  const updateNodeStats = useCallback(() => {
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram) return;

    let total = 0;
    let success = 0;
    let error = 0;
    let running = 0;

    diagram.nodes.each((node) => {
      if (node.data.template === "stickyNote") return;
      total++;
      if (node.data._state === "running") running++;
      else if (node.data.errors?.length > 0) error++;
      else if (node.data._executionResult?.success) success++;
    });

    setNodeStats({ total, success, error, running });
  }, [diagramRef]);

  useEffect(() => {
    if (!collapsed) {
      setTimeout(initOverview, 100);
    }
    return () => {
      if (overviewRef.current) {
        overviewRef.current.div = null;
        overviewRef.current = null;
      }
    };
  }, [collapsed, initOverview]);

  useEffect(() => {
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram) return;

    const listener = () => updateNodeStats();
    diagram.addModelChangedListener(listener);
    updateNodeStats();

    return () => {
      diagram.removeModelChangedListener(listener);
    };
  }, [diagramRef, updateNodeStats]);

  const handleMinimapClick = useCallback(
    (e) => {
      if (!overviewRef.current || !diagramRef.current) return;

      const overview = overviewRef.current;
      const diagram = diagramRef.current.getDiagram();
      if (!diagram) return;

      const rect = overviewDivRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const docPoint = overview.transformViewToDoc(new go.Point(x, y));
      diagram.centerRect(
        new go.Rect(
          docPoint.x - diagram.viewportBounds.width / 2,
          docPoint.y - diagram.viewportBounds.height / 2,
          diagram.viewportBounds.width,
          diagram.viewportBounds.height
        )
      );
    },
    [diagramRef]
  );

  return (
    <motion.div
      className={cn(
        "absolute bottom-4 right-4 z-30",
        "bg-white rounded-xl border border-zinc-200/80",
        "overflow-hidden",
        className
      )}
      style={{
        boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.08), 0 1px 4px 0 rgba(0, 0, 0, 0.04)",
      }}
      animate={{ width: collapsed ? 44 : 200, height: collapsed ? 44 : 180 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between px-2.5 py-2 border-b border-zinc-100">
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
            <span className="text-xs font-medium text-zinc-600">Map</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-xl hover:bg-zinc-100 transition-colors",
            collapsed && "mx-auto"
          )}
          title={collapsed ? "Expand minimap" : "Collapse minimap"}
        >
          {collapsed ? (
            <Maximize2 className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
          ) : (
            <Minimize2 className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
          )}
        </button>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              ref={overviewDivRef}
              className="w-full h-[110px] cursor-crosshair bg-zinc-50/50"
              onClick={handleMinimapClick}
            />

            {showLegend && (
              <div className="flex items-center justify-center gap-3 px-2 py-1.5 border-t border-zinc-100">
                <LegendItem color={NODE_STATUS_COLORS.success} count={nodeStats.success} />
                <LegendItem color={NODE_STATUS_COLORS.error} count={nodeStats.error} />
                <LegendItem color={NODE_STATUS_COLORS.running} count={nodeStats.running} />
                <span className="text-[10px] text-zinc-400">
                  {nodeStats.total} nodes
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LegendItem({ color, count }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-zinc-600">{count}</span>
    </div>
  );
}

export { NODE_STATUS_COLORS, getNodeStatusColor };
