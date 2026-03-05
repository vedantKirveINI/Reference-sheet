import React, { useState, useEffect, useCallback } from "react";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

const ZOOM_STEPS = [25, 50, 75, 100, 125, 150, 200, 300];

function findNextZoom(current, direction) {
  const pct = Math.round(current * 100);
  if (direction === "in") {
    for (const step of ZOOM_STEPS) {
      if (step > pct) return step;
    }
    return ZOOM_STEPS[ZOOM_STEPS.length - 1];
  } else {
    for (let i = ZOOM_STEPS.length - 1; i >= 0; i--) {
      if (ZOOM_STEPS[i] < pct) return ZOOM_STEPS[i];
    }
    return ZOOM_STEPS[0];
  }
}

export default function ZoomControlsToolbar({ canvasRef }) {
  const [zoomPct, setZoomPct] = useState(100);

  const syncZoom = useCallback(() => {
    const diagram = canvasRef?.current?.getDiagram?.();
    if (diagram) {
      setZoomPct(Math.round(diagram.scale * 100));
    }
  }, [canvasRef]);

  useEffect(() => {
    let diagram = canvasRef?.current?.getDiagram?.();
    let retryTimer;

    const bind = () => {
      diagram = canvasRef?.current?.getDiagram?.();
      if (!diagram) {
        retryTimer = setTimeout(bind, 500);
        return;
      }
      syncZoom();
      diagram.addDiagramListener("ViewportBoundsChanged", listener);
    };

    const listener = (e) => {
      if (e.diagram) {
        setZoomPct(Math.round(e.diagram.scale * 100));
      }
    };

    bind();

    return () => {
      clearTimeout(retryTimer);
      try {
        diagram?.removeDiagramListener?.("ViewportBoundsChanged", listener);
      } catch {}
    };
  }, [canvasRef, syncZoom]);

  const applyZoom = (pct) => {
    const diagram = canvasRef?.current?.getDiagram?.();
    if (!diagram) return;
    diagram.startTransaction("zoom");
    diagram.scale = pct / 100;
    diagram.commitTransaction("zoom");
    setZoomPct(pct);
  };

  const handleZoomIn = () => {
    const diagram = canvasRef?.current?.getDiagram?.();
    if (!diagram) return;
    applyZoom(findNextZoom(diagram.scale, "in"));
  };

  const handleZoomOut = () => {
    const diagram = canvasRef?.current?.getDiagram?.();
    if (!diagram) return;
    applyZoom(findNextZoom(diagram.scale, "out"));
  };

  const handleFitToScreen = () => {
    const diagram = canvasRef?.current?.getDiagram?.();
    if (!diagram) return;
    diagram.zoomToFit();
    diagram.centerRect(diagram.documentBounds);
    setZoomPct(Math.round(diagram.scale * 100));
  };

  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 z-30",
        "flex items-center gap-0.5 px-1 py-1",
        "bg-white rounded-lg shadow-md border border-gray-200",
        "select-none"
      )}
    >
      <button
        onClick={handleZoomOut}
        title="Zoom Out (⌘−)"
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <span
        className="min-w-[3rem] text-center text-xs font-medium text-gray-600 tabular-nums cursor-default"
        title="Current zoom level"
      >
        {zoomPct}%
      </span>

      <button
        onClick={handleZoomIn}
        title="Zoom In (⌘+)"
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-gray-200 mx-0.5" />

      <button
        onClick={handleFitToScreen}
        title="Fit to Screen (⌘0)"
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}
