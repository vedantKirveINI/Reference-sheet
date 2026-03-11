import React from "react";
import { createPortal } from "react-dom";
import { StickyNoteToolbar, STICKY_NOTE_DEFAULTS } from "./StickyNoteToolbar";
import { useStickyNoteToolbar } from "./useStickyNoteToolbar";

export function StickyNoteToolbarPortal({ diagramRef, containerRef }) {
  const {
    activeNote,
    toolbarPosition,
    isVisible,
    hideToolbar,
    cancelHide,
    updateNote,
    nodeData,
  } = useStickyNoteToolbar(diagramRef);

  const container = containerRef?.current || document.body;

  const mergedNodeData = {
    ...STICKY_NOTE_DEFAULTS,
    ...nodeData,
  };

  return createPortal(
    <div
      onMouseEnter={cancelHide}
      onMouseLeave={() => hideToolbar(100)}
    >
      <StickyNoteToolbar
        nodeData={mergedNodeData}
        onUpdate={updateNote}
        position={toolbarPosition}
        visible={isVisible && activeNote !== null}
        onClose={() => hideToolbar(0)}
      />
    </div>,
    container
  );
}

export function useStickyNoteIntegration(diagramRef) {
  const toolbarState = useStickyNoteToolbar(diagramRef);

  const stickyNoteHandlers = {
    onMouseEnter: (e, node) => {
      toolbarState.showToolbar(node);
    },
    onMouseLeave: (e, node) => {
      toolbarState.hideToolbar(200);
    },
  };

  return {
    toolbarState,
    stickyNoteHandlers,
  };
}
