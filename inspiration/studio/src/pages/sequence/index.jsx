import React, { useRef, useState, useCallback, useEffect, useMemo, Suspense, Component, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { ICStudioContext } from "@/ICStudioContext";
import { decodeParameters, encodeParameters, getAnnotation } from "@/utils/utils";
import { QUERY_KEY, WORKSPACE_KEY, ASSET_KEY, SUCCESS } from "@/constants/keys";
import canvasServices from "../../sdk-services/canvas-sdk-services";
import { AlertTriangle, Loader2, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { MODE } from "@/constants/mode";

const HARDCODED_QUERY_PARAM =
  "eyJ3Ijoia1dJOWJaWnc5IiwiYSI6IjA3OTM0N2Q5LWE4MzAtNDM0Mi1hYjk0LTM1OGRkY2Q5OTdlYiIsInQiOm51bGx9";
import { Button } from "@/components/ui/button";
import CommandPalette from "@/components/studio/CommandPalette";
import { getSequenceSearchConfig } from "@/components/sequence/command-palette/sequenceSearchConfig";
import { getSequenceNodeTemplates, getSequenceLinkTemplates } from "@/components/sequence/templates/nodeTemplates";
import { SEQUENCE_NODE_TYPES, SEQUENCE_NODE_TEMPLATES, SEQUENCE_CANVAS_BG } from "@/components/sequence/constants";
import { SEQUENCE_NODE_DESCRIPTIONS, getSequenceNodeDescription } from "@/components/sequence/command-palette/nodeDescriptions";
import { getSequenceExtension } from "@/components/sequence/extensions";
import { Canvas } from "@/components/canvas";
import Header from "@/components/studio/Header";
import BottomCtaContainer from "@/components/BottomCtaContainer";
import CanvasSidebar from "@/pages/ic-canvas/components/CanvasSidebar";
import { getSidebarActions, getSidebarPanel } from "@/pages/ic-canvas/utils/sidebar-utils";
import { ShadcnContextMenuBridge as ContextMenu } from "@/components/canvas/context-menu/ShadcnContextMenuBridge";
import {
  useCanvasKeyboardShortcuts,
  createKeyboardShortcutHandlers,
  KeyboardShortcutsPanel,
  NodeFinder,
} from "@src/components/canvas/keyboard-shortcuts";
import {
  StickyNoteToolbarPortal,
  useStickyNoteIntegration,
} from "@src/components/canvas/sticky-notes";
import { useExecutionVisualizer } from "@/components/canvas/execution";
import tools from "../../assets/icons/tools";
import classes from "./index.module.css";

const ExecutionHistoryDrawer = React.lazy(() => import("@/components/canvas/execution-history"));
const SequencePublishV2 = React.lazy(() => import("@/components/dialogs/publish-sequence-v2"));

class DialogErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      `[DialogErrorBoundary] Node drawer crashed`,
      {
        error: error?.message || error,
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        nodeData: this.props.nodeData,
        nodeType: this.props.nodeData?.type,
        nodeKey: this.props.nodeData?.key,
      }
    );
  }

  render() {
    if (this.state.hasError) {
      const nodeInfo = this.props.nodeData 
        ? `Node: ${this.props.nodeData?.name || this.props.nodeData?.type || 'Unknown'} (${this.props.nodeData?.key || 'no key'})`
        : '';
      return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4 max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-gray-900 text-base font-medium">
              Failed to load dialog
            </span>
            {nodeInfo && (
              <span className="text-gray-600 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {nodeInfo}
              </span>
            )}
            <span className="text-gray-500 text-sm text-center">
              {this.state.error?.message || 'An unexpected error occurred.'}
              <br />
              Check the browser console for details.
            </span>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onClose?.();
              }}
              className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const DrawerLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
    <span className="text-gray-500 text-sm">Loading configuration...</span>
  </div>
);

const generateKey = (prefix = "seq_") => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const NODE_TYPE_TO_TEMPLATE = {
  [SEQUENCE_NODE_TYPES.TRIGGER]: SEQUENCE_NODE_TEMPLATES.TRIGGER,
  [SEQUENCE_NODE_TYPES.TINY_MODULE]: SEQUENCE_NODE_TEMPLATES.TINY_MODULE,
  [SEQUENCE_NODE_TYPES.WAIT]: SEQUENCE_NODE_TEMPLATES.WAIT,
  [SEQUENCE_NODE_TYPES.CONDITIONAL]: SEQUENCE_NODE_TEMPLATES.CONDITIONAL,
  [SEQUENCE_NODE_TYPES.EXIT]: SEQUENCE_NODE_TEMPLATES.EXIT,
  [SEQUENCE_NODE_TYPES.HITL]: SEQUENCE_NODE_TEMPLATES.HITL,
  [SEQUENCE_NODE_TYPES.MERGE_JOIN]: SEQUENCE_NODE_TEMPLATES.MERGE_JOIN,
  [SEQUENCE_NODE_TYPES.LOOP_START]: SEQUENCE_NODE_TEMPLATES.LOOP_START,
  [SEQUENCE_NODE_TYPES.LOOP_END]: SEQUENCE_NODE_TEMPLATES.LOOP_END,
};


const SequenceCanvas = () => {
  const { workspaceId, updateWorkspaceId } = useContext(ICStudioContext);
  const [searchParams] = useSearchParams();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const extensionRef = useRef(null);
  const canvasSidebarRef = useRef(null);
  const saveButtonRef = useRef(null);
  const publishBtnRef = useRef(null);

  const { stickyNoteHandlers } = useStickyNoteIntegration(canvasRef);
  const { startLinkAnimation, stopLinkAnimation, stopAllAnimations, highlightExecutionPath, pulseNode, EXECUTION_COLORS } = useExecutionVisualizer(canvasRef);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [lastClickPosition, setLastClickPosition] = useState({ x: 100, y: 100 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [sequenceId, setSequenceId] = useState(null);
  const [sequenceData, setSequenceData] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [assetId, setAssetId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [nodeCount, setNodeCount] = useState(0);
  const [activeSidebarPanelId, setActiveSidebarPanelId] = useState(null);

  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuItems, setContextMenuItems] = useState([]);
  const [documentCoords, setDocumentCoords] = useState(null);

  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showNodeFinder, setShowNodeFinder] = useState(false);

  const [showExecutionHistory, setShowExecutionHistory] = useState(false);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [currentExecutionId, setCurrentExecutionId] = useState(null);
  const [showPublishDrawer, setShowPublishDrawer] = useState(false);

  const sequenceNodeTemplates = useMemo(() => getSequenceNodeTemplates(), []);
  const sequenceLinkTemplates = useMemo(() => getSequenceLinkTemplates(), []);
  const sequenceSearchConfig = useMemo(() => getSequenceSearchConfig(), []);

  useEffect(() => {
    const queryParam = searchParams.get(QUERY_KEY) || HARDCODED_QUERY_PARAM;
    const params = decodeParameters(queryParam);
    const extractedWorkspaceId = params[WORKSPACE_KEY];
    const extractedAssetId = params[ASSET_KEY];
    
    if (extractedWorkspaceId && extractedWorkspaceId !== workspaceId) {
      updateWorkspaceId(extractedWorkspaceId);
    }
    if (extractedAssetId) {
      setAssetId(extractedAssetId);
    }
    setIsInitialized(true);
  }, [searchParams, workspaceId, updateWorkspaceId]);

  useEffect(() => {
    if (!workspaceId || !assetId) return;

    const loadAssetDetails = async () => {
      try {
        const response = await canvasServices.findOne({
          workspace_id: workspaceId,
          asset_id: assetId,
        });

        if (response?.status === SUCCESS && response?.result) {
          setAssetDetails(response.result);
          setSequenceData((prev) => ({
            ...prev,
            name: response.result?.asset?.name || prev?.name,
            status: response.result?.asset?.published_info?.published_at ? "published" : prev?.status,
            updated_at: response.result?.asset?.edited_at || prev?.updated_at,
          }));
          setSequenceId(response.result?.asset_id || assetId);

          if (response.result?._r && canvasRef.current) {
            await canvasRef.current.loadModelJSON(response.result._r);
            setTimeout(() => canvasRef.current?.autoAlign?.(), 100);
          }
        }
      } catch (error) {
        console.error("Failed to load sequence asset:", error);
      }
    };

    loadAssetDetails();
  }, [workspaceId, assetId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initialTriggerCreated = useRef(false);

  useEffect(() => {
    if (initialTriggerCreated.current) return;
    const tryCreateTrigger = () => {
      const diagram = canvasRef.current?.getDiagram?.();
      if (!diagram) return false;

      let hasNodes = false;
      diagram.nodes.each((node) => {
        if (node.data && !node.data.isGroup) {
          hasNodes = true;
        }
      });

      if (!hasNodes) {
        const triggerDescription = getSequenceNodeDescription(SEQUENCE_NODE_TYPES.TRIGGER);
        const triggerNode = {
          key: generateKey(),
          type: SEQUENCE_NODE_TYPES.TRIGGER,
          template: SEQUENCE_NODE_TEMPLATES.TRIGGER,
          name: triggerDescription?.title || "Trigger",
          description: triggerDescription?.tagline || "Choose how this sequence starts",
          _src: triggerDescription?._src || "",
          nodeNumber: 1,
          location: "0 0",
          deletable: false,
        };
        diagram.startTransaction("addTrigger");
        diagram.model.addNodeData(triggerNode);
        diagram.commitTransaction("addTrigger");
        initialTriggerCreated.current = true;
        requestAnimationFrame(() => {
          diagram.scale = 1;
          diagram.scrollToRect(new go.Rect(-100, -100, 400, 400));
        });
      }
      return true;
    };

    if (!tryCreateTrigger()) {
      const interval = setInterval(() => {
        if (tryCreateTrigger()) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleCanvasClick = useCallback((e, documentPoint) => {
    if (documentPoint) {
      const [x, y] = documentPoint.split(" ").map(Number);
      setLastClickPosition({ x, y });
    }
  }, []);

  const handleCanvasDoubleClick = useCallback((e, documentPoint) => {
    if (documentPoint) {
      const [x, y] = documentPoint.split(" ").map(Number);
      setLastClickPosition({ x, y });
      setIsCommandPaletteOpen(true);
    }
  }, []);

  const handleNodeClick = useCallback((e, node) => {
    const nodeData = node?.data || node;
    if (!nodeData) return;
    setSelectedNode(nodeData);
  }, []);

  const handleNodeDoubleClick = useCallback((e, node) => {
    const nodeData = node?.data || node;
    if (!nodeData) return;
    setSelectedNode(nodeData);
    setIsDrawerOpen(true);
    setActiveSidebarPanelId(null);
  }, []);

  const handleNodeContextClick = useCallback((e, node, viewPortCoords) => {
    const nodeData = node?.data || node;
    if (!nodeData) return;

    const isTrigger = nodeData?.type === SEQUENCE_NODE_TYPES.TRIGGER;

    const menuItems = [
      {
        id: "edit-node",
        name: "Edit Node",
        icon: Edit3,
        onClick: () => {
          setSelectedNode(nodeData);
          setIsDrawerOpen(true);
          setActiveSidebarPanelId(null);
        },
        divider: true,
      },
      ...(!isTrigger ? [{
        id: "delete-node",
        name: "Delete Node",
        icon: Trash2,
        danger: true,
        onClick: () => {
          const diagram = canvasRef.current?.getDiagram?.();
          if (!diagram) return;
          diagram.startTransaction("deleteNode");
          const goNode = diagram.findNodeForKey(nodeData?.key);
          if (goNode) {
            diagram.remove(goNode);
          }
          diagram.commitTransaction("deleteNode");
          toast.success("Node deleted");
        },
      }] : []),
    ];

    setContextMenuItems(menuItems);
    setDocumentCoords({
      left: viewPortCoords.x,
      top: viewPortCoords.y,
    });
    setShowContextMenu(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const getSavePayload = useCallback(
    async (name, currentAssetDetails = assetDetails) => {
      if (!canvasRef.current) return null;

      const assetName = name || currentAssetDetails?.asset?.name || sequenceData?.name || "Untitled Sequence";

      let modelJson = canvasRef.current.getModelJSON();
      let parsedModel = typeof modelJson === "string" ? JSON.parse(modelJson) : modelJson;

      if (parsedModel?.nodeDataArray) {
        parsedModel.nodeDataArray = parsedModel.nodeDataArray.map(node => {
          if (!node.tf_data || Object.keys(node.tf_data).length === 0) {
            const nodeName = node.description || node.name || node.text || node.type;
            node.tf_data = {
              id: node.key,
              type: node.type,
              config: {
                ...(node.go_data || {}),
                name: nodeName,
                node_id: node.key,
              },
            };
            console.log("[Sequence getSavePayload] Generated tf_data for node:", {
              key: node.key,
              name: nodeName,
              type: node.type,
              tf_data: node.tf_data,
            });
          }
          return node;
        });
        modelJson = JSON.stringify(parsedModel);
      }

      const payload = {
        ...currentAssetDetails,
        annotation: "SEQ",
        asset_meta: {
          ...currentAssetDetails?.asset_meta,
          bgColor: SEQUENCE_CANVAS_BG,
        },
        name: assetName,
        _r: modelJson,
        workspace_id: workspaceId,
      };

      const nodesSummary = (parsedModel?.nodeDataArray || []).map(n => ({
        key: n.key,
        name: n.name || n.text || n.description,
        type: n.type,
        hasTfData: !!n.tf_data && Object.keys(n.tf_data).length > 0,
        tfDataKeys: n.tf_data ? Object.keys(n.tf_data) : [],
        hasGoData: !!n.go_data,
      }));
      console.log("[Sequence getSavePayload] Payload built:", {
        assetName,
        annotation: "SEQ",
        workspaceId,
        totalNodes: nodesSummary.length,
        nodes: nodesSummary,
      });

      return payload;
    },
    [assetDetails, workspaceId, sequenceData],
  );

  const handleSaveSequence = useCallback(async () => {
    if (!canvasRef.current || isSaving) return;

    setIsSaving(true);
    try {
      const savePayload = await getSavePayload();
      if (!savePayload) {
        toast.error("Failed to prepare sequence for saving.");
        return;
      }

      console.log("[Sequence handleSaveSequence] Saving sequence...");
      const saveResponse = await canvasServices.saveCanvas(savePayload);
      console.log("[Sequence handleSaveSequence] Save response:", {
        status: saveResponse?.status,
        message: saveResponse?.message,
        hasResult: !!saveResponse?.result,
        assetId: saveResponse?.result?.asset_id,
      });

      if (saveResponse?.status === SUCCESS) {
        setAssetDetails((prev) => ({
          ...prev,
          ...savePayload,
          ...saveResponse.result,
        }));
        setIsDirty(false);

        if (saveResponse.result?.asset_id && saveResponse.result.asset_id !== assetId) {
          setAssetId(saveResponse.result.asset_id);
          window.history.replaceState(
            "",
            "",
            `/sequence?${QUERY_KEY}=${encodeParameters({
              [WORKSPACE_KEY]: workspaceId,
              [ASSET_KEY]: saveResponse.result.asset_id,
            })}`,
          );
        }
      } else {
        toast.error(saveResponse?.message || "Failed to save sequence");
      }
    } catch (error) {
      console.error("Failed to save sequence:", error);
      toast.error("Failed to save sequence");
    } finally {
      setIsSaving(false);
    }
  }, [workspaceId, assetId, isSaving, getSavePayload]);

  const handlePublishSequence = useCallback(async () => {
    setShowPublishDrawer(true);
  }, []);

  const handleRunSequence = useCallback(async () => {
    setIsRunning(true);
    try {
      toast.info("Sequence run initiated (Heimdall wiring pending).");
    } catch (error) {
      setIsRunning(false);
      console.error("Failed to run sequence:", error);
      toast.error("Failed to run sequence");
    }
  }, [sequenceId]);

  const handleStopSequence = useCallback(() => {
    setIsRunning(false);
    stopAllAnimations();
  }, [stopAllAnimations]);

  useEffect(() => {
    if (!isRunning || !currentExecutionId) return;

    let cancelled = false;
    const pollExecution = async () => {
      try {
        // Polling implementation will be migrated to Heimdall executions.
        const result = null;
        if (cancelled) return;

        if (result?.data?.status === 'completed' || result?.data?.status === 'failed') {
          setIsRunning(false);
          stopAllAnimations();

          if (result.data.nodeResults) {
            result.data.nodeResults.forEach((nr) => {
              pulseNode(nr.nodeKey, nr.status === 'completed' ? 'success' : nr.status);
            });
          }

          if (result.data.status === 'completed') {
            toast.success("Sequence completed successfully");
          } else {
            toast.error("Sequence execution failed");
          }
          return;
        }

        if (result?.data?.currentNode) {
          pulseNode(result.data.currentNode, 'running');
        }

        if (!cancelled) {
          setTimeout(pollExecution, 2000);
        }
      } catch (error) {
        console.error("Error polling execution:", error);
        if (!cancelled) {
          setTimeout(pollExecution, 5000);
        }
      }
    };

    pollExecution();
    return () => { cancelled = true; };
  }, [isRunning, currentExecutionId, pulseNode, stopAllAnimations]);

  const handleSidebarActionClick = useCallback(({ action }) => {
    if (!action) return;

    if (action.id === "add-nodes") {
      setIsCommandPaletteOpen(true);
      canvasSidebarRef.current?.closeSidebar();
      return;
    } else if (action.id === "jump-to-node") {
      setShowNodeFinder(true);
      canvasSidebarRef.current?.closeSidebar();
      return;
    } else if (action.id === "execution-history") {
      setShowExecutionHistory(true);
      canvasSidebarRef.current?.closeSidebar();
      return;
    } else if (action.id === "intercom") {
      if (window.__showIntercom) {
        window.__showIntercom();
      }
      return;
    }

    const ActionPanel = getSidebarPanel(action.id);
    if (ActionPanel) {
      setActiveSidebarPanelId(action.id);
      setIsDrawerOpen(false);
    }
    canvasSidebarRef.current?.closeSidebar();
  }, [sequenceId]);

  const handleUpdateWorkflow = useCallback(async (details, options = {}) => {
    setSequenceData((prev) => ({ ...prev, ...details }));
    if (options.isPublish) {
      setShowPublishDrawer(true);
    } else {
      await handleSaveSequence();
    }
  }, [handleSaveSequence]);

  const autoAlignHandler = useCallback(() => {
    canvasRef.current?.autoAlign?.();
  }, []);

  const handleUndo = useCallback(() => {
    const diagram = canvasRef.current?.getDiagram?.();
    if (diagram && diagram.commandHandler.canUndo()) {
      diagram.commandHandler.undo();
    }
  }, []);

  const handleRedo = useCallback(() => {
    const diagram = canvasRef.current?.getDiagram?.();
    if (diagram && diagram.commandHandler.canRedo()) {
      diagram.commandHandler.redo();
    }
  }, []);

  const setRightDrawerComponent = useCallback((component) => {
    console.log("Right drawer component requested:", component);
  }, []);

  const handleDrawerSave = useCallback((goData, updatedNodeData) => {
    if (selectedNode && canvasRef.current && selectedNode.key) {
      if (goData !== undefined && updatedNodeData !== undefined) {
        const nodeUpdate = {
          name: updatedNodeData.name,
          _src: updatedNodeData._src,
          errors: updatedNodeData.errors,
          go_data: goData,
        };
        canvasRef.current.updateNode(selectedNode.key, nodeUpdate);
        setSelectedNode(prev => ({ ...prev, ...nodeUpdate }));
      } else if (extensionRef.current) {
        const data = extensionRef.current.getData?.();
        if (data) {
          const mergedData = { ...selectedNode, ...data };
          canvasRef.current.updateNode(selectedNode.key, mergedData);
          setSelectedNode(mergedData);
        }
      }
    }
    setIsDrawerOpen(false);
  }, [selectedNode]);

  const handleUpdateTitle = useCallback((update) => {
    if (selectedNode && canvasRef.current) {
      canvasRef.current.updateNode(selectedNode.key, update);
      setSelectedNode(prev => ({ ...prev, ...update }));
    }
  }, [selectedNode]);

  const handleGetNodes = useCallback(async (options) => {
    if (!canvasRef.current) return [];
    try {
      const nodes = canvasRef.current.getNodes?.() || [];
      if (options?.fetchConnectableNodes) {
        return nodes.filter(n => n.key !== selectedNode?.key);
      }
      return nodes;
    } catch (error) {
      console.error("Error getting nodes:", error);
      return [];
    }
  }, [selectedNode]);

  const handleUpdateNodeLinks = useCallback((linksToUpdate) => {
    if (!canvasRef.current || !linksToUpdate) return;
    try {
      if (canvasRef.current.updateLinks) {
        canvasRef.current.updateLinks(linksToUpdate);
      }
    } catch (error) {
      console.error("Error updating node links:", error);
    }
  }, []);

  const getViewportCenter = useCallback(() => {
    const diagram = canvasRef.current?.getDiagram?.();
    if (diagram) {
      const vb = diagram.viewportBounds;
      return { x: vb.centerX, y: vb.centerY };
    }
    return lastClickPosition;
  }, [lastClickPosition]);

  const hasTriggerNode = useCallback(() => {
    const diagram = canvasRef.current?.getDiagram?.();
    if (!diagram) return false;
    let found = false;
    diagram.nodes.each((node) => {
      if (node.data?.type === SEQUENCE_NODE_TYPES.TRIGGER) found = true;
    });
    return found;
  }, []);

  const handleAddNodeFromExtension = useCallback((nodeType) => {
    if (!canvasRef.current) return;
    if (nodeType === SEQUENCE_NODE_TYPES.TRIGGER && hasTriggerNode()) {
      toast.info("A sequence can only have one trigger node");
      return;
    }
    const template = NODE_TYPE_TO_TEMPLATE[nodeType];
    const description = SEQUENCE_NODE_DESCRIPTIONS[nodeType];
    const position = getViewportCenter();
    
    const newNodeData = {
      key: generateKey(),
      type: nodeType,
      template: template,
      name: description?.title || nodeType,
      description: description?.tagline || "",
      _src: description?._src || "",
    };

    canvasRef.current.createNode(newNodeData, {
      openNodeAfterCreate: true,
      autoLink: true,
      location: position,
    });
  }, [getViewportCenter]);

  const ExtensionComponent = useMemo(() => {
    if (!selectedNode) return null;
    return getSequenceExtension(selectedNode.type);
  }, [selectedNode]);

  const handleAddNode = useCallback((nodeDescriptor) => {
    if (!canvasRef.current) return;
    if (nodeDescriptor.id === SEQUENCE_NODE_TYPES.TRIGGER && hasTriggerNode()) {
      toast.info("A sequence can only have one trigger node");
      return;
    }

    const template = NODE_TYPE_TO_TEMPLATE[nodeDescriptor.id];
    const description = SEQUENCE_NODE_DESCRIPTIONS[nodeDescriptor.id];
    const position = getViewportCenter();

    const newNodeData = {
      key: generateKey(),
      type: nodeDescriptor.id,
      template: template,
      name: description?.title || nodeDescriptor.title,
      description: description?.tagline || "",
      _src: description?._src || "",
    };

    canvasRef.current.createNode(newNodeData, {
      openNodeAfterCreate: true,
      autoLink: false,
      location: position,
    });

    setLastClickPosition({
      x: position.x + 150,
      y: position.y,
    });
  }, [getViewportCenter]);

  const handleNodeCreated = useCallback((node) => {
    setIsDirty(true);
    setNodeCount(prev => prev + 1);
  }, []);

  const updateNodeCount = useCallback(() => {
    const diagram = canvasRef.current?.getDiagram?.();
    if (diagram) {
      let count = 0;
      diagram.nodes.each((node) => {
        if (node.data && !node.data.isGroup) {
          count++;
        }
      });
      setNodeCount(count);
    }
  }, []);

  const handleModelChanged = useCallback((e) => {
    if (!e) return;
    updateNodeCount();
    setIsDirty(true);
  }, [updateNodeCount]);

  const keyboardHandlers = useMemo(
    () =>
      createKeyboardShortcutHandlers(canvasRef, {
        onNodeDoubleClick: handleNodeDoubleClick,
        showAddNodeDrawer: () => setIsCommandPaletteOpen(true),
        autoAlignHandler,
        showNodeFinder: () => setShowNodeFinder(true),
      }),
    [canvasRef, handleNodeDoubleClick, autoAlignHandler, setShowNodeFinder]
  );

  useCanvasKeyboardShortcuts(canvasRef, keyboardHandlers);

  const renderExtensionDrawer = () => {
    if (!isDrawerOpen || !ExtensionComponent) return null;
    
    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      );
    }

    return (
      <DialogErrorBoundary 
        nodeData={selectedNode} 
        onClose={handleDrawerClose}
      >
        <Suspense fallback={<DrawerLoadingFallback />}>
          <ExtensionComponent
            ref={extensionRef}
            canvasRef={canvasRef}
            annotation={selectedNode?.annotation}
            data={selectedNode?.go_data || {}}
            nodeData={selectedNode}
            nodeType={selectedNode?.type}
            variables={[]}
            schema={selectedNode?.schema}
            workspaceId={workspaceId}
            assetId={assetId || ""}
            projectId=""
            parentId=""
            webhookUrl=""
            open={isDrawerOpen}
            onClose={handleDrawerClose}
            onSave={handleDrawerSave}
            onUpdateTitle={handleUpdateTitle}
            getNodes={handleGetNodes}
            onUpdateNodeLinks={handleUpdateNodeLinks}
            onAddNode={handleAddNodeFromExtension}
          />
        </Suspense>
      </DialogErrorBoundary>
    );
  };

  return (
    <>
      <div ref={canvasContainerRef} className={classes["canvas-container"]}>
        <Canvas
          ref={canvasRef}
          stickyNoteHandlers={stickyNoteHandlers}
          canvasClicked={handleCanvasClick}
          canvasDoubleClicked={handleCanvasDoubleClick}
          nodeClicked={handleNodeClick}
          nodeDoubleClicked={handleNodeDoubleClick}
          nodeContextClicked={handleNodeContextClick}
          onNodeCreated={handleNodeCreated}
          onModelChanged={handleModelChanged}
          customTemplates={sequenceNodeTemplates}
          customLinkTemplates={sequenceLinkTemplates}
          backgroundColor={SEQUENCE_CANVAS_BG}
          onSelectionDeleting={(e, selection) => {
            let hasTrigger = false;
            selection.each((part) => {
              if (part.data?.type === SEQUENCE_NODE_TYPES.TRIGGER) {
                hasTrigger = true;
              }
            });
            if (hasTrigger) {
              e.cancel = true;
              toast.info("The trigger node cannot be deleted");
            }
          }}
        />
      </div>
      <div className={classes["canvas-overlay-container"]}>
        <div className={classes["layout-grid"]}>
          <div className={classes["left-column"]}>
            <div className={classes["cta-container"]}>
              <Header
                mode={MODE.SEQUENCE_CANVAS}
                assetDetails={{
                  asset: {
                    name: sequenceData?.name || "Untitled Sequence",
                    published_info: sequenceData?.status === "published" ? { published_at: sequenceData?.updated_at } : null,
                    edited_at: sequenceData?.updated_at,
                    run_count: sequenceData?.run_count,
                    failure_count: sequenceData?.failure_count,
                  },
                }}
                updateWorkflow={handleUpdateWorkflow}
                saveButtonRef={saveButtonRef}
                publishBtnRef={publishBtnRef}
                loading={isSaving}
                isRunning={isRunning}
                isDirty={isDirty}
                onMarkDirty={() => setIsDirty(true)}
                metrics={{
                  runs: sequenceData?.run_count,
                  successRate: sequenceData?.failure_count
                    ? Math.round(
                      (1 -
                        sequenceData.failure_count /
                        (sequenceData.run_count || 1)) *
                      100,
                    )
                    : 100,
                }}
              />
              <BottomCtaContainer
                showAddNodeDrawer={() => setIsCommandPaletteOpen(true)}
                tools={tools || { autoAlign: "" }}
                autoAlignHandler={autoAlignHandler}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onTest={handleRunSequence}
                onStop={handleStopSequence}
                isRunning={isRunning}
                mode={MODE.SEQUENCE_CANVAS}
                onShowNodeFinder={() => setShowNodeFinder(true)}
                onShowKeyboardShortcuts={() =>
                  setShowKeyboardShortcuts((prev) => !prev)
                }
                nodeCount={nodeCount}
                onToggleExecutionHistory={() =>
                  setShowExecutionHistory((prev) => !prev)
                }
                executionHistoryOpen={showExecutionHistory}
                canvasRef={canvasRef}
              />
            </div>
            <div className={classes["bottom-drawer"]}>
              {showExecutionHistory && assetId && (
                <Suspense fallback={<DrawerLoadingFallback />}>
                  <ExecutionHistoryDrawer
                    workspaceId={workspaceId}
                    assetId={assetId}
                    isOpen={showExecutionHistory}
                    onToggle={() => setShowExecutionHistory(false)}
                  />
                </Suspense>
              )}
            </div>
          </div>
          <div className={classes["right-column"]}>
            <div className={classes["right-drawer"]}>
              {renderExtensionDrawer()}
              {!isDrawerOpen && activeSidebarPanelId && (() => {
                const PanelComponent = getSidebarPanel(activeSidebarPanelId);
                if (!PanelComponent) return null;
                return (
                  <Suspense fallback={<DrawerLoadingFallback />}>
                    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="text-sm font-medium text-gray-700">
                          {getSidebarActions(MODE.SEQUENCE_CANVAS).find(a => a.id === activeSidebarPanelId)?.name || "Panel"}
                        </span>
                        <button
                          onClick={() => setActiveSidebarPanelId(null)}
                          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="flex-1 overflow-auto">
                        <PanelComponent />
                      </div>
                    </div>
                  </Suspense>
                );
              })()}
            </div>
            <div className={classes["canvas-sidebar-fixed"]}>
              <CanvasSidebar
                ref={canvasSidebarRef}
                actions={getSidebarActions(MODE.SEQUENCE_CANVAS)}
                canvasMode={MODE.SEQUENCE_CANVAS}
                onSidebarActionClick={(action, index, e) => {
                  handleSidebarActionClick({ action, index, e });
                }}
              >
              </CanvasSidebar>
            </div>
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => {
          setIsCommandPaletteOpen(false);
          canvasSidebarRef.current?.closeSidebar();
        }}
        tabData={sequenceSearchConfig}
        canvasRef={canvasRef}
        previousNode={selectedNode}
        onNodeSelect={(node) => {
          const sequenceDesc = node._sequenceDescription;
          if (sequenceDesc) {
            if (sequenceDesc.isPaired && sequenceDesc.pairedWith) {
              const pairedNode = SEQUENCE_NODE_DESCRIPTIONS[sequenceDesc.pairedWith];
              handleAddNode({
                ...sequenceDesc,
                paired: true,
                pairedNodeDescription: pairedNode,
              });
            } else {
              handleAddNode(sequenceDesc);
            }
          } else {
            handleAddNode({
              id: node.type,
              title: node.name,
              _src: node._src,
            });
          }
        }}
        onTriggerReplace={async (existingTriggerNode, newTrigger) => {
          const nodeKey = existingTriggerNode?.key || existingTriggerNode?.data?.key;
          if (nodeKey) {
            canvasRef.current?.removeOutgoingLinks?.(nodeKey, true);
            const nodeToRemove = canvasRef.current?.findNode(nodeKey);
            if (nodeToRemove) {
              canvasRef.current?.removeNode(nodeToRemove);
            }
          }
          const sequenceDesc = newTrigger._sequenceDescription;
          if (sequenceDesc) {
            handleAddNode(sequenceDesc);
          } else {
            handleAddNode({
              id: newTrigger.type,
              title: newTrigger.name,
              _src: newTrigger._src,
            });
          }
        }}
      />

      <ContextMenu
        show={showContextMenu}
        menus={contextMenuItems}
        coordinates={documentCoords}
        onClose={() => setShowContextMenu(false)}
      />

      <KeyboardShortcutsPanel
        open={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      <NodeFinder
        open={showNodeFinder}
        onClose={() => {
          setShowNodeFinder(false);
          canvasSidebarRef.current?.closeSidebar();
        }}
        nodes={canvasRef.current?.getAllNodes?.() || []}
        onSelectNode={(node) => {
          const diagram = canvasRef.current?.getDiagram?.();
          if (diagram && node?.key) {
            const goNode = diagram.findNodeForKey(node.key);
            if (goNode) {
              diagram.clearSelection();
              diagram.select(goNode);
              diagram.scrollToRect(goNode.actualBounds);
            }
          }
        }}
        onOpenNode={(node) => {
          const diagram = canvasRef.current?.getDiagram?.();
          if (diagram && node?.key) {
            const goNode = diagram.findNodeForKey(node.key);
            if (goNode) {
              handleNodeDoubleClick(null, goNode);
            }
          }
        }}
      />

      <StickyNoteToolbarPortal
        diagramRef={canvasRef}
        containerRef={canvasContainerRef}
      />

      {showPublishDrawer && (
        <DialogErrorBoundary onClose={() => setShowPublishDrawer(false)}>
          <Suspense fallback={<DrawerLoadingFallback />}>
            <SequencePublishV2
              nodes={canvasRef.current?.getAllNodes?.() || []}
              initialAssetDetails={assetDetails}
              getSavePayload={getSavePayload}
              sequenceId={sequenceId}
              sequenceData={sequenceData}
              workspaceId={workspaceId}
              assetId={assetId}
              onPublishSuccess={(updatedDetails) => {
                setAssetDetails(updatedDetails);
                setSequenceData((prev) => ({
                  ...prev,
                  status: "published",
                  updated_at: updatedDetails?.asset?.published_info?.published_at || new Date().toISOString(),
                }));
              }}
              onAssetDetailsChange={(updates) => {
                setAssetDetails((prev) => ({
                  ...prev,
                  asset: {
                    ...prev?.asset,
                    ...updates,
                  },
                }));
                const hasPublishedInfo = updates?.published_info !== undefined;
                const isPublished = hasPublishedInfo
                  ? !!updates.published_info?.published_at
                  : undefined;
                if (isPublished !== undefined) {
                  setSequenceData((prev) => ({
                    ...prev,
                    status: isPublished ? "published" : "draft",
                  }));
                }
              }}
              onClose={() => setShowPublishDrawer(false)}
              onNavigateToNode={(nodeKey) => {
                const diagram = canvasRef.current?.getDiagram?.();
                if (diagram && nodeKey) {
                  const goNode =
                    diagram.findNodeForKey(nodeKey) ||
                    diagram.findNodeForKey(parseInt(nodeKey, 10));
                  if (goNode) {
                    diagram.clearSelection();
                    diagram.select(goNode);
                    diagram.scrollToRect(goNode.actualBounds);
                    handleNodeDoubleClick(null, goNode);
                  }
                }
              }}
            />
          </Suspense>
        </DialogErrorBoundary>
      )}
    </>
  );
};

export default SequenceCanvas;
