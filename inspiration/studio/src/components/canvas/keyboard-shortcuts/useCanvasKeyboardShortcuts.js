import { useEffect, useCallback, useRef } from "react";
import { hasActiveEscapeLayers } from "@src/contexts/EscapeStackContext";

export const CANVAS_SHORTCUTS = {
  DELETE: { key: "Delete", label: "Delete", description: "Delete selected" },
  BACKSPACE: { key: "Backspace", label: "⌫", description: "Delete selected" },
  DUPLICATE: { key: "d", ctrl: true, label: "⌘D", description: "Duplicate node" },
  UNDO: { key: "z", ctrl: true, label: "⌘Z", description: "Undo" },
  REDO: { key: "z", ctrl: true, shift: true, label: "⌘⇧Z", description: "Redo" },
  REDO_ALT: { key: "y", ctrl: true, label: "⌘Y", description: "Redo" },
  FIND: { key: "f", ctrl: true, label: "⌘F", description: "Find nodes" },
  SELECT_ALL: { key: "a", ctrl: true, label: "⌘A", description: "Select all" },
  ESCAPE: { key: "Escape", label: "Esc", description: "Deselect / Cancel" },
  ENTER: { key: "Enter", label: "Enter", description: "Edit selected node" },
  ARROW_UP: { key: "ArrowUp", label: "↑", description: "Navigate up" },
  ARROW_DOWN: { key: "ArrowDown", label: "↓", description: "Navigate down" },
  ARROW_LEFT: { key: "ArrowLeft", label: "←", description: "Navigate left" },
  ARROW_RIGHT: { key: "ArrowRight", label: "→", description: "Navigate right" },
  STICKY_NOTE: { key: "n", shift: true, label: "⇧N", description: "Add sticky note" },
  ADD_NODE: { key: "a", label: "A", description: "Add node" },
  AUTO_ALIGN: { key: "a", ctrl: true, shift: true, label: "⌘⇧A", description: "Auto align" },
  ZOOM_IN: { key: "=", ctrl: true, label: "⌘+", description: "Zoom in" },
  ZOOM_OUT: { key: "-", ctrl: true, label: "⌘-", description: "Zoom out" },
  ZOOM_FIT: { key: "0", ctrl: true, label: "⌘0", description: "Fit to screen" },
  RUN_NODE: { key: "r", ctrl: true, label: "⌘R", description: "Run selected node" },
};

function matchesShortcut(event, shortcut) {
  const ctrlKey = event.ctrlKey || event.metaKey;
  const shiftKey = event.shiftKey;
  
  if (shortcut.ctrl && !ctrlKey) return false;
  if (!shortcut.ctrl && ctrlKey) return false;
  if (shortcut.shift && !shiftKey) return false;
  if (!shortcut.shift && shiftKey && shortcut.ctrl) return false;
  
  return event.key === shortcut.key || event.key.toLowerCase() === shortcut.key.toLowerCase();
}

export function useCanvasKeyboardShortcuts(canvasRef, handlers = {}) {
  const {
    onDelete,
    onDuplicate,
    onUndo,
    onRedo,
    onFind,
    onSelectAll,
    onEscape,
    onEnter,
    onNavigate,
    onAddStickyNote,
    onAddNode,
    onAutoAlign,
    onZoomIn,
    onZoomOut,
    onZoomFit,
    onRunNode,
  } = handlers;

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const handleKeyDown = useCallback(
    (event) => {
      const target = event.target;
      const isInputElement =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.classList.contains("goTXarea");

      if (isInputElement && event.key !== "Escape") {
        return;
      }

      const diagram = canvasRef?.current?.getDiagram?.();
      if (!diagram) return;

      if (diagram.currentTool instanceof window.go?.TextEditingTool) {
        if (event.key !== "Escape") return;
      }

      const h = handlersRef.current;

      if (matchesShortcut(event, CANVAS_SHORTCUTS.DELETE) || 
          matchesShortcut(event, CANVAS_SHORTCUTS.BACKSPACE)) {
        event.preventDefault();
        h.onDelete?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.DUPLICATE)) {
        event.preventDefault();
        h.onDuplicate?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.REDO) || 
          matchesShortcut(event, CANVAS_SHORTCUTS.REDO_ALT)) {
        event.preventDefault();
        h.onRedo?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.UNDO)) {
        event.preventDefault();
        h.onUndo?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.FIND)) {
        event.preventDefault();
        h.onFind?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.SELECT_ALL)) {
        event.preventDefault();
        h.onSelectAll?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.AUTO_ALIGN)) {
        event.preventDefault();
        h.onAutoAlign?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ESCAPE)) {
        // Skip if escape stack has active layers (e.g., drawers, modals)
        // The EscapeStackContext will handle the escape event instead
        if (hasActiveEscapeLayers()) {
          return;
        }
        event.preventDefault();
        h.onEscape?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ENTER)) {
        event.preventDefault();
        h.onEnter?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.RUN_NODE)) {
        event.preventDefault();
        h.onRunNode?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ARROW_UP)) {
        event.preventDefault();
        h.onNavigate?.("up");
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ARROW_DOWN)) {
        event.preventDefault();
        h.onNavigate?.("down");
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ARROW_LEFT)) {
        event.preventDefault();
        h.onNavigate?.("left");
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ARROW_RIGHT)) {
        event.preventDefault();
        h.onNavigate?.("right");
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.STICKY_NOTE) && event.shiftKey) {
        event.preventDefault();
        h.onAddStickyNote?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ZOOM_IN)) {
        event.preventDefault();
        h.onZoomIn?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ZOOM_OUT)) {
        event.preventDefault();
        h.onZoomOut?.();
        return;
      }

      if (matchesShortcut(event, CANVAS_SHORTCUTS.ZOOM_FIT)) {
        event.preventDefault();
        h.onZoomFit?.();
        return;
      }
    },
    [canvasRef]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: CANVAS_SHORTCUTS,
  };
}

export function createKeyboardShortcutHandlers(canvasRef, options = {}) {
  const {
    onNodeDoubleClick,
    showAddNodeDrawer,
    autoAlignHandler,
    showNodeFinder,
  } = options;

  const getDiagram = () => canvasRef?.current?.getDiagram?.();

  return {
    onDelete: () => {
      const diagram = getDiagram();
      if (diagram && !diagram.isReadOnly) {
        diagram.commandHandler.deleteSelection();
      }
    },
    onDuplicate: () => {
      const diagram = getDiagram();
      if (diagram && !diagram.isReadOnly) {
        const selection = diagram.selection.first();
        if (selection) {
          const node = canvasRef.current?.createNode?.({
            ...selection.data,
            key: undefined,
            location: undefined,
          }, {
            location: {
              x: selection.location.x + 50,
              y: selection.location.y + 50,
            },
          });
        }
      }
    },
    onUndo: () => {
      const diagram = getDiagram();
      if (diagram) {
        diagram.commandHandler.undo();
      }
    },
    onRedo: () => {
      const diagram = getDiagram();
      if (diagram) {
        diagram.commandHandler.redo();
      }
    },
    onFind: () => {
      showNodeFinder?.();
    },
    onSelectAll: () => {
      const diagram = getDiagram();
      if (diagram) {
        diagram.commandHandler.selectAll();
      }
    },
    onEscape: () => {
      const diagram = getDiagram();
      if (diagram) {
        diagram.clearSelection();
        if (diagram.currentTool) {
          diagram.currentTool.doCancel();
        }
      }
    },
    onEnter: () => {
      const diagram = getDiagram();
      if (diagram) {
        const selection = diagram.selection.first();
        if (selection) {
          onNodeDoubleClick?.(null, selection);
        }
      }
    },
    onNavigate: (direction) => {
      const diagram = getDiagram();
      if (!diagram) return;

      const selection = diagram.selection.first();
      if (!selection) {
        const firstNode = diagram.nodes.first();
        if (firstNode) {
          diagram.select(firstNode);
        }
        return;
      }

      let targetNode = null;

      switch (direction) {
        case "right":
          targetNode = selection.findNodesOutOf().first();
          break;
        case "left":
          targetNode = selection.findNodesInto().first();
          break;
        case "up":
        case "down": {
          const allNodes = [];
          diagram.nodes.each((n) => {
            if (n !== selection && Math.abs(n.location.x - selection.location.x) < 150) {
              allNodes.push(n);
            }
          });
          allNodes.sort((a, b) => a.location.y - b.location.y);
          const currentY = selection.location.y;
          if (direction === "up") {
            targetNode = allNodes.reverse().find((n) => n.location.y < currentY);
          } else {
            targetNode = allNodes.find((n) => n.location.y > currentY);
          }
          break;
        }
      }

      if (targetNode) {
        diagram.clearSelection();
        diagram.select(targetNode);
        diagram.scrollToRect(targetNode.actualBounds);
      }
    },
    onAddStickyNote: () => {
      canvasRef.current?.createStickyNote?.();
    },
    onAddNode: () => {
      showAddNodeDrawer?.({ via: "keyboard-shortcut" });
    },
    onAutoAlign: () => {
      autoAlignHandler?.();
    },
    onZoomIn: () => {
      const diagram = getDiagram();
      if (diagram) {
        diagram.scale = Math.min(diagram.scale * 1.2, 2.5);
      }
    },
    onZoomOut: () => {
      const diagram = getDiagram();
      if (diagram) {
        diagram.scale = Math.max(diagram.scale / 1.2, 0.5);
      }
    },
    onZoomFit: () => {
      const diagram = getDiagram();
      if (diagram) {
        diagram.zoomToFit();
      }
    },
    onRunNode: () => {
      const diagram = getDiagram();
      if (diagram) {
        const selection = diagram.selection.first();
        if (selection && selection.data?.hasTestModule) {
          options.onRunNode?.(selection);
        }
      }
    },
  };
}
