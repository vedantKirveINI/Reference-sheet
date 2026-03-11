import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  Suspense,
  lazy,
  Component,
} from "react";

// Error boundary for lazy-loaded dialogs
class DialogErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[DialogErrorBoundary] Node drawer crashed`, {
      error: error?.message || error,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      nodeData: this.props.nodeData,
      nodeType: this.props.nodeData?.type,
      nodeSubType: this.props.nodeData?.subType,
      nodeKey: this.props.nodeData?.key,
    });
  }

  render() {
    if (this.state.hasError) {
      const nodeInfo = this.props.nodeData
        ? `Node: ${
            this.props.nodeData?.name || this.props.nodeData?.type || "Unknown"
          } (${this.props.nodeData?.key || "no key"})`
        : "";
      return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4 max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
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
              {this.state.error?.message || "An unexpected error occurred."}
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
import classes from "./index.module.css";
// import ContextMenu from "oute-ds-context-menu";
// import { showConfirmDialog } from "oute-ds-dialog";
// import { ODSIcon as Icon } from "@src/module/ods";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
// import { ODSLabel } from "@src/module/ods";
// import { default_theme } from "@src/module/ods";
import { ShadcnContextMenuBridge as ContextMenu } from "../../components/canvas/context-menu/ShadcnContextMenuBridge.jsx";
import {
  showConfirmDialog,
  ODSIcon as Icon,
  ODSAdvancedLabel,
  ODSLabel,
  ODSButton as Button,
} from "@src/module/ods";
import { cn } from "@/lib/utils";
import { showDraftRecoveryToast } from "@/components/studio/DraftRecoveryToast";
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import { SETUP_COMPONENTS } from "../../components/dialogs/add-component-dialog/constants/setup-constants.js";
import tools from "../../assets/icons/tools/index.js";

import canvasServices from "../../sdk-services/canvas-sdk-services.js";
import {
  ASSET_KEY,
  EVENT_TYPE_KEY,
  PARENT_KEY,
  PROJECT_KEY,
  QUERY_KEY,
  SUCCESS,
  WORKSPACE_KEY,
} from "../../constants/keys.js";

import componentSDKServices from "../../sdk-services/component-sdk-services.js";
import { enrichCanvasModelForVariableList } from "./utils/enrichCanvasModelForVariableList.js";
import domainSDKServices from "../../sdk-services/domain-sdk-services.js";
import { ICStudioContext } from "../../ICStudioContext.jsx";
import { getMode } from "../../config/config.jsx";
import { toast } from "sonner";

import { MODE } from "../../constants/mode.js";
import assetSDKServices from "../../sdk-services/asset-sdk-services.js";
import { NODE_TEMPLATES } from "../../components/canvas/templates/index.js";
import { resetSession as resetSuggestionSession } from "../../components/canvas-assistant/suggestionThrottle.js";
import { recordManualAdd } from "../../components/canvas-assistant/decisionMemory.js";
import { setupNode as setupNodeWithAI } from "../../components/canvas-assistant/assistantService.js";

import {
  QuestionType,
  getCanvasTheme,
  getClarityId,
} from "../../module/constants/index.js";

import {
  trackSDKServices,
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";

import {
  encodeParameters,
  getAnnotation,
  getSaveDialogTitle,
} from "../../utils/utils.jsx";
// import { serverConfig } from "@src/module/ods";
import { serverConfig } from "@src/module/ods";
import { localStorageConstants } from "@src/module/constants";

import {
  DeletedAssetMessage,
  DeletedAssetTitle,
} from "../../components/dialogs/deleted-asset-dialog/index.jsx";
import { useNavigate } from "react-router-dom";
import {
  ADD_ASSET_ID_DIALOG,
  CREATE_CANVAS_ASSET_DIALOG,
  FORM_PUBLISH_DIALOG,
  WORKFLOW_PUBLISH_DIALOG,
  LINK_RENAME_DIALOG,
  NODE_DIALOG,
  PREVIEW_DIALOG,
  TEST_CASE_DIALOG,
  TEST_CASE_RUN_DIALOG,
  WORKFLOW_NAME_DIALOG,
} from "./constants/constants.js";
import { mapLimit } from "async";

import variableSDKServices from "../../sdk-services/variable-sdk-services.js";
import canvasSDKServices from "../../sdk-services/canvas-sdk-services.js";
import { predictStartNode } from "../../components/dialogs/form-preview-v2/utils/canvas/helpers.js";

import { formatDataForQuestionEventLog } from "./utils/question-log-utils.js";

import {
  updateIfElseNodeLinks,
  validateIfElseData,
  CANVAS_BG,
  getNodeSrc,
} from "../../components/canvas/index.js";
import { getExtensionComponent } from "../../components/canvas/extensions/getExtensionComponent.js";

import {
  IF_ELSE_TYPE,
  INTEGRATION_TYPE,
  IF_ELSE_TYPE_V2,
  HITL_TYPE,
  HITL_V2_TYPE,
  TRIGGER_SETUP_TYPE,
  TRIGGER_SETUP_NODE,
  getDefaultIfElseGoData,
} from "../../components/canvas/extensions/index.js";
import CommonTestModuleV3 from "../../components/canvas/extensions/common-components/CommonTestModuleV3.jsx";
import { LOOP_START_TYPE } from "../../components/canvas/extensions/loop-start/constants.js";
import {
  LOOP_END_TYPE,
  LOOP_END_NODE,
  getLoopEndName,
} from "../../components/canvas/extensions/loop-end/constants.js";
import { FOR_EACH_TYPE } from "../../components/canvas/extensions/for-each/constants.js";
import { REPEAT_TYPE } from "../../components/canvas/extensions/repeat/constants.js";
import { LOOP_UNTIL_TYPE } from "../../components/canvas/extensions/loop-until/constants.js";
import AddLogsPopover from "../../components/popper/logs-popover/index.jsx";
import { createNodeIdMap, getChildNodeLocation } from "./utils/canvas-utils.js";
import {
  KeyboardShortcutsPanel,
  NodeFinder,
  useCanvasKeyboardShortcuts,
  createKeyboardShortcutHandlers,
} from "@src/components/canvas/keyboard-shortcuts";
import {
  StickyNoteToolbarPortal,
  useStickyNoteIntegration,
} from "@src/components/canvas/sticky-notes";

import { useSelector, useDispatch } from "react-redux";
import { getCache, updateCache } from "../../redux/reducers/godata-reducer.js";
import { getSidebarPanel } from "./utils/sidebar-utils.jsx";

const LOOP_START_TYPES = new Set([
  LOOP_START_TYPE,
  FOR_EACH_TYPE,
  REPEAT_TYPE,
  LOOP_UNTIL_TYPE,
]);
const isLoopStartType = (type) => LOOP_START_TYPES.has(type);

const Drawer = lazy(() => import("../../module/drawer/index.js"));
import WizardDrawer from "../../module/drawer/WizardDrawer.jsx";
import { getDefaultTheme } from "./utils/get-default-theme.js";
import {
  validateNodeConfig,
  validateNodeForRun,
} from "./utils/validateNodeConfig.js";
import { useCanvasUtauEvents } from "../../hooks/use-canvas-uatu-events.js";
import SuspenseLoader from "../../components/loaders/SuspenseLoader.jsx";
import { emitFixWithAI } from "../../components/canvas/utils/fixWithAI.js";
// Note: Intercom SDK is dynamically imported to prevent default launcher from showing
// See: initAndShowIntercom function
import Clarity from "@microsoft/clarity";
import userServices from "../../sdk-services/user-sdk-services.js";

// const Dialog = lazy(() => import("oute-ds-dialog"));
const Dialog = lazy(() =>
  import("@src/module/ods").then((m) => ({ default: m.ODSDialog })),
);

const WorkflowName = lazy(
  () => import("../../components/dialogs/workflow-name-dialog/index.jsx"),
);

const CreateCanvasAssetDialog = lazy(
  () => import("../../components/dialogs/create-canvas-asset-dialog/index.jsx"),
);

const LinkRename = lazy(
  () => import("../../components/dialogs/link-rename-dialog/index.jsx"),
);

const PageProcessingLoader = lazy(
  () => import("../../components/loaders/PageProcessingLoader.jsx"),
);

const JsonUploadInput = lazy(
  () => import("../../components/json-upload-input/JsonUploadInput.jsx"),
);

const ErrorWarningPopover = lazy(
  () => import("../../components/popper/errors-warnings-popover/index.jsx"),
);

const RunInputsPopover = lazy(
  () => import("../../components/popper/run-inputs-popover/index.jsx"),
);

const FormPreviewV2 = lazy(() =>
  import("../../components/dialogs/form-preview-v2/index.js").then((module) => ({
    default: module.FormPreviewV2,
  })),
);

const FormPublishDialog = lazy(
  () => import("../../components/dialogs/form-publish-dialog/index.jsx"),
);

const AddAssetIdDialog = lazy(
  () => import("../../components/dialogs/add-asset-id-dialog/index.jsx"),
);

const Canvas = lazy(() =>
  import("../../components/canvas/index.js").then((module) => ({
    default: module.Canvas,
  })),
);

const TestCaseRun = lazy(() =>
  import("@src/module/ic-deployment/test-case-run").then((module) => ({
    default: module.TestCaseRun,
  })),
);

/**
 * Returns true if the workflow's single start node is Manual Trigger with no input schema.
 * Used to skip opening the Run Workflow input panel when no inputs are needed.
 */
function isManualStartWithNoInputs(modelJSON) {
  if (!modelJSON) return false;
  try {
    const payload =
      typeof modelJSON === "string"
        ? { _r: JSON.parse(modelJSON) }
        : { _r: modelJSON };
    const startResult = predictStartNode(payload);
    if (startResult.status !== "success" || !startResult.result) return false;
    if (startResult.error === "MULTIPLE_START_NODES") return false;
    const node = startResult.result;
    const goData = node?.go_data || {};
    if (goData.startType !== "manual") return false;
    const inputSchema = goData.inputSchema;
    if (!inputSchema) return true;
    if (Array.isArray(inputSchema) && inputSchema.length === 0) return true;
    if (
      inputSchema?.blocks &&
      Array.isArray(inputSchema.blocks) &&
      inputSchema.blocks.length === 0
    )
      return true;
    return false;
  } catch {
    return false;
  }
}

const TestCaseSetup = lazy(() =>
  import("@src/module/ic-deployment/test-case-setup").then((module) => ({
    default: module.TestCaseSetup,
  })),
);

const PublishPopper = lazy(() => import("../../components/dialogs/publish/index.jsx"));

const WorkflowPublishV2 = lazy(
  () => import("../../components/dialogs/publish-workflow-v2/index.jsx"),
);

const ExecuteRun = lazy(() => import("../../components/execute-run/index.jsx"));

const LogsDialog = lazy(() => import("../../components/dialogs/logs-dialogs/index.jsx"));
const LogsDialogPanelWrapper = lazy(() =>
  import("../../module/panels/LogsDialog/index.js").then((module) => ({
    default: module.LogsDialogPanelWrapper,
  })),
);
const ExecutionResultsPopover = lazy(
  () => import("../../components/popper/execution-results-popover/index.jsx"),
);

import { getDisabledNodes } from "../../constants/node-rules.js";
import { useUpdateHITLNode } from "../../hooks/useUpdateHITLNode.js";
import { useSearchConfig } from "../../hooks/useSearchConfig.js";
import { useProcessAiCanvas } from "../../hooks/useProcessAiCanvas.js";
import { useAuth } from "@oute/oute-ds.common.molecule.tiny-auth";
import { PublishTitle } from "../../components/dialogs/publish/components/publish-title.jsx";
import { getTransformedNodeData } from "../../components/dialogs/publish/forms/utils/formResponses.js";
import { REDIRECT_PATHS } from "./constants/constants.js";
import {
  Edit3,
  Trash2,
  Play,
  Unlink,
  Plus,
  AlignJustify,
  StickyNote,
  FileText,
  User,
  Gift,
  LogOut,
  ShieldAlert,
  Copy,
} from "lucide-react";
import ErrorHandlingModal from "../../components/canvas/extensions/common-components/ErrorHandlingModal.jsx";
import NullComponent from "../../components/NullComponent/index.jsx";
import Header from "../../components/studio/Header/index.jsx";
import BottomCtaContainer from "../../components/BottomCtaContainer/index.jsx";
// import QuickAccessPanel from "../../components/QuickAccessPanel";
import useKeydown from "../../hooks/useKeyDown.js";
import useContextMenu from "../../hooks/useContextMenu.js";
import {
  formatSingleFormLog,
  formatSingleLog,
} from "@oute/oute-ds.common.molecule.terminal";
import { shouldCheckReferences } from "../../constants/canvas-model-events.js";
import { isEmpty } from "lodash";
import { TroubleShootCard } from "../../components/trouble-shoot-card/index.jsx";
import CommandPalette from "../../components/studio/CommandPalette/index.jsx";
import { useFormAI } from "../../components/canvas/hooks/useFormAI.js";
import { useWorkflowAI } from "../../components/canvas/hooks/useWorkflowAI.js";
import GuidedSetupOverlay from "@/components/guided-setup/GuidedSetupOverlay";
import GuidedDrawerBanner from "@/components/guided-setup/GuidedDrawerBanner";
const ExecutionHistoryDrawer = lazy(
  () => import("@src/components/canvas/execution-history"),
);
import { syncTestDataToNodes } from "@src/components/canvas/execution-history/testDataUtils";
const IC = () => {
  const context = useContext(ICStudioContext);

  // Safe destructuring with default values to prevent errors if context is null
  const {
    assetId,
    workspaceId,
    parentId,
    projectId,
    eventType,
    userData,
    setUserData,
    isEmbedMode,
    isEmbedAuthenticated,
    pendingEmbedCanvasData,
    setPendingEmbedCanvasData,
    embedSendMessage,
  } = context || {};

  useEffect(() => {
    resetSuggestionSession();
  }, []);

  const { user } = useAuth();
  const canvasRef = useRef();
  const canvasContainerRef = useRef();
  const { stickyNoteHandlers } = useStickyNoteIntegration(canvasRef);
  const nodeModalRef = useRef();
  const isPublishRef = useRef();
  const publishBtnRef = useRef();
  const executeRunRef = useRef();
  const paramsRef = useRef({ current: null });

  const variablesRef = useRef(); //local, global
  const defaultDrawerRef = useRef();
  const workflowNameRef = useRef();
  const testModuleRef = useRef();
  const jsonUploadRef = useRef();
  const nodeConfigsRef = useRef({
    showDefaultTheme: false,
  });
  const publishRef = useRef();
  const isAiNodeFlow = useRef(false);
  const saveButtonRef = useRef();
  const [showNodeDialog, setShowNodeDialog] = useState(null);
  const [setupClarification, setSetupClarification] = useState(null);
  const [setupClarificationAnswers, setSetupClarificationAnswers] = useState({});
  const [guidedDrawerContext, setGuidedDrawerContext] = useState(null);
  const [errorHandlingModalData, setErrorHandlingModalData] = useState(null);
  const [documentCoords, setDocumentCoords] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuItems, setContextMenuItems] = useState([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showNodeFinder, setShowNodeFinder] = useState(false);
  const [assetDetails, setAssetDetails] = useState(null);
  const [customDomainData, setCustomDomainData] = useState({
    domainList: [],
    customUrls: [],
  });

  // const [searchConfig, setSearchConfig] = useState([]);
  const {
    config: searchConfig,
    loadingConfig,
    integrationThumbnailMap,
  } = useSearchConfig({
    workspaceId,
  });
  const [selectedLinkData, setSelectedLinkData] = useState("");
  const [loading, setLoading] = useState("Initializing...");
  // const [showGenerateFormCTA, setShowGenerateFormCTA] = useState(false);
  // const [showCMSPreviewDialog, setShowCMSPreviewDialog] = useState(false);
  const [runTestCasePayload, setRunTestCasePayload] = useState(null);
  const [isAddNodesPanelOpen, setIsAddNodesPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isExecutionHistoryOpen, setIsExecutionHistoryOpen] = useState(false);
  const [refetchExecutionHistoryTrigger, setRefetchExecutionHistoryTrigger] =
    useState(0);
  const [runWorkflowWizardOpen, setRunWorkflowWizardOpen] = useState(false);
  const [runWorkflowSchema, setRunWorkflowSchema] = useState(null);
  // const [prevNodeOutput, setPrevNodeOutput] = useState(null);
  // const [showPublishPopper, setShowPublishPopper] = useState(false);

  const [errorsWarningsData, setErrorsWarningsData] = useState(null);
  const [showErrorWarningPopover, setShowErrorWarningPopover] = useState(null);

  const [executionsData, setExecutionsData] = useState(null);
  const [showExecutions, setShowExecutions] = useState(false);

  const [showAddLogsPopover, setShowAddLogsPopover] = useState(false);

  // const [showRunInputsPopover, setShowRunInputsPopover] = useState(false);
  // const [runInputSchema, setRunInputSchema] = useState(null);

  // const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [rightDrawerComponent, setRightDrawerComponent] = useState("default");

  // Draft recovery ref for Promise resolution
  const draftDialogResolveRef = useRef(null);

  const [dialogComponent, setDialogComponent] = useState(null);

  const setDialogComponentWithClose = useCallback((component) => {
    if (component != null) setIsExecutionHistoryOpen(false);
    setDialogComponent(component);
  }, []);

  const setRightDrawerComponentWithClose = useCallback((component) => {
    if (component !== "default") setIsExecutionHistoryOpen(false);
    setRightDrawerComponent(component);
  }, []);

  const [nodeCount, setNodeCount] = useState(0);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  // const [hideOverview, setHideOverview] = useState(false);
  // const [scale, setScale] = useState(100);

  const canvasTheme = getCanvasTheme();

  const linkedNodesRef = useRef(null); // Correctly initialize it as a mutable reference
  const nodeToReplaceRef = useRef(null); // Correctly initialize it as a mutable reference
  const ifElseNodeSelectedCallbackRef = useRef(null); // Callback to update If-Else block's moveTo
  const themeRef = useRef(getDefaultTheme()); //to access and save theme
  const moduleTestIdRef = useRef(null);
  const showNodeDialogRef = useRef(null);
  const showDialogRef = useRef(null);
  const embedNodeConfigCountRef = useRef(0);
  const embedNudgeShownRef = useRef(false);

  const handleEmbedSignUp = useCallback(() => {
    if (embedSendMessage) {
      embedSendMessage("embedAuthRequired", { source: "studio" });
    }
  }, [embedSendMessage]);

  useEffect(() => {
    showNodeDialogRef.current = showNodeDialog;
  }, [showNodeDialog]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const godata_cache = useSelector(getCache);
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    const wasSaving =
      prevLoadingRef.current &&
      typeof prevLoadingRef.current === "string" &&
      prevLoadingRef.current.toLowerCase().includes("saving");
    const isNotSavingNow =
      !loading ||
      (typeof loading === "string" &&
        !loading.toLowerCase().includes("saving"));

    if (wasSaving && isNotSavingNow) {
      setHasUnsavedChanges(false);
    }

    prevLoadingRef.current = loading;
  }, [loading]);

  const getUserData = useCallback(async () => {
    const response = await userServices.getUser();
    if (response?.status === "success") {
      setUserData(response.result);
    }
  }, [setUserData]);

  const { initUATU, onNewEvent } = useCanvasUtauEvents({
    assetDetails: assetDetails,
    userData: userData,
  });

  const { updateHITLData, postSaveHandlerForHITLNode } =
    useUpdateHITLNode(canvasRef);

  const updateGoDataCache = useCallback(
    (data) => {
      dispatch(updateCache(data));
    },
    [dispatch],
  );

  const debouncedDraftSave = useMemo(
    () =>
      debounce((assetId) => {
        if (canvasRef.current) {
          dispatch(
            updateCache({
              _r: canvasRef.current.getModelJSON(),
              asset_id: assetId,
              cached_at: Date.now(),
            }),
          );
        }
      }, 500),
    [dispatch],
  );

  useEffect(() => {
    return () => {
      debouncedDraftSave.flush();
    };
  }, [debouncedDraftSave]);

  useEffect(() => {
    if (!isEmbedMode || !pendingEmbedCanvasData || !canvasRef.current) return;
    console.log("[EmbedStudio] pendingEmbedCanvasData updated — reloading canvas, nodeCount:", (pendingEmbedCanvasData?.nodeDataArray || []).length);
    canvasRef.current.loadModelJSON(JSON.stringify(pendingEmbedCanvasData)).then(() => {
      canvasRef.current?.autoAlign();
      const nodeCount = (pendingEmbedCanvasData?.nodeDataArray || []).length;
      embedSendMessage?.({ event: "assetLoaded", nodeCount });
      setPendingEmbedCanvasData?.(null);
    });
  }, [isEmbedMode, pendingEmbedCanvasData, embedSendMessage, setPendingEmbedCanvasData]);

  const checkReferences = useCallback(() => {
    const model = JSON.parse(canvasRef.current.getModelJSON());
    mapLimit(canvasRef.current.getAllNodes() || [], 2, (node, callback) => {
      setTimeout(async () => {
        const validateNodeRefsResponse =
          await componentSDKServices.validateNodeRefs(model, node.key, {
            ...(variablesRef.current || {}),
            ...(paramsRef?.current?.params || {}),
          });
        if (
          validateNodeRefsResponse?.status === "success" &&
          validateNodeRefsResponse.result?.nodes?.length > 0
        ) {
          validateNodeRefsResponse.result.nodes.forEach((node) => {
            // Filter out false warnings for FILE_PICKER array item properties
            const filteredWarnings = (node.warnings || []).filter((warning) => {
              // Known FILE_PICKER array item properties that are valid but may trigger false warnings
              const filePickerProperties = ["url", "size", "mimeType", "name"];

              // Check if warning mentions a FILE_PICKER property
              const propertyMatch = warning.match(/The key \[([^\]]+)\]/);
              if (
                propertyMatch &&
                filePickerProperties.includes(propertyMatch[1])
              ) {
                // Extract node ID from warning message
                const nodeIdMatch = warning.match(/NODE - (\d+)/);
                if (nodeIdMatch) {
                  const referencedNodeId = nodeIdMatch[1];
                  const referencedNode =
                    canvasRef.current?.findNode?.(referencedNodeId)?.data;

                  // Check if referenced node is FILE_PICKER and has response as array
                  if (referencedNode?.type === "FILE_PICKER") {
                    const flattenedSchema =
                      referencedNode?.go_data?.output?.schema
                        ?.flattened_schema || [];
                    const hasResponseArray = flattenedSchema.some(
                      (item) =>
                        item?.key === "response" &&
                        item?.type?.toUpperCase() === "ARRAY",
                    );

                    // If response is an array, these properties are valid array item properties
                    if (hasResponseArray) {
                      return false; // Filter out this false positive warning
                    }
                  }
                }
              }
              return true; // Keep all other warnings
            });

            canvasRef.current.updateNode(node.key, {
              warnings: filteredWarnings,
            });
          });
        }
        callback();
      }, 0);
    });
  }, []);

  const { processFormData, processWorkflowData } = useProcessAiCanvas(
    canvasRef,
    checkReferences,
  );

  // Check if a node is a placeholder node (+ button)
  const isPlaceholderNode = useCallback((nodeData) => {
    if (!nodeData) return false;
    return (
      nodeData.name === "PLACEHOLDERNODE" ||
      nodeData.isPlaceholder === true ||
      nodeData.addNodeData != null ||
      nodeData.template === NODE_TEMPLATES.PLACEHOLDER
    );
  }, []);

  // Clean up orphan links for a node (links pointing to null/undefined, placeholder nodes, or duplicates)
  const cleanupOrphanLinks = useCallback(
    (nodeKey, validLinkKeys = null) => {
      if (!nodeKey || !canvasRef.current) return;

      const existingLinks = canvasRef.current.findLinksOutOf(nodeKey);
      if (!existingLinks || existingLinks.count === 0) return;

      const linksToRemove = [];
      const seenTargets = new Map(); // Track seen target nodes to detect duplicates

      existingLinks.each((link) => {
        const toNode = link.data.to;
        const linkKey = link.data.key;

        // If validLinkKeys is provided, remove links not in the list
        if (validLinkKeys && !validLinkKeys.includes(linkKey)) {
          linksToRemove.push(link.data);
          return;
        }

        // Check if link points to null/undefined
        if (!toNode) {
          linksToRemove.push(link.data);
          return;
        }

        // Check if link points to a placeholder node (node that doesn't exist or is a placeholder)
        const targetNode = canvasRef.current.findNode(toNode);
        if (!targetNode) {
          linksToRemove.push(link.data);
          return;
        }

        // Check if target is a placeholder node
        if (isPlaceholderNode(targetNode.data)) {
          linksToRemove.push(link.data);
          return;
        }

        // Check for duplicate links to the same target node
        if (seenTargets.has(toNode)) {
          // Keep the one with a label, remove the one without
          const existingLinkData = seenTargets.get(toNode);
          if (link.data.label && !existingLinkData.label) {
            // Current has label, remove the previous one
            linksToRemove.push(existingLinkData);
            seenTargets.set(toNode, link.data);
          } else {
            // Previous has label or both have no label, remove current
            linksToRemove.push(link.data);
          }
          return;
        }

        seenTargets.set(toNode, link.data);
      });

      // Remove orphan links and their target placeholder nodes
      linksToRemove.forEach((linkData) => {
        // First, check if this link points to a placeholder node and remove it
        if (linkData.to) {
          const targetNode = canvasRef.current.findNode(linkData.to);
          if (targetNode && isPlaceholderNode(targetNode.data)) {
            canvasRef.current.removeNode(targetNode);
          }
        }
        canvasRef.current.removeLink(linkData);
      });
    },
    [isPlaceholderNode],
  );

  // Clean up orphan placeholder nodes (+ buttons) connected to a node
  const cleanupPlaceholderNodes = useCallback(
    (nodeKey) => {
      if (!nodeKey || !canvasRef.current) return;

      const nodesToRemove = [];
      const linksToRemove = [];

      // Check outgoing links for placeholder targets
      const outgoingLinks = canvasRef.current.findLinksOutOf(nodeKey);
      if (outgoingLinks) {
        outgoingLinks.each((link) => {
          const toNode = link.data.to;
          if (!toNode) {
            linksToRemove.push(link.data);
            return;
          }

          const targetNode = canvasRef.current.findNode(toNode);
          if (!targetNode) {
            linksToRemove.push(link.data);
            return;
          }

          // Check if target is a placeholder node
          if (isPlaceholderNode(targetNode.data)) {
            nodesToRemove.push(targetNode);
            linksToRemove.push(link.data);
          }
        });
      }

      // Also check incoming links (placeholder could be source)
      const incomingLinks = canvasRef.current.findLinksInto(nodeKey);
      if (incomingLinks) {
        incomingLinks.each((link) => {
          const fromNode = link.data.from;
          if (!fromNode) {
            linksToRemove.push(link.data);
            return;
          }

          const sourceNode = canvasRef.current.findNode(fromNode);
          if (!sourceNode) {
            linksToRemove.push(link.data);
            return;
          }

          // Check if source is a placeholder node
          if (isPlaceholderNode(sourceNode.data)) {
            nodesToRemove.push(sourceNode);
            linksToRemove.push(link.data);
          }
        });
      }

      // Remove links first
      linksToRemove.forEach((linkData) => {
        canvasRef.current.removeLink(linkData);
      });

      // Then remove placeholder nodes
      nodesToRemove.forEach((node) => {
        canvasRef.current.removeNode(node);
      });

      // Additional pass: scan all nodes to find any orphan placeholders with no connections
      // This catches placeholders that got detached from their links
      const modelJson = canvasRef.current.getModelJSON();
      if (modelJson?.nodeDataArray) {
        const orphanPlaceholders = modelJson.nodeDataArray.filter(
          (nodeData) => {
            if (!isPlaceholderNode(nodeData)) return false;
            // Check if this placeholder has any valid connections
            const hasIncomingLinks = modelJson.linkDataArray?.some(
              (link) => link.to === nodeData.key && link.from,
            );
            const hasOutgoingLinks = modelJson.linkDataArray?.some(
              (link) => link.from === nodeData.key && link.to,
            );
            // Placeholder is orphan if it has no valid connections
            return !hasIncomingLinks && !hasOutgoingLinks;
          },
        );

        orphanPlaceholders.forEach((nodeData) => {
          const node = canvasRef.current.findNode(nodeData.key);
          if (node) {
            canvasRef.current.removeNode(node);
          }
        });
      }
    },
    [isPlaceholderNode],
  );

  const updateNodeLinks = useCallback((node, linksToUpdate) => {
    // Get existing links for the node
    const existingLinks = canvasRef.current.findLinksOutOf(node.data.key);

    // Track the link data for easy search and update
    let existingLinkData = {};
    existingLinks.each((link) => {
      existingLinkData[link.data.key] = link.data;
    });

    linksToUpdate.forEach((linkToUpdate, index) => {
      // Check if the link already exists by key first
      let existingLink = existingLinks
        .filter((l) => l.data.key === linkToUpdate.key)
        .first();

      // If no match by key but we have a 'to' node, try matching by 'to' node
      if (!existingLink && linkToUpdate.to) {
        existingLink = existingLinks
          .filter((l) => l.data.to === linkToUpdate.to)
          .first();

        if (existingLink) {
          // Update the link's key to match the expected blockId
          if (existingLink.data.key !== linkToUpdate.key) {
            canvasRef.current.updateLink({
              linkData: existingLink.data,
              linkKeyToUpdate: "key",
              linkKeyToUpdateValue: linkToUpdate.key,
            });

            // Also update the label if provided
            if (
              linkToUpdate.label &&
              existingLink.data.label !== linkToUpdate.label
            ) {
              canvasRef.current.updateLink({
                linkData: existingLink.data,
                linkKeyToUpdate: "label",
                linkKeyToUpdateValue: linkToUpdate.label,
              });
            }

            // Refresh the link reference after update
            const diagram = canvasRef.current.getDiagram();
            const matchingLink = diagram.findLinkForData({
              from: node.data.key,
              to: linkToUpdate.to,
              key: linkToUpdate.key,
            });
            if (matchingLink) {
              existingLink = matchingLink;
            }
          }
        }
      }

      if (existingLink) {
        // Update the link label if necessary
        if (
          linkToUpdate.label &&
          existingLink.data.label !== linkToUpdate.label
        ) {
          // update link label
          canvasRef.current.updateLink({
            linkData: existingLink.data,
            linkKeyToUpdate: "label",
            linkKeyToUpdateValue: linkToUpdate.label,
          });
        }
        // Update to the new node
        if (linkToUpdate.to !== existingLink.data.to) {
          const oldConnectedNode = canvasRef.current.findNode(
            existingLink.data.to,
          );
          // Update link to new node
          if (linkToUpdate.to) {
            canvasRef.current.updateLink({
              linkData: existingLink.data,
              linkKeyToUpdate: "to",
              linkKeyToUpdateValue: linkToUpdate.to,
            });
            // Remove if placeholder node
            if (
              oldConnectedNode?.data?.template === NODE_TEMPLATES.PLACEHOLDER
            ) {
              canvasRef.current.removeNode(oldConnectedNode);
            } else if (
              oldConnectedNode &&
              !isPlaceholderNode(oldConnectedNode.data)
            ) {
              const newTargetNode = canvasRef.current.findNode(linkToUpdate.to);
              if (newTargetNode?.location) {
                const spacing = 300;
                const newX = newTargetNode.location.x + spacing;
                const newY = newTargetNode.location.y;
                canvasRef.current.moveNode(oldConnectedNode, newX, newY);
              }
            }
          } else {
            // If previous connected node was not a placeholder node then create a placeholder
            if (oldConnectedNode.data.template !== NODE_TEMPLATES.PLACEHOLDER) {
              const placeholderNode = canvasRef.current.createNode(
                {
                  template: NODE_TEMPLATES.PLACEHOLDER,
                },
                {
                  location: getChildNodeLocation(
                    node.location,
                    linksToUpdate.length,
                    index,
                  ),
                },
              );
              canvasRef.current.updateLink({
                linkData: existingLink.data,
                linkKeyToUpdate: "to",
                linkKeyToUpdateValue: placeholderNode.key,
              });
            }
          }
        }
      } else {
        if (linkToUpdate.to) {
          // Create a new link to existing node
          canvasRef.current.createLink({
            from: node.data.key,
            to: linkToUpdate.to,
            label: linkToUpdate.label,
            key: linkToUpdate.key,
            metadata: {
              ...(linkToUpdate?.metadata || {}),
            },
          });
        } else {
          // Create a placeholder node and link
          if (
            process.env.NODE_ENV === "development" &&
            node?.data?.type === IF_ELSE_TYPE
          ) {
            console.log("[updateNodeLinks] Creating IF Else placeholder link", {
              nodeKey: node.data.key,
              linkKey: linkToUpdate.key,
              label: linkToUpdate.label,
            });
          }
          const placeholderNode = canvasRef.current.createNode(
            {
              template: NODE_TEMPLATES.PLACEHOLDER,
            },
            {
              location: getChildNodeLocation(
                node.location,
                linksToUpdate.length,
                linksToUpdate.indexOf(linkToUpdate),
              ),
            },
          );
          canvasRef.current.createLink({
            from: node.data.key,
            to: placeholderNode.key,
            label: linkToUpdate.label,
            key: linkToUpdate.key,
            metadata: {
              ...(linkToUpdate?.metadata || {}),
            },
            ...(linkToUpdate.label === "ELSE" ? { linkForElse: true } : {}),
          });
        }
      }

      // Remove this link from the existingLinkData as it's accounted for
      delete existingLinkData[linkToUpdate.key];
    });

    // Remove any remaining links that were not updated (orphans)
    for (let key in existingLinkData) {
      canvasRef.current.removeLink(existingLinkData[key]);
    }
  }, []);

  const updateLabelReferences = useCallback(
    ({ updatedNodeData = {} }) => {
      let nodeRefStorage = {};
      const canvasNodes = canvasRef.current?.getAllNodes?.() || [];
      canvasNodes?.forEach((node) => {
        if (!node?.key) return;
        nodeRefStorage[node?.key] = {
          name: node?.name ?? node?.text ?? node?.description ?? "",
          type: node?.type,
        };
      });
      mapLimit(canvasNodes, 2, (node, callback) => {
        if (!node?.type) {
          return callback();
        }
        setTimeout(async () => {
          if (node?.type === IF_ELSE_TYPE_V2) {
            const used_ref_src_ids =
              node?.tf_data?.config?.used_ref_src_ids || [];
            if (!used_ref_src_ids?.includes?.(updatedNodeData?.key))
              return callback();
            const newNode = canvasRef.current?.createNode(node);
            updateNodeLinks(
              newNode,
              newNode?.data?.go_data?.conditions?.map((statement, index) => {
                let conditionStr = "";
                const conditionStrResponse =
                  componentSDKServices.conditionsToString(
                    statement,
                    nodeRefStorage,
                  );

                if (
                  conditionStrResponse?.status === SUCCESS &&
                  !isEmpty(conditionStrResponse?.result?.condition_str)
                ) {
                  conditionStr = conditionStrResponse?.result?.condition_str;
                } else {
                  conditionStr =
                    statement.type === "else"
                      ? "ELSE"
                      : `Statement ${index + 1}`;
                }
                return {
                  label: conditionStr,
                  to: statement.action,
                  key: statement.id,
                };
              }),
            );
          }
          callback();
        }, 0);
      });
    },
    [updateNodeLinks],
  );

  const checkAssetExistence = useCallback(
    async (params) => {
      setLoading("Checking permissions...");
      const accessInfoResponse = await assetSDKServices.getAccessInfo(
        params?.assetId,
      );
      if (accessInfoResponse?.status === SUCCESS) {
        if (!accessInfoResponse.result.can_access) {
          navigate("resource-not-found");
        } else if (accessInfoResponse.result.in_trash) {
          setLoading(false);
          const response = await showConfirmDialog({
            showCloseIcon: false,
            dialogTitle: <DeletedAssetTitle />,
            dialogContent: <DeletedAssetMessage />,
            okLabel: "Take out of bin",
            cancelLabel: "Go to home screen",
          });
          if (response === "ok") {
            setLoading("Restoring in progress...");
            try {
              let isRestored = false;
              const response = await assetSDKServices.restoreAsset([
                params?.assetId,
              ]);
              if (response?.status === SUCCESS) isRestored = true;
              return {
                doesAssetExists: true,
                isRestored,
              };
            } finally {
              setLoading(false);
            }
          } else {
            navigate(serverConfig.OUTE_URL, {
              relative: "path",
            });
          }
        }
      }
      setLoading(null);
      return {
        doesAssetExists: true,
      };
    },
    [navigate],
  );

  const getSavePayload = useCallback(
    async (
      { name: canvasAssetName, description: canvasAssetDescription },
      currentAssetDetails = assetDetails,
    ) => {
      const nodes = canvasRef.current?.getAllNodes() || [];
      const transformedNodes = getTransformedNodeData(nodes);

      // Initialize the base payload object
      const name = canvasAssetName || currentAssetDetails?.asset?.name;

      // canvasAssetDescription can be empty string when user removes the description
      const description =
        canvasAssetDescription !== undefined
          ? canvasAssetDescription
          : currentAssetDetails?.asset?.meta?.description;

      let payload = {};

      // Set up the main payload with essential properties
      payload = {
        ...currentAssetDetails, // Spread existing asset details
        annotation: getAnnotation(getMode(), eventType), // Generate annotation based on current mode and event type
        asset_meta: {
          ...currentAssetDetails?.asset_meta, // Merge existing asset meta data
          bgColor: CANVAS_BG, // Set background color for the asset
          description: description,
          formMeta: { questionCount: transformedNodes?.length },
        },
        name, // Asset name (provided as argument)
        parent_id: getMode() === MODE.CMS_CANVAS ? projectId : parentId, // Set parent_id based on the current mode (CMS or regular mode)
        project_id: projectId, // Project ID to associate with this asset
        _r: canvasRef.current.getModelJSON(), // Serialize the canvas model state
        workspace_id: workspaceId, // Workspace ID where the asset belongs
        meta: {
          ...currentAssetDetails?.meta, // Merge existing metadata
          _t: themeRef?.current,
          params: paramsRef?.current?.params || {}, // Include params from a reference, if available
          moduleTestId: moduleTestIdRef?.current,
        },
      };

      // Return the final payload object with or without thumbnail information
      return payload;
    },
    [assetDetails, eventType, parentId, projectId, workspaceId],
  );

  const saveWorkflow = useCallback(
    async ({ name, description }) => {
      const savePayload = await getSavePayload({ name, description });
      const saveCanvasResponse = await canvasServices.saveCanvas(savePayload);

      let updatedAssetDetails = { ...assetDetails };
      if (saveCanvasResponse?.status === SUCCESS) {
        const isFirstSave = !assetDetails?.asset_id;
        setAssetDetails((prev) => {
          return { ...prev, ...savePayload, ...saveCanvasResponse.result };
        });
        updateGoDataCache(null);
        if (!isEmbedMode) {
          window.history.replaceState(
            "",
            "",
            `/?${QUERY_KEY}=${encodeParameters({
              [WORKSPACE_KEY]: workspaceId,
              [PROJECT_KEY]: projectId,
              [PARENT_KEY]: getMode() === MODE.CMS_CANVAS ? projectId : parentId,
              [ASSET_KEY]: saveCanvasResponse.result.asset_id,
              [EVENT_TYPE_KEY]: eventType,
            })}`,
          );
        }
        if (isEmbedMode && embedSendMessage) {
          const savedAssetId = saveCanvasResponse.result.asset_id || saveCanvasResponse.result._id;
          if (isFirstSave && savedAssetId) {
            console.log("[EmbedStudio] saveWorkflow: first save — assetCreated, asset_id:", savedAssetId);
            embedSendMessage({ event: "assetCreated", assetId: savedAssetId, workspaceId, projectId });
          } else if (savedAssetId) {
            console.log("[EmbedStudio] saveWorkflow: asset saved — asset_id:", savedAssetId);
            embedSendMessage({ event: "assetUpdated", assetId: savedAssetId });
          }
        }
        if (!isEmbedMode) onNewEvent(UATU_CANVAS, {
          subEvent: UATU_PREDICATE_EVENTS_CANVAS.ASSET_SAVE,
          annotation: getAnnotation(getMode(), eventType),
        });
        if (getMode() === MODE.WORKFLOW_CANVAS) {
          onNewEvent(UATU_CANVAS, {
            subEvent: UATU_PREDICATE_EVENTS_CANVAS.FORM_SAVE,
          });
        }
      }
      return updatedAssetDetails;
    },
    [
      onNewEvent,
      assetDetails,
      eventType,
      getSavePayload,
      parentId,
      projectId,
      updateGoDataCache,
      workspaceId,
    ],
  );

  const saveWorkflowWithParams = useCallback(
    async (params) => {
      let savePayload = await getSavePayload({ name: params?.name });
      savePayload = { ...savePayload, ...params };
      const saveCanvasResponse = await canvasServices.saveCanvas(savePayload);
      if (saveCanvasResponse?.status === SUCCESS) {
        setAssetDetails((prev) => {
          return { ...prev, ...savePayload, ...saveCanvasResponse.result };
        });
        updateGoDataCache(null);
        window.history.replaceState(
          "",
          "",
          `/?${QUERY_KEY}=${encodeParameters({
            [WORKSPACE_KEY]: workspaceId,
            [PROJECT_KEY]: projectId,
            [PARENT_KEY]: getMode() === MODE.CMS_CANVAS ? projectId : parentId,
            [ASSET_KEY]: saveCanvasResponse.result.asset_id,
            [EVENT_TYPE_KEY]: eventType,
          })}`,
        );
      }
    },
    [
      eventType,
      getSavePayload,
      parentId,
      projectId,
      updateGoDataCache,
      workspaceId,
    ],
  );

  const onWorkflowStatusChange = useCallback(
    async ({ enabled, response }) => {
      const mergeExecutionControlState = (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...(response?.result || {}),
          asset: {
            ...prev?.asset,
            settings: {
              ...prev?.asset?.settings,
              execution_control: {
                enabled,
              },
            },
          },
        };
      };

      if (response != null) {
        setAssetDetails((prev) => mergeExecutionControlState(prev));
        return;
      }

      const assetId = assetDetails?.asset?._id ?? assetDetails?.asset_id;
      if (!assetId) {
        setAssetDetails((prev) => mergeExecutionControlState(prev));
        return;
      }

      try {
        const payload = {
          asset_id: assetId,
          settings: {
            execution_control: { enabled },
          },
        };
        const saveResponse = await canvasServices.saveCanvas(payload);
        if (saveResponse?.status === SUCCESS) {
          const result = saveResponse?.result || {};
          setAssetDetails((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ...result,
              asset: {
                ...prev?.asset,
                ...result?.asset,
                settings: {
                  ...prev?.asset?.settings,
                  ...result?.asset?.settings,
                  execution_control: { enabled },
                },
              },
            };
          });
        } else {
          toast.error("Failed to update workflow status");
        }
      } catch {
        toast.error("Failed to update workflow status");
      }
    },
    [assetDetails?.asset?._id, assetDetails?.asset_id],
  );

  const onAssetPublishSuccess = useCallback(
    (newAssetDetails) => {
      setAssetDetails({ ...newAssetDetails });
      onNewEvent(UATU_CANVAS, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.ASSET_PUBLISH,
        annotation: getAnnotation(getMode(), eventType),
      });
      if (getMode() === MODE.WORKFLOW_CANVAS) {
        onNewEvent(UATU_CANVAS, {
          subEvent: UATU_PREDICATE_EVENTS_CANVAS.FORM_PUBLISH,
        });

        window.parent.postMessage(
          {
            type: "STUDIO_PUBLISHED",
            payload: {
              message: JSON.stringify({
                status: "success",
                data: newAssetDetails,
              }),
            },
          },
          "*", // Replace "*" with specific origin for security
        );
      }
      updateGoDataCache(null);
    },
    [setAssetDetails],
  );

  const updateWorkflow = useCallback(
    async ({ name, description }, params = { isPublish: false }) => {
      if (!name) {
        isPublishRef.current = params?.isPublish;
        setDialogComponentWithClose(WORKFLOW_NAME_DIALOG);
        return;
      }
      //check if assets and asset exists
      if (assetDetails?.asset_id) {
        await checkAssetExistence({
          assetId: assetDetails?.asset_id,
        });
      }
      let initialAssetDetails = { ...assetDetails };
      if (
        !params?.isPublish ||
        (params?.isPublish && !assetDetails?.asset_id)
      ) {
        try {
          setLoading("Saving your progress...");
          initialAssetDetails = await saveWorkflow({ name, description });
        } finally {
          setLoading(false);
        }
      }
      if (params?.isPublish) {
        if (dialogComponent === WORKFLOW_NAME_DIALOG) {
          setDialogComponentWithClose(null);
        }
        const nodes = canvasRef.current?.getAllNodes() || [];
        if (nodes.length === 0) {
          toast.error(
            `Please add atleast one node to publish your ${
              getMode() === MODE.WORKFLOW_CANVAS ? "form" : "workflow"
            }.`,
          );
          defaultDrawerRef.current?.clickAction("add-nodes");
          return;
        }
        const errors = canvasRef.current.checkErrors();
        if (errors.length > 0) {
          toast.error(
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexDirection: "column",
              }}
            >
              Please fix the following errors before publishing your{" "}
              {getMode() === MODE.WORKFLOW_CANVAS ? "form" : "workflow"}{" "}
              <ODSLabel variant="body1" color="#fff">
                {`${errors?.[0]?.data?.name}: ${errors?.[0]?.data?.errors?.[0]}`}
              </ODSLabel>
            </div>,
          );
          return;
        }
        if (getMode() === MODE.WORKFLOW_CANVAS) {
          setDialogComponentWithClose(FORM_PUBLISH_DIALOG);
          return;
        }
        setDialogComponentWithClose(WORKFLOW_PUBLISH_DIALOG);
      }
    },
    [
      assetDetails,
      checkAssetExistence,
      saveWorkflow,
      dialogComponent,
      userData,
      onAssetPublishSuccess,
      onNewEvent,
      getSavePayload,
      onWorkflowStatusChange,
    ],
  );

  const saveNodeDataHandler = useCallback(
    async (
      node,
      go_data_payload,
      /**
       * acceptable keys to change for updated_node_data
       *
       * _src
       * name
       * description
       * background
       * foreground
       * errors
       * warnings
       * logs
       *
       * DO NOT CHANGE type, key, template !!!
       */
      updated_node_data = {},
      openNodeAfterCreate = true,
      updateReferences = true,
      shouldUpdateLabelReferences = true,
    ) => {
      setHasUnsavedChanges(true);
      const last_updated = Date.now();
      console.log("[saveNodeDataHandler] received", {
        nodeKey: node?.key,
        nodeType: node?.type,
        updated_node_data_type: updated_node_data?.type,
        updated_node_data_subType: updated_node_data?.subType,
        subTypeMatches: updated_node_data?.subType === TRIGGER_SETUP_TYPE,
      });
      if (updated_node_data?.subType === TRIGGER_SETUP_TYPE) {
        if (!updated_node_data?.type) {
          canvasRef.current.createNode({
            ...node,
            errors: ["Incomplete Trigger Setup"],
            go_data: { last_updated },
          });
          if (!openNodeAfterCreate) {
            setRightDrawerComponentWithClose("default");
            setShowNodeDialog(null);
          }
          return;
        }
        // Trigger type is defined: persist go_data_payload (same as legacy – payload is stored in node)
        const triggerGoData = { ...(go_data_payload || {}), last_updated };
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[saveNodeDataHandler] TRIGGER_SAVE – storing go_data for node",
            {
              nodeKey: node?.key,
              triggerType: updated_node_data?.type,
              go_data_keys: Object.keys(triggerGoData),
              go_data_payload_keys: go_data_payload
                ? Object.keys(go_data_payload)
                : [],
            },
          );
        }
        // Apply full updated_node_data so type/subType/name/_src match legacy (e.g. FORM_TRIGGER, Form Trigger, form icon)
        let modifiedNodeData = {
          ...node,
          ...updated_node_data,
          type: updated_node_data?.type ?? node.type,
          subType: updated_node_data?.subType ?? "TRIGGER_SETUP",
          name: updated_node_data?.name ?? node.name,
          _src: updated_node_data?._src || node._src,
          go_data: triggerGoData,
          tf_data: undefined,
        };
        const updatedNode = canvasRef.current.createNode(modifiedNodeData);
        node = updatedNode.data;
        console.log("[saveNodeDataHandler] TRIGGER_SAVE – after createNode", {
          nodeKey: node?.key,
          node_type: node?.type,
          node_subType: node?.subType,
          node_name: node?.name,
        });
      }
      node.warnings = [];
      if (
        updated_node_data?.subType === TRIGGER_SETUP_TYPE &&
        Array.isArray(updated_node_data?.errors) &&
        updated_node_data.errors.length > 0
      ) {
        node.errors = updated_node_data.errors;
      } else {
        node.errors = [];
      }
      let response;

      // Add logging for If-Else type nodes (development only)
      if (
        process.env.NODE_ENV === "development" &&
        node.type === IF_ELSE_TYPE
      ) {
        console.log("[saveNodeDataHandler] IF-ELSE SAVE:", {
          nodeKey: node.key,
          blocksCount: go_data_payload?.blocks?.length ?? 0,
          ifDataCount: go_data_payload?.ifData?.length ?? 0,
          elseDataCount: go_data_payload?.elseData?.length ?? 0,
          firstBlockConditionGroup: go_data_payload?.blocks?.[0]?.conditionGroup
            ? "present"
            : "missing",
          firstIfDataConditionGroup: go_data_payload?.ifData?.[0]
            ?.conditionGroup
            ? "present"
            : "missing",
        });
      }

      // Preserve HITL node connection IDs BEFORE transformNode so backend validation passes
      let preservedHitlIds = {};
      if (node.type === HITL_TYPE || node.type === HITL_V2_TYPE) {
        const existingLinks = canvasRef.current.findLinksOutOf(node.key);
        let responseNodeId = node.go_data?.on_response_node_id;
        let initiateNodeId = node.go_data?.initiate_node_id;
        existingLinks?.each?.((link) => {
          if (link.data?.isOnResponseLink) {
            responseNodeId = link.data.to;
          } else if (link.data?.isInitiateLink) {
            initiateNodeId = link.data.to;
          }
        });
        if (responseNodeId)
          preservedHitlIds.on_response_node_id = responseNodeId;
        if (initiateNodeId) preservedHitlIds.initiate_node_id = initiateNodeId;
      }

      try {
        if (
          go_data_payload &&
          node.type !== TRIGGER_SETUP_TYPE &&
          !updated_node_data?.errors?.length
        ) {
          if (process.env.NODE_ENV === "development") {
            console.log("[saveNodeDataHandler] Calling transformNode for:", {
              nodeKey: node.key,
              nodeType: node.type,
              hasGoData: !!go_data_payload,
              hasPreservedIds: Object.keys(preservedHitlIds).length > 0,
            });
          }

          response = await componentSDKServices.transformNode(
            canvasRef.current.getModelJSON(),
            node.key,
            {
              ...(go_data_payload || {}),
              ...preservedHitlIds, // Include IDs in transformNode payload for backend validation
              logs: updated_node_data?.logs || node.logs,
              last_updated,
            },
          );

          if (process.env.NODE_ENV === "development") {
            console.log("[saveNodeDataHandler] transformNode response:", {
              nodeKey: node.key,
              status: response?.status,
              hasTfData: !!response?.result?.tf_data,
              hasTfOutput: !!response?.result?.tf_output,
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[saveNodeDataHandler] transformNode error for",
            node.key,
            ":",
            error,
          );
        }
      }

      const nodeErrorConfig =
        node?.errorConfig || updated_node_data?.errorConfig;
      let error_handling = null;
      if (nodeErrorConfig && nodeErrorConfig.strategy) {
        error_handling = { strategy: nodeErrorConfig.strategy };
        if (nodeErrorConfig.strategy === "retry") {
          error_handling.retryCount = nodeErrorConfig.retryCount || 3;
          error_handling.retryDelay = nodeErrorConfig.retryDelay || 5;
          error_handling.retryFallback =
            nodeErrorConfig.retryFallback || "stop";
        }
        if (
          nodeErrorConfig.strategy === "custom_error_flow" ||
          (nodeErrorConfig.strategy === "retry" &&
            nodeErrorConfig.retryFallback === "custom_error_flow")
        ) {
          if (nodeErrorConfig.jump_to_id) {
            error_handling.jump_to_id = nodeErrorConfig.jump_to_id;
          } else {
            try {
              const existingLinks = canvasRef.current.findLinksOutOf(node.key);
              existingLinks?.each?.((link) => {
                if (
                  link.data?.category === "errorLink" ||
                  link.data?.isErrorLink
                ) {
                  const targetKey = link.data?.to;
                  if (targetKey) {
                    error_handling.jump_to_id = targetKey;
                  }
                }
              });
            } catch (e) {}
          }
        }
      }

      // Only use transformation results if transformation succeeded
      const tfData =
        response?.status === "success" ? response?.result?.tf_data : undefined;
      const tfOutput =
        response?.status === "success"
          ? response?.result?.tf_output
          : undefined;

      const newNode = canvasRef.current.createNode(
        {
          ...node,
          ...updated_node_data,
          tf_data: tfData,
          go_data: {
            ...go_data_payload,
            ...preservedHitlIds,
            ...(tfOutput && { output: tfOutput }),
            last_updated,
            ...(error_handling ? { error_handling } : {}),
          },
        },
        {
          openNodeAfterCreate,
        },
      );
      if (newNode.data.type === IF_ELSE_TYPE_V2) {
        updateNodeLinks(
          newNode,
          newNode.data?.go_data?.conditions?.map((statement, index) => {
            let conditionStr = "";
            const conditionStrResponse =
              componentSDKServices.conditionsToString(statement);

            if (
              conditionStrResponse?.status === SUCCESS &&
              !isEmpty(conditionStrResponse?.result?.condition_str)
            ) {
              conditionStr = conditionStrResponse?.result?.condition_str;
            } else {
              conditionStr =
                statement.type === "else" ? "ELSE" : `Statement ${index + 1}`;
            }
            return {
              label: conditionStr,
              to: statement.action,
              key: statement.id,
            };
          }),
        );
      } else if (
        newNode.data.type === HITL_TYPE ||
        newNode.data.type === HITL_V2_TYPE
      ) {
        postSaveHandlerForHITLNode(newNode);
      }

      if (newNode?.data?.key) {
        const {
          errors: validatedErrors,
          warnings: validatedWarnings,
          validationIssues,
        } = validateNodeConfig(newNode.data);
        canvasRef.current.updateNode(newNode.data.key, {
          errors: validatedErrors || [],
          warnings: validatedWarnings || [],
          validationIssues: validationIssues ?? null,
        });
      }

      if (updateReferences) checkReferences();
      if (shouldUpdateLabelReferences)
        updateLabelReferences({ updatedNodeData: newNode?.data });
      if (!openNodeAfterCreate) {
        setRightDrawerComponentWithClose("default");
        setShowNodeDialog(null);
      }
      updateGoDataCache({
        _r: canvasRef.current.getModelJSON(),
        asset_id: assetId,
      });
      const event = new CustomEvent("onNodeSave", {
        detail: node,
      });
      document.dispatchEvent(event);
    },
    [
      assetId,
      postSaveHandlerForHITLNode,
      updateGoDataCache,
      updateLabelReferences,
      updateNodeLinks,
    ],
  );

  const autoSaveNodeDataHandler = useCallback(
    async (
      nodeData,
      go_data_payload,
      /**
       * acceptable keys to change for updated_node_data
       *
       * _src
       * name
       * description
       * background
       * foreground
       * errors
       * warnings
       * logs
       *
       * DO NOT CHANGE type, key, template !
       */
      updated_node_data = {},
      updateReferences = false,
      openNodeAfterCreate = false,
    ) => {
      console.log(
        "autoSaveNodeDataHandler",
        nodeData,
        go_data_payload,
        updated_node_data,
        openNodeAfterCreate,
        updateReferences,
      );
      saveNodeDataHandler(
        nodeData,
        go_data_payload,
        updated_node_data,
        openNodeAfterCreate,
        updateReferences,
      );
    },
    [saveNodeDataHandler],
  );

  // Create nodeIdMap from searchConfig for useWorkflowAI hook
  const nodeIdMap = useMemo(() => {
    if (searchConfig) {
      return createNodeIdMap(searchConfig);
    }
    return {};
  }, [searchConfig]);

  // Initialize useFormAI hook to handle AI form generation events
  useFormAI({
    canvasRef,
    onConfirmClear: async () => {
      // Use default confirm clear behavior
      return true;
    },
    processFormData,
    saveNodeDataHandler,
  });

  // Initialize useWorkflowAI hook to handle AI workflow generation events
  useWorkflowAI({
    canvasRef,
    onConfirmClear: async () => {
      // Use default confirm clear behavior
      return true;
    },
    processWorkflowData,
    saveNodeDataHandler,
    nodeIdMap,
  });

  const getWorkflowContext = useCallback(() => {
    try {
      const diagram = canvasRef.current?.getDiagram?.();
      if (!diagram) return {};
      const model = diagram.model;
      const nodeDataArray = model?.nodeDataArray || [];
      const linkDataArray = model?.linkDataArray || [];

      const FRIENDLY_NAMES = {
        TRIGGER_SETUP: "Manual Trigger",
        TRIGGER_SETUP_NODE: "Manual Trigger",
        FORM_TRIGGER: "Form Trigger",
        CUSTOM_WEBHOOK: "Webhook Trigger",
        WEBHOOK_V2: "Webhook Trigger",
        TIME_BASED_TRIGGER_V2: "Schedule Trigger",
        TIME_BASED_TRIGGER: "Schedule Trigger",
        SHEET_TRIGGER_V2: "Sheet Trigger",
        SHEET_TRIGGER: "Sheet Trigger",
        SHEET_DATE_FIELD_TRIGGER: "Sheet Date Trigger",
        HTTP: "HTTP Request",
        TRANSFORMER_V3: "Data Transformer",
        TRANSFORMER: "Data Transformer",
        FORMULA_FX: "Formula",
        SELF_EMAIL: "Send Email",
        CREATE_RECORD_V2: "Create Record",
        UPDATE_RECORD_V2: "Update Record",
        DB_FIND_ALL_V2: "Find All Records",
        DB_FIND_ONE_V2: "Find One Record",
        DELETE_RECORD_V2: "Delete Record",
        GPT: "AI Text Generator",
        GPT_RESEARCHER: "AI Researcher",
        GPT_WRITER: "AI Writer",
        GPT_ANALYZER: "AI Analyzer",
        GPT_SUMMARIZER: "AI Summarizer",
        IF_ELSE_V2: "If/Else",
        IF_ELSE: "If/Else",
        LOOP_START: "Loop Start",
        LOOP_END: "Loop End",
        ITERATOR_V2: "Loop",
        ITERATOR: "Loop",
        DELAY_V2: "Delay",
        DELAY: "Delay",
        PERSON_ENRICHMENT_V2: "Person Enrichment",
        COMPANY_ENRICHMENT_V2: "Company Enrichment",
        PLACEHOLDER: "Placeholder",
        BREAK: "Stop Loop",
        HITL: "Human Review",
        INTEGRATION: "Integration",
        "Input Setup": "Manual Trigger",
        "Success Setup": "End",
      };

      const friendlyType = (t) =>
        FRIENDLY_NAMES[t] ||
        (t || "Step")
          .replace(/_/g, " ")
          .replace(/\bV\d+$/i, "")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim() ||
        "Step";

      const nodeMap = {};
      nodeDataArray.forEach((n) => {
        nodeMap[n.key] = n;
      });

      const nodes = nodeDataArray.map((n) => ({
        key: n.key,
        name: n.name || n.text,
        type: friendlyType(n.type),
        subType: n.type,
        config: n.go_data || {},
        errors: n.errors,
        warnings: n.warnings,
        hasTestData: !!n._testOutput,
      }));

      const links = linkDataArray.map((l) => ({
        from: l.from,
        to: l.to,
        fromName: nodeMap[l.from]?.name || nodeMap[l.from]?.text || "",
        toName: nodeMap[l.to]?.name || nodeMap[l.to]?.text || "",
        label: l.text || l.label || "",
        category: l.category || "",
        isErrorLink: l.category === "error" || l.isErrorLink,
      }));

      const TRIGGER_TYPES_SET = new Set([
        "Input Setup",
        "CUSTOM_WEBHOOK",
        "TIME_BASED_TRIGGER",
        "SHEET_TRIGGER",
        "SHEET_DATE_FIELD_TRIGGER",
        "FORM_TRIGGER",
        "TRIGGER_SETUP",
        "TRIGGER_SETUP_NODE",
        "TIME_BASED_TRIGGER_V2",
        "SHEET_TRIGGER_V2",
        "WEBHOOK_V2",
      ]);
      const isTrigger = (nd) =>
        TRIGGER_TYPES_SET.has(nd.type) ||
        TRIGGER_TYPES_SET.has(nd.subType) ||
        nd.template === "TRIGGER_SETUP" ||
        nd.template === "TRIGGER";

      const currentCanvasType = getMode();
      const flowIssues = [];
      const targetKeys = new Set(linkDataArray.map((l) => l.to));
      const sourceKeys = new Set(linkDataArray.map((l) => l.from));
      const terminalTypes = new Set(["Success Setup", "PLACEHOLDER"]);

      if (
        currentCanvasType !== "WORKFLOW_CANVAS" &&
        !nodeDataArray.some(isTrigger) &&
        nodeDataArray.length >= 2
      ) {
        flowIssues.push("No trigger node found — the workflow has no starting point");
      }

      nodeDataArray.forEach((n) => {
        const isTarget = targetKeys.has(n.key);
        const isSource = sourceKeys.has(n.key);
        const isTerminal =
          terminalTypes.has(n.type) ||
          n.type?.includes("End") ||
          n.type?.includes("Exit");
        if (isTarget && !isSource && !isTerminal && !isTrigger(n)) {
          flowIssues.push(
            `"${n.name || n.text || friendlyType(n.type)}" is a dead end — nothing follows it`,
          );
        }
        if (
          !isTarget &&
          !isSource &&
          nodeDataArray.length > 1 &&
          !isTrigger(n)
        ) {
          flowIssues.push(
            `"${n.name || n.text || friendlyType(n.type)}" is disconnected from the flow`,
          );
        }
      });

      let focusedNode = null;
      try {
        const sel = diagram.selection.first();
        if (sel?.data) {
          const nd = sel.data;
          focusedNode = {
            name: nd.name || nd.text,
            type: friendlyType(nd.type),
            key: nd.key,
            config: nd.go_data || {},
            errors: nd.errors,
            warnings: nd.warnings,
          };
        }
      } catch {}

      const availableVariables = [];
      const seenPaths = new Set();
      nodeDataArray.forEach((n) => {
        const stepName = (n.name || n.text || friendlyType(n.type) || "Step")
          .replace(/\s+/g, " ")
          .trim();
        const safeName = stepName.replace(/\s+/g, "_") || "Step";
        const out = n._testOutput ?? n.testOutput;
        if (out && typeof out === "object" && !Array.isArray(out)) {
          Object.keys(out).forEach((key) => {
            const path = `${safeName}.${key}`;
            if (!seenPaths.has(path)) {
              seenPaths.add(path);
              availableVariables.push({
                path: `${safeName}.${key}`,
                type: "any",
              });
            }
          });
        } else {
          const path = `${safeName}.output`;
          if (!seenPaths.has(path)) {
            seenPaths.add(path);
            availableVariables.push({ path, type: "any" });
          }
        }
      });

      return {
        nodes,
        links,
        flowName: assetDetails?.name || "",
        nodeCount: nodes.length,
        linkCount: links.length,
        flowIssues,
        focusedNode,
        availableVariables,
        executionHistory: [],
        canvasType: getMode(),
      };
    } catch (err) {
      return {};
    }
  }, [canvasRef, assetDetails?.name]);

  // PostMessage Bridge: Convert postMessage events from parent window to CustomEvents
  // This allows formAIHandler and workflowAIHandler to receive events from the chat interface
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        // Security: Only accept messages from parent window (when embedded in iframe)
        if (event.source !== window.parent) {
          return;
        }

        const { type, payload } = event.data || {};

        // Only process FORM_AI and WORKFLOW_AI event types
        if (
          !type ||
          (!type.startsWith("FORM_AI_") && !type.startsWith("WORKFLOW_AI_"))
        ) {
          return;
        }

        // Validate payload structure
        if (!payload || typeof payload !== "object") {
          return;
        }

        // Convert postMessage to CustomEvent that formAIHandler/workflowAIHandler can listen to
        const customEvent = new CustomEvent(type, {
          detail: payload || {},
        });

        // Dispatch the CustomEvent so handlers can receive it
        window.dispatchEvent(customEvent);
      } catch (error) {}
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const getNodes = async (key, params) => {
    if (params.fetchConnectableNodes) {
      const response = await componentSDKServices.getConnectList(
        canvasRef.current.getModelJSON(),
        key,
      );
      if (response?.status === SUCCESS) return response?.result || [];
    }
    if (params.fetchNodesFrom) {
      return canvasRef.current.findNodesBetween(params.fetchNodesFrom, key);
    }
    if (params.fetchAllNodes) {
      return canvasRef.current
        .getAllNodes()
        ?.filter((node) => node.template !== NODE_TEMPLATES.PLACEHOLDER);
    }
    if (params.fetchPreviousNodes) {
      return canvasRef.current.getPreviousNodes(key);
    }
    return [];
  };
  const updateIfElseData = useCallback(async (from, to, newNode, link) => {
    // Initialize go_data if it doesn't exist
    let go_data = from.data?.go_data || {};

    // Initialize ifData and elseData arrays if they don't exist
    if (!go_data.ifData) {
      go_data.ifData = [];
    }
    if (!go_data.elseData) {
      go_data.elseData = [];
    }

    const link_data = link?.data;
    let blockContext =
      link_data?.blockContext || linkedNodesRef.current?.blockContext;

    // If blockContext is missing but we have a link key, derive it from go_data
    // This handles the "between nodes" case where blockContext wasn't set
    if (!blockContext && link?.data?.key && go_data) {
      const linkKey = link.data.key;

      // Check if this key belongs to an ifData entry
      const ifDataEntry = go_data.ifData?.find(
        (_if) => _if.key === linkKey || _if.id === linkKey,
      );

      // Check if this key belongs to an elseData entry
      const elseDataEntry = go_data.elseData?.find(
        (_else) => _else.key === linkKey,
      );

      if (ifDataEntry) {
        // Determine block type from ifData entry
        // Find the block index to determine if it's IF or ELSE-IF
        const blockIndex = go_data.ifData.findIndex(
          (_if) => _if.key === linkKey || _if.id === linkKey,
        );
        blockContext = {
          blockId: linkKey,
          blockType: blockIndex === 0 ? "if" : "else_if",
          blockIndex: blockIndex,
        };
        console.log(
          "[updateIfElseData] Derived blockContext from link key:",
          blockContext,
        );
      } else if (elseDataEntry) {
        blockContext = {
          blockId: linkKey,
          blockType: "else",
          blockIndex: 0,
        };
        console.log(
          "[updateIfElseData] Derived blockContext from elseData:",
          blockContext,
        );
      } else if (link_data?.linkForElse) {
        // Fallback: if linkForElse is set, it's an ELSE block
        blockContext = {
          blockId: linkKey,
          blockType: "else",
          blockIndex: 0,
        };
      }
    }

    if (!to) {
      // New node added (not between existing nodes)
      // Legacy behavior: Always pushes new entry with link key
      // New approach: Use blockId if available, otherwise use link key

      if (blockContext?.blockType === "else" || link_data?.linkForElse) {
        // Update ELSE block
        if (go_data.elseData && go_data.elseData[0]) {
          go_data.elseData[0].jumpTo = newNode.data;
          // Ensure key matches blockId or link key
          const expectedKey = blockContext?.blockId || link?.data?.key;
          if (expectedKey && go_data.elseData[0].key !== expectedKey) {
            go_data.elseData[0].key = expectedKey;
          }

          // CRITICAL: Also sync moveTo in blocks array
          const elseBlockIdx = go_data.blocks?.findIndex(
            (b) => b.type === "else" || b.id === expectedKey,
          );
          if (elseBlockIdx !== -1 && go_data.blocks[elseBlockIdx]) {
            go_data.blocks[elseBlockIdx].moveTo = newNode.data;
          }
        } else {
          go_data.elseData = [
            {
              jumpTo: newNode.data,
              key:
                blockContext?.blockId ||
                link?.data?.key ||
                `else_${Date.now()}`,
            },
          ];
        }
      } else if (blockContext?.blockId) {
        // Try to find existing entry by blockId first
        let idx = go_data.ifData?.findIndex(
          (_if) =>
            _if.key === blockContext.blockId || _if.id === blockContext.blockId,
        );

        if (idx !== -1 && go_data.ifData[idx]) {
          // Update existing entry
          go_data.ifData[idx].jumpTo = newNode.data;
          // Ensure key matches blockId
          if (go_data.ifData[idx].key !== blockContext.blockId) {
            go_data.ifData[idx].key = blockContext.blockId;
          }

          // CRITICAL: Also sync moveTo in blocks array
          const blockIdx = go_data.blocks?.findIndex(
            (b) => b.id === blockContext.blockId,
          );
          if (blockIdx !== -1 && go_data.blocks[blockIdx]) {
            go_data.blocks[blockIdx].moveTo = newNode.data;
          }
        } else {
          // No existing entry - push new one with blockId as key (like legacy pushes with link key)
          go_data.ifData.push({
            jumpTo: newNode.data,
            key: blockContext.blockId,
            id: blockContext.blockId,
          });
        }
      } else {
        // BlockContext is undefined - use fallback matching
        // First try to match by link key
        let idx = -1;
        if (link?.data?.key) {
          idx = go_data.ifData?.findIndex((_if) => _if.key === link.data.key);
        }

        // If no match by link key, find first entry without jumpTo (empty placeholder)
        if (idx === -1) {
          idx = go_data.ifData?.findIndex((_if) => !_if.jumpTo);
        }

        if (idx !== -1 && go_data.ifData[idx]) {
          // Update existing entry
          go_data.ifData[idx].jumpTo = newNode.data;
          // Ensure key matches link key if available
          if (link?.data?.key && go_data.ifData[idx].key !== link.data.key) {
            go_data.ifData[idx].key = link.data.key;
          }

          // CRITICAL: Also sync moveTo in blocks array
          const entryKey = go_data.ifData[idx].key || go_data.ifData[idx].id;
          const blockIdx = go_data.blocks?.findIndex((b) => b.id === entryKey);
          if (blockIdx !== -1 && go_data.blocks[blockIdx]) {
            go_data.blocks[blockIdx].moveTo = newNode.data;
          }
        } else {
          // No match found - push new entry with link key (legacy behavior)
          go_data.ifData.push({
            jumpTo: newNode.data,
            key: link?.data?.key || `if_${Date.now()}`,
          });
        }
      }
    } else {
      if (link_data?.linkForElse || blockContext?.blockType === "else") {
        if (!go_data.elseData[0]) {
          go_data.elseData[0] = {
            jumpTo: null,
            key:
              link?.data?.key || blockContext?.blockId || `else_${Date.now()}`,
          };
        }
        go_data.elseData[0].jumpTo = newNode.data;
        // Ensure key matches link key
        if (link?.data?.key && go_data.elseData[0].key !== link.data.key) {
          go_data.elseData[0].key = link.data.key;
        }

        // CRITICAL: Also sync moveTo in blocks array for ELSE
        const elseBlockKey = go_data.elseData[0].key;
        const elseBlockIdx = go_data.blocks?.findIndex(
          (b) => b.type === "else" || b.id === elseBlockKey,
        );
        if (elseBlockIdx !== -1 && go_data.blocks[elseBlockIdx]) {
          go_data.blocks[elseBlockIdx].moveTo = newNode.data;
        }
      } else {
        // Node added between existing nodes (to exists)
        // Legacy behavior: Uses link.data.key to find and update entry
        // This is the key difference - legacy matches by link key, not blockId

        let idx = -1;

        if (link?.data?.key) {
          // Primary: Match by link key (legacy approach)
          idx = go_data.ifData.findIndex((_if) => _if.key === link.data.key);
        }

        // Fallback: Try blockId if link key doesn't match
        if (idx === -1 && blockContext?.blockId) {
          idx = go_data.ifData.findIndex(
            (_if) =>
              _if.key === blockContext.blockId ||
              _if.id === blockContext.blockId,
          );
        }

        // Fallback: Try blockIndex
        if (
          idx === -1 &&
          blockContext?.blockIndex !== undefined &&
          go_data.ifData?.[blockContext.blockIndex]
        ) {
          idx = blockContext.blockIndex;
        }

        // Fallback: If blockContext is undefined, find first entry without jumpTo
        if (idx === -1 && !blockContext) {
          idx = go_data.ifData?.findIndex((_if) => !_if.jumpTo);
        }

        if (idx !== -1 && go_data.ifData[idx]) {
          // Update existing entry
          go_data.ifData[idx].jumpTo = newNode.data;
          // Ensure key matches link key (legacy approach)
          if (link?.data?.key && go_data.ifData[idx].key !== link.data.key) {
            go_data.ifData[idx].key = link.data.key;
          }
          // Ensure id matches blockId if blockContext is available
          if (blockContext?.blockId && !go_data.ifData[idx].id) {
            go_data.ifData[idx].id = blockContext.blockId;
          }

          // CRITICAL: Also sync moveTo in blocks array
          const entryKey = go_data.ifData[idx].key || go_data.ifData[idx].id;
          const blockIdx = go_data.blocks?.findIndex((b) => b.id === entryKey);
          if (blockIdx !== -1 && go_data.blocks[blockIdx]) {
            go_data.blocks[blockIdx].moveTo = newNode.data;
          }
        } else {
          // No match found - push new entry
          // Use link key if available (legacy), otherwise blockId
          const newKey =
            link?.data?.key || blockContext?.blockId || `if_${Date.now()}`;
          console.log(
            "[updateIfElseData] Adding new ifData entry (between nodes):",
            {
              newKey,
              blockContext,
              linkKey: link?.data?.key,
              existingIfDataKeys: go_data.ifData?.map((_if) => _if.key),
            },
          );
          go_data.ifData.push({
            jumpTo: newNode.data,
            key: newKey,
            id: blockContext?.blockId || newKey,
          });
        }
      }
    }
    const errors = validateIfElseData(go_data);
    const last_updated = Date.now();
    const response = await componentSDKServices.transformNode(
      canvasRef.current.getModelJSON(),
      from.data.key,
      {
        ...(go_data || {}),
        last_updated,
      },
    );

    if (response?.status === "success") {
      canvasRef.current.createNode(
        {
          ...from.data,
          errors,
          tf_data: response.result.tf_data,
          go_data: {
            ...go_data,
            output: response.result.tf_output,
            last_updated,
          },
        },
        {
          openNodeAfterCreate: false,
        },
      );
    }
  }, []);
  const updateIfElseV2Data = useCallback(
    async (from, to, newNode, link) => {
      let go_data = from.data?.go_data;
      const link_data = link?.data;
      const blockContext = link_data?.blockContext;

      if (!to) {
        // Use blockContext to determine which block to update
        if (blockContext?.blockType === "else" || link_data?.linkForElse) {
          // Update ELSE block (last condition in V2 format)
          go_data.conditions[go_data?.conditions.length - 1].action =
            newNode.data.key;
        } else if (blockContext?.blockId) {
          // Use blockId for stable mapping (preferred over index)
          let idx = go_data.conditions?.findIndex(
            (_if) =>
              _if.id === blockContext.blockId ||
              _if.key === blockContext.blockId,
          );
          // Fallback to blockIndex if blockId not found
          if (
            idx === -1 &&
            blockContext?.blockIndex !== undefined &&
            go_data.conditions?.[blockContext.blockIndex]
          ) {
            idx = blockContext.blockIndex;
          }
          if (idx !== -1 && go_data.conditions?.[idx]) {
            go_data.conditions[idx].action = newNode.data.key;
          } else {
            // No matching block found - splice new entry before ELSE
            go_data?.conditions?.splice(go_data?.conditions.length - 1, 0, {
              action: newNode.data.key,
              id: blockContext.blockId || link.data.key,
              type: "else-if",
              logicType: "AND",
              conditions: [{ id: Date.now(), operation: "equals" }],
              groups: [],
              isAdvanced: false,
            });
          }
        } else {
          // Legacy fallback: splice new entry before ELSE
          go_data?.conditions?.splice(go_data?.conditions.length - 1, 0, {
            action: newNode.data.key,
            id: link.data.key,
            type: "else-if",
            logicType: "AND",
            conditions: [{ id: Date.now(), operation: "equals" }],
            groups: [],
            isAdvanced: false,
          });
        }
      } else {
        if (link_data?.linkForElse || blockContext?.blockType === "else") {
          go_data.conditions[go_data?.conditions.length - 1].action =
            newNode.data.key;
        } else {
          // Try blockId first, then blockIndex, then key lookup
          let idx = -1;
          if (blockContext?.blockId) {
            idx = go_data.conditions?.findIndex(
              (_if) =>
                _if.id === blockContext.blockId ||
                _if.key === blockContext.blockId,
            );
          }
          if (
            idx === -1 &&
            blockContext?.blockIndex !== undefined &&
            go_data.conditions?.[blockContext.blockIndex]
          ) {
            idx = blockContext.blockIndex;
          }
          if (idx === -1) {
            idx = go_data.conditions?.findIndex(
              (_if) => _if.id === link.data.key,
            );
          }
          if (idx !== -1 && go_data.conditions?.[idx]) {
            go_data.conditions[idx].action = newNode.data.key;
          } else {
            go_data?.conditions?.splice(go_data?.conditions.length - 1, 0, {
              action: newNode.data.key,
              id: blockContext?.blockId || link.data.key,
              type: "else-if",
              logicType: "AND",
              conditions: [{ id: Date.now(), operation: "equals" }],
              groups: [],
              isAdvanced: false,
            });
          }
        }
      }
      // const errors = validateIfElseData(go_data);
      const last_updated = Date.now();
      const response = await componentSDKServices.transformNode(
        canvasRef.current.getModelJSON(),
        from.data.key,
        {
          ...(go_data || {}),
          last_updated,
        },
      );
      if (response?.status === "success") {
        canvasRef.current.createNode(
          {
            ...from.data,
            // errors,
            tf_data: response.result.tf_data,
            go_data: {
              ...go_data,
              output: response.result.tf_output,
              last_updated,
            },
          },
          {
            openNodeAfterCreate: false,
          },
        );
      }

      updateNodeLinks(
        from,
        from.data?.go_data?.conditions?.map((statement, index) => {
          let conditionStr = "";
          const conditionStrResponse =
            componentSDKServices.conditionsToString(statement);

          if (
            conditionStrResponse?.status === SUCCESS &&
            !isEmpty(conditionStrResponse?.result?.condition_str)
          ) {
            conditionStr = conditionStrResponse?.result?.condition_str;
          } else {
            conditionStr =
              statement.type === "else" ? "ELSE" : `Statement ${index + 1}`;
          }
          return {
            label: conditionStr,
            to: statement.action,
            key: statement.id,
          };
        }),
      );
    },
    [updateNodeLinks],
  );

  const onAddNewNodeHandler = useCallback(
    async (item, options = { openDialog: true, autoLink: true }) => {
      try {
        // Making enable again for ankit
        // if (item?.type === "GPT") {
        //   showTinyGPTAiUsageForm();
        //   return;
        // }
        if (linkedNodesRef.current) {
          const { from, to } = linkedNodesRef.current;
          let fromNode,
            toNode,
            link = null;
          if (from) {
            fromNode = canvasRef.current.findNode(from);
          }
          if (to) {
            toNode = canvasRef.current.findNode(to);
          }

          const newNode = canvasRef.current.createNode(item, {
            location: toNode
              ? toNode.location
              : getChildNodeLocation(fromNode.location, 1, 0),
            openNodeAfterCreate: false,
          });

          console.log(
            "[Canvas] Node added — name:",
            newNode?.data?.name ?? item?.name,
            ", type:",
            newNode?.data?.type ?? item?.type,
          );

          // Create two output branches for HITL/HITL_V2 nodes when they are first added
          if (
            newNode.data.type === HITL_TYPE ||
            newNode.data.type === HITL_V2_TYPE
          ) {
            postSaveHandlerForHITLNode(newNode);
          }

          if (isLoopStartType(newNode.data.type)) {
            const loopPairId = `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            canvasRef.current.updateNode(newNode.data.key, { loopPairId });
            const loopEndLocation = {
              x: (newNode.location?.x || newNode.data?.location?.x || 0) + 300,
              y: newNode.location?.y || newNode.data?.location?.y || 0,
            };
            const loopEndNode = canvasRef.current.createNode(
              {
                ...LOOP_END_NODE,
                loopPairId,
                pairedNodeKey: newNode.data.key,
                background: newNode.data.background,
                foreground: newNode.data.foreground,
                dark: newNode.data.dark,
                light: newNode.data.light,
                name: getLoopEndName(newNode.data.type).name,
                description: getLoopEndName(newNode.data.type).description,
              },
              { location: loopEndLocation, openNodeAfterCreate: false },
            );
            canvasRef.current.updateNode(newNode.data.key, {
              pairedNodeKey: loopEndNode.data.key,
            });
            canvasRef.current.createLink({
              from: newNode.data.key,
              to: loopEndNode.data.key,
            });
            const last_updated = Date.now();
            canvasRef.current.updateNode(newNode.data.key, {
              go_data: {
                ...(newNode.data.go_data || {}),
                pairedNodeKey: loopEndNode.data.key,
                loopPairId,
                last_updated,
              },
            });
            canvasRef.current.updateNode(loopEndNode.data.key, {
              go_data: {
                ...(loopEndNode.data.go_data || {}),
                pairedNodeKey: newNode.data.key,
                loopPairId,
                last_updated,
              },
            });
          }

          // if leafnode add is clicked
          if (!to && from) {
            const shouldLink =
              !fromNode?.data?.denyToLink &&
              fromNode?.data?.type !== HITL_TYPE &&
              fromNode?.data?.type !== HITL_V2_TYPE;
            if (shouldLink) {
              // Extract blockContext from linkedNodesRef - it MUST be available for if-else nodes
              let blockContext = linkedNodesRef.current?.blockContext;

              // For if-else nodes, blockContext should always be set before opening palette
              // If it's missing, this is an error condition - log it but proceed
              if (fromNode?.data?.type === IF_ELSE_TYPE && !blockContext) {
                console.warn(
                  "[createLink for If-Else] blockContext is missing! This should not happen.",
                  {
                    from,
                    to: newNode.key,
                    linkedNodesRef: linkedNodesRef.current,
                  },
                );
                // Try to retrieve from callback ref as fallback (shouldn't be needed)
                // But we'll proceed with auto-generated key as legacy fallback
              }

              const isElseBlock = blockContext?.blockType === "else";

              // For if-else nodes, use blockId as key if available (new approach)
              // Otherwise, use auto-generated key and match by link key later (legacy approach)
              const linkKey = blockContext?.blockId || undefined;

              // CRITICAL FIX: Check if a placeholder link with this key already exists
              // This happens when IfElse.jsx creates initial placeholder links on drawer open
              // If it exists, UPDATE it instead of creating a new one (which would cause "3 fangs" bug)
              let existingPlaceholderLink = null;
              if (linkKey && fromNode?.data?.type === IF_ELSE_TYPE) {
                const existingLinks = canvasRef.current.findLinksOutOf(from);
                existingLinks?.each((l) => {
                  if (l.data.key === linkKey) {
                    existingPlaceholderLink = l;
                  }
                });
              }

              if (existingPlaceholderLink) {
                // Store the old target node key before updating
                const oldTargetNodeKey = existingPlaceholderLink.data.to;

                // Update existing placeholder link instead of creating new
                console.log(
                  "[createLink for If-Else] Found existing placeholder link, UPDATING instead of creating:",
                  {
                    existingKey: existingPlaceholderLink.data.key,
                    existingTo: oldTargetNodeKey,
                    newTo: newNode.key,
                    blockContext,
                  },
                );

                canvasRef.current?.updateLink({
                  linkData: existingPlaceholderLink.data,
                  linkKeyToUpdate: "to",
                  linkKeyToUpdateValue: newNode.key,
                });

                // Also update label if needed
                if (blockContext?.conditionStr) {
                  canvasRef.current?.updateLink({
                    linkData: existingPlaceholderLink.data,
                    linkKeyToUpdate: "label",
                    linkKeyToUpdateValue: blockContext.conditionStr,
                  });
                }

                // CRITICAL: Remove the old placeholder node that this link was pointing to
                if (oldTargetNodeKey && oldTargetNodeKey !== newNode.key) {
                  const oldTargetNode =
                    canvasRef.current?.findNode(oldTargetNodeKey);
                  console.log(
                    "[createLink for If-Else] Attempting to remove old placeholder:",
                    {
                      oldTargetNodeKey,
                      nodeFound: !!oldTargetNode,
                      nodeData: oldTargetNode?.data,
                      isPlaceholder: oldTargetNode
                        ? isPlaceholderNode(oldTargetNode.data)
                        : null,
                      template: oldTargetNode?.data?.template,
                    },
                  );
                  if (oldTargetNode && isPlaceholderNode(oldTargetNode.data)) {
                    console.log(
                      "[createLink for If-Else] Removing old placeholder node:",
                      oldTargetNodeKey,
                    );
                    canvasRef.current?.removeNode(oldTargetNode);
                  }
                }

                link = existingPlaceholderLink;
                console.log(
                  "[createLink for If-Else] Placeholder link UPDATED:",
                  {
                    linkKey: link?.data?.key,
                    linkFrom: link?.data?.from,
                    linkTo: link?.data?.to,
                  },
                );
              } else {
                // No existing link found, create new one
                console.log(
                  "[createLink for If-Else] Creating new link with:",
                  {
                    from,
                    to: newNode.key,
                    linkKey,
                    blockContext,
                    hasBlockId: !!blockContext?.blockId,
                    fromNodeType: fromNode?.data?.type,
                  },
                );

                link = canvasRef.current?.createLink({
                  from,
                  to: newNode.key,
                  // Use blockId as key if available, otherwise auto-generated
                  ...(linkKey ? { key: linkKey } : {}),
                  metadata: {},
                  // Set linkForElse if this is an ELSE block
                  ...(isElseBlock ? { linkForElse: true } : {}),
                  // Include blockContext for more specific linking
                  ...(blockContext ? { blockContext } : {}),
                });

                console.log("[createLink for If-Else] Link created:", {
                  linkKey: link?.data?.key,
                  linkFrom: link?.data?.from,
                  linkTo: link?.data?.to,
                  blockContextAvailable: !!blockContext,
                  blockId: blockContext?.blockId,
                  expectedKey: linkKey,
                  keyMatches: link?.data?.key === linkKey,
                });
              }
            }

            //handle for if else's godata
            if (fromNode?.data?.type === IF_ELSE_TYPE) {
              updateIfElseData(fromNode, toNode, newNode, link);

              // Execute callback and then update link key if needed
              if (ifElseNodeSelectedCallbackRef.current) {
                const callbackBlockContext =
                  linkedNodesRef.current?.blockContext || blockContext;
                console.log(
                  "[onAddNewNodeHandler] Executing if-else callback with blockContext:",
                  callbackBlockContext,
                );

                ifElseNodeSelectedCallbackRef.current(
                  newNode,
                  callbackBlockContext,
                );

                // After callback completes, check if link key needs to be updated
                // This handles the case where blockContext wasn't available initially
                if (
                  link &&
                  callbackBlockContext?.blockId &&
                  link.data.key !== callbackBlockContext.blockId
                ) {
                  if (process.env.NODE_ENV === "development") {
                    console.log(
                      "[createLink for If-Else] Link key mismatch - REMOVING old and CREATING new:",
                      {
                        oldKey: link.data.key,
                        newKey: callbackBlockContext.blockId,
                        from: link.data.from,
                        to: link.data.to,
                      },
                    );
                  }

                  // CRITICAL FIX: Instead of trying to update the key (which can leave orphans),
                  // remove the old link and create a new one with the correct key
                  // Extract only the safe, supported link properties (not GoJS-internal fields)
                  const { from, to, metadata, linkForElse, routing, ports } =
                    link.data;
                  canvasRef.current?.removeLink(link.data);

                  // Preserve linkForElse from original link OR derive from blockContext
                  const isElseBlockNew =
                    linkForElse || callbackBlockContext?.blockType === "else";

                  // Create new link with correct key using only whitelisted fields
                  link = canvasRef.current?.createLink({
                    from,
                    to,
                    key: callbackBlockContext.blockId,
                    metadata: metadata || {},
                    linkForElse: isElseBlockNew,
                    blockContext: callbackBlockContext,
                    ...(routing ? { routing } : {}),
                    ...(ports ? { ports } : {}),
                  });

                  if (process.env.NODE_ENV === "development") {
                    console.log(
                      "[createLink for If-Else] New link created with correct key:",
                      {
                        newKey: link?.data?.key,
                        expectedKey: callbackBlockContext.blockId,
                        keyMatches:
                          link?.data?.key === callbackBlockContext.blockId,
                      },
                    );
                  }
                }

                // Persist the newly created node (same as onAddJumpToHandler)

                const goDataPayload = {
                  ...newNode?.data?.go_data,
                  last_updated: Date.now(),
                };
                const newNodeWarnings = [];
                if (newNode?.data?.type === INTEGRATION_TYPE) {
                  goDataPayload.flow = {};
                  newNodeWarnings.push(
                    "Integration needs setup — select a connection and action to use",
                  );
                }
                await saveNodeDataHandler(
                  newNode?.data,
                  goDataPayload,
                  { warnings: newNodeWarnings },
                  false,
                  true,
                );

                canvasRef.current.autoAlign();
                canvasRef.current.goToNode(newNode.key, {
                  openNodeAfterScroll: false,
                });

                // Clear callback after it completes
                // Don't clear linkedNodesRef yet - keep blockContext available for link key updates
                ifElseNodeSelectedCallbackRef.current = null;
                // Only clear linkedNodesRef if we're not updating link keys
                // The blockContext may still be needed for link matching
                setTimeout(() => {
                  linkedNodesRef.current = null;
                }, 100);
              } else {
                // No callback, safe to clear
                linkedNodesRef.current = null;
              }
            } else if (fromNode?.data?.type === IF_ELSE_TYPE_V2) {
              const ifElseV2BlockContext =
                linkedNodesRef.current?.blockContext ??
                link?.data?.blockContext;

              updateIfElseV2Data(fromNode, toNode, newNode, link);
              if (ifElseNodeSelectedCallbackRef.current) {
                ifElseNodeSelectedCallbackRef.current(
                  newNode,
                  ifElseV2BlockContext,
                );
                ifElseNodeSelectedCallbackRef.current = null;
                linkedNodesRef.current = null;
              } else {
                linkedNodesRef.current = null;
              }

              const goDataPayload = {
                ...newNode?.data?.go_data,
                last_updated: Date.now(),
              };
              const newNodeWarnings = [];
              if (newNode?.data?.type === INTEGRATION_TYPE) {
                goDataPayload.flow = {};
                newNodeWarnings.push(
                  "Integration needs setup — select a connection and action to use",
                );
              }
              await saveNodeDataHandler(
                newNode?.data,
                goDataPayload,
                { warnings: newNodeWarnings },
                false,
                true,
              );

              canvasRef.current.autoAlign();
              canvasRef.current.goToNode(newNode.key, {
                openNodeAfterScroll: false,
              });
            } else if (
              (fromNode?.data?.type === HITL_TYPE ||
                fromNode?.data?.type === HITL_V2_TYPE) &&
              link
            ) {
              updateHITLData(fromNode, toNode, newNode, link);
              linkedNodesRef.current = null;
            } else {
              linkedNodesRef.current = null;
            }
            if (assetId && newNode?.data)
              recordManualAdd(assetId, newNode.data.type, newNode.data.name);
            if (options.openDialog) {
              const nodeType = newNode.data?.subType || newNode.data?.type;
              const component = getExtensionComponent(
                nodeType,
                newNode.data.module,
                newNode.data,
              );
              if (component) {
                showDialogRef.current?.(newNode, component);
                setIsCommandPaletteOpen(false);
              }
            }
            return newNode;
          }
          //if node is added in between
          else if (to && from) {
            // For "between nodes" case, linkedNodesRef.current contains the link data
            // Ensure it has the link key for proper matching in updateIfElseData
            const linkData = linkedNodesRef.current;
            if (linkData && !linkData.key && link) {
              // Ensure link data has key for matching
              linkData.key = link.data?.key;
            }

            link = canvasRef.current?.updateLink({
              linkData: linkData || linkedNodesRef.current,
              linkKeyToUpdate: "to",
              linkKeyToUpdateValue: newNode.key,
            });
            if (
              newNode.data.type === IF_ELSE_TYPE ||
              newNode.data.type === IF_ELSE_TYPE_V2
            ) {
              // Legacy: when IF Else is added between two nodes, do not link to downstream node.
              // Create the two default branch links (Statement 1 and ELSE) to placeholders instead.
              const defaultGoData = getDefaultIfElseGoData();
              saveNodeDataHandler(newNode.data, defaultGoData, {}, true);
              updateNodeLinks(newNode, updateIfElseNodeLinks(defaultGoData));
            } else {
              if (toNode.name === "PLACEHOLDERNODE") {
                canvasRef.current?.removeNode(toNode);
              } else {
                canvasRef.current?.createLink({
                  from: newNode.key,
                  to,
                  metadata: {},
                });
              }
            }
            canvasRef.current?.shiftNodes(newNode);

            //handle for if else's godata
            if (fromNode?.data?.type === IF_ELSE_TYPE) {
              // For "between nodes" case, derive blockContext from link key if missing
              // This ensures we update the correct block entry
              let derivedBlockContext = null;
              if (!linkedNodesRef.current?.blockContext && link?.data?.key) {
                const go_data = fromNode.data?.go_data || {};
                const linkKey = link.data.key;

                // Check if this key belongs to an ifData entry
                const ifDataEntry = go_data.ifData?.find(
                  (_if) => _if.key === linkKey || _if.id === linkKey,
                );

                // Check if this key belongs to an elseData entry
                const elseDataEntry = go_data.elseData?.find(
                  (_else) => _else.key === linkKey,
                );

                if (ifDataEntry) {
                  const blockIndex = go_data.ifData.findIndex(
                    (_if) => _if.key === linkKey || _if.id === linkKey,
                  );
                  derivedBlockContext = {
                    blockId: linkKey,
                    blockType: blockIndex === 0 ? "if" : "else_if",
                    blockIndex: blockIndex,
                  };
                } else if (elseDataEntry || link.data.linkForElse) {
                  derivedBlockContext = {
                    blockId: linkKey,
                    blockType: "else",
                    blockIndex: 0,
                  };
                }

                if (derivedBlockContext) {
                  linkedNodesRef.current = {
                    ...linkedNodesRef.current,
                    blockContext: derivedBlockContext,
                  };
                  // Also update the link's data to include blockContext
                  if (link && link.data) {
                    link.data.blockContext = derivedBlockContext;
                  }
                }
              }

              // Pass the updated link to updateIfElseData
              // linkedNodesRef.current should contain link data with key and blockContext
              updateIfElseData(fromNode, toNode, newNode, link);
              if (ifElseNodeSelectedCallbackRef.current) {
                const callbackBlockContext =
                  linkedNodesRef.current?.blockContext;
                console.log(
                  "[onAddNewNodeHandler] Executing if-else callback (between nodes) with blockContext:",
                  callbackBlockContext,
                );
                ifElseNodeSelectedCallbackRef.current(
                  newNode,
                  callbackBlockContext,
                );
                ifElseNodeSelectedCallbackRef.current = null;
                // Delay clearing to ensure link updates complete
                setTimeout(() => {
                  linkedNodesRef.current = null;
                }, 100);
              } else {
                linkedNodesRef.current = null;
              }
            } else if (fromNode?.data?.type === IF_ELSE_TYPE_V2) {
              updateIfElseV2Data(fromNode, toNode, newNode, link);
              if (ifElseNodeSelectedCallbackRef.current) {
                ifElseNodeSelectedCallbackRef.current(
                  newNode,
                  linkedNodesRef.current?.blockContext,
                );
                ifElseNodeSelectedCallbackRef.current = null;
                linkedNodesRef.current = null;
              } else {
                linkedNodesRef.current = null;
              }
            } else if (
              fromNode?.data?.type === HITL_TYPE ||
              fromNode?.data?.type === HITL_V2_TYPE
            ) {
              updateHITLData(fromNode, toNode, newNode, link);
              linkedNodesRef.current = null;
            } else {
              linkedNodesRef.current = null;
            }
            if (assetId && newNode?.data)
              recordManualAdd(assetId, newNode.data.type, newNode.data.name);
            if (options.openDialog) {
              const nodeType = newNode.data?.subType || newNode.data?.type;
              const component = getExtensionComponent(
                nodeType,
                newNode.data.module,
                newNode.data,
              );
              if (component) {
                showDialogRef.current?.(newNode, component);
                setIsCommandPaletteOpen(false);
              }
            }
            return newNode;
          }
        } else {
          const newNode = canvasRef.current.createNode(item, {
            openNodeAfterCreate: options.openDialog,
            autoLink: options.autoLink,
          });

          console.log(
            "[Canvas] Node added — name:",
            newNode?.data?.name ?? item?.name,
            ", type:",
            newNode?.data?.type ?? item?.type,
          );

          // Create two output branches for HITL/HITL_V2 nodes when they are first added
          if (
            newNode?.data?.type === HITL_TYPE ||
            newNode?.data?.type === HITL_V2_TYPE
          ) {
            postSaveHandlerForHITLNode(newNode);
          }

          if (isLoopStartType(newNode?.data?.type)) {
            const loopPairId = `loop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            canvasRef.current.updateNode(newNode.data.key, { loopPairId });
            const loopEndLocation = {
              x: (newNode.location?.x || newNode.data?.location?.x || 0) + 300,
              y: newNode.location?.y || newNode.data?.location?.y || 0,
            };
            const loopEndNode = canvasRef.current.createNode(
              {
                ...LOOP_END_NODE,
                loopPairId,
                pairedNodeKey: newNode.data.key,
                background: newNode.data.background,
                foreground: newNode.data.foreground,
                dark: newNode.data.dark,
                light: newNode.data.light,
                name: getLoopEndName(newNode.data.type).name,
                description: getLoopEndName(newNode.data.type).description,
              },
              { location: loopEndLocation, openNodeAfterCreate: false },
            );
            canvasRef.current.updateNode(newNode.data.key, {
              pairedNodeKey: loopEndNode.data.key,
            });
            canvasRef.current.createLink({
              from: newNode.data.key,
              to: loopEndNode.data.key,
            });
            const last_updated = Date.now();
            canvasRef.current.updateNode(newNode.data.key, {
              go_data: {
                ...(newNode.data.go_data || {}),
                pairedNodeKey: loopEndNode.data.key,
                loopPairId,
                last_updated,
              },
            });
            canvasRef.current.updateNode(loopEndNode.data.key, {
              go_data: {
                ...(loopEndNode.data.go_data || {}),
                pairedNodeKey: newNode.data.key,
                loopPairId,
                last_updated,
              },
            });
          }

          if (assetId && newNode?.data)
            recordManualAdd(assetId, newNode.data.type, newNode.data.name);
          return newNode;
        }
      } catch (error) {
        console.error("[onAddNewNodeHandler] Error:", error);
        linkedNodesRef.current = null;
      }
      return;
    },
    [updateHITLData, updateIfElseData, updateIfElseV2Data],
  );

  const getInputProps = useCallback(
    (id) => {
      if (id === "add-nodes") {
        const existingNodes = canvasRef.current.getAllNodes();
        const disabledNodes = getDisabledNodes(
          existingNodes,
          linkedNodesRef.current,
          canvasRef,
        );

        return {
          tabData: searchConfig,
          plan: userData?.plan || "basic",
          disabledNodes,
          isOpen: isAddNodesPanelOpen,
          onClose: () => {
            defaultDrawerRef.current?.closeSidebarPanel();
          },
          previousNode: linkedNodesRef.current
            ? canvasRef.current?.findNode(linkedNodesRef.current?.from)?.data
            : null,
          onClick: async (node) => {
            await onAddNewNodeHandler(node);
            onNewEvent(UATU_CANVAS, {
              subEvent: UATU_PREDICATE_EVENTS_CANVAS.NODE_CREATION,
              nodeType: node?.type,
              nodeName: node?.name,
              module: node?.module,
            });
          },
          onSearch: (searchText = "") => {
            if (!searchText || searchText.length < 3) return;
            onNewEvent(UATU_CANVAS, {
              subEvent: UATU_PREDICATE_EVENTS_CANVAS.SEARCH_NODE,
              searchText: searchText,
            });
          },
        };
      } else if (id === "global-params") {
        return {
          initialData: paramsRef?.current?.params || assetDetails?.meta?.params,
          parentId: parentId,
          assetId: assetDetails?.asset_id,
          workspaceId: workspaceId,
          onSave: (data) => {
            paramsRef.current.params = data;
            checkReferences();
          },
        };
      } else if (id === "jump-to-node") {
        const nodes = canvasRef.current.getAllNodes();
        return {
          nodes,
          onChange: (e, option) => {
            setShowNodeDialog(null); //close the current open node
            canvasRef.current.goToNode(option.key);
          },
        };
      } else if (id === "theme-manager") {
        return {
          theme: getDefaultTheme(themeRef),
          projectId: projectId,
          workspaceId: workspaceId,
          handleSetTheme: (_theme) => {
            if (nodeModalRef.current) {
              nodeModalRef.current?.refereshTheme?.(_theme);
            }
          },
          onThemeChange: (_theme) => {
            if (nodeModalRef.current) {
              nodeModalRef.current?.refereshTheme?.(_theme);
            }
            themeRef.current = _theme;
          },
          dark: "#FD5D2D",
          light: "#F09A19",
        };
      }
      return {};
    },
    [
      assetDetails?.asset_id,
      assetDetails?.meta?.params,
      isAddNodesPanelOpen,
      onAddNewNodeHandler,
      onNewEvent,
      parentId,
      projectId,
      searchConfig,
      userData?.plan,
      workspaceId,
    ],
  );

  const accountContextMenuItems = useMemo(
    () => [
      {
        id: "account",
        name: "My Account",
        icon: User,
        onClick: () => {
          const targetUrl = `${serverConfig.WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.ACCOUNT}`;
          window.open(targetUrl, "_blank");
        },
      },
      {
        id: "referral",
        name: "Referral & Credits",
        icon: Gift,
        onClick: () => {
          const targetUrl = `${serverConfig.WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.REFERRAL}`;
          window.open(targetUrl, "_blank");
        },
        divider: true,
      },
      {
        id: "logout",
        name: "Logout",
        icon: LogOut,
        danger: true,
        onClick: () => {
          const targetUrl = `${serverConfig.WC_LANDING_URL}/redirect?r=${REDIRECT_PATHS.LOGOUT}`;
          window.location.href = targetUrl;
        },
      },
    ],
    [],
  );

  const renderAccountContextMenu = useCallback(
    (e) => {
      setContextMenuItems(accountContextMenuItems);
      // Use click position directly - collision detection will handle optimal positioning
      setDocumentCoords({
        top: e.clientY,
        left: e.clientX,
      });
      setShowContextMenu(true);
    },
    [accountContextMenuItems],
  );

  const openNodeWithTheme = () => {
    const node = canvasRef?.current
      ?.getAllNodes()
      .find((n) => n.module === "Question");

    if (showNodeDialog !== null) {
      setShowNodeDialog(null);
    }

    if (node) {
      nodeConfigsRef.current.showDefaultTheme = true;
      canvasRef.current.goToNode(node?.key);
    }
  };

  const onOpenGlobalParams = useCallback(() => {
    setRightDrawerComponentWithClose("default");
    setTimeout(() => {
      const ActionPanel = getSidebarPanel("global-params");
      const inputProps = getInputProps("global-params");
      if (!ActionPanel) return;
      defaultDrawerRef.current?.openSidebarPanel({
        id: "global-params",
        name: "Global Params",
        panel: (
          <Suspense fallback={<SuspenseLoader />}>
            <ActionPanel {...inputProps} />
          </Suspense>
        ),
      });
    }, 100);
  }, [setRightDrawerComponentWithClose, getInputProps]);

  const onOpenThemeManager = useCallback(() => {
    setRightDrawerComponentWithClose("default");
    setTimeout(() => {
      const ActionPanel = getSidebarPanel("theme-manager");
      const inputProps = getInputProps("theme-manager");
      if (!ActionPanel) return;
      defaultDrawerRef.current?.openSidebarPanel({
        id: "theme-manager",
        name: "Theme Manager",
        panel: (
          <Suspense fallback={<SuspenseLoader />}>
            <ActionPanel {...inputProps} />
          </Suspense>
        ),
      });
    }, 100);
  }, [setRightDrawerComponentWithClose, getInputProps]);

  const onOpenHelp = useCallback(() => {
    setRightDrawerComponentWithClose("default");
    setTimeout(() => {
      const ActionPanel = getSidebarPanel("help");
      if (!ActionPanel) return;
      defaultDrawerRef.current?.openSidebarPanel({
        id: "help",
        name: "Help and Resources",
        panel: (
          <Suspense fallback={<SuspenseLoader />}>
            <ActionPanel />
          </Suspense>
        ),
      });
    }, 100);
  }, [setRightDrawerComponentWithClose]);

  const openThemeManagerInSidebar = useCallback(() => {
    setDialogComponentWithClose(null);
    setShowNodeDialog(null);
    onOpenThemeManager();
  }, [setDialogComponentWithClose, onOpenThemeManager]);

  const onAddJumpToHandler = useCallback(
    async (node) => {
      const goDataPayload = {
        ...node?.go_data,
        last_updated: Date.now(),
      };
      const warnings = [];
      if (node?.type === INTEGRATION_TYPE) {
        goDataPayload.flow = {};
        warnings.push(
          "Integration needs setup — select a connection and action to use",
        );
      }

      const newNode = canvasRef.current.createNode(
        {
          ...node,
          go_data: goDataPayload,
        },
        {
          openNodeAfterCreate: false,
          autoLink: false,
          skipScroll: true,
        },
      );

      await saveNodeDataHandler(
        newNode?.data,
        newNode?.data?.go_data,
        { warnings: warnings },
        false,
        true,
      );
      canvasRef.current.autoAlign();
      canvasRef.current.goToNode(newNode.key, {
        openNodeAfterScroll: false,
      });
    },
    [saveNodeDataHandler],
  );

  const getNodeDrawer = useCallback(
    (Component, variables, nodeData, part) => {
      const isTriggerDrawer =
        nodeData?.subType === TRIGGER_SETUP_TYPE ||
        nodeData?.type === TRIGGER_SETUP_TYPE;
      if (isTriggerDrawer) {
        console.log("[ic-canvas] getNodeDrawer – opening trigger drawer", {
          nodeKey: nodeData?.key,
          assetId: assetDetails?.asset_id,
          hasAssetId: !!assetDetails?.asset_id,
        });
      }
      if (
        process.env.NODE_ENV === "development" &&
        (nodeData?.type === IF_ELSE_TYPE ||
          nodeData?.type === IF_ELSE_TYPE_V2) &&
        nodeData?.key
      ) {
        console.log("[ic-canvas] getNodeDrawer – opening IF-Else node", {
          nodeKey: nodeData.key,
          go_dataKeys: nodeData?.go_data ? Object.keys(nodeData.go_data) : [],
          blocksLength: nodeData?.go_data?.blocks?.length ?? 0,
          ifDataLength: nodeData?.go_data?.ifData?.length ?? 0,
          firstBlockConditionGroup: nodeData?.go_data?.blocks?.[0]
            ?.conditionGroup
            ? "present"
            : "missing",
          firstIfDataConditionGroup: nodeData?.go_data?.ifData?.[0]
            ?.conditionGroup
            ? "present"
            : "missing",
        });
      }
      const handleSetupWithAI = async (clarificationAnswersPayload = null) => {
        try {
          const ctx = getWorkflowContext?.() || {};
          const dataAtNode = ctx.availableVariables?.length
            ? Object.fromEntries(
                (ctx.availableVariables || [])
                  .slice(0, 20)
                  .map((v) => [v.path.replace(/\./g, "_"), `{{${v.path}}}`]),
              )
            : {};
          const currentConfigForRequest =
            setupClarification?.nodeKey === nodeData?.key && setupClarification?.partialConfig
              ? { ...(nodeData?.go_data || {}), ...setupClarification.partialConfig }
              : nodeData?.go_data;
          const result = await setupNodeWithAI({
            nodeType: nodeData?.type || nodeData?.subType,
            nodeKey: nodeData?.key,

            currentConfig: nodeData?.go_data,
            dataAtNode: Object.keys(dataAtNode).length
              ? dataAtNode
              : { sample: "Configure using workflow data." },
            macroJourney: ctx.macroJourney,
            clarificationAnswers: clarificationAnswersPayload ?? (Object.keys(setupClarificationAnswers || {}).length > 0 ? setupClarificationAnswers : undefined),
            canvasType: ctx.canvasType || getMode(),
          });
          if (result.needs_clarification && result.questions?.length > 0) {
            setSetupClarification({
              nodeKey: nodeData?.key,
              questions: result.questions,
              partialConfig: result.partialConfig || {},
            });
            setSetupClarificationAnswers({});
            toast.info("Please answer the questions below so we can configure the node.");
            return;
          }
          setSetupClarification(null);
          setSetupClarificationAnswers({});
          const config = result.config;
          if (config && Object.keys(config).length > 0) {
            saveNodeDataHandler(
              nodeData,
              { ...(nodeData?.go_data || {}), ...config },
              {},
              false,
            );
            toast.success(
              "Agent applied configuration. Review and save if needed.",
            );
          } else {
            toast.info(
              "No configuration suggested. Configure the node manually.",
            );
          }
        } catch (e) {
          toast.error("Set up with AI failed. Please configure manually.");
        }
      };

      const handleSubmitClarification = () => {
        handleSetupWithAI(setupClarificationAnswers);
      };

      const showClarificationForm = setupClarification?.nodeKey === nodeData?.key && setupClarification?.questions?.length > 0;

      return (
        <DialogErrorBoundary
          onClose={() => {
            setShowNodeDialog(null);
            setRightDrawerComponentWithClose("default");
          }}
          nodeData={nodeData}
        >
          <div className="flex flex-col h-full">
            {guidedDrawerContext && (
              <GuidedDrawerBanner
                nodeData={nodeData}
                stepNumber={guidedDrawerContext.stepNumber}
                totalSteps={guidedDrawerContext.totalSteps}
                activeTab={guidedDrawerContext.activeTab}
                hasAIConfig={!!nodeData?.config && Object.keys(nodeData.config).length > 0}
                onBackToOverview={() => {
                  setShowNodeDialog(null);
                  setRightDrawerComponentWithClose("default");
                }}
                onSaveAndNext={() => {
                  try {
                    if (nodeModalRef.current?.getData) {
                      const goDataPayload = nodeModalRef.current.getData();
                      if (goDataPayload) {
                        saveNodeDataHandler(nodeData, goDataPayload, {}, false);
                      }
                    }
                  } catch (e) {
                    console.warn("[GuidedSetup] Could not save node data on advance:", e);
                  }
                  setShowNodeDialog(null);
                  setRightDrawerComponentWithClose("default");
                  guidedDrawerContext.onAdvance?.();
                }}
              />
            )}
            <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-border shrink-0">
              <button
                type="button"
                onClick={() => handleSetupWithAI()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Set up with AI
              </button>
            </div>
            {showClarificationForm && (
              <div className="shrink-0 px-3 py-2 border-b border-border bg-muted/30 space-y-3">
                <p className="text-xs font-medium text-foreground">Answer these to configure the node</p>
                {setupClarification.questions.map((q) => (
                  <div key={q.id} className="space-y-1">
                    <label htmlFor={q.id} className="text-xs text-muted-foreground">
                      {q.question}
                    </label>
                    {q.options?.length > 0 ? (
                      <select
                        id={q.id}
                        value={setupClarificationAnswers[q.id] ?? ""}
                        onChange={(e) =>
                          setSetupClarificationAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                      >
                        <option value="">Select...</option>
                        {q.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={q.id}
                        type="text"
                        value={setupClarificationAnswers[q.id] ?? ""}
                        onChange={(e) =>
                          setSetupClarificationAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Your answer"
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs"
                      />
                    )}
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSubmitClarification}
                    className="rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Submit answers
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSetupClarification(null);
                      setSetupClarificationAnswers({});
                    }}
                    className="rounded-md border border-input px-2 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <Suspense fallback={<></>}>
              <Component
                key={
                  nodeData?.type === IF_ELSE_TYPE ||
                  nodeData?.type === IF_ELSE_TYPE_V2
                    ? `${nodeData.key}-${nodeData?.go_data?.last_updated ?? ""}`
                    : nodeData?.key
                }
                canvasRef={canvasRef}
                ref={nodeModalRef}
                workspaceId={workspaceId ?? assetDetails?.workspace_id}
                projectId={projectId}
                parentId={parentId}
                assetId={assetDetails?.asset_id}
                searchConfig={searchConfig}
                assetDetails={{
                  name: assetDetails?.asset?.name,
                }}
                integrationThumbnailMap={integrationThumbnailMap}
                userData={userData}
                eventType={eventType}
                nodeConfigsRef={nodeConfigsRef}
                variables={{
                  ...variables,
                  ...(paramsRef?.current?.params || {}),
                  ...(variablesRef.current || {}),
                }}
                isPremiumUser={userData?.plan && userData?.plan !== "basic"}
                data={{ ...(nodeData?.go_data || {}) }}
                nodeData={nodeData}
                onGuidedTabChange={guidedDrawerContext ? (tabId) => {
                  setGuidedDrawerContext((prev) => prev ? { ...prev, activeTab: tabId } : prev);
                } : undefined}
                getNodes={(params) => getNodes(nodeData.key, params)}
                onUpdateTitle={(updatedKeys) => {
                  setHasUnsavedChanges(true);
                  canvasRef.current.updateNode(nodeData.key, updatedKeys);
                  updateGoDataCache({
                    _r: canvasRef.current.getModelJSON(),
                    asset_id: assetDetails?.asset_id,
                    cached_at: Date.now(),
                  });
                }}
                onSave={(
                  go_data_payload,
                  updated_node_data,
                  openNodeAfterCreate,
                ) => {
                  /**
                   * acceptable keys to change for updated_node_data
                   *
                   * src
                   * name
                   * description
                   * foreground
                   * background
                   * errors
                   * warnings
                   * logs
                   *
                   * DO NOT CHANGE type, key, template !
                   */
                  saveNodeDataHandler(
                    nodeData,
                    go_data_payload,
                    updated_node_data,
                    openNodeAfterCreate,
                  );
                }}
                autoSave={(
                  saveData,
                  updated_node_data,
                  updateReferences,
                  openNodeAfterCreate,
                ) =>
                  autoSaveNodeDataHandler(
                    nodeData,
                    saveData,
                    updated_node_data,
                    updateReferences,
                    openNodeAfterCreate,
                  )
                }
                onAddJumpTo={onAddJumpToHandler}
                // onUpdateNode={(nodeProps) => updateNodeHandler(data, nodeProps)}
                onUpdateNodeLinks={(linksToBeUpdated) => {
                  updateNodeLinks(part, linksToBeUpdated);
                }}
                onDiscard={() => {
                  if (nodeData?.key) {
                    const freshNodeData =
                      canvasRef.current?.findNode?.(nodeData.key)?.data ||
                      nodeData;
                    const { errors, warnings, validationIssues } =
                      validateNodeConfig(freshNodeData);
                    canvasRef.current.updateNode(nodeData.key, {
                      errors,
                      warnings,
                      validationIssues,
                    });
                  }
                  setRightDrawerComponentWithClose("default");
                  setShowNodeDialog(null);
                }}
                onClose={async () => {
                  // Persist IF-Else go_data when drawer closes (X or escape) so conditions are saved
                  if (
                    (nodeData?.type === IF_ELSE_TYPE ||
                      nodeData?.type === IF_ELSE_TYPE_V2) &&
                    nodeModalRef.current?.getData
                  ) {
                    const goDataPayload = nodeModalRef.current.getData();
                    saveNodeDataHandler(nodeData, goDataPayload, {}, false);
                  }

                  // Persist HITL go_data when drawer closes so branches are created/maintained.
                  // Await so Run/Preview sees updated node with on_response_node_id/initiate_node_id.
                  if (
                    nodeData?.type === HITL_TYPE ||
                    nodeData?.type === HITL_V2_TYPE
                  ) {
                    if (nodeModalRef.current?.getData) {
                      const goDataPayload = nodeModalRef.current.getData();
                      // Get fresh node from canvas to ensure we have current go_data with IDs
                      const freshNode = canvasRef.current?.findNode(
                        nodeData.key,
                      );
                      const nodeToSave = freshNode?.data || nodeData;
                      await saveNodeDataHandler(
                        nodeToSave,
                        goDataPayload,
                        {},
                        false,
                      );
                    } else {
                      // Ensure branches are created even if getData fails
                      const actualNode = canvasRef.current?.findNode(
                        nodeData.key,
                      );
                      if (actualNode) {
                        postSaveHandlerForHITLNode(actualNode);
                      }
                    }
                  }

                  // Persist trigger setup data when drawer closes so configuration is saved (include type/subType/name/_src)
                  if (
                    (nodeData?.subType === TRIGGER_SETUP_TYPE ||
                      nodeData?.type === TRIGGER_SETUP_TYPE) &&
                    nodeModalRef.current?.getData
                  ) {
                    const goDataPayload =
                      typeof nodeModalRef.current.getDataAsync === "function"
                        ? await nodeModalRef.current.getDataAsync()
                        : nodeModalRef.current.getData();
                    const updatedNodeData =
                      nodeModalRef.current?.getLegacySavePayload?.() ?? {};
                    console.log(
                      "[TriggerSetup onClose] persisting trigger – go_data + meta",
                      {
                        nodeKey: nodeData?.key,
                        type: updatedNodeData?.type,
                        subType: updatedNodeData?.subType,
                        name: updatedNodeData?.name,
                      },
                    );
                    saveNodeDataHandler(
                      nodeData,
                      goDataPayload,
                      updatedNodeData,
                      false,
                    );
                  }

                  // Do not cleanup IF Else and HITL placeholder links on close so the two branches persist
                  const shouldCleanup =
                    nodeData?.type !== IF_ELSE_TYPE &&
                    nodeData?.type !== IF_ELSE_TYPE_V2 &&
                    nodeData?.type !== HITL_TYPE &&
                    nodeData?.type !== HITL_V2_TYPE &&
                    nodeData?.key;
                  if (shouldCleanup) {
                    cleanupPlaceholderNodes(nodeData.key);
                    cleanupOrphanLinks(nodeData.key);
                  }

                  if (nodeData?.key) {
                    const freshNodeData =
                      canvasRef.current?.findNode?.(nodeData.key)?.data ||
                      nodeData;
                    const { errors, warnings, validationIssues } =
                      validateNodeConfig(freshNodeData);
                    canvasRef.current.updateNode(nodeData.key, {
                      errors,
                      warnings,
                      validationIssues,
                    });
                  }

                  setRightDrawerComponentWithClose("default");
                  setShowNodeDialog(null);
                }}
                onSidebarActionClick={({ action }) => {
                  if (action?.id === "add-nodes") {
                    const linkOutOfAddNodeAdornment =
                      canvasRef.current.findLinksOutOf(nodeData?.key);
                    linkedNodesRef.current =
                      linkOutOfAddNodeAdornment?.count == 1
                        ? linkOutOfAddNodeAdornment?.first()?.data
                        : { from: nodeData?.key };
                    setIsCommandPaletteOpen(true);
                  } else if (action?.id === "global-params") {
                    onOpenGlobalParams();
                  } else if (action?.id === "theme-manager") {
                    onOpenThemeManager();
                  } else if (action?.id === "help") {
                    onOpenHelp();
                  }
                }}
                sidebarActions={[]}
                onSideBarToggle={(open, id) => {
                  if (!open && id === "theme-manager") {
                    if (nodeModalRef.current) {
                      nodeModalRef.current?.refereshTheme?.(themeRef?.current);
                    }
                  }
                  if (!open) {
                    linkedNodesRef.current = null;
                    nodeToReplaceRef.current = null;
                  }
                }}
                defaultTheme={getDefaultTheme(themeRef)}
                getDisabledNodes={() => {
                  return getDisabledNodes(
                    canvasRef.current.getAllNodes(),
                    linkedNodesRef.current,
                    canvasRef,
                  );
                }}
                linkedNodeDataRef={linkedNodesRef}
                annotation={assetDetails?.annotation}
                onAddNode={(blockContext, onNodeSelectedCallback) => {
                  console.log(
                    "[getNodeDrawer] onAddNode called with blockContext:",
                    {
                      blockContext,
                      nodeKey: nodeData?.key,
                      hasCallback: !!onNodeSelectedCallback,
                    },
                  );

                  if (!blockContext) {
                    console.warn(
                      "[getNodeDrawer] onAddNode called without blockContext!",
                    );
                  }

                  linkedNodesRef.current = {
                    from: nodeData?.key,
                    blockContext: blockContext || null,
                  };
                  ifElseNodeSelectedCallbackRef.current =
                    onNodeSelectedCallback || null;

                  console.log("[getNodeDrawer] linkedNodesRef set:", {
                    from: linkedNodesRef.current.from,
                    blockContext: linkedNodesRef.current.blockContext,
                    hasCallback: !!ifElseNodeSelectedCallbackRef.current,
                  });

                  setIsCommandPaletteOpen(true);
                }}
              />
            </Suspense>
          </div>
        </DialogErrorBoundary>
      );
    },
    [
      getWorkflowContext,
      onAddJumpToHandler,
      assetDetails?.annotation,
      assetDetails?.asset?.name,
      assetDetails?.asset_id,
      autoSaveNodeDataHandler,
      cleanupOrphanLinks,
      cleanupPlaceholderNodes,
      eventType,
      parentId,
      projectId,
      saveNodeDataHandler,
      searchConfig,
      setupClarification,
      setupClarificationAnswers,
      setSetupClarification,
      setSetupClarificationAnswers,
      updateGoDataCache,
      updateNodeLinks,
      userData,
      workspaceId,
      integrationThumbnailMap,
    ],
  );
  const showDialog = useCallback(
    async (node, Component) => {
      // Normalize node structure - handle both { part: { data } } and direct node objects
      const part = node.part || node;
      const data = part.data || part;

      // Guard: If no Component provided, we can't open a dialog
      if (!Component) {
        console.warn("[showDialog] No Component provided, cannot open dialog", {
          nodeKey: data?.key,
          nodeType: data?.type,
        });
        return;
      }

      // Close existing dialog before opening new one to prevent dual dialogs
      if (showNodeDialog !== null) {
        setShowNodeDialog(null);
        setRightDrawerComponentWithClose("default");
        // Small delay to ensure React processes the close before opening new
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const isAutoCompleteQuestion = data?.type === QuestionType.AUTOCOMPLETE;
      if (isAutoCompleteQuestion) {
        await saveNodeDataHandler(data, data?.go_data, {}, false, false);
      }
      let variables = {};
      try {
        const rawModel = canvasRef.current.getModelJSON();
        const enrichedModel = enrichCanvasModelForVariableList(rawModel);
        const { result } = await componentSDKServices.getVariableList(
          enrichedModel,
          node.key,
          projectId,
          assetId,
          {
            include_current_output: isAutoCompleteQuestion,
          },
        );
        variables = result;
      } catch {
        variables = {};
      }
      const modal = getNodeDrawer(Component, variables, data, part);
      setShowNodeDialog({ ...modal, key: data?.key });
      setRightDrawerComponentWithClose(NODE_DIALOG);
    },
    [assetId, getNodeDrawer, projectId, saveNodeDataHandler, showNodeDialog],
  );

  // Store showDialog in a ref so onAddNewNodeHandler can call it at runtime. onAddNewNodeHandler
  // is defined earlier in this file (before showDialog), so it cannot reference showDialog in its
  // closure or dependency array without causing "Cannot access 'showDialog' before initialization".
  // This useEffect keeps the ref in sync with the current showDialog; the plus-icon flow then
  // invokes showDialogRef.current?.(newNode, component) after creating the link, so variables load correctly.
  useEffect(() => {
    showDialogRef.current = showDialog;
  }, [showDialog]);

  // const getAssetDetails = useCallback(() => assetDetails, [assetDetails]);
  const nodeDoubleClickedHandler = useCallback(
    async (e, node) => {
      if (node?.data?.isErrorTerminal && node?.data?.sourceNodeKey) {
        const diagram = canvasRef.current.getDiagram();
        const sourceNode = diagram?.findNodeForKey(node.data.sourceNodeKey);
        if (sourceNode?.data) {
          setErrorHandlingModalData(sourceNode.data);
        }
        return;
      }
      if (!assetDetails?.asset_id && !isAiNodeFlow.current && !isEmbedMode)
        await updateWorkflow({
          name: `Untitled ${getSaveDialogTitle(getMode())}`,
          description: "",
        });
      const nodeType = node.data?.subType || node.data?.type;
      const component = getExtensionComponent(
        nodeType,
        node.data.module,
        node.data,
      );
      if (component) {
        console.log(
          "[Canvas] Node opened — name:",
          node?.data?.name ?? node?.data?.text,
          ", type:",
          nodeType,
        );
        if (isEmbedMode && !isEmbedAuthenticated && !embedNudgeShownRef.current) {
          embedNodeConfigCountRef.current += 1;
          if (embedNodeConfigCountRef.current >= 3) {
            embedNudgeShownRef.current = true;
            toast("Nice work! Sign up to keep your progress.", {
              action: {
                label: "Sign up",
                onClick: () => {
                  if (embedSendMessage) {
                    embedSendMessage("embedAuthRequired", { source: "nudge" });
                  }
                },
              },
              duration: 8000,
            });
          }
        }
        showDialog(node, component);
      } else {
        console.warn(
          `[nodeDoubleClickedHandler] Cannot open node - no component found`,
          {
            nodeType,
            module: node.data.module,
            nodeKey: node.data?.key,
            nodeData: node.data,
          },
        );
      }
    },
    [assetDetails?.asset_id, isEmbedMode, isEmbedAuthenticated, embedSendMessage, showDialog, updateWorkflow],
  );

  const isLinkConnectable = async (model, from, to) => {
    const response = await componentSDKServices.canConnect(model, from, to);
    return response?.status === SUCCESS;
  };

  const showAddNodeDrawer = useCallback(
    ({ via = "unknown", useDrawer = false }) => {
      if (rightDrawerComponent !== "default") {
        setRightDrawerComponentWithClose("default");
        setShowNodeDialog(null);
      }

      setIsCommandPaletteOpen(true);
      onNewEvent(UATU_CANVAS, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.ADD_NODE,
        via,
      });
    },
    [rightDrawerComponent, onNewEvent],
  );

  const nodeClickedHandler = (e, node) => {
    // if (e.subject?.name === "AGENT_RESET_TRIGGER_TYPE") {
    //   canvasRef.current.createNode(
    //     {
    //       ...AGENT_INPUT_NODE,
    //       key: node.data?.key,
    //       subType: null,
    //     },
    //     { openNodeAfterCreate: true },
    //   );
    // } else if (e.subject?.name === "RESET_TRIGGER_SETUP") {
    //   const updatedNode = canvasRef.current.createNode(
    //     {
    //       ...TRIGGER_SETUP_NODE,
    //       go_data: {},
    //       output: {},
    //       tf_data: {},
    //       key: node.data?.key,
    //       subType: "",
    //       errors: [],
    //       warnings: [],
    //     },
    //     { openNodeAfterCreate: true },
    //   );
    //   console.log(updatedNode, "updatedNode");
    // }
    if (node.name === "ADDNODEADORNMENTTEMPLATEGO") {
      const linkOutOfAddNodeAdornment = canvasRef.current.findLinksOutOf(
        node?.data?.key,
      );
      linkedNodesRef.current =
        linkOutOfAddNodeAdornment?.count == 1
          ? linkOutOfAddNodeAdornment?.first()?.data
          : { from: node.data.key };
      showAddNodeDrawer({ via: "add-node-adornment" });
    } else if (node.name === "PLACEHOLDERNODE") {
      const linksIntoPlaceholder = canvasRef.current.findLinksInto(
        node?.data?.key,
      );
      linkedNodesRef.current = linksIntoPlaceholder?.first()?.data;
      showAddNodeDrawer({ via: "placeholder-node" });
    } else if (node?.data?.isErrorTerminal && node?.data?.sourceNodeKey) {
      const sourceNodeKey = node.data.sourceNodeKey;
      const diagram = canvasRef.current.getDiagram();
      const sourceNode = diagram?.findNodeForKey(sourceNodeKey);
      if (sourceNode?.data) {
        setErrorHandlingModalData(sourceNode.data);
      }
      return;
    } else {
      if (rightDrawerComponent !== "default") {
        nodeDoubleClickedHandler(null, node);
        return;
      }
    }
    return;
  };
  const onNodeCreatedHandler = useCallback((node) => {
    // Note: When openNodeAfterCreate is true, canvas.jsx already calls nodeDoubleClicked
    // which opens the dialog. This handler is for post-creation side effects only.
    // The node.component check was legacy dead code that could cause duplicate dialogs.
    // Intentionally not opening dialog here to avoid race conditions.
  }, []);
  const unlinkHandler = async (linkdata) => {
    const fromNode = canvasRef.current.findNode(linkdata?.from);

    if (fromNode?.data?.type === IF_ELSE_TYPE) {
      // Extract data from the current node
      const ifElseNodeData = fromNode?.data;
      let ifElseRowData = ifElseNodeData?.go_data;

      // Process "ifData" array
      const ifDataIndex = ifElseRowData.ifData
        ?.slice()
        ?.findIndex((rowData) => rowData.key === linkdata.key);

      if (ifDataIndex === -1) {
        if (ifElseRowData.elseData[0].key === linkdata.key) {
          ifElseRowData.elseData[0].jumpTo = null;
          // Also clear moveTo in the blocks array to keep data in sync
          const elseBlockIdx = ifElseRowData.blocks?.findIndex(
            (b) => b.id === linkdata.key,
          );
          if (elseBlockIdx !== -1 && ifElseRowData.blocks[elseBlockIdx]) {
            ifElseRowData.blocks[elseBlockIdx].moveTo = null;
          }
        } else {
          // throw link not found error
          console.warn(
            "[unlinkHandler] Link key not found in ifData or elseData:",
            linkdata.key,
          );
        }
      } else {
        // Update "jumpTo" property and set the flag
        ifElseRowData.ifData[ifDataIndex].jumpTo = null;
        // Also clear moveTo in the blocks array to keep data in sync
        const ifBlockKey = ifElseRowData.ifData[ifDataIndex].key;
        const ifBlockIdx = ifElseRowData.blocks?.findIndex(
          (b) => b.id === ifBlockKey,
        );
        if (ifBlockIdx !== -1 && ifElseRowData.blocks[ifBlockIdx]) {
          ifElseRowData.blocks[ifBlockIdx].moveTo = null;
        }
      }
      const errors = validateIfElseData(ifElseRowData);
      // Save updated node data
      saveNodeDataHandler(ifElseNodeData, ifElseRowData, { errors }, false);

      // Prepare an array of links to be updated
      const linksToBeUpdated = updateIfElseNodeLinks(ifElseRowData);

      // Update node links
      updateNodeLinks(fromNode, linksToBeUpdated);
    } else if (fromNode?.data?.type === IF_ELSE_TYPE_V2) {
      let go_data = fromNode?.data?.go_data;
      const idx = go_data?.conditions?.findIndex(
        (statement) => statement.action === linkdata.to,
      );
      if (idx !== -1) {
        go_data.conditions[idx].action = null;
        saveNodeDataHandler(fromNode?.data, go_data, null, false);
      }
    } else if (
      fromNode?.data?.type === HITL_TYPE ||
      fromNode?.data?.type === HITL_V2_TYPE
    ) {
      // When HITL link is removed, clear go_data ID and recreate placeholder + reconnect
      const hitlNode = fromNode;
      let go_data = { ...(hitlNode.data?.go_data || {}) };

      // Clear the ID for the removed link
      if (linkdata.isOnResponseLink) {
        go_data.on_response_node_id = null;
      } else if (linkdata.isInitiateLink) {
        go_data.initiate_node_id = null;
      }

      // Remove the link first
      canvasRef.current.removeLink(linkdata);

      // Update node go_data to clear the deleted node reference
      canvasRef.current.createNode(
        {
          ...hitlNode.data,
          go_data,
        },
        {
          openNodeAfterCreate: false,
        },
      );

      // Recreate placeholder and reconnect using postSaveHandlerForHITLNode
      const updatedNode = canvasRef.current.findNode(hitlNode.data.key);
      if (updatedNode) {
        postSaveHandlerForHITLNode(updatedNode);
      }
    } else if (linkdata?.category === "errorLink" || linkdata?.isErrorLink) {
      const sourceNodeData = fromNode?.data;
      if (sourceNodeData) {
        canvasRef.current.updateNode(sourceNodeData.key, { errorConfig: null });
        setHasUnsavedChanges(true);
      }
      const diagram = canvasRef.current.getDiagram();
      const targetNode = diagram?.findNodeForKey(linkdata.to);
      if (
        targetNode?.data?.template === "placeholder" ||
        targetNode?.data?.template === "errorTerminal"
      ) {
        diagram.startTransaction("removeErrorTarget");
        diagram.model.removeNodeData(targetNode.data);
        diagram.commitTransaction("removeErrorTarget");
      }
      canvasRef.current.removeLink(linkdata);
    } else {
      // Remove the link if the node is not of type IF_ELSE_TYPE
      canvasRef.current.removeLink(linkdata);
    }
  };
  const getLinkContextMenuItems = (linkData) => {
    return [
      {
        id: "unlink",
        name: "Unlink",
        icon: Unlink,
        onClick: () => {
          unlinkHandler(linkData);
        },
      },
      {
        id: "rename",
        name: "Rename",
        icon: Edit3,
        onClick: () => {
          setSelectedLinkData(linkData);
          setDialogComponentWithClose(LINK_RENAME_DIALOG);
        },
        divider: true,
      },
      {
        id: "add-node",
        name: "Add Node",
        icon: Plus,
        onClick: () => {
          linkedNodesRef.current = linkData;
          showAddNodeDrawer({ via: "link-context-menu" });
        },
      },
    ];
  };
  const linkContextClickedHandler = (e, link, viewPortCoords) => {
    // Closing the drawer when link is renamed
    setRightDrawerComponentWithClose("default");
    defaultDrawerRef?.current?.closeSidebarPanel();
    if (!link?.data) {
      return;
    }

    const linkData = link.data;
    // setLinkMenu(linkMenuItems);
    const menuItems = getLinkContextMenuItems(linkData);
    setContextMenuItems(menuItems);
    setDocumentCoords({
      top: viewPortCoords?.y || 0,
      left: viewPortCoords?.x || 0,
    });
    setShowContextMenu(true);
  };

  /**
   * The `linkDrawnHandler` function handles the event when a link is drawn between two nodes in a
   * canvas.
   * @param e - The parameter `e` is an event object that contains information about the event that
   * triggered the `linkDrawnHandler` function. It likely contains information about the link that was
   * drawn, such as the source node (`fromNode`) and the target node (`toNode`).
   * @returns The function does not explicitly return anything.
   */
  const linkDrawnHandler = useCallback(
    async (_fromNode, _toNode, link) => {
      const fromNode = _fromNode;
      const toNode = _toNode;
      const isFromNodePlaceholder =
        fromNode?.data?.template === NODE_TEMPLATES.PLACEHOLDER;

      const fromNodeToLink = isFromNodePlaceholder
        ? fromNode.findTreeParentNode()
        : fromNode;
      let linkLabel = "";
      // canvasRef.current.cancelCurrentTool(); //need to check why this is failing
      canvasRef.current.removeLink(link.data);
      const isConnectable = await isLinkConnectable(
        canvasRef.current.getModelJSON(),
        fromNodeToLink.data.key,
        toNode.data.key,
      );
      if (!isConnectable) return;
      if (
        fromNodeToLink?.data?.type === IF_ELSE_TYPE ||
        fromNodeToLink?.data?.type === IF_ELSE_TYPE_V2 ||
        fromNodeToLink?.data?.type === HITL_TYPE ||
        fromNodeToLink?.data?.type === HITL_V2_TYPE
      ) {
        if (isFromNodePlaceholder) {
          const linksIntoPlaceholder = canvasRef.current.findLinksInto(
            fromNode?.data?.key,
          );
          linkedNodesRef.current = linksIntoPlaceholder?.first()?.data;
          onAddNewNodeHandler(toNode?.data, { openDialog: false });
          return;
        } else {
          linkedNodesRef.current = {
            from: fromNodeToLink.data.key,
          };
          onAddNewNodeHandler(toNode?.data, { openDialog: false });
          return;
        }
      }
      canvasRef.current.createLink({
        from: fromNodeToLink.data.key,
        to: toNode.data.key,
        label: linkLabel,
        metadata: {},
      });
    },
    [onAddNewNodeHandler],
  );

  const resetTriggerNode = (node, openNodeAfterCreate = true) => {
    canvasRef.current.createNode(
      {
        ...TRIGGER_SETUP_NODE,
        go_data: {},
        output: {},
        tf_data: {},
        key: node.data?.key,
        subType: "",
        errors: [],
        warnings: [],
        description: TRIGGER_SETUP_NODE.description || "",
        config: {},
        ai_trigger_integration: undefined,
      },
      { openNodeAfterCreate },
    );
  };

  const selectionDeletingHandler = (e, selections) => {
    if (!selections.size) {
      return;
    }
    if (showNodeDialog) {
      setShowNodeDialog(null);
      setRightDrawerComponentWithClose("default");
    }
    // Convert selections to an array to safely iterate
    const selectedNodes = selections.toArray();

    const additionalNodesToDelete = [];
    selectedNodes.forEach((node) => {
      if (
        (isLoopStartType(node?.data?.type) ||
          node?.data?.type === LOOP_END_TYPE) &&
        node?.data?.pairedNodeKey
      ) {
        const pairedNode = canvasRef.current?.findNode(node.data.pairedNodeKey);
        if (
          pairedNode &&
          !selections.has(pairedNode) &&
          !additionalNodesToDelete.includes(pairedNode)
        ) {
          additionalNodesToDelete.push(pairedNode);
        }
      }
    });
    additionalNodesToDelete.forEach((n) => {
      canvasRef.current.removeOutgoingLinks(n.key, true);
      const inLinks = canvasRef.current.findLinksInto(n.key);
      if (inLinks) {
        const arr = [];
        inLinks.each((l) => arr.push(l));
        arr.forEach((l) => {
          const fromNode = canvasRef.current.findNode(l.data.from);
          if (fromNode && !selections.has(fromNode)) {
            unlinkHandler(l.data);
          }
        });
      }
      canvasRef.current.removeNode(n);
    });

    selectedNodes.forEach((node) => {
      const isTriggerNode =
        node?.data?.subType === TRIGGER_SETUP_TYPE ||
        node?.data?.type === TRIGGER_SETUP_TYPE;
      const allowTriggerDelete =
        import.meta.env.VITE_ALLOW_TRIGGER_DELETE === "true";

      if (isTriggerNode && !allowTriggerDelete) {
        resetTriggerNode(node, selectedNodes?.length === 1);
      } else {
        // Remove outgoing links from the current selected canvas for the current node
        canvasRef.current.removeOutgoingLinks(node.key, true);

        // Find incoming links for the current selected node on the canvas
        const incomingLinks = canvasRef.current.findLinksInto(node.key);
        if (!incomingLinks) {
          return;
        }

        // Create an array from the links to safely iterate
        const incomingLinksArray = [];
        incomingLinks.each((link) => incomingLinksArray.push(link));

        // Process HITL links first - recreate placeholders before node deletion removes links
        incomingLinksArray.forEach((link) => {
          const fromNode = canvasRef.current.findNode(link.data.from);
          if (
            !selections.has(fromNode) &&
            (fromNode?.data?.type === HITL_TYPE ||
              fromNode?.data?.type === HITL_V2_TYPE) &&
            (link.data?.isOnResponseLink || link.data?.isInitiateLink)
          ) {
            // Remove the old link first
            canvasRef.current.removeLink(link.data);

            // Clear go_data ID and recreate placeholder + reconnect
            let go_data = { ...(fromNode.data?.go_data || {}) };
            if (link.data.isOnResponseLink) {
              go_data.on_response_node_id = null;
            } else if (link.data.isInitiateLink) {
              go_data.initiate_node_id = null;
            }
            canvasRef.current.createNode(
              {
                ...fromNode.data,
                go_data,
              },
              {
                openNodeAfterCreate: false,
              },
            );
            const updatedHitlNode = canvasRef.current.findNode(
              fromNode.data.key,
            );
            if (updatedHitlNode) {
              postSaveHandlerForHITLNode(updatedHitlNode);
            }
          }
        });

        // Then process non-HITL links normally
        incomingLinksArray.forEach((link) => {
          const fromNode = canvasRef.current.findNode(link.data.from);
          if (selections.has(fromNode)) {
            return;
          }
          // Skip HITL links - already handled above
          if (
            (fromNode?.data?.type === HITL_TYPE ||
              fromNode?.data?.type === HITL_V2_TYPE) &&
            (link.data?.isOnResponseLink || link.data?.isInitiateLink)
          ) {
            return;
          }
          unlinkHandler(link?.data);
        });
      }
    });
  };

  const setThemeFn = useCallback((newTheme) => {
    if (newTheme) {
      themeRef.current = newTheme;
      if (nodeModalRef.current) {
        nodeModalRef.current?.refereshTheme?.(newTheme);
      }
    }
  }, []);

  const getFormPreviewPayload = useCallback(
    (name) => {
      const modelJSON = canvasRef.current?.getModelJSON?.() || null;
      return {
        _id: assetDetails?._id,
        annotation: getAnnotation(getMode(), eventType),
        name,
        parent_id: getMode() === MODE.CMS_CANVAS ? projectId : parentId,
        project_id: projectId,
        _r: modelJSON,
        workspace_id: workspaceId,
        meta: {
          ...assetDetails?.meta,
          _t: themeRef?.current,
          params: paramsRef?.current?.params || {},
        },
      };
    },
    [assetDetails, eventType, parentId, projectId, workspaceId],
  );

  const getCanvasPayload = useCallback(() => {
    const nodes = canvasRef.current?.getAllNodes() || [];
    const transformedNodes = getTransformedNodeData(nodes);
    const name = assetDetails?.asset?.name;
    const description = assetDetails?.asset?.meta?.description;

    return {
      ...assetDetails,
      annotation: getAnnotation(getMode(), eventType),
      asset_meta: {
        ...assetDetails?.asset_meta,
        bgColor: CANVAS_BG,
        description: description,
        formMeta: { questionCount: transformedNodes?.length },
      },
      name,
      parent_id: getMode() === MODE.CMS_CANVAS ? projectId : parentId,
      project_id: projectId,
      _r: canvasRef.current?.getModelJSON(),
      workspace_id: workspaceId,
      meta: {
        ...assetDetails?.meta,
        _t: themeRef?.current,
        params: paramsRef?.current?.params || {},
        moduleTestId: moduleTestIdRef?.current,
      },
    };
  }, [assetDetails, eventType, parentId, projectId, workspaceId]);

  const onEvent = useCallback((event) => {
    setLogs((prev) => [...prev, formatSingleFormLog(event)]);
  }, []);

  const handleOpenNodeWithTheme = useCallback(() => {
    setDialogComponentWithClose(null);
    if (canvasRef.current) {
      const themeNode = canvasRef.current
        .getAllNodes()
        ?.find((node) => node?.type === "THEME");
      if (themeNode?.key) {
        canvasRef.current.goToNode(themeNode.key);
      }
    }
  }, []);

  const autoAlignHandler = useCallback(() => {
    canvasRef.current.autoAlign();
  }, []);

  const canvasContextClickedHandler = useCallback(
    (e, viewPortCoords) => {
      setRightDrawerComponentWithClose("default");
      defaultDrawerRef?.current?.closeSidebarPanel();
      setDocumentCoords({
        top: viewPortCoords?.y || 0,
        left: viewPortCoords?.x || 0,
      });
      const menuItems = [
        {
          id: "add_node",
          name: "Add Node",
          icon: Plus,
          onClick: () => {
            showAddNodeDrawer({ via: "canvas-context-menu" });
          },
          divider: true,
        },
        {
          id: "auto_align",
          name: "Auto Align",
          icon: AlignJustify,
          onClick: () => {
            autoAlignHandler();
          },
        },
        {
          id: "sticky-note",
          name: "Add Sticky Note",
          icon: StickyNote,
          onClick: () => {
            canvasRef.current.createStickyNote();
          },
        },
      ];
      setContextMenuItems(menuItems);
      setShowContextMenu(true);
    },
    [autoAlignHandler, showAddNodeDrawer],
  );

  const onRenameLinkHandler = (linkData, labelToUpdate) => {
    canvasRef.current.updateLink({
      linkData,
      linkKeyToUpdate: "label",
      linkKeyToUpdateValue: labelToUpdate,
      options: {
        strictRename: true,
        fromRename: true,
      },
    });
  };

  const nodeContextClickedHandler = useCallback(
    (e, node, viewPortCoords) => {
      // Closing the drawer when node context is clicked
      setRightDrawerComponentWithClose("default");
      defaultDrawerRef?.current?.closeSidebarPanel();

      if (node?.data?.isErrorTerminal) {
        const sourceNodeKey = node.data.sourceNodeKey;
        const diagram = canvasRef.current.getDiagram();
        const sourceNode = diagram?.findNodeForKey(sourceNodeKey);
        const menuItems = [
          {
            id: "edit-error-config",
            name: "Edit Error Config",
            icon: ShieldAlert,
            onClick: () => {
              if (sourceNode?.data) {
                setErrorHandlingModalData(sourceNode.data);
              }
            },
          },
          {
            id: "delete-node",
            name: "Delete",
            icon: Trash2,
            danger: true,
            onClick: () => {
              const linksInto = canvasRef.current.findLinksInto(
                node?.data?.key,
              );
              linksInto?.each((link) => {
                if (
                  link.data?.category === "errorLink" ||
                  link.data?.isErrorLink
                ) {
                  unlinkHandler(link.data);
                }
              });
            },
          },
        ];
        setContextMenuItems(menuItems);
        setDocumentCoords(viewPortCoords);
        setShowContextMenu(true);
        return;
      }

      const hasTestModule = node.data?.hasTestModule;
      const assetId = assetDetails?.asset_id;
      const annotation = assetDetails?.annotation;

      let menuItems = [
        {
          id: "open-node",
          name: "Edit Node",
          icon: Edit3,
          onClick: () => {
            nodeDoubleClickedHandler(null, node);
          },
        },
        {
          id: "add-logs",
          name: "Add Logs",
          icon: FileText,
          onClick: async () => {
            const addLogsModel = enrichCanvasModelForVariableList(
              canvasRef.current.getModelJSON(),
            );
            const { result } = await componentSDKServices.getVariableList(
              addLogsModel,
              node.data.key,
              projectId,
              assetId,
              { include_current_output: true },
            );
            const coords = canvasRef.current
              .getDiagram()
              .transformDocToView(node.location);

            const addLogsPopover = (
              <Suspense fallback={<></>}>
                <AddLogsPopover
                  nodeData={node.data}
                  popoverCoordinates={{
                    top: coords.y,
                    left: coords.x + 220,
                  }}
                  variables={result}
                  onClose={() => {
                    setShowAddLogsPopover(null);
                  }}
                  onSave={(logData = { before: {}, after: {} }) => {
                    saveNodeDataHandler(
                      node.data,
                      node.data?.go_data,
                      { logs: logData },
                      false,
                    );
                  }}
                />
              </Suspense>
            );
            setShowAddLogsPopover(addLogsPopover);
          },
          divider: hasTestModule ? false : true,
        },
      ];

      if (hasTestModule) {
        menuItems.push({
          id: "run",
          name: "Run This Node Only",
          icon: Play,
          onClick: async () => {
            let variables = {};
            try {
              const runNodeModel = enrichCanvasModelForVariableList(
                canvasRef.current.getModelJSON(),
              );
              const { result } = await componentSDKServices.getVariableList(
                runNodeModel,
                node.key,
                projectId,
                assetId,
              );
              variables = result;
            } catch {
              variables = {};
            }
            defaultDrawerRef.current?.openSidebarPanel({
              id: "run-node",
              name: `Run ${node?.data?.name || node?.data?.type}`,
              panel: (
                <div
                  style={{
                    display: "grid",
                    overflow: "hidden",
                    gridTemplateRows: "1fr auto",
                    gap: "1rem",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <CommonTestModuleV3
                    ref={testModuleRef}
                    canvasRef={canvasRef}
                    annotation={annotation}
                    go_data={node?.data?.go_data}
                    variables={{
                      ...(variablesRef.current || {}),
                      ...(variables || {}),
                      ...(paramsRef.current.params || {}),
                    }}
                    node={node?.data}
                    workspaceId={workspaceId}
                    assetId={assetId}
                    projectId={projectId}
                    parentId={parentId}
                    theme={{}}
                    autoContextualContent={true}
                    useV3Input={true}
                    useV4Result={true}
                    persistTestData={true}
                    inputMode="auto"
                    resultType="json"
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "100%",
                    }}
                  >
                    <Button
                      variant="black"
                      label="Run This Node"
                      onClick={() => testModuleRef.current?.beginTest()}
                    />
                  </div>
                </div>
              ),
            });
          },
          divider: true,
        });
      }

      const isTriggerNode =
        node?.data?.type === TRIGGER_SETUP_TYPE ||
        node?.data?.subType === TRIGGER_SETUP_TYPE;
      if (!isTriggerNode) {
        menuItems.push({
          id: "duplicate-node",
          name: "Duplicate Node",
          icon: Copy,
          shortcut: "⌘D",
          disabled: rightDrawerComponent !== "default",
          onClick: async () => {
            const cloned = cloneDeep(node.data || node);
            delete cloned.key;
            delete cloned.location;
            cloned.name = (cloned.name || "") + " (copied)";
            const newNode = canvasRef.current?.createNode?.(cloned, {
              openNodeAfterCreate: false,
              autoLink: false,
              location: {
                x: (node.location?.x ?? 0) + 50,
                y: (node.location?.y ?? 0) + 50,
              },
            });
            if (newNode) {
              try {
                await saveNodeDataHandler(
                  newNode.data,
                  newNode.data?.go_data ?? {},
                  {},
                  false,
                );
              } catch (err) {
                toast.error(
                  "Failed to generate configuration for duplicated node.",
                );
              }
            }
          },
        });
      }

      const questionTypeValues = Object.values(QuestionType);
      const nodeType =
        node?.data?.subType || node?.data?.type || node?.data?.go_data?.type;
      const isQuestionNode = questionTypeValues.includes(nodeType);

      if (!isQuestionNode) {
        menuItems.push({
          id: "on-error",
          name: "On Error",
          icon: ShieldAlert,
          divider: true,
          onClick: () => {
            const part = node.part || node;
            const data = part.data || part;
            setErrorHandlingModalData(data);
          },
        });
      }

      menuItems.push({
        id: "delete-node",
        name: "Delete Node",
        icon: Trash2,
        danger: true,
        onClick: () => {
          if (
            node?.data?.subType === TRIGGER_SETUP_TYPE ||
            node?.data?.type === TRIGGER_SETUP_TYPE
          ) {
            resetTriggerNode(node);
            return;
          }
          canvasRef.current.deleteSelection();
        },
      });

      console.log(
        "[DEBUG ic-canvas] Setting context menu items and showing menu",
        {
          menuItemsCount: menuItems?.length,
          coords: { top: viewPortCoords?.y || 0, left: viewPortCoords?.x || 0 },
        },
      );
      setContextMenuItems(menuItems);
      setDocumentCoords({
        top: viewPortCoords?.y || 0,
        left: viewPortCoords?.x || 0,
      });
      setShowContextMenu(true);
    },
    [
      assetDetails?.annotation,
      assetDetails?.asset_id,
      nodeDoubleClickedHandler,
      parentId,
      projectId,
      saveNodeDataHandler,
      workspaceId,
    ],
  );

  const executeWorkflow = async (e) => {
    if (!assetDetails?.asset_id) {
      toast.warning("Please save the workflow first.");
      return;
    }
    console.log("[RUN_ENTRY] executeWorkflow called", {
      timestamp: Date.now(),
    });

    const allNodes = canvasRef.current?.getAllNodes() || [];
    for (const node of allNodes) {
      const {
        errors: newErrors,
        warnings: newWarnings,
        validationIssues,
      } = validateNodeForRun(node);
      const mergedErrors = [...new Set([...(node.errors || []), ...newErrors])];
      const mergedWarnings = [
        ...new Set([...(node.warnings || []), ...newWarnings]),
      ];
      if (newErrors.length > 0 || newWarnings.length > 0) {
        canvasRef.current.updateNode(node.key, {
          errors: mergedErrors,
          warnings: mergedWarnings,
          validationIssues: validationIssues ?? node.validationIssues ?? null,
        });
      }
      if (mergedErrors.length > 0) {
        const diagram = canvasRef.current?.getDiagram?.();
        const goNode = diagram?.findNodeForKey(node.key);
        if (goNode) {
          diagram.clearSelection();
          diagram.select(goNode);
          diagram.scrollToRect(goNode.actualBounds);
          const viewPt = diagram.transformDocToView(goNode.location);
          setDocumentCoords({ left: viewPt.x + 60, top: viewPt.y });
          setErrorsWarningsData({
            errors: mergedErrors,
            warnings: mergedWarnings,
            nodeKey: node.key,
            nodeType: node.type || "",
            nodeName: node.text || node.name || "",
            nodeIcon: node.icon || "",
            validationIssues: validationIssues ?? node.validationIssues ?? null,
          });
          setShowErrorWarningPopover(true);
        }
        return;
      }
    }

    try {
      const rect = e?.target?.getBoundingClientRect?.();
      if (rect) {
        setDocumentCoords({
          top: rect.y + 48,
          left: rect.x,
        });
      }

      let modelJSON = canvasRef.current?.getModelJSON?.();
      if (!modelJSON) {
        toast.error("Unable to get workflow data. Please try again.");
        return;
      }

      // Ensure HITL nodes have on_response_node_id/initiate_node_id from links so SDK validation passes (single source of truth: linkDataArray)
      const model =
        typeof modelJSON === "string" ? JSON.parse(modelJSON) : modelJSON;
      const nodeDataArray = model?.nodeDataArray || [];
      const linkDataArray = model?.linkDataArray || [];
      nodeDataArray.forEach((node) => {
        if (node.type !== HITL_TYPE && node.type !== HITL_V2_TYPE) return;
        const go_data = node.go_data || {};
        let on_response_node_id = go_data.on_response_node_id;
        let initiate_node_id = go_data.initiate_node_id;
        linkDataArray.forEach((link) => {
          if (link.from !== node.key) return;
          if (link.isOnResponseLink) on_response_node_id = link.to;
          if (link.isInitiateLink) initiate_node_id = link.to;
        });
        if (on_response_node_id != null || initiate_node_id != null) {
          node.go_data = { ...go_data };
          if (on_response_node_id != null)
            node.go_data.on_response_node_id = on_response_node_id;
          if (initiate_node_id != null)
            node.go_data.initiate_node_id = initiate_node_id;
        }
      });
      const payload =
        typeof modelJSON === "string" ? JSON.stringify(model) : model;

      const getStartNodeAndSchemaResponse =
        await canvasSDKServices.getStartNodeAndSchema(payload);
      const result = getStartNodeAndSchemaResponse?.result;
      if (result?.input_schema?.schema?.[0]?.schema?.length === 0) {
        console.log("[ic-canvas] run started (empty schema)");
        setLogs([]);
        setIsExecutionHistoryOpen(true);
        setIsRunning(true);
        executeRunRef?.current?.execute([]);
      } else if (isManualStartWithNoInputs(payload)) {
        console.log("[ic-canvas] run started (manual, no inputs)");
        setLogs([]);
        setIsExecutionHistoryOpen(true);
        setIsRunning(true);
        executeRunRef?.current?.execute([]);
      } else {
        setRunWorkflowSchema(result?.input_schema?.schema ?? []);
        setIsExecutionHistoryOpen(false);
        setRunWorkflowWizardOpen(true);
      }
    } catch (error) {
      toast.error("An error occurred while starting the workflow test.");
    }
  };

  const onExecuteRunEvent = useCallback(
    (data) => {
      console.log("[ic-canvas run event]", {
        event_name: data?.event_name,
        event: data?.event,
        node_id: data?.node_id,
        node_name: data?.node_name,
        is_advance: data?.is_advance,
        raw: data,
      });
      if (data.is_advance) return;
      const formatted = formatSingleLog(data);
      console.log(
        "[ic-canvas formatSingleLog result]",
        formatted != null ? "ok" : "null",
        data?.event_name,
      );
      setLogs((prev) => [...prev, formatted].filter(Boolean));
    },
    [formatSingleLog],
  );

  const onExecuteRunComplete = useCallback((status) => {
    console.log("[ic-canvas] onExecutionComplete", status);
    setIsRunning(false);
    setLoading(null);
    setLogs([]);
    setRefetchExecutionHistoryTrigger((prev) => prev + 1);
  }, []);

  const createNodesForAICanvas = useCallback(
    async (data) => {
      if (!data?.meta?.aiNodes) {
        return;
      }
      const nodesData = JSON.parse(data?.meta?.aiNodes);
      if (data.annotation === "WC") {
        const nodeIdMap = createNodeIdMap(searchConfig);
        await processWorkflowData(nodesData, saveNodeDataHandler, nodeIdMap);
      } else if (data.annotation === "FC") {
        await processFormData(nodesData, saveNodeDataHandler);
      }
    },
    [processFormData, processWorkflowData, saveNodeDataHandler, searchConfig],
  );

  const setUpVariables = useCallback(async () => {
    if (projectId) {
      setLoading("Fetching project variables...");
      const getByParentResponse = await variableSDKServices.getByParent({
        parent_id: projectId,
        asset_id: assetId,
      });
      if (getByParentResponse?.status === "success")
        variablesRef.current = getByParentResponse?.result;
    }
  }, [assetId, projectId]);

  const initCanvas = useCallback(async () => {
    const deduplicateSetupNodes = () => {
      const diagram = canvasRef?.current?.getDiagram?.();
      if (!diagram) return;
      const setupTemplates = new Set(SETUP_COMPONENTS.map((c) => c.template));
      const setupTypes = new Set(SETUP_COMPONENTS.map((c) => c.type));
      const nodesByTemplate = new Map();
      diagram.nodes.each((node) => {
        const tpl = node.data?.template;
        const type = node.data?.type;
        if (
          (tpl && setupTemplates.has(tpl)) ||
          (type && setupTypes.has(type))
        ) {
          const groupKey = tpl || type;
          if (!nodesByTemplate.has(groupKey)) nodesByTemplate.set(groupKey, []);
          nodesByTemplate.get(groupKey).push(node);
        }
      });
      const duplicates = [];
      nodesByTemplate.forEach((nodes) => {
        if (nodes.length <= 1) return;
        const withLinks = nodes.filter((n) => n.findLinksOutOf().count > 0);
        const keeper = withLinks.length > 0 ? withLinks[0] : nodes[0];
        nodes.forEach((n) => {
          if (n !== keeper) duplicates.push(n);
        });
      });
      if (duplicates.length > 0) {
        diagram.startTransaction("deduplicateSetupNodes");
        duplicates.forEach((node) => {
          diagram.removeParts(node.findLinksOutOf());
          diagram.removeParts(node.findLinksInto());
          diagram.remove(node);
        });
        diagram.commitTransaction("deduplicateSetupNodes");
      }
    };

    try {
      if (isEmbedMode && pendingEmbedCanvasData) {
        console.log("[EmbedStudio] initCanvas: loading injected canvas data — nodeCount:", (pendingEmbedCanvasData?.nodeDataArray || []).length);
        await canvasRef.current?.loadModelJSON(JSON.stringify(pendingEmbedCanvasData));
        canvasRef.current?.autoAlign();
        setPendingEmbedCanvasData?.(null);
        const nodeCount = (pendingEmbedCanvasData?.nodeDataArray || []).length;
        embedSendMessage?.({ event: "assetLoaded", nodeCount });
        setLoading(null);
        return;
      }

      if (isEmbedMode && !pendingEmbedCanvasData) {
        console.log("[EmbedStudio] initCanvas: waiting for loadAsset postMessage — skipping backend fetch");
        setLoading(false);
        return;
      }

      await setUpVariables();

      let canvasAlreadyLoaded = false;
      if (assetId && workspaceId) {
        const { doesAssetExists, isRestored = false } =
          await checkAssetExistence({
            assetId,
            workspaceId,
          });

        if (doesAssetExists) {
          setLoading("Initialising...");
          let modelJSON = null;
          if (godata_cache?._r && assetId === godata_cache?.asset_id) {
            setLoading(null);

            // Calculate draft node count
            let draftNodeCount = 0;
            try {
              const cachedModel =
                typeof godata_cache._r === "string"
                  ? JSON.parse(godata_cache._r)
                  : godata_cache._r;
              draftNodeCount = cachedModel?.nodeDataArray?.length || 0;
            } catch (e) {}

            // Fetch saved version info first
            const savedResponse = await canvasSDKServices.findOne({
              workspace_id: workspaceId,
              asset_id: assetId,
            });

            let savedNodeCount = 0;
            let savedTimestamp = Date.now();
            if (
              savedResponse?.status === SUCCESS &&
              savedResponse?.result?._r
            ) {
              try {
                const savedModel =
                  typeof savedResponse.result._r === "string"
                    ? JSON.parse(savedResponse.result._r)
                    : savedResponse.result._r;
                savedNodeCount = savedModel?.nodeDataArray?.length || 0;
                savedTimestamp = savedResponse.result?.asset?.edited_at
                  ? new Date(savedResponse.result.asset.edited_at).getTime()
                  : Date.now();
              } catch (e) {}
            }

            // Preload draft state immediately - show it to user
            const draftModelJSON = godata_cache._r;
            if (draftModelJSON) {
              await canvasRef.current.loadModelJSON(draftModelJSON);
              deduplicateSetupNodes();
              setTimeout(() => canvasRef.current.autoAlign(), 100);
              canvasAlreadyLoaded = true;
            }

            // Show draft recovery toast and wait for user decision
            const useDraft = await new Promise((resolve) => {
              draftDialogResolveRef.current = resolve;
              showDraftRecoveryToast({
                draftInfo: {
                  nodeCount: draftNodeCount,
                  timestamp: godata_cache?.cached_at || Date.now(),
                },
                onContinue: () => resolve(true),
                onStartFresh: () => resolve(false),
              });
            });

            if (useDraft) {
              // Draft is already loaded, just ensure it's set
              modelJSON = draftModelJSON;
            } else {
              // User chose saved version - reload with saved version
              updateGoDataCache(null);
              // Use the saved response we already fetched
              if (savedResponse?.status === SUCCESS) {
                setAssetDetails(() => ({ ...savedResponse?.result }));
                setThemeFn(savedResponse?.result?.meta?._t);
                paramsRef.current.params = savedResponse?.result?.meta?.params;
                modelJSON = savedResponse.result._r;
                // Reload canvas with saved version
                if (modelJSON) {
                  await canvasRef.current.loadModelJSON(modelJSON);
                  deduplicateSetupNodes();
                  setTimeout(() => canvasRef.current.autoAlign(), 100);
                  canvasAlreadyLoaded = true;
                }
              }
            }
          }

          let response;
          if (isRestored) {
            const maxAttempts = 3;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              const delay = attempt * 1000;

              if (attempt === 1) {
                setLoading("Restoring your assets...");
              } else if (attempt === 2) {
                setLoading(
                  "Still working on it… this may take a little longer than expected.",
                );
              }

              await new Promise((resolve) => setTimeout(resolve, delay));

              response = await canvasSDKServices.findOne({
                workspace_id: workspaceId,
                asset_id: assetId,
              });

              if (
                response?.status === SUCCESS &&
                response?.result?.state === "ACTIVE"
              ) {
                break;
              }
            }

            setLoading(null);

            if (response?.result?.state !== "ACTIVE") {
              toast.error(
                "It's taking longer than expected to load your data. Please refresh the page or try again later.",
              );
              return;
            }
          } else {
            response = await canvasSDKServices.findOne({
              workspace_id: workspaceId,
              asset_id: assetId,
            });
          }

          setAssetDetails(() => {
            return {
              ...response?.result,
            };
          });
          setThemeFn(response?.result?.meta?._t);
          paramsRef.current.params = response?.result?.meta?.params;

          if (response?.result?.meta?.aiNodes) {
            isAiNodeFlow.current = true;
            await createNodesForAICanvas(response.result);
            canvasRef.current.autoAlign();
            setTimeout(() => {
              saveWorkflowWithParams({
                ...response.result,
                meta: {
                  ...response.result?.meta,
                  aiNodes: null,
                },
              });
              isAiNodeFlow.current = false;
              setRightDrawerComponentWithClose("default");
              setShowNodeDialog(null);
            }, 0);
            return;
          }
          if (response?.result?.meta?.moduleTestId) {
            moduleTestIdRef.current = response?.result?.meta?.moduleTestId;
          }
          if (!modelJSON) modelJSON = response.result._r;

          // Only load if we haven't already loaded from draft dialog
          if (modelJSON && !canvasAlreadyLoaded) {
            await canvasRef.current.loadModelJSON(modelJSON);
            deduplicateSetupNodes();
            setTimeout(() => canvasRef.current.autoAlign(), 100);
            let projectsInfo = {};
            let publishedAssets = {};
            const handleNodeUpdates = async (node, callback) => {
              let updatedNode = cloneDeep(node);
              const project_id = updatedNode?.go_data?.flow?.project_id;
              const projectInfo = projectsInfo[project_id];
              if (!projectInfo) {
                const src = await getNodeSrc(updatedNode);
                if (project_id) projectsInfo[project_id] = { src };
                updatedNode._src = src;
              } else {
                updatedNode._src = projectInfo.src;
              }
              if (updatedNode.type === INTEGRATION_TYPE) {
                const asset_id = updatedNode?.tf_data?.config?.flow?.asset_id;
                if (!publishedAssets[asset_id]) {
                  const publishedByAssetResponse =
                    await canvasServices.getPublishedByAsset({
                      asset_id: updatedNode?.tf_data?.config?.flow?.asset_id,
                    });
                  if (publishedByAssetResponse?.status === "success")
                    publishedAssets[asset_id] = publishedByAssetResponse.result;
                }
                if (publishedAssets[asset_id]) {
                  const current_published_id = publishedAssets[asset_id]?._id;
                  const saved_published_id =
                    updatedNode?.tf_data?.config?.flow?.id;
                  if (current_published_id !== saved_published_id) {
                    updatedNode.warnings = [
                      ...(updatedNode.warnings || []),
                      "A new version is available. Please save the node to get the latest version.",
                    ];
                  }
                }
              }
              const {
                errors: validatedErrors,
                warnings: validatedWarnings,
                validationIssues: validatedIssues,
              } = validateNodeConfig(updatedNode);
              if (validatedErrors.length > 0 || validatedWarnings.length > 0) {
                updatedNode.errors = [
                  ...new Set([
                    ...(updatedNode.errors || []),
                    ...validatedErrors,
                  ]),
                ];
                updatedNode.warnings = [
                  ...new Set([
                    ...(updatedNode.warnings || []),
                    ...validatedWarnings,
                  ]),
                ];
                updatedNode.validationIssues =
                  validatedIssues ?? updatedNode.validationIssues ?? null;
              }
              canvasRef.current.createNode(updatedNode, {
                skipScroll: true,
                autoLink: false,
              });
              callback();
            };
            mapLimit(
              canvasRef.current.getAllNodes() || [],
              2,
              (node, callback) => {
                handleNodeUpdates(node, () => {
                  setTimeout(async () => {
                    callback();
                  }, 0);
                });
              },
            );
            return;
          }
        }
      } else {
        if (getMode() === MODE.WORKFLOW_CANVAS) {
          // setShowGenerateFormCTA(true);
        }
      }
      if (!canvasAlreadyLoaded) {
        const diagram = canvasRef?.current?.getDiagram?.();
        const existingTypes = new Set();
        const existingTemplates = new Set();
        if (diagram) {
          diagram.nodes.each((node) => {
            if (node.data?.type) existingTypes.add(node.data.type);
            if (node.data?.template) existingTemplates.add(node.data.template);
          });
        }
        SETUP_COMPONENTS.forEach((n) => {
          if (existingTypes.has(n.type)) return;
          if (n.template && existingTemplates.has(n.template)) return;
          canvasRef?.current?.createNode(n);
        });
      }
      if (!assetId && !isEmbedMode) {
        canvasRef.current.autoAlign();
        if (getMode() !== MODE.CMS_CANVAS) {
          setDialogComponentWithClose(CREATE_CANVAS_ASSET_DIALOG);
        }
      }
    } finally {
      setLoading(false);
      if (!isEmbedMode) {
        onNewEvent(UATU_CANVAS, {
          subEvent: UATU_PREDICATE_EVENTS_CANVAS.USER_SESSION_START,
        });
      }
    }
  }, [
    isEmbedMode,
    assetId,
    checkAssetExistence,
    createNodesForAICanvas,
    godata_cache?._r,
    godata_cache?.asset_id,
    onNewEvent,
    saveWorkflowWithParams,
    setThemeFn,
    setUpVariables,
    updateGoDataCache,
    updateWorkflow,
    workspaceId,
  ]);

  const isDraft = useMemo(() => {
    return (
      godata_cache?._r ||
      !assetDetails?.asset?.published_info?.published_at ||
      new Date(assetDetails?.asset?.edited_at).getTime() -
        new Date(assetDetails?.asset?.published_info?.published_at).getTime() >
        5000
    );
  }, [
    assetDetails?.asset?.edited_at,
    assetDetails?.asset?.published_info?.published_at,
    godata_cache?._r,
  ]);

  useEffect(() => {
    if (isEmbedMode) return;
    if (
      !assetDetails?.asset_id ||
      !userData?._id ||
      !assetDetails?.workspace_id
    )
      return;
    const initializeUTAU = async () => {
      await initUATU().then(() => {
        onNewEvent(UATU_CANVAS, {
          subEvent: UATU_PREDICATE_EVENTS_CANVAS.USER_LAST_ACTIVE,
        });
      });
    };
    initializeUTAU();
  }, [
    isEmbedMode,
    initUATU,
    onNewEvent,
    assetDetails?.asset_id,
    userData?._id,
    assetDetails?.workspace_id,
  ]);

  // Intercom: lazy-load SDK only when user clicks chat to prevent default launcher
  const intercomBootedRef = useRef(false);
  const lastIntercomUserRef = useRef({ name: null, email: null });

  const initAndShowIntercom = useCallback(async () => {
    const { boot, show, onHide, update } =
      await import("@intercom/messenger-js-sdk");
    if (!intercomBootedRef.current) {
      boot({
        app_id: process.env.REACT_APP_INTERCOM_ID,
        name: user?.name,
        email: user?.email,
        hide_default_launcher: true,
        horizontal_padding: 100,
        vertical_padding: 80,
      });
      onHide(() => {
        localStorage.setItem("itc", true);
      });
      lastIntercomUserRef.current = { name: user?.name, email: user?.email };
      intercomBootedRef.current = true;
    } else if (
      lastIntercomUserRef.current.name !== user?.name ||
      lastIntercomUserRef.current.email !== user?.email
    ) {
      update({ name: user?.name, email: user?.email });
      lastIntercomUserRef.current = { name: user?.name, email: user?.email };
    }
    show();
  }, [user?.email, user?.name]);

  // Expose for sidebar action (not in embed mode)
  useEffect(() => {
    if (isEmbedMode) return;
    window.__showIntercom = initAndShowIntercom;
    return () => {
      delete window.__showIntercom;
      // Cleanup Intercom on unmount if it was initialized
      if (intercomBootedRef.current) {
        import("@intercom/messenger-js-sdk").then(({ shutdown }) => shutdown());
      }
    };
  }, [isEmbedMode, initAndShowIntercom]);

  useEffect(() => {
    if (isEmbedMode) return;
    if (!userData) getUserData();
  }, [isEmbedMode, getUserData, userData]);

  useEffect(() => {
    if (isEmbedMode) return;
    if (user?.sub && user?.email) {
      Clarity.init(getClarityId());
      Clarity.identify(user.sub, user.sub, "", user.email);
      Clarity.setTag("email", user.email);
      Clarity.setTag("user_id", user.sub);
    }
  }, [isEmbedMode, user?.sub, user?.email]);

  useEffect(() => {
    if (loadingConfig) return;
    if (!isInitialized) {
      setIsInitialized(true);
      initCanvas().then(() => {
        syncTestDataToNodes(canvasRef);
      });
    }
  }, [initCanvas, isInitialized, loadingConfig]);

  useEffect(() => {
    if (isEmbedMode) return;
    async function fetchPremiumUser() {
      if (!assetDetails?.workspace_id) return;

      try {
        const status = await trackSDKServices.checkIfPremiumUser(
          assetDetails.workspace_id,
        );

        setIsPremiumUser(status);
      } catch (error) {
        setIsPremiumUser(false);
      }
    }
    fetchPremiumUser();
  }, [isEmbedMode, assetDetails?.workspace_id]);

  useEffect(() => {
    async function fetchDomains() {
      if (!workspaceId) return;

      try {
        console.log("fetchDomains", workspaceId);
        const domainsResponse = await domainSDKServices.findByWorkspace({
          workspace_id: workspaceId,
          mapping_type: "domain",
        });
        console.log("domainsResponse", domainsResponse);

        const domainList =
          domainsResponse?.status === "success" &&
          Array.isArray(domainsResponse?.result)
            ? domainsResponse.result
            : [];

        let customUrls = [];

        setCustomDomainData({
          domainList,
          customUrls,
        });
      } catch (domainError) {
        console.log("domainError", domainError);
        setCustomDomainData({
          domainList: [],
          customUrls: [],
        });

        toast.error("Failed to fetch domains");
      }
    }

    async function fetchCustomUrls() {
      if (!assetId || !workspaceId) return;

      try {
        const customUrlsResponse = await domainSDKServices.findByWorkspace({
          workspace_id: workspaceId,
          mapping_type: "path",
          asset_id: assetId,
        });

        const customUrls =
          customUrlsResponse?.status === "success" &&
          Array.isArray(customUrlsResponse?.result)
            ? customUrlsResponse.result
            : [];

        setCustomDomainData((prev) => ({
          ...prev,
          customUrls,
        }));
      } catch (customUrlsError) {
        toast.error("Failed to fetch custom URLs");

        setCustomDomainData((prev) => ({
          ...prev,
          customUrls: [],
        }));
      }
    }

    if (!isEmbedMode) {
      fetchDomains();
      fetchCustomUrls();
    }
  }, [isEmbedMode, assetId, workspaceId]);

  useKeydown({
    saveButtonRef,
    showAddNodeDrawer,
    onToggleKeyboardShortcuts: () => setShowKeyboardShortcuts((prev) => !prev),
    onEmbedSaveAttempt: isEmbedMode && !isEmbedAuthenticated ? handleEmbedSignUp : undefined,
  });

  const keyboardHandlers = useMemo(() => {
    const base = createKeyboardShortcutHandlers(canvasRef, {
      onNodeDoubleClick: nodeDoubleClickedHandler,
      showAddNodeDrawer,
      autoAlignHandler,
      showNodeFinder: () => setShowNodeFinder(true),
    });
    return {
      ...base,
      onDelete: () => {
        const diagram = canvasRef?.current?.getDiagram?.();
        if (!diagram || diagram.isReadOnly) return;
        const openDialog = showNodeDialogRef.current;
        if (openDialog && diagram.selection.count > 0) {
          const selectedKeys = new Set(
            diagram.selection
              .toArray()
              .map((n) => n.data?.key)
              .filter(Boolean),
          );
          if (selectedKeys.has(openDialog.key)) {
            setShowNodeDialog(null);
            setRightDrawerComponentWithClose("default");
            return;
          }
        }
        base.onDelete();
      },
    };
  }, [
    canvasRef,
    nodeDoubleClickedHandler,
    showAddNodeDrawer,
    autoAlignHandler,
    setShowNodeFinder,
    setShowNodeDialog,
    setRightDrawerComponentWithClose,
  ]);

  useCanvasKeyboardShortcuts(canvasRef, keyboardHandlers);

  useContextMenu();

  // Guard against null context (after all hooks to comply with Rules of Hooks)
  if (!context) {
    return (
      <div
        className={classes["loading-container"]}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <ODSLabel variant="body1">Loading...</ODSLabel>
      </div>
    );
  }

  return (
    <>
      <div ref={canvasContainerRef} className={classes["canvas-container"]}>
        <TroubleShootCard
          onContactUsClicked={() => {
            // Lazy-load and show Intercom
            if (window.__showIntercom) {
              window.__showIntercom();
            }
          }}
        />
        <Canvas
          mode={getMode()}
          ref={canvasRef}
          stickyNoteHandlers={stickyNoteHandlers}
          canvasClicked={() => {}}
          canvasDoubleClicked={() => {
            showAddNodeDrawer({ via: "canvas-double-click" });
          }}
          isReadOnly={rightDrawerComponent !== "default"}
          canvasContextClicked={canvasContextClickedHandler}
          nodeClicked={nodeClickedHandler}
          nodeDoubleClicked={nodeDoubleClickedHandler}
          nodeContextClicked={nodeContextClickedHandler}
          onNodeCreated={onNodeCreatedHandler}
          linkContextClicked={linkContextClickedHandler}
          onLinkDrawn={(e) => {
            const link = e.subject;
            linkDrawnHandler(link.fromNode, link.toNode, link);
          }}
          // onScaleChange={(value = 1) => setScale((value * 100).toFixed(0)}
          onSelectionDeleting={selectionDeletingHandler}
          onModelChanged={(event) => {
            if (shouldCheckReferences(event?.oldValue)) {
              checkReferences();
            }
            setNodeCount(event?.model?.nodeDataArray?.length || 0);
            if (isInitialized && event?.isTransactionFinished) {
              setHasUnsavedChanges(true);
              debouncedDraftSave(assetDetails?.asset_id);
              if (isEmbedMode && embedSendMessage) {
                const modelData = canvasRef.current?.getModelJSON?.();
                if (modelData) {
                  try {
                    const parsed = JSON.parse(modelData);
                    embedSendMessage({
                      event: "assetUpdated",
                      data: parsed,
                      nodeCount: (parsed.nodeDataArray || []).length,
                      ...(assetDetails?.asset_id ? { assetId: assetDetails.asset_id } : {}),
                    });
                  } catch {}
                }
              }
            }
          }}
          onBadgeClick={(e, data, viewPortCoords, type) => {
            setDocumentCoords({
              left: viewPortCoords?.x + 30,
              top: viewPortCoords?.y,
            });
            if (type === "errors") {
              setErrorsWarningsData(data);
              setShowErrorWarningPopover(true);
            } else if (type === "executions") {
              setExecutionsData(data);
              setShowExecutions(true);
            }
          }}
          // allowBackwardLinking={getMode() === MODE.WORKFLOW_CANVAS} //disabled backlink
        />
      </div>
      <NullComponent nodeCount={nodeCount} />
      {isExecutionHistoryOpen && (
        <Suspense fallback={<></>}>
          <ExecutionHistoryDrawer
            workspaceId={assetDetails?.workspace_id}
            assetId={
              assetDetails?.asset?.asset_id ||
              assetDetails?.asset?._id ||
              assetId
            }
            isOpen={isExecutionHistoryOpen}
            onToggle={() => setIsExecutionHistoryOpen((prev) => !prev)}
            liveLogs={logs}
            isLiveRunActive={isRunning}
            refetchTrigger={refetchExecutionHistoryTrigger}
          />
        </Suspense>
      )}
      <div className={classes["canvas-overlay-container"]}>
        <div className={classes["layout-grid"]}>
          <div className={classes["left-column"]}>
            <div className={classes["cta-container"]}>
              {/* <QuickAccessPanel
                onNodeClick={onAddNewNodeHandler}
                searchConfig={searchConfig}
                canvasRef={canvasRef}
              /> */}
              <Header
                setDialogComponent={setDialogComponentWithClose}
                assetDetails={assetDetails}
                getSaveDialogTitle={getSaveDialogTitle}
                isDraft={isDraft}
                isDirty={hasUnsavedChanges}
                onMarkDirty={() => setHasUnsavedChanges(true)}
                updateWorkflow={updateWorkflow}
                saveButtonRef={saveButtonRef}
                loading={loading}
                isRunning={isRunning}
                executeWorkflow={executeWorkflow}
                setLoading={setLoading}
                executeRunRef={executeRunRef}
                nodeCount={nodeCount}
                assetId={assetId}
                publishBtnRef={publishBtnRef}
                defaultDrawerRef={defaultDrawerRef}
                variablesRef={variablesRef}
                getFormPreviewPayload={getFormPreviewPayload}
                onAssetDetailsChange={onWorkflowStatusChange}
                isEmbedMode={isEmbedMode}
                isEmbedAuthenticated={isEmbedAuthenticated}
                onEmbedSignUp={handleEmbedSignUp}
                onOpenGlobalParams={onOpenGlobalParams}
                onOpenThemeManager={onOpenThemeManager}
                onOpenHelp={onOpenHelp}
                metrics={{
                  responses:
                    assetDetails?.asset?.stats?.response_count ??
                    assetDetails?.asset?.response_count,
                  today: assetDetails?.asset?.stats?.today_count ?? 0,
                  runs: assetDetails?.asset?.run_count,
                  successRate: assetDetails?.asset?.failure_count
                    ? Math.round(
                        (1 -
                          assetDetails.asset.failure_count /
                            (assetDetails.asset.run_count || 1)) *
                          100,
                      )
                    : 100,
                }}
              />
              <BottomCtaContainer
                showAddNodeDrawer={showAddNodeDrawer}
                onAddNode={onAddNewNodeHandler}
                tools={tools}
                autoAlignHandler={autoAlignHandler}
                setRightDrawerComponent={setRightDrawerComponentWithClose}
                onTest={executeWorkflow}
                onStop={() => {
                  setLoading("Stopping... Please wait.");
                  executeRunRef?.current?.abort();
                }}
                onPreview={() => {
                  if (!canvasRef.current?.getModelJSON) {
                    return;
                  }
                  setDialogComponentWithClose(PREVIEW_DIALOG);
                }}
                isRunning={isRunning}
                mode={getMode()}
                onShowNodeFinder={() => setShowNodeFinder(true)}
                nodeCount={nodeCount}
                onToggleExecutionHistory={() =>
                  setIsExecutionHistoryOpen((prev) => !prev)
                }
                executionHistoryOpen={isExecutionHistoryOpen}
                getWorkflowContext={getWorkflowContext}
                canvasRef={canvasRef}
                assetId={assetDetails?.asset_id || ""}
                tabData={searchConfig}
                saveNodeDataHandler={saveNodeDataHandler}
                workspaceId={workspaceId}
              />
            </div>
          </div>
          <div
            className={classes["right-column"]}
            data-canvas-right-column
          >
            <div className={classes["right-drawer"]} data-drawer-container>
              {rightDrawerComponent === "default" && (
                <Suspense fallback={<></>}>
                  <Drawer
                    ref={defaultDrawerRef}
                    open={true}
                    removeContentPadding
                    sliderProps={{
                      sx: {
                        background: canvasTheme.background,
                      },
                    }}
                    showCloseIcon={true}
                    showFullscreenIcon={false}
                    showSidebar={false}
                    onSidebarPanelClose={() => {
                      setIsAddNodesPanelOpen(false);
                      nodeToReplaceRef.current = null;
                      linkedNodesRef.current = null;
                    }}
                  />
                </Suspense>
              )}
              {rightDrawerComponent === NODE_DIALOG && showNodeDialog}
              <Suspense fallback={<></>}>
                <LogsDialog
                  open={rightDrawerComponent === "logs"}
                  data={logs}
                  onClose={() => setRightDrawerComponentWithClose("default")}
                  onClearTerminal={() => setLogs([])}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <div>
        <WizardDrawer
          open={runWorkflowWizardOpen}
          title="Run Workflow"
          subtitle="Provide inputs and run"
          showCloseIcon
          onClose={() => {
            setRunWorkflowWizardOpen(false);
            setRunWorkflowSchema(null);
          }}
        >
          <Suspense fallback={<></>}>
            <RunInputsPopover
              schema={runWorkflowSchema ?? []}
              onRun={async (schema) => {
                console.log("[ic-canvas] run started (wizard)", {
                  schemaLength: schema?.length,
                });
                setRunWorkflowWizardOpen(false);
                setRunWorkflowSchema(null);
                setLogs([]);
                setIsExecutionHistoryOpen(true);
                setIsRunning(true);
                executeRunRef?.current?.execute(schema);
              }}
              onCancel={() => {
                setRunWorkflowWizardOpen(false);
                setRunWorkflowSchema(null);
              }}
            />
          </Suspense>
        </WizardDrawer>
        <Suspense fallback={<></>}>
          <Dialog
            open={dialogComponent === WORKFLOW_NAME_DIALOG}
            showFullscreenIcon={false}
            onClose={() => {
              // Validate before closing if workflowNameRef is available
              if (workflowNameRef.current) {
                const isValid = workflowNameRef.current.isValid();
                if (!isValid) {
                  // Show validation errors and prevent closing
                  workflowNameRef.current.validateFields();
                  return;
                }
              }
              setDialogComponentWithClose(null);
            }}
            transition="none"
            dialogWidth="clamp(320px, 90vw, 500px)"
            dialogMinHeight="clamp(120px, 20vh, 160px)"
            dialogTitle={`Save ${getSaveDialogTitle(getMode())} as`}
            dialogContent={
              <Suspense fallback={<></>}>
                <WorkflowName
                  ref={workflowNameRef}
                  onSave={async (details) => {
                    await updateWorkflow(details, {
                      isPublish: isPublishRef.current,
                    });
                    isPublishRef.current = null;
                    setDialogComponentWithClose(null);
                  }}
                  details={{
                    name:
                      assetDetails?.asset?.name ||
                      (getMode() === MODE.TOOL_CANVAS
                        ? ""
                        : `Untitled ${getSaveDialogTitle(getMode())}`),
                    description: assetDetails?.asset?.meta?.description || "",
                  }}
                />
              </Suspense>
            }
          />
        </Suspense>
        <Suspense fallback={<></>}>
          <Dialog
            open={dialogComponent === CREATE_CANVAS_ASSET_DIALOG}
            showFullscreenIcon={false}
            onClose={async () => {
              await updateWorkflow({
                name: `Untitled ${getSaveDialogTitle(getMode())}`,
                description: "",
              });
              setDialogComponentWithClose(null);
            }}
            transition="none"
            dialogWidth="clamp(400px, 92vw, 720px)"
            dialogMinHeight="clamp(320px, 55vh, 480px)"
            className="flex flex-col max-h-[88vh] overflow-hidden !p-0"
            overlayClassName="!bg-transparent"
            overlayStyle={{
              backgroundColor: "rgba(0,0,0,0.18)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            dialogContent={
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <Suspense fallback={<></>}>
                  <CreateCanvasAssetDialog
                    onSave={async (details) => {
                      await updateWorkflow(details);
                      setDialogComponentWithClose(null);
                    }}
                    onClose={async () => {
                      await updateWorkflow({
                        name: `Untitled ${getSaveDialogTitle(getMode())}`,
                        description: "",
                      });
                      setDialogComponentWithClose(null);
                    }}
                    defaultName={`Untitled ${getSaveDialogTitle(getMode())}`}
                    defaultDescription=""
                    mode={getMode()}
                    theme={canvasTheme}
                    assetTypeLabel={getSaveDialogTitle(getMode())}
                  />
                </Suspense>
              </div>
            }
          />
        </Suspense>
        <Suspense fallback={<></>}>
          <Dialog
            open={dialogComponent === LINK_RENAME_DIALOG}
            showFullscreenIcon={false}
            onClose={() => {
              setDialogComponentWithClose(null);
              setSelectedLinkData(null);
            }}
            transition="none"
            dialogWidth="clamp(320px, 90vw, 500px)"
            dialogMinHeight="clamp(120px, 20vh, 160px)"
            dialogTitle={
              <ODSAdvancedLabel
                labelText="Rename"
                labelProps={{
                  variant: "h6",
                  color: "rgb(38, 50, 56)",
                }}
                style={{
                  padding: "0.5rem",
                }}
                leftAdornment={
                  <Icon
                    outeIconName="OUTEEditIcon"
                    outeIconProps={{
                      sx: {
                        color: "rgb(189, 189, 189)",
                      },
                    }}
                  />
                }
              />
            }
            dialogContent={
              <Suspense fallback={<></>}>
                <LinkRename
                  onSave={(updatedLabel) => {
                    onRenameLinkHandler(selectedLinkData, updatedLabel);
                    setDialogComponentWithClose(null);
                    setSelectedLinkData(null);
                  }}
                  defaultLinkLabel={selectedLinkData?.label}
                />
              </Suspense>
            }
          />
        </Suspense>
        {/* <Suspense fallback={<></>}>
          <TestCaseSetup
            showTestCaseDialog={dialogComponent === TEST_CASE_DIALOG}
            onClose={() => {
              setDialogComponentWithClose(null);
            }}
            assetId={assetDetails?.asset_id}
            projectId={projectId}
            workspaceId={workspaceId}
            workflowDetails={{
              name: assetDetails?.asset?.name,
              icon: assetDetails?.asset?.meta?.thumbnail,
              model: canvasRef.current?.getModelJSON(),
            }}
            onTestCaseRun={(runPaylod) => {
              setRunTestCasePayload({
                ...runPaylod,
                data: runPaylod.data.map((data) => {
                  return {
                    ...data,

                    canvas_data: {
                      _r: canvasRef.current?.getModelJSON(),
                    },
                  };
                }),
              });
              setDialogComponentWithClose(TEST_CASE_RUN_DIALOG);
            }}
          />
        </Suspense>
        <Suspense fallback={<></>}>
          <TestCaseRun
            show={dialogComponent === TEST_CASE_RUN_DIALOG}
            runTestCasesPayload={runTestCasePayload}
            onClose={() => {
              setRunTestCasePayload(null);
              setDialogComponentWithClose(null);
            }}
            projectId={projectId}
          />
        </Suspense> */}
        <Suspense fallback={<></>}>
          <Dialog
            open={dialogComponent === ADD_ASSET_ID_DIALOG}
            showFullscreenIcon={false}
            onClose={() => {
              setDialogComponentWithClose(null);
            }}
            transition="none"
            dialogWidth="clamp(320px, 90vw, 500px)"
            dialogTitle={`Add Asset ID`}
            dialogContent={
              <Suspense fallback={<></>}>
                <AddAssetIdDialog
                  onSave={(value) => {
                    moduleTestIdRef.current = value;
                    setDialogComponentWithClose(null);
                  }}
                  defaultAssetId={
                    moduleTestIdRef.current || assetDetails?.meta?.moduleTestId
                  }
                />
              </Suspense>
            }
          />
        </Suspense>
        <ContextMenu
          show={showContextMenu}
          menus={contextMenuItems}
          coordinates={documentCoords}
          onClose={() => {
            setShowContextMenu(false);
          }}
        />
        <KeyboardShortcutsPanel
          open={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
        <NodeFinder
          open={showNodeFinder}
          onClose={() => {
            setShowNodeFinder(false);
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
                nodeDoubleClickedHandler(null, goNode);
              }
            }
          }}
        />
        <StickyNoteToolbarPortal
          diagramRef={canvasRef}
          containerRef={canvasContainerRef}
        />
        <Suspense fallback={<></>}>
          <FormPreviewV2
            open={dialogComponent === PREVIEW_DIALOG}
            formName={assetDetails?.asset?.name || "Preview"}
            payload={getFormPreviewPayload(assetDetails?.asset?.name)}
            params={paramsRef.current?.params}
            variables={variablesRef.current}
            theme={themeRef.current}
            assetId={assetDetails?.asset_id}
            embedMode={isEmbedMode}
            initialMode={
              typeof localStorage !== "undefined"
                ? localStorage.getItem(
                    localStorageConstants.QUESTION_CREATOR_MODE,
                  )
                : undefined
            }
            initialViewport={
              typeof localStorage !== "undefined"
                ? localStorage.getItem(
                    localStorageConstants.QUESTION_CREATOR_VIEWPORT,
                  )
                : undefined
            }
            hideBranding={
              !!assetDetails?.asset?.settings?.form?.remove_branding
            }
            onPublish={() => {
              setDialogComponentWithClose(null);
              // Open publish modal after closing preview
              setTimeout(() => {
                setDialogComponentWithClose(FORM_PUBLISH_DIALOG);
              }, 100);
            }}
            onClose={() => {
              setDialogComponentWithClose(null);
            }}
            onEvent={(event) => {
              setLogs((prev) => [...prev, formatSingleFormLog(event)]);
            }}
            onAnalyticsEvent={onNewEvent}
            onThemeChange={(newTheme) => {
              // Update ic-canvas theme state
              themeRef.current = newTheme;
              // Update node modal theme
              setThemeFn(newTheme);
            }}
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
                  nodeDoubleClickedHandler(null, goNode);
                }
              }
            }}
            onCustomizeTheme={openThemeManagerInSidebar}
          />
        </Suspense>
        {dialogComponent === FORM_PUBLISH_DIALOG && (
          <DialogErrorBoundary
            onClose={() => setDialogComponentWithClose(null)}
          >
            <Suspense
              fallback={
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                  <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600 text-sm">
                      Loading publish panel...
                    </span>
                  </div>
                </div>
              }
            >
              <FormPublishDialog
                userData={userData}
                nodes={canvasRef.current?.getAllNodes()}
                payload={getFormPreviewPayload(assetDetails?.asset?.name)}
                initialAssetDetails={{
                  ...assetDetails,
                  customDomainData,
                }}
                onCustomDomainDataChange={(updatedCustomDomainData) => {
                  setCustomDomainData(updatedCustomDomainData);
                }}
                onClose={() => {
                  setDialogComponentWithClose(null);
                }}
                openNodeWithTheme={openThemeManagerInSidebar}
                params={paramsRef.current?.params}
                variables={variablesRef.current}
                onEvent={(event) => {
                  setLogs((prev) => [...prev, formatSingleFormLog(event)]);
                }}
                theme={themeRef.current}
                onAnalyticsEvent={onNewEvent}
                getSavePayload={getSavePayload}
                onPublishSuccess={onAssetPublishSuccess}
                isPremiumUser={isPremiumUser}
              />
            </Suspense>
          </DialogErrorBoundary>
        )}
        {dialogComponent === WORKFLOW_PUBLISH_DIALOG && (
          <DialogErrorBoundary
            onClose={() => setDialogComponentWithClose(null)}
          >
            <Suspense
              fallback={
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f8f9fa]">
                  <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)] p-8 flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                    <span className="text-zinc-500 text-sm">
                      Loading publish panel...
                    </span>
                  </div>
                </div>
              }
            >
              <WorkflowPublishV2
                nodes={canvasRef.current?.getAllNodes() || []}
                initialAssetDetails={assetDetails}
                getSavePayload={getSavePayload}
                onPublishSuccess={(updatedDetails) => {
                  onAssetPublishSuccess(updatedDetails);
                }}
                onAssetDetailsChange={onWorkflowStatusChange}
                onClose={() => setDialogComponentWithClose(null)}
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
                      nodeDoubleClickedHandler(null, goNode);
                    }
                  }
                }}
              />
            </Suspense>
          </DialogErrorBoundary>
        )}
        {showErrorWarningPopover && (
          <Suspense fallback={<></>}>
            <ErrorWarningPopover
              data={errorsWarningsData}
              popoverCoordinates={documentCoords}
              onClose={() => {
                setShowErrorWarningPopover(false);
                setErrorsWarningsData(null);
                setDocumentCoords(null);
              }}
              onFixNow={(nodeKey) => {
                setShowErrorWarningPopover(false);
                setErrorsWarningsData(null);
                setDocumentCoords(null);
                const diagram = canvasRef.current?.getDiagram?.();
                if (diagram && nodeKey) {
                  const goNode =
                    diagram.findNodeForKey(nodeKey) ||
                    diagram.findNodeForKey(parseInt(nodeKey, 10));
                  if (goNode) {
                    diagram.clearSelection();
                    diagram.select(goNode);
                    diagram.scrollToRect(goNode.actualBounds);
                    nodeDoubleClickedHandler(null, goNode);
                  }
                }
              }}
              onFixWithAI={(nodeKey) => {
                const currentData = errorsWarningsData || {};
                setShowErrorWarningPopover(false);
                setErrorsWarningsData(null);
                setDocumentCoords(null);
                emitFixWithAI(nodeKey, null, {
                  nodeName: currentData.nodeName || "",
                  nodeType: currentData.nodeType || "",
                  errors: currentData.errors || [],
                  warnings: currentData.warnings || [],
                });
              }}
            />
          </Suspense>
        )}
        {showExecutions && (
          <Suspense fallback={<></>}>
            <ExecutionResultsPopover
              data={executionsData}
              popoverCoordinates={documentCoords}
              onClose={() => {
                setShowExecutions(false);
                setExecutionsData(null);
                setDocumentCoords(null);
              }}
            />
          </Suspense>
        )}
        {!!showAddLogsPopover && showAddLogsPopover}
        <Suspense fallback={<></>}>
          <ExecuteRun
            ref={executeRunRef}
            params={paramsRef.current?.params}
            variables={variablesRef.current}
            canvasRef={canvasRef}
            assetDetails={assetDetails}
            onEvent={onExecuteRunEvent}
            onExecutionComplete={onExecuteRunComplete}
          />
        </Suspense>
        {!!loading && (
          <Suspense fallback={<></>}>
            <PageProcessingLoader message={loading} />
          </Suspense>
        )}
        <Suspense fallback={<></>}>
          <JsonUploadInput
            ref={jsonUploadRef}
            onUpload={(jsonStr) => {
              canvasRef.current.loadModelJSON(jsonStr);
            }}
          />
        </Suspense>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => {
            setIsCommandPaletteOpen(false);
          }}
          tabData={searchConfig}
          canvasRef={canvasRef}
          getWorkflowContext={getWorkflowContext}
          onNavigateToNode={(nodeKey) => {
            const diagram =
              canvasRef.current?.getDiagram?.() || canvasRef.current;
            if (!diagram) return;
            const goNode =
              diagram.findNodeForKey(nodeKey) ||
              diagram.findNodeForKey(parseInt(nodeKey, 10));
            if (goNode) {
              diagram.clearSelection();
              diagram.select(goNode);
              diagram.scrollToRect(goNode.actualBounds);
            }
          }}
          previousNode={
            linkedNodesRef.current
              ? canvasRef.current?.findNode(linkedNodesRef.current?.from)?.data
              : null
          }
          getDisabledNodes={() =>
            getDisabledNodes(
              canvasRef.current?.getAllNodes() || [],
              linkedNodesRef.current,
              canvasRef,
            )
          }
          onNodeSelect={async (node) => {
            const isFromIfElse = !!ifElseNodeSelectedCallbackRef.current;
            const ifElseNodeKey = linkedNodesRef.current?.from;
            await onAddNewNodeHandler(node, {
              openDialog: !isFromIfElse,
              autoLink: true,
            });

            if (isFromIfElse && ifElseNodeKey) {
              const ifElseNode = canvasRef.current?.findNode(ifElseNodeKey);
              if (ifElseNode?.data) {
                const nodeType =
                  ifElseNode.data?.subType || ifElseNode.data?.type;
                const component = getExtensionComponent(
                  nodeType,
                  ifElseNode.data.module,
                  ifElseNode.data,
                );
                if (component) {
                  const nodeForDialog = {
                    part: ifElseNode,
                    data: ifElseNode.data,
                    key: ifElseNode.data?.key,
                  };
                  showDialog(nodeForDialog, component);
                }
              }
            }

            onNewEvent(UATU_CANVAS, {
              subEvent: UATU_PREDICATE_EVENTS_CANVAS.NODE_CREATION,
              nodeType: node?.type,
              nodeName: node?.name,
              module: node?.module,
            });
          }}
          onTriggerReplace={async (existingTriggerNode, newTrigger) => {
            const nodeKey =
              existingTriggerNode?.key || existingTriggerNode?.data?.key;
            if (nodeKey) {
              canvasRef.current?.removeOutgoingLinks?.(nodeKey, true);
              const nodeToRemove = canvasRef.current?.findNode(nodeKey);
              if (nodeToRemove) {
                canvasRef.current?.removeNode(nodeToRemove);
              }
            }
            linkedNodesRef.current = null;
            await onAddNewNodeHandler(newTrigger);
            onNewEvent(UATU_CANVAS, {
              subEvent: UATU_PREDICATE_EVENTS_CANVAS.NODE_CREATION,
              nodeType: newTrigger?.type,
              nodeName: newTrigger?.name,
              module: newTrigger?.module,
            });
          }}
        />
      </div>
      <GuidedSetupOverlay
        canvasRef={canvasRef}
        isNodeDrawerOpen={rightDrawerComponent !== "default"}
        onOpenNodeDrawer={(nodeKey, guidedContext) => {
          if (guidedContext) {
            setGuidedDrawerContext(guidedContext);
          }
          const diagram = canvasRef.current?.getDiagram?.() || canvasRef.current;
          if (!diagram) return;
          const nodeObj = diagram.findNodeForKey(nodeKey);
          if (nodeObj) {
            nodeDoubleClickedHandler(null, nodeObj);
          }
        }}
        onCloseNodeDrawer={() => {
          setGuidedDrawerContext(null);
          setShowNodeDialog(null);
          setRightDrawerComponentWithClose("default");
        }}
        onGuidedContextChange={(ctx) => {
          setGuidedDrawerContext(ctx);
        }}
      />
      <ErrorHandlingModal
        open={!!errorHandlingModalData}
        onOpenChange={(open) => {
          if (!open) setErrorHandlingModalData(null);
        }}
        nodeData={errorHandlingModalData}
        canvasRef={canvasRef}
        onSave={(nodeKey, errorConfig) => {
          canvasRef.current.updateNode(nodeKey, { errorConfig });
          setHasUnsavedChanges(true);
          setErrorHandlingModalData(null);
          const diagram = canvasRef.current?.getDiagram?.();
          if (diagram) {
            const nodeObj = diagram.findNodeForKey(nodeKey);
            if (nodeObj?.data) {
              const nodeData = nodeObj.data;
              saveNodeDataHandler(
                { ...nodeData, errorConfig },
                nodeData?.go_data || {},
                {},
                false,
                false,
                false,
              );
            }
          }
        }}
      />
    </>
  );
};

export default IC;
