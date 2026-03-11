# Canvas Enhancements Integration Guide

This guide explains how to integrate the new canvas enhancement features into the existing IC Canvas application.

## Quick Start

### 1. Wrap your canvas with the provider

```jsx
import { CanvasEnhancementsProvider } from './enhancements/CanvasEnhancementsProvider';

function ICCanvasPage() {
  const canvasRef = useRef();
  const containerRef = useRef();

  return (
    <CanvasEnhancementsProvider
      diagramRef={canvasRef}
      containerRef={containerRef}
      handlers={{
        onNodeDoubleClick: nodeDoubleClickHandler,
        showAddNodeDrawer: showAddNodeDrawer,
        autoAlignHandler: autoAlignHandler,
        showNodeFinder: () => setNodeFinderOpen(true),
        onRunNode: handleRunNode,
      }}
      currentUser={currentUser}
    >
      <div ref={containerRef}>
        <Canvas ref={canvasRef} {...canvasProps} />
        {/* Enhancement UI components */}
        <CanvasEnhancementsUI />
      </div>
    </CanvasEnhancementsProvider>
  );
}
```

### 2. Update canvas initialization to use enhanced templates

```jsx
// In canvas.jsx initDiagram():
import { getEnhancedNodeTemplateOptions } from './enhancements/CanvasEnhancementsProvider';

// When getting node templates:
d.nodeTemplateMap = getNodeTemplates(mode, {
  stickyNoteHandlers: options.stickyNoteHandlers,
});
```

### 3. Render enhancement UI components

```jsx
import {
  StickyNoteToolbarPortal,
  NodeFinder,
  KeyboardShortcutsPanel,
  EnhancedMinimap,
  CommentThread,
  LinkLabelEditor,
} from './enhancements';

function CanvasEnhancementsUI() {
  const {
    stickyNotes,
    contextMenu,
    linkLabels,
    comments,
    currentUser,
  } = useCanvasEnhancements();

  return (
    <>
      {/* Sticky Note Toolbar */}
      <StickyNoteToolbarPortal
        nodeData={stickyNotes.nodeData}
        position={stickyNotes.toolbarPosition}
        visible={stickyNotes.isVisible}
        onUpdate={stickyNotes.updateNote}
        onClose={() => stickyNotes.hideToolbar(0)}
      />

      {/* Node Finder (Ctrl+F) */}
      <NodeFinder
        open={nodeFinderOpen}
        onClose={() => setNodeFinderOpen(false)}
        nodes={allNodes}
        onSelectNode={handleSelectNode}
      />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Enhanced Minimap */}
      <EnhancedMinimap diagramRef={canvasRef} />

      {/* Link Label Editor */}
      {linkLabels.editingLink && (
        <LinkLabelEditor
          linkData={linkLabels.editingLink}
          position={linkLabels.editorPosition}
          initialValue={linkLabels.editingLink.label}
          onSave={linkLabels.saveLabel}
          onCancel={linkLabels.cancelEditing}
        />
      )}

      {/* Comment Thread */}
      {comments.activeThread && (
        <CommentThread
          nodeKey={comments.activeThread}
          comments={comments.comments}
          position={comments.threadPosition}
          currentUser={currentUser}
          onAddComment={comments.addComment}
          onEditComment={comments.editComment}
          onDeleteComment={comments.deleteComment}
          onClose={comments.closeThread}
        />
      )}
    </>
  );
}
```

## Feature-by-Feature Integration

### Modern Sticky Notes
The new sticky note system uses a React toolbar rendered via portal instead of GoJS-only adornments.

1. The `stickyNoteTemplateV2` is automatically used when handlers are provided
2. Mouse enter/leave events trigger the toolbar visibility
3. Toolbar uses shadcn components for consistent styling

### Context Menu
Replace ODS context menus with shadcn-based menus:

```jsx
// Connect to canvas events:
<Canvas
  nodeContextClicked={contextMenuHandlers.onNodeContextClicked}
  linkContextClicked={contextMenuHandlers.onLinkContextClicked}
  canvasContextClicked={contextMenuHandlers.onBackgroundContextClicked}
/>
```

### Keyboard Shortcuts
Shortcuts are automatically registered when using the provider. Supported shortcuts:
- `Delete/Backspace` - Delete selection
- `Ctrl+D` - Duplicate node
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` / `Ctrl+Y` - Redo
- `Ctrl+F` - Find nodes
- `Arrow keys` - Navigate between nodes
- `Enter` - Edit selected node
- `N` - Add sticky note
- `A` - Add node

### Execution Visualization
Use for workflow execution feedback:

```jsx
const { execution } = useCanvasEnhancements();

// During execution:
execution.startLinkAnimation(linkKey, '#3B82F6');
execution.pulseNode(nodeKey, 'running');

// After execution:
execution.stopLinkAnimation(linkKey);
execution.pulseNode(nodeKey, 'success'); // or 'error'
```

### Node Status Indicators
Apply status to nodes:

```jsx
import { getNodeStatus, getStatusBorderColor } from './node-status';

// In node template or overlay:
const status = getNodeStatus(nodeData);
const borderColor = getStatusBorderColor(status);
```

### Comments
Enable threaded comments on nodes:

```jsx
// Add comment indicator to node template
// On click, call: comments.openThread(nodeKey, position)
```

## Backward Compatibility

All enhancements are opt-in and the original implementations remain functional:
- Original `stickyNoteTemplate` is still used when handlers aren't provided
- Context menu utils in `utils/context-menu-utils.jsx` continue to work
- No breaking changes to existing Canvas API
