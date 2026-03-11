import React, { useEffect, useRef, useCallback } from "react";
import * as go from "gojs";

const EXECUTION_COLORS = {
  running: "#3B82F6",
  success: "#22C55E",
  error: "#EF4444",
  pending: "#9CA3AF",
};

const ANIMATION_CONFIG = {
  duration: 800,
  strokeWidth: 4,
  dashArray: [8, 4],
};

export function useExecutionVisualizer(diagramRef) {
  const animationsRef = useRef(new Map());

  const animateLinkExecution = useCallback((link, color = EXECUTION_COLORS.running) => {
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram || !link) return null;

    const linkKey = link.data?.key;
    if (!linkKey) return null;

    if (animationsRef.current.has(linkKey)) {
      return animationsRef.current.get(linkKey);
    }

    const animation = new go.Animation();
    animation.duration = ANIMATION_CONFIG.duration;
    animation.easing = go.Animation.EaseLinear;
    animation.runCount = Infinity;

    const linkShape = link.findObject("LINKSHAPE");
    if (linkShape) {
      linkShape.strokeDashArray = ANIMATION_CONFIG.dashArray;
      linkShape.stroke = color;
      linkShape.strokeWidth = ANIMATION_CONFIG.strokeWidth;
      animation.add(linkShape, "strokeDashOffset", 24, 0);
    }

    animationsRef.current.set(linkKey, { animation, link, originalStroke: linkShape?.stroke });
    animation.start();
    return { animation, link };
  }, [diagramRef]);

  const startLinkAnimation = useCallback((linkKey, color) => {
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram) return;

    const link = diagram.findLinkForKey(linkKey);
    if (!link) return;

    animateLinkExecution(link, color);
  }, [diagramRef, animateLinkExecution]);

  const stopLinkAnimation = useCallback((linkKey) => {
    const animData = animationsRef.current.get(linkKey);
    if (!animData) return;

    animData.animation.stop();

    const linkShape = animData.link?.findObject("LINKSHAPE");
    if (linkShape) {
      linkShape.strokeDashArray = null;
      linkShape.strokeWidth = 2;
    }
    animationsRef.current.delete(linkKey);
  }, []);

  const stopAllAnimations = useCallback(() => {
    animationsRef.current.forEach((animData, key) => {
      stopLinkAnimation(key);
    });
  }, [stopLinkAnimation]);

  const highlightExecutionPath = useCallback((nodeKeys, options = {}) => {
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram) return;

    const { duration = 500, color = EXECUTION_COLORS.running } = options;

    nodeKeys.forEach((key, index) => {
      setTimeout(() => {
        const node = diagram.findNodeForKey(key);
        if (!node) return;

        diagram.startTransaction("highlight");
        diagram.model.setDataProperty(node.data, "_executionHighlight", true);
        diagram.commitTransaction("highlight");

        const animation = new go.Animation();
        animation.duration = duration;

        const shape = node.findObject("SELECTIONADORNMENTGO");
        if (shape) {
          animation.add(shape, "stroke", shape.stroke, color);
        }

        animation.start();

        setTimeout(() => {
          diagram.startTransaction("unhighlight");
          diagram.model.setDataProperty(node.data, "_executionHighlight", false);
          diagram.commitTransaction("unhighlight");
        }, duration * 2);
      }, index * duration);
    });
  }, [diagramRef]);

  const pulseNode = useCallback((nodeKey, status) => {
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram) return;

    const node = diagram.findNodeForKey(nodeKey);
    if (!node) return;

    const color = EXECUTION_COLORS[status] || EXECUTION_COLORS.pending;

    const animation = new go.Animation();
    animation.duration = 300;
    animation.runCount = 2;
    animation.reversible = true;

    const shape = node.findObject("SELECTIONADORNMENTGO");
    if (shape) {
      animation.add(shape, "scale", 1, 1.05);
      animation.add(shape, "strokeWidth", shape.strokeWidth || 1, 3);
    }

    animation.start();
  }, [diagramRef]);

  useEffect(() => {
    return () => {
      stopAllAnimations();
    };
  }, [stopAllAnimations]);

  return {
    startLinkAnimation,
    stopLinkAnimation,
    stopAllAnimations,
    highlightExecutionPath,
    pulseNode,
    EXECUTION_COLORS,
  };
}

export function ExecutionTimeBadge({ executionTime, className }) {
  if (!executionTime) return null;

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono",
        "bg-gray-100 text-gray-600",
        className
      )}
    >
      {formatTime(executionTime)}
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export { EXECUTION_COLORS };
