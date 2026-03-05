import { useState, useCallback, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import * as go from "gojs";

export function useStickyNoteToolbar(diagramRef, onNodeUpdate) {
  const [activeNote, setActiveNote] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef(null);

  const showToolbar = useCallback(
    (node) => {
      if (!diagramRef.current || !node) return;

      const diagram = diagramRef.current.getDiagram();
      if (!diagram) return;

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      const nodeBounds = node.actualBounds;
      const viewPoint = diagram.transformDocToView(
        new go.Point(nodeBounds.centerX, nodeBounds.top - 10)
      );

      setActiveNote(node);
      setToolbarPosition({ x: viewPoint.x, y: viewPoint.y });
      setIsVisible(true);
    },
    [diagramRef]
  );

  const hideToolbar = useCallback((delay = 150) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setActiveNote(null);
    }, delay);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const updateNote = useCallback(
    (updates) => {
      if (!activeNote || !diagramRef.current) return;

      const diagram = diagramRef.current.getDiagram();
      if (!diagram) return;

      diagram.startTransaction("update sticky note");
      Object.entries(updates).forEach(([key, value]) => {
        diagram.model.setDataProperty(activeNote.data, key, value);
      });
      diagram.commitTransaction("update sticky note");

      if (onNodeUpdate) {
        onNodeUpdate(activeNote.data.key, updates);
      }
    },
    [activeNote, diagramRef, onNodeUpdate]
  );

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return {
    activeNote,
    toolbarPosition,
    isVisible,
    showToolbar,
    hideToolbar,
    cancelHide,
    updateNote,
    nodeData: activeNote?.data || {},
  };
}

export function createStickyNoteHandlers(toolbarHook) {
  const { showToolbar, hideToolbar } = toolbarHook;

  return {
    onMouseEnter: (e, node) => {
      if (node.diagram?.currentTool instanceof go.TextEditingTool) {
        return;
      }
      showToolbar(node);
    },
    onMouseLeave: (e, node) => {
      hideToolbar(200);
    },
  };
}
