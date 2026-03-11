import React, { createContext, useContext, useMemo } from "react";
import { useStickyNoteToolbar } from "../sticky-notes";
import { useContextMenu, CONTEXT_MENU_TYPES } from "../context-menu";
import { useCanvasKeyboardShortcuts, createKeyboardShortcutHandlers } from "../keyboard-shortcuts";
import { useExecutionVisualizer } from "../execution";
import { useLinkLabels } from "../link-labels";
import { useNodeComments } from "../comments";

const CanvasEnhancementsContext = createContext(null);

export function useCanvasEnhancements() {
  const context = useContext(CanvasEnhancementsContext);
  if (!context) {
    throw new Error("useCanvasEnhancements must be used within CanvasEnhancementsProvider");
  }
  return context;
}

export function CanvasEnhancementsProvider({
  children,
  diagramRef,
  containerRef,
  handlers = {},
  currentUser,
}) {
  const stickyNotes = useStickyNoteToolbar(diagramRef);
  const contextMenu = useContextMenu();
  const execution = useExecutionVisualizer(diagramRef);
  const linkLabels = useLinkLabels(diagramRef);
  const comments = useNodeComments();

  const keyboardHandlers = useMemo(
    () =>
      createKeyboardShortcutHandlers(diagramRef, {
        onNodeDoubleClick: handlers.onNodeDoubleClick,
        showAddNodeDrawer: handlers.showAddNodeDrawer,
        autoAlignHandler: handlers.autoAlignHandler,
        showNodeFinder: handlers.showNodeFinder,
        onRunNode: handlers.onRunNode,
      }),
    [diagramRef, handlers]
  );

  useCanvasKeyboardShortcuts(diagramRef, keyboardHandlers);

  const stickyNoteHandlers = useMemo(
    () => ({
      onMouseEnter: stickyNotes.showToolbar,
      onMouseLeave: () => stickyNotes.hideToolbar(200),
    }),
    [stickyNotes]
  );

  const contextMenuHandlers = useMemo(
    () => ({
      onNodeContextClicked: (e, node, viewCoords) => {
        contextMenu.openMenu(CONTEXT_MENU_TYPES.NODE, node, viewCoords);
      },
      onLinkContextClicked: (e, link, viewCoords) => {
        contextMenu.openMenu(CONTEXT_MENU_TYPES.LINK, link.data, viewCoords);
      },
      onBackgroundContextClicked: (e, viewCoords) => {
        contextMenu.openMenu(CONTEXT_MENU_TYPES.BACKGROUND, null, viewCoords);
      },
    }),
    [contextMenu]
  );

  const value = useMemo(
    () => ({
      stickyNotes,
      stickyNoteHandlers,
      contextMenu,
      contextMenuHandlers,
      execution,
      linkLabels,
      comments,
      currentUser,
    }),
    [
      stickyNotes,
      stickyNoteHandlers,
      contextMenu,
      contextMenuHandlers,
      execution,
      linkLabels,
      comments,
      currentUser,
    ]
  );

  return (
    <CanvasEnhancementsContext.Provider value={value}>
      {children}
    </CanvasEnhancementsContext.Provider>
  );
}

export function getEnhancedNodeTemplateOptions(enhancements) {
  return {
    stickyNoteHandlers: enhancements.stickyNoteHandlers,
  };
}
