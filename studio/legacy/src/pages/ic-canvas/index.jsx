import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  Suspense,
  lazy,
} from "react";
import classes from "./index.module.css";
// import ContextMenu from "oute-ds-context-menu";
// import { showConfirmDialog } from "oute-ds-dialog";
// import Icon from "oute-ds-icon";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
// import ODSLabel from "oute-ds-label";
// import default_theme from "oute-ds-shared-assets";
import {
  ODSContextMenu as ContextMenu,
  showConfirmDialog,
  ODSIcon as Icon,
  ODSAdvancedLabel,
  ODSLabel,
  sharedAssets,
} from "@src/module/ods";
const default_theme = sharedAssets;
import cloneDeep from "lodash/cloneDeep";
import { SETUP_COMPONENTS } from "../../components/dialogs/add-component-dialog/constants/setup-constants";
import tools from "../../assets/icons/tools";

import canvasServices from "../../sdk-services/canvas-sdk-services";
import {
  ASSET_KEY,
  EVENT_TYPE_KEY,
  PARENT_KEY,
  PROJECT_KEY,
  QUERY_KEY,
  SUCCESS,
  WORKSPACE_KEY,
} from "../../constants/keys";

import componentSDKServices from "../../sdk-services/component-sdk-services";
import domainSDKServices from "../../sdk-services/domain-sdk-services";
import { ICStudioContext } from "../../ICStudioContext";
import { getMode } from "../../config/config";
// import { showAlert } from "oute-ds-alert";
import { showAlert } from "@src/module/ods";
import { MODE } from "../../constants/mode";
import assetSDKServices from "../../sdk-services/asset-sdk-services";
import { NODE_TEMPLATES } from "../../components/canvas/templates";

import {
  QuestionType,
  getCanvasTheme,
  getClarityId,
} from "../../module/constants";

import {
  trackSDKServices,
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";

import {
  encodeParameters,
  getAnnotation,
  getSaveDialogTitle,
} from "../../utils/utils";
// import { serverConfig } from "oute-ds-utils";
import { serverConfig } from "@src/module/ods";

import {
  DeletedAssetMessage,
  DeletedAssetTitle,
} from "../../components/dialogs/deleted-asset-dialog";
import { useNavigate } from "react-router-dom";
import {
  ADD_ASSET_ID_DIALOG,
  FORM_PUBLISH_DIALOG,
  LINK_RENAME_DIALOG,
  NODE_DIALOG,
  PREVIEW_DIALOG,
  TEST_CASE_DIALOG,
  TEST_CASE_RUN_DIALOG,
  WORKFLOW_NAME_DIALOG,
} from "./constants/constants";
import { mapLimit } from "async";

import variableSDKServices from "../../sdk-services/variable-sdk-services";
import canvasSDKServices from "../../sdk-services/canvas-sdk-services";

import { formatDataForQuestionEventLog } from "./utils/question-log-utils";

import {
  updateIfElseNodeLinks,
  validateIfElseData,
  CANVAS_BG,
  getNodeSrc,
} from "../../components/canvas";
import { getExtensionComponent } from "../../components/canvas/extensions/getExtensionComponent";

import {
  IF_ELSE_TYPE,
  INTEGRATION_TYPE,
  IF_ELSE_TYPE_V2,
  HITL_TYPE,
  TRIGGER_SETUP_TYPE,
  TRIGGER_SETUP_NODE,
} from "../../components/canvas/extensions";

import { createNodeIdMap, getChildNodeLocation } from "./utils/canvas-utils";

import { useSelector, useDispatch } from "react-redux";
import { getCache, updateCache } from "../../redux/reducers/godata-reducer";
import { getSidebarActions, getSidebarPanel } from "./utils/sidebar-utils";

const Drawer = lazy(() => import("../../module/drawer"));
import { getDefaultTheme } from "./utils/get-default-theme";
import { useCanvasUtauEvents } from "../../hooks/use-canvas-uatu-events";
import SuspenseLoader from "../../components/loaders/SuspenseLoader";
import Intercom, { show, shutdown, onHide } from "@intercom/messenger-js-sdk";
import Clarity from "@microsoft/clarity";
import userServices from "../../sdk-services/user-sdk-services";

// const Dialog = lazy(() => import("oute-ds-dialog"));
const Dialog = lazy(() =>
  import("@src/module/ods").then((m) => ({ default: m.ODSDialog }))
);

const WorkflowName = lazy(() =>
  import("../../components/dialogs/workflow-name-dialog")
);

const LinkRename = lazy(() =>
  import("../../components/dialogs/link-rename-dialog")
);

const PageProcessingLoader = lazy(() =>
  import("../../components/loaders/PageProcessingLoader")
);

const JsonUploadInput = lazy(() =>
  import("../../components/json-upload-input/JsonUploadInput")
);

const ErrorWarningPopover = lazy(() =>
  import("../../components/popper/errors-warnings-popover")
);

const RunInputsPopover = lazy(() =>
  import("../../components/popper/run-inputs-popover")
);

const FormPreviewDialog = lazy(() =>
  import("../../components/dialogs/form-preview-dialog")
);

const FormPublishDialog = lazy(() =>
  import("../../components/dialogs/form-publish-dialog")
);

const AddAssetIdDialog = lazy(() =>
  import("../../components/dialogs/add-asset-id-dialog")
);

const Canvas = lazy(() =>
  import("../../components/canvas").then((module) => ({
    default: module.Canvas,
  }))
);

const TestCaseRun = lazy(() =>
  import("@oute/icdeployment.skeleton.test-case-run").then((module) => ({
    default: module.TestCaseRun,
  }))
);

const TestCaseSetup = lazy(() =>
  import("@oute/icdeployment.skeleton.test-case-setup").then((module) => ({
    default: module.TestCaseSetup,
  }))
);

const PublishPopper = lazy(() => import("../../components/dialogs/publish"));

const ExecuteRun = lazy(() => import("../../components/execute-run"));

const LogsDialog = lazy(() => import("../../components/dialogs/logs-dialogs"));
const ExecutionResultsPopover = lazy(() =>
  import("../../components/popper/execution-results-popover")
);

import { getDisabledNodes } from "../../constants/node-rules";
import { useUpdateHITLNode } from "../../hooks/useUpdateHITLNode";
import { useSearchConfig } from "../../hooks/useSearchConfig";
import { useProcessAiCanvas } from "../../hooks/useProcessAiCanvas";
import { useAuth } from "@oute/oute-ds.common.molecule.tiny-auth";
import { PublishTitle } from "../../components/dialogs/publish/components/publish-title";
import { getTransformedNodeData } from "../../components/dialogs/publish/forms/utils/formResponses";
import {
  getAccountContextMenuItems,
  getLinkContextMenuItems as getLinkContextMenuItemsUtil,
  getCanvasContextMenuItems,
  getNodeContextMenuItems,
} from "./utils/context-menu-utils";
import NullComponent from "../../components/NullComponent";
import Header from "../../components/Header";
import BottomCtaContainer from "../../components/BottomCtaContainer";
// import QuickAccessPanel from "../../components/QuickAccessPanel";
import useKeydown from "../../hooks/useKeyDown";
import useContextMenu from "../../hooks/useContextMenu";
import {
  formatSingleFormLog,
  formatSingleLog,
} from "@oute/oute-ds.common.molecule.terminal";
import { shouldCheckReferences } from "../../constants/canvas-model-events";
import { isEmpty } from "lodash";
import { TroubleShootCard } from "../../components/trouble-shoot-card";
import CommandPalette from "../../components/CommandPalette";
import { useFormAI } from "../../components/canvas/hooks/useFormAI";
import { useWorkflowAI } from "../../components/canvas/hooks/useWorkflowAI";

const IC = () => {
  const {
    assetId,
    workspaceId,
    parentId,
    projectId,
    eventType,
    userData,
    setUserData,
  } = useContext(ICStudioContext);
  const { user } = useAuth();
  const canvasRef = useRef();
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
  const bottomRightContainerRef = useRef();
  const tinyBotContainerRef = useRef();
  const isAiNodeFlow = useRef(false);
  const saveButtonRef = useRef();
  // const { boot, shutdown, hide, show, update } = useIntercom();
  // const [isTinyBotActive, setIsTinyBotActive] = useState(true);
  const [showNodeDialog, setShowNodeDialog] = useState(null);
  const [documentCoords, setDocumentCoords] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuItems, setContextMenuItems] = useState([]);
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
  const [defaultDrawerSidebarOpen, setDefaultDrawerSidebarOpen] =
    useState(false);
  const [isAddNodesPanelOpen, setIsAddNodesPanelOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeSidebarPanelId, setActiveSidebarPanelId] = useState(null);
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

  const [rightDrawerComponent, setRightDrawerComponent] = useState("default");

  const [dialogComponent, setDialogComponent] = useState(null);

  const [nodeCount, setNodeCount] = useState(0);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  // const [hideOverview, setHideOverview] = useState(false);
  // const [scale, setScale] = useState(100);

  const canvasTheme = getCanvasTheme();

  const linkedNodesRef = useRef(null); // Correctly initialize it as a mutable reference
  const nodeToReplaceRef = useRef(null); // Correctly initialize it as a mutable reference
  const themeRef = useRef(getDefaultTheme()); //to access and save theme
  const moduleTestIdRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const godata_cache = useSelector(getCache);

  const getUserData = useCallback(async () => {
    const response = await userServices.getUser();
    if (response.status === "success") {
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
    [dispatch]
  );

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
            canvasRef.current.updateNode(node.key, {
              warnings: node.warnings || [],
            });
          });
        }
        callback();
      }, 0);
    });
  }, []);

  const { processFormData, processWorkflowData } =
    useProcessAiCanvas(canvasRef, checkReferences);

  const updateNodeLinks = useCallback((node, linksToUpdate) => {
    // Get existing links for the node
    const existingLinks = canvasRef.current.findLinksOutOf(node.data.key);
    // Track the link data for easy search and update
    let existingLinkData = {};
    existingLinks.each((link) => {
      existingLinkData[link.data.key] = link.data;
    });
    linksToUpdate.forEach((linkToUpdate, index) => {
      // Check if the link already exists
      let existingLink = existingLinks
        .filter((l) => l.data.key === linkToUpdate.key)
        .first();
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
            existingLink.data.to
          );
          // Update link to new node
          if (linkToUpdate.to) {
            canvasRef.current.updateLink({
              linkData: existingLink.data,
              linkKeyToUpdate: "to",
              linkKeyToUpdateValue: linkToUpdate.to,
            });
            // Remove if placeholder node
            if (oldConnectedNode.data.template === NODE_TEMPLATES.PLACEHOLDER) {
              canvasRef.current.removeNode(oldConnectedNode);
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
                    index
                  ),
                }
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
          // Create a new link
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
          // Create a placeholder
          const placeholderNode = canvasRef.current.createNode(
            {
              template: NODE_TEMPLATES.PLACEHOLDER,
            },
            {
              location: getChildNodeLocation(
                node.location,
                linksToUpdate.length,
                index
              ),
            }
          );
          // Create a new link
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
    // Remove any remaining links that were not updated
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
          name: node?.description,
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
                    nodeRefStorage
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
              })
            );
          }
          callback();
        }, 0);
      });
    },
    [updateNodeLinks]
  );

  const checkAssetExistence = useCallback(
    async (params) => {
      setLoading("Checking permissions...");
      const accessInfoResponse = await assetSDKServices.getAccessInfo(
        params?.assetId
      );
      if (accessInfoResponse.status === SUCCESS) {
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
    [navigate]
  );

  const getSavePayload = useCallback(
    async (
      { name: canvasAssetName, description: canvasAssetDescription },
      currentAssetDetails = assetDetails
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
    [assetDetails, eventType, parentId, projectId, workspaceId]
  );

  const saveWorkflow = useCallback(
    async ({ name, description }) => {
      const savePayload = await getSavePayload({ name, description });
      const saveCanvasResponse = await canvasServices.saveCanvas(savePayload);

      let updatedAssetDetails = { ...assetDetails };
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
          })}`
        );
        onNewEvent(UATU_CANVAS, {
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
    ]
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
          })}`
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
    ]
  );

  const onWorkflowStatusChange = useCallback(({ enabled, response }) => {
    setAssetDetails((prev) => {
      if (!prev) return prev;
      return {
        ...(prev || {}),
        ...(response?.result || {}),
        settings: {
          ...(prev?.settings || {}),
          execution_control: {
            enabled,
          },
        },
      };
    });
  }, []);

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
          "*" // Replace "*" with specific origin for security
        );
      }
      updateGoDataCache(null);
    },
    [setAssetDetails]
  );

  const updateWorkflow = useCallback(
    async ({ name, description }, params = { isPublish: false }) => {
      if (!name) {
        isPublishRef.current = params?.isPublish;
        setDialogComponent(WORKFLOW_NAME_DIALOG);
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
          setDialogComponent(null);
        }
        const nodes = canvasRef.current?.getAllNodes() || [];
        if (nodes.length === 0) {
          showAlert({
            message: `Please add atleast one node to publish your ${
              getMode() === MODE.WORKFLOW_CANVAS ? "form" : "workflow"
            }.`,
            type: "error",
          });
          defaultDrawerRef.current?.clickAction("add-nodes");
          return;
        }
        const errors = canvasRef.current.checkErrors();
        if (errors.length > 0) {
          showAlert({
            message: (
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
              </div>
            ),
            type: "error",
          });
          return;
        }
        if (getMode() === MODE.WORKFLOW_CANVAS) {
          setDialogComponent(FORM_PUBLISH_DIALOG);
          return;
        }
        defaultDrawerRef.current?.openSidebarPanel({
          id: "PUBLISH",
          name: (
            <PublishTitle
              title={
                initialAssetDetails?.asset?.name ||
                getSaveDialogTitle(getMode())
              }
            />
          ),
          panel: (
            <Suspense fallback={<SuspenseLoader />}>
              <PublishPopper
                ref={publishRef}
                userData={userData}
                anchorEl={publishBtnRef.current}
                initialAssetDetails={initialAssetDetails}
                nodes={nodes}
                onPublishSuccess={onAssetPublishSuccess}
                onAnalyticsEvent={onNewEvent}
                getSavePayload={getSavePayload}
                onAssetDetailsChange={onWorkflowStatusChange}
                onClose={() => {
                  if (publishRef.current) {
                    publishRef?.current?.saveFormResponses();
                  }
                  defaultDrawerRef?.current?.closeSidebarPanel();
                }}
              />
            </Suspense>
          ),
        });
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
    ]
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
      shouldUpdateLabelReferences = true
    ) => {
      const last_updated = Date.now();
      if (updated_node_data?.subType === TRIGGER_SETUP_TYPE) {
        if (!updated_node_data?.type) {
          canvasRef.current.createNode({
            ...node,
            errors: ["Incomplete Trigger Setup"],
            go_data: { last_updated },
          });
          if (!openNodeAfterCreate) {
            setRightDrawerComponent("default");
            setShowNodeDialog(null);
          }
          return;
        }
        let modifiedNodeData = {
          ...node,
          ...updated_node_data,
          go_data: {
            last_updated,
          },
          tf_data: undefined,
        };
        const updatedNode = canvasRef.current.createNode(modifiedNodeData);
        node = updatedNode.data;
      }
      node.warnings = [];
      node.errors = [];
      let response;

      try {
        if (
          go_data_payload &&
          node.type !== TRIGGER_SETUP_TYPE &&
          !updated_node_data?.errors?.length &&
          go_data_payload?.last_updated
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[saveNodeDataHandler] Calling transformNode for:', {
              nodeKey: node.key,
              nodeType: node.type,
              hasGoData: !!go_data_payload,
            });
          }
          
          response = await componentSDKServices.transformNode(
            canvasRef.current.getModelJSON(),
            node.key,
            {
              ...(go_data_payload || {}),
              logs: updated_node_data?.logs || node.logs,
              last_updated,
            }
          );
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[saveNodeDataHandler] transformNode response:', {
              nodeKey: node.key,
              status: response?.status,
              hasTfData: !!response?.result?.tf_data,
              hasTfOutput: !!response?.result?.tf_output,
            });
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[saveNodeDataHandler] transformNode error for', node.key, ':', error);
        }
      }

      // Only use transformation results if transformation succeeded
      const tfData = response?.status === "success" ? response?.result?.tf_data : undefined;
      const tfOutput = response?.status === "success" ? response?.result?.tf_output : undefined;

      const newNode = canvasRef.current.createNode(
        {
          ...node,
          ...updated_node_data,
          tf_data: tfData,
          go_data: {
            ...go_data_payload,
            ...(tfOutput && { output: tfOutput }),
            last_updated,
          },
        },
        {
          openNodeAfterCreate,
        }
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
          })
        );
      } else if (newNode.data.type === HITL_TYPE) {
        postSaveHandlerForHITLNode(newNode);
      }

      if (updateReferences) checkReferences();
      if (shouldUpdateLabelReferences)
        updateLabelReferences({ updatedNodeData: newNode?.data });
      if (!openNodeAfterCreate) {
        setRightDrawerComponent("default");
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
    ]
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
      openNodeAfterCreate = false
    ) => {
      saveNodeDataHandler(
        nodeData,
        go_data_payload,
        updated_node_data,
        openNodeAfterCreate,
        updateReferences
      );
    },
    [saveNodeDataHandler]
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
    saveNodeDataHandler
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
    nodeIdMap
  });

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
        if (!type || (!type.startsWith('FORM_AI_') && !type.startsWith('WORKFLOW_AI_'))) {
          return;
        }
        
        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log('[PostMessage Bridge] Received event:', type, payload);
        }
        
        // Validate payload structure
        if (!payload || typeof payload !== 'object') {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[PostMessage Bridge] Invalid payload structure for event:', type);
          }
          return;
        }
        
        // Convert postMessage to CustomEvent that formAIHandler/workflowAIHandler can listen to
        const customEvent = new CustomEvent(type, {
          detail: payload || {}
        });
        
        // Dispatch the CustomEvent so handlers can receive it
        window.dispatchEvent(customEvent);
        
        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log('[PostMessage Bridge] Dispatched CustomEvent:', type);
        }
      } catch (error) {
        // Error handling: Log errors without breaking the application
        console.error('[PostMessage Bridge] Error handling message:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const getNodes = async (key, params) => {
    if (params.fetchConnectableNodes) {
      const response = await componentSDKServices.getConnectList(
        canvasRef.current.getModelJSON(),
        key
      );
      if (response.status === SUCCESS) return response.result;
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
    let go_data = from.data?.go_data;
    const link_data = link?.data;
    if (!to) {
      go_data.ifData.push({
        jumpTo: newNode.data,
        key: link.data.key,
      });
    } else {
      if (link_data.linkForElse) {
        go_data.elseData[0].jumpTo = newNode.data;
      } else {
        const idx = go_data.ifData.findIndex(
          (_if) => _if.key === link.data.key
        );
        if (idx !== -1) {
          go_data.ifData[idx].jumpTo = newNode.data;
        } else {
          go_data.ifData.push({
            jumpTo: newNode.data,
            key: link.data.key,
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
      }
    );
    if (response?.status === "success")
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
        }
      );
  }, []);
  const updateIfElseV2Data = useCallback(
    async (from, to, newNode, link) => {
      let go_data = from.data?.go_data;
      const link_data = link?.data;
      if (!to) {
        go_data?.conditions?.splice(go_data?.conditions.length - 1, 0, {
          action: newNode.data.key,
          id: link.data.key,
          type: "else-if",
          logicType: "AND",
          conditions: [{ id: Date.now(), operation: "equals" }],
          groups: [],
          isAdvanced: false,
        });
      } else {
        if (link_data.linkForElse) {
          go_data.conditions[go_data?.conditions.length - 1].action =
            newNode.data.key;
        } else {
          const idx = go_data.conditions?.findIndex(
            (_if) => _if.id === link.data.key
          );
          if (idx !== -1) {
            go_data.conditions[idx].action = newNode.data.key;
          } else {
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
        }
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
          }
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
        })
      );
    },
    [updateNodeLinks]
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
            openNodeAfterCreate: options.openDialog,
          });
          // if leafnode add is clicked
          if (!to && from) {
            const shouldLink =
              !fromNode?.data?.denyToLink && fromNode?.data?.type !== HITL_TYPE;
            if (shouldLink) {
              link = canvasRef.current?.createLink({
                from,
                to: newNode.key,
                metadata: {},
              });
            }

            //handle for if else's godata
            if (fromNode?.data?.type === IF_ELSE_TYPE) {
              updateIfElseData(fromNode, toNode, newNode, link);
            } else if (fromNode?.data?.type === IF_ELSE_TYPE_V2) {
              updateIfElseV2Data(fromNode, toNode, newNode, link);
            } else if (fromNode?.data?.type === HITL_TYPE && link) {
              updateHITLData(fromNode, toNode, newNode, link);
            }
            return newNode;
          }
          //if node is added in between
          else if (to && from) {
            link = canvasRef.current?.updateLink({
              linkData: linkedNodesRef.current,
              linkKeyToUpdate: "to",
              linkKeyToUpdateValue: newNode.key,
            });
            if (toNode.name === "PLACEHOLDERNODE") {
              canvasRef.current?.removeNode(toNode);
            } else {
              canvasRef.current?.createLink({
                from: newNode.key,
                to,
                metadata: {},
              });
            }
            canvasRef.current?.shiftNodes(newNode);

            //handle for if else's godata
            if (fromNode?.data?.type === IF_ELSE_TYPE) {
              updateIfElseData(fromNode, toNode, newNode, link);
            } else if (fromNode?.data?.type === IF_ELSE_TYPE_V2) {
              updateIfElseV2Data(fromNode, toNode, newNode, link);
            } else if (fromNode?.data?.type === HITL_TYPE) {
              updateHITLData(fromNode, toNode, newNode, link);
            }
            return newNode;
          }
        } else {
          return canvasRef.current.createNode(item, {
            openNodeAfterCreate: options.openDialog,
            autoLink: options.autoLink,
          });
        }
      } catch (error) {
      } finally {
        linkedNodesRef.current = null;
      }
      return;
    },
    [updateHITLData, updateIfElseData, updateIfElseV2Data]
  );

  const getInputProps = useCallback(
    (id) => {
      if (id === "add-nodes") {
        const existingNodes = canvasRef.current.getAllNodes();
        const disabledNodes = getDisabledNodes(
          existingNodes,
          linkedNodesRef.current,
          canvasRef
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
    ]
  );

  const accountContextMenuItems = useMemo(
    () => getAccountContextMenuItems(),
    []
  );

  const renderAccountContextMenu = useCallback(
    (e) => {
      setContextMenuItems(accountContextMenuItems);
      setDocumentCoords({
        top: e.clientY - 20,
        left: e.clientX - 220,
      });
      setShowContextMenu(true);
    },
    [accountContextMenuItems]
  );

  const onSidebarActionClick = useCallback(
    ({ action, e }, drawerRef) => {
      if (!action) return;

      if (action.id === "account") {
        renderAccountContextMenu(e);
        return;
      } else if (action.id === "intercom") {
        onNewEvent(UATU_CANVAS, {
          subEvent: UATU_PREDICATE_EVENTS_CANVAS.CHAT_WITH_US_CLICK,
        });
        show();
      }
      if (!nodeModalRef.current && action.id === "theme-manager") {
        const node = canvasRef?.current
          ?.getAllNodes()
          .find((n) => n.module === "Question");

        if (node) {
          nodeConfigsRef.current.showDefaultTheme = true;
          canvasRef.current.goToNode(node?.key);
          return;
        }
      }
      const ActionPanel = getSidebarPanel(action.id);
      const inputProps = getInputProps(action.id);
      if (!ActionPanel) return;
      drawerRef.current?.openSidebarPanel({
        id: action.id,
        name: action.name,
        panel: (
          <Suspense fallback={<SuspenseLoader />}>
            <ActionPanel {...inputProps} />
          </Suspense>
        ),
      });
    },
    [getInputProps, onNewEvent, renderAccountContextMenu]
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

  const onAddJumpToHandler = useCallback(
    async (node) => {
      const goDataPayload = {
        ...node?.go_data,
        last_updated: Date.now(),
      };
      const warnings = [];
      if (node?.type === INTEGRATION_TYPE) {
        goDataPayload.flow = {};
        warnings.push("Please check as the node is not configured yet.");
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
        }
      );

      await saveNodeDataHandler(
        newNode?.data,
        newNode?.data?.go_data,
        { warnings: warnings },
        false,
        true
      );
      canvasRef.current.autoAlign();
      canvasRef.current.goToNode(newNode.key, {
        openNodeAfterScroll: false,
      });
    },
    [saveNodeDataHandler]
  );

  const getNodeDrawer = useCallback(
    (Component, variables, nodeData, part) => {
      return (
        <Suspense fallback={<></>}>
          <Component
            canvasRef={canvasRef}
            ref={nodeModalRef}
            workspaceId={workspaceId}
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
            getNodes={(params) => getNodes(nodeData.key, params)}
            onUpdateTitle={(updatedKeys) => {
              canvasRef.current.updateNode(nodeData.key, updatedKeys);
              updateGoDataCache({
                _r: canvasRef.current.getModelJSON(),
                asset_id: assetDetails?.asset_id,
              });
            }}
            onSave={(
              go_data_payload,
              updated_node_data,
              openNodeAfterCreate
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
                openNodeAfterCreate
              );
            }}
            autoSave={(
              saveData,
              updated_node_data,
              updateReferences,
              openNodeAfterCreate
            ) =>
              autoSaveNodeDataHandler(
                nodeData,
                saveData,
                updated_node_data,
                updateReferences,
                openNodeAfterCreate
              )
            }
            onAddJumpTo={onAddJumpToHandler}
            // onUpdateNode={(nodeProps) => updateNodeHandler(data, nodeProps)}
            onUpdateNodeLinks={(linksToBeUpdated) => {
              updateNodeLinks(part, linksToBeUpdated);
            }}
            onDiscard={() => {
              setRightDrawerComponent("default");
              setShowNodeDialog(null);
            }}
            onSidebarActionClick={({ action, index, e }, drawerRef) => {
              const linkOutOfAddNodeAdornment =
                canvasRef.current.findLinksOutOf(nodeData?.key);
              linkedNodesRef.current =
                linkOutOfAddNodeAdornment?.count == 1
                  ? linkOutOfAddNodeAdornment?.first()?.data
                  : { from: nodeData?.key };
              onSidebarActionClick({ action, index, e }, drawerRef);
            }}
            sidebarActions={getSidebarActions(getMode())}
            onSideBarToggle={(open, id) => {
              if (!open && id === "theme-manager") {
                if (nodeModalRef.current) {
                  nodeModalRef.current.refereshTheme(themeRef?.current);
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
                canvasRef
              );
            }}
            linkedNodeDataRef={linkedNodesRef}
            annotation={assetDetails?.annotation}
          />
        </Suspense>
      );
    },
    [
      onAddJumpToHandler,
      assetDetails?.annotation,
      assetDetails?.asset?.name,
      assetDetails?.asset_id,
      autoSaveNodeDataHandler,
      eventType,
      onSidebarActionClick,
      parentId,
      projectId,
      saveNodeDataHandler,
      searchConfig,
      updateGoDataCache,
      updateNodeLinks,
      userData,
      workspaceId,
      integrationThumbnailMap,
    ]
  );
  const showDialog = useCallback(
    async (node, Component) => {
      const { part } = node;
      const { data } = part;

      const isAutoCompleteQuestion = data?.type === QuestionType.AUTOCOMPLETE;
      if (isAutoCompleteQuestion) {
        await saveNodeDataHandler(data, data?.go_data, {}, false, false);
      }
      let variables = {};
      try {
        const { result } = await componentSDKServices.getVariableList(
          canvasRef.current.getModelJSON(),
          node.key,
          projectId,
          assetId,
          {
            include_current_output: isAutoCompleteQuestion,
          }
        );
        variables = result;
      } catch {
        variables = {};
      }
      const modal = getNodeDrawer(Component, variables, data, part);
      setShowNodeDialog({ ...modal, key: data?.key });
      setRightDrawerComponent(NODE_DIALOG);
    },
    [assetId, getNodeDrawer, projectId, saveNodeDataHandler]
  );
  // const getAssetDetails = useCallback(() => assetDetails, [assetDetails]);
  const nodeDoubleClickedHandler = useCallback(
    async (e, node) => {
      if (!assetDetails?.asset_id && !isAiNodeFlow.current)
        await updateWorkflow({
          name: `Untitled ${getSaveDialogTitle(getMode())}`,
          description: "",
        });
      const component = getExtensionComponent(
        node.data?.subType || node.data?.type,
        node.data.module,
        node.data
      );
      if (component) {
        showDialog(node, component);
      }
    },
    [assetDetails?.asset_id, showDialog, updateWorkflow]
  );

  const isLinkConnectable = async (model, from, to) => {
    const response = await componentSDKServices.canConnect(model, from, to);
    return response?.status === SUCCESS;
  };

  const showAddNodeDrawer = useCallback(
    ({ via = "unknown", useDrawer = false }) => {
      if (rightDrawerComponent !== "default") {
        setRightDrawerComponent("default");
        setShowNodeDialog(null);
      }

      const usePalette = [
        "keyboard-shortcut",
        "canvas-double-click",
        "add-node-button",
      ].includes(via);

      if (useDrawer || !usePalette) {
        setTimeout(() => {
          defaultDrawerRef.current?.clickAction("add-nodes");
        }, 100);
      } else {
        setIsCommandPaletteOpen(true);
      }

      onNewEvent(UATU_CANVAS, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.ADD_NODE,
        via,
      });
    },
    [rightDrawerComponent, onNewEvent]
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
        node?.data?.key
      );
      linkedNodesRef.current =
        linkOutOfAddNodeAdornment?.count == 1
          ? linkOutOfAddNodeAdornment?.first()?.data
          : { from: node.data.key };
      showAddNodeDrawer({ via: "add-node-adornment" });
    } else if (node.name === "PLACEHOLDERNODE") {
      const linksIntoPlaceholder = canvasRef.current.findLinksInto(
        node?.data?.key
      );
      linkedNodesRef.current = linksIntoPlaceholder?.first()?.data;
      showAddNodeDrawer({ via: "placeholder-node" });
    } else {
      if (rightDrawerComponent !== "default") {
        nodeDoubleClickedHandler(null, node);
        return;
      }
    }
    return;
  };
  const onNodeCreatedHandler = useCallback(
    (node) => {
      if (node.component) {
        showDialog(node);
      }
    },
    [showDialog]
  );
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
        } else {
          // throw link not found error
        }
      } else {
        // Update "jumpTo" property and set the flag
        ifElseRowData.ifData[ifDataIndex].jumpTo = null;
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
        (statement) => statement.action === linkdata.to
      );
      if (idx !== -1) {
        go_data.conditions[idx].action = null;
        saveNodeDataHandler(fromNode?.data, go_data, null, false);
      }
    } else if (fromNode?.data?.type === HITL_TYPE) {
      let go_data = fromNode?.data?.go_data || {};
      if (linkdata.isOnResponseLink) {
        go_data.on_response_node_id = null;
      } else if (linkdata.isInitiateLink) {
        go_data.initiate_node_id = null;
      }
      saveNodeDataHandler(fromNode?.data, go_data, null, false);
      canvasRef.current.removeLink(linkdata);
    } else {
      // Remove the link if the node is not of type IF_ELSE_TYPE
      canvasRef.current.removeLink(linkdata);
    }
  };
  const getLinkContextMenuItems = (linkData) => {
    return getLinkContextMenuItemsUtil(linkData, {
      unlinkHandler,
      setSelectedLinkData,
      setDialogComponent,
      LINK_RENAME_DIALOG,
      linkedNodesRef,
      showAddNodeDrawer,
    });
  };
  const linkContextClickedHandler = (e, link, viewPortCoords) => {
    // Closing the drawer when link is renamed
    setRightDrawerComponent("default");
    defaultDrawerRef?.current?.closeSidebarPanel();
    if (!link?.data) return;

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
        toNode.data.key
      );
      if (!isConnectable) return;
      if (
        fromNodeToLink?.data?.type === IF_ELSE_TYPE ||
        fromNodeToLink?.data?.type === IF_ELSE_TYPE_V2 ||
        fromNodeToLink?.data?.type === HITL_TYPE
      ) {
        if (isFromNodePlaceholder) {
          const linksIntoPlaceholder = canvasRef.current.findLinksInto(
            fromNode?.data?.key
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
    [onAddNewNodeHandler]
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
      },
      { openNodeAfterCreate }
    );
  };

  const selectionDeletingHandler = (e, selections) => {
    if (!selections.size) return;
    if (showNodeDialog) {
      setShowNodeDialog(null);
      setRightDrawerComponent("default");
    }
    // Convert selections to an array to safely iterate
    const selectedNodes = selections.toArray();

    selectedNodes.forEach((node) => {
      if (node?.data?.subType === TRIGGER_SETUP_TYPE) {
        resetTriggerNode(node, selectedNodes?.length === 1);
      } else {
        // Remove outgoing links from the current selected canvas for the current node
        canvasRef.current.removeOutgoingLinks(node.key, true);

        // Find incoming links for the current selected node on the canvas
        const incomingLinks = canvasRef.current.findLinksInto(node.key);
        if (!incomingLinks) return;

        // Create an array from the links to safely iterate
        const incomingLinksArray = [];
        incomingLinks.each((link) => incomingLinksArray.push(link));

        // For each incoming link found
        incomingLinksArray.forEach((link) => {
          // Find the node from which the link originates (fromNode)
          const fromNode = canvasRef.current.findNode(link.data.from);

          // If the fromNode is also selected for deletion, skip unlinkHandler
          if (selections.has(fromNode)) return;

          // Otherwise, invoke unlinkHandler with the data of the current link
          unlinkHandler(link?.data);
        });
      }
    });
  };

  const setThemeFn = useCallback((newTheme) => {
    if (newTheme) {
      themeRef.current = newTheme;
      if (nodeModalRef.current) {
        nodeModalRef.current.refereshTheme(newTheme);
      }
    }
  }, []);

  const getFormPreviewPayload = useCallback(
    (name) => {
      return {
        _id: assetDetails?._id,
        annotation: getAnnotation(getMode(), eventType),
        name,
        parent_id: getMode() === MODE.CMS_CANVAS ? projectId : parentId,
        project_id: projectId,
        _r: canvasRef.current.getModelJSON(),
        workspace_id: workspaceId,
        meta: {
          ...assetDetails?.meta,
          _t: themeRef?.current,
          params: paramsRef?.current?.params || {},
        },
      };
    },
    [assetDetails, eventType, parentId, projectId, workspaceId]
  );

  const autoAlignHandler = useCallback(() => {
    canvasRef.current.autoAlign();
  }, []);

  const canvasContextClickedHandler = useCallback(
    (e, viewPortCoords) => {
      // Closing the drawer when canvas is clicked
      setRightDrawerComponent("default");
      defaultDrawerRef?.current?.closeSidebarPanel();
      setDocumentCoords({
        top: viewPortCoords?.y || 0,
        left: viewPortCoords?.x || 0,
      });
      const menuItems = getCanvasContextMenuItems({
        showAddNodeDrawer,
        autoAlignHandler,
        canvasRef,
      });
      setContextMenuItems(menuItems);
      setShowContextMenu(true);
    },
    [autoAlignHandler, showAddNodeDrawer]
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
      setRightDrawerComponent("default");
      defaultDrawerRef?.current?.closeSidebarPanel();
      const menuItems = getNodeContextMenuItems(node, {
        nodeDoubleClickedHandler,
        resetTriggerNode,
        TRIGGER_SETUP_TYPE,
        canvasRef,
        componentSDKServices,
        projectId,
        assetId: assetDetails?.asset_id,
        setShowAddLogsPopover,
        saveNodeDataHandler,
        defaultDrawerRef,
        variablesRef,
        paramsRef,
        testModuleRef,
        workspaceId,
        parentId,
        annotation: assetDetails?.annotation,
      });
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
    ]
  );

  const executeWorkflow = async (e) => {
    if (!assetDetails.asset_id) {
      showAlert({
        type: "warn",
        message: "Please save the workflow first.",
      });
      return;
    }
    const rect = e.target.getBoundingClientRect();
    setDocumentCoords({
      top: rect.y + 48,
      left: rect.x,
    });
    const getStartNodeAndSchemaResponse =
      await canvasSDKServices.getStartNodeAndSchema(
        canvasRef.current.getModelJSON()
      );
    const result = getStartNodeAndSchemaResponse?.result;
    if (result?.input_schema?.schema?.[0]?.schema?.length === 0) {
      // setShowLogs(true);
      setRightDrawerComponent("logs");
      setIsRunning(true);
      executeRunRef?.current?.execute([]);
    } else {
      // setRunInputSchema(result?.input_schema?.schema || []);
      defaultDrawerRef.current?.openSidebarPanel({
        id: "run-workflow",
        name: "Run Workflow",
        panel: (
          <Suspense fallback={<></>}>
            <RunInputsPopover
              schema={result?.input_schema?.schema || []}
              onRun={async (schema) => {
                defaultDrawerRef?.current?.closeSidebarPanel();
                // setShowLogs(true);
                setRightDrawerComponent("logs");
                setIsRunning(true);
                executeRunRef?.current?.execute(schema);
              }}
              onCancel={() => {
                defaultDrawerRef?.current?.closeSidebarPanel();
                // setRunInputSchema(null);
              }}
            />
          </Suspense>
        ),
      });
    }
  };

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
    [processFormData, processWorkflowData, saveNodeDataHandler, searchConfig]
  );

  const setUpVariables = useCallback(async () => {
    if (projectId) {
      setLoading("Fetching project variables...");
      const getByParentResponse = await variableSDKServices.getByParent({
        parent_id: projectId,
        asset_id: assetId,
      });
      if (getByParentResponse.status === "success")
        variablesRef.current = getByParentResponse.result;
    }
  }, [assetId, projectId]);

  const initCanvas = useCallback(async () => {
    try {
      await setUpVariables();
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
            const confirm = await showConfirmDialog({
              showCloseIcon: false,
              dialogContent: (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "8rem",
                    width: "100%",
                  }}
                >
                  <ODSLabel>
                    Do you wish to continue from you left off or load the saved
                    state?
                  </ODSLabel>
                </div>
              ),
              cancelLabel: "Load saved state",
              cancelButtonVariant: "black-outlined",
              okLabel: "Continue from where I left off",
              okButtonVariant: "black",
            });
            if (confirm === "ok") {
              modelJSON = godata_cache?._r;
            } else {
              updateGoDataCache(null);
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
                  "Still working on it… this may take a little longer than expected."
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
              showAlert({
                type: "error",
                message:
                  "It’s taking longer than expected to load your data. Please refresh the page or try again later.",
              });
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
              setRightDrawerComponent("default");
              setShowNodeDialog(null);
            }, 0);
            return;
          }
          if (response?.result?.meta?.moduleTestId) {
            moduleTestIdRef.current = response?.result?.meta?.moduleTestId;
          }
          if (!modelJSON) modelJSON = response.result._r;

          if (modelJSON) {
            await canvasRef.current.loadModelJSON(modelJSON);
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
              }
            );
            return;
          }
        }
      } else {
        if (getMode() === MODE.WORKFLOW_CANVAS) {
          // setShowGenerateFormCTA(true);
        }
      }
      SETUP_COMPONENTS.forEach((n) => {
        canvasRef?.current?.createNode(n);
      });
      if (!assetId) {
        canvasRef.current.autoAlign();
        if (getMode() !== MODE.TOOL_CANVAS) {
          // COMMENTING THIS ONLY FOR ANIKIT
          // await updateWorkflow({
          //   name: `Untitled ${getSaveDialogTitle(getMode())}`,
          //   description: "",
          // });
        } else {
          setDialogComponent(WORKFLOW_NAME_DIALOG);
        }
      }
    } finally {
      setLoading(false);
      onNewEvent(UATU_CANVAS, {
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.USER_SESSION_START,
      });
    }
  }, [
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
    initUATU,
    onNewEvent,
    assetDetails?.asset_id,
    userData?._id,
    assetDetails?.workspace_id,
  ]);

  useEffect(() => {
    const updatePosition = () => {
      if (bottomRightContainerRef.current && tinyBotContainerRef.current) {
        const bottomRightRect =
          bottomRightContainerRef.current.getBoundingClientRect();
        tinyBotContainerRef.current.style.right = `${
          bottomRightRect.width + 24
        }px`;
      }
    };

    // Update position initially
    updatePosition();

    // Observe changes to the bottomRight div's size
    const resizeObserver = new ResizeObserver(() => {
      updatePosition();
    });

    if (bottomRightContainerRef.current) {
      resizeObserver.observe(bottomRightContainerRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    Intercom({
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
    return () => {
      shutdown(); // Cleanup when the component is unmounted
    };
  }, [user?.email, user?.name]);

  useEffect(() => {
    if (!userData) getUserData();
  }, [getUserData, userData]);

  useEffect(() => {
    if (bottomRightContainerRef.current && tinyBotContainerRef.current) {
      const bottomRightRect =
        bottomRightContainerRef.current.getBoundingClientRect();
      tinyBotContainerRef.current.style.right = `${
        window.innerWidth - bottomRightRect.left
      }px`;
    }

    if (user?.sub && user?.email) {
      Clarity.init(getClarityId());
      Clarity.identify(user.sub, user.sub, "", user.email);
      Clarity.setTag("email", user.email);
      Clarity.setTag("user_id", user.sub);
    }
  }, [user?.sub, user?.email]);

  useEffect(() => {
    if (loadingConfig) return;
    if (!isInitialized) {
      setIsInitialized(true);
      initCanvas();
    }
  }, [initCanvas, isInitialized, loadingConfig]);

  useEffect(() => {
    async function fetchPremiumUser() {
      if (!assetDetails?.workspace_id) return;

      try {
        const status = await trackSDKServices.checkIfPremiumUser(
          assetDetails.workspace_id
        );
        setIsPremiumUser(status);
      } catch (error) {
        setIsPremiumUser(false);
      }
    }
    fetchPremiumUser();
  }, [assetDetails?.workspace_id]);

  useEffect(() => {
    async function fetchDomains() {
      if (!workspaceId) return;

      try {
        const domainsResponse = await domainSDKServices.findByWorkspace({
          workspace_id: workspaceId,
          mapping_type: "domain",
        });

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
        setCustomDomainData({
          domainList: [],
          customUrls: [],
        });

        showAlert({
          type: "error",
          message: "Failed to fetch domains",
        });
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
        showAlert({
          type: "error",
          message: "Failed to fetch custom URLs",
        });

        setCustomDomainData((prev) => ({
          ...prev,
          customUrls: [],
        }));
      }
    }

    fetchDomains();
    fetchCustomUrls();
  }, [assetId, workspaceId]);

  useKeydown({ saveButtonRef, showAddNodeDrawer, canvasRef });
  useContextMenu();

  return (
    <>
      <div className={classes["canvas-container"]}>
        <TroubleShootCard
          onContactUsClicked={() => {
            show();
          }}
        />
        <Canvas
          mode={getMode()}
          ref={canvasRef}
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
          // onScaleChange={(value = 1) => setScale((value * 100).toFixed(0))}
          onSelectionDeleting={selectionDeletingHandler}
          onModelChanged={(event) => {
            if (shouldCheckReferences(event?.oldValue)) {
              checkReferences();
            }
            setNodeCount(event?.model?.nodeDataArray?.length || 0);
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
                setDialogComponent={setDialogComponent}
                assetDetails={assetDetails}
                getSaveDialogTitle={getSaveDialogTitle}
                isDraft={isDraft}
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
              />
              <BottomCtaContainer
                showAddNodeDrawer={showAddNodeDrawer}
                tools={tools}
                autoAlignHandler={autoAlignHandler}
                setRightDrawerComponent={setRightDrawerComponent}
                onUndo={() => canvasRef?.current?.undo?.()}
                onRedo={() => canvasRef?.current?.redo?.()}
              />
            </div>
            <div className={classes["bottom-drawer"]}></div>
          </div>
          <div className={classes["right-column"]}>
            <div className={classes["right-drawer"]}>
              {rightDrawerComponent === "default" && (
                <Suspense fallback={<></>}>
                  <Drawer
                    ref={defaultDrawerRef}
                    open={rightDrawerComponent === "default"}
                    removeContentPadding
                    onSidebarToggle={(open, id) => {
                      if (id === "PUBLISH") {
                        publishRef.current?.saveFormResponses();
                      }
                      setDefaultDrawerSidebarOpen(open);
                      setActiveSidebarPanelId(open ? id : null);
                      setIsAddNodesPanelOpen(open && id === "add-nodes");
                    }}
                    onSidebarPanelClose={() => {
                      nodeToReplaceRef.current = null;
                      linkedNodesRef.current = null;
                      setRightDrawerComponent("default");
                    }}
                    sliderProps={{
                      sx: {
                        background: canvasTheme.background,
                      },
                    }}
                    showCloseIcon={defaultDrawerSidebarOpen}
                    showFullscreenIcon={false}
                    showSidebar
                    sidebarProps={{
                      style: {
                        color: canvasTheme.foreground,
                        background: canvasTheme.background,
                      },
                      activeStyles: {
                        background: "#fff",
                        color: canvasTheme.dark || "#000",
                      },
                      actions: getSidebarActions(getMode()),
                    }}
                    onSidebarActionClick={onSidebarActionClick}
                  />
                </Suspense>
              )}
              {rightDrawerComponent === NODE_DIALOG && showNodeDialog}
              <Suspense fallback={<></>}>
                <LogsDialog
                  open={rightDrawerComponent === "logs"}
                  data={logs}
                  onClose={() => setRightDrawerComponent("default")}
                  onClearTerminal={() => setLogs([])}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
      <div>
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
              setDialogComponent(null);
            }}
            transition="none"
            dialogWidth="500px"
            dialogMinHeight="160px"
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
                    setDialogComponent(null);
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
            open={dialogComponent === LINK_RENAME_DIALOG}
            showFullscreenIcon={false}
            onClose={() => {
              setDialogComponent(null);
              setSelectedLinkData(null);
            }}
            transition="none"
            dialogWidth="500px"
            dialogMinHeight="160px"
            dialogTitle={
              <ODSAdvancedLabel
                labelText="Rename"
                labelProps={{
                  variant: "h6",
                  color: default_theme.palette?.grey["A100"],
                }}
                sx={{
                  padding: "0.5rem",
                }}
                leftAdornment={
                  <Icon
                    outeIconName="OUTEEditIcon"
                    outeIconProps={{
                      sx: {
                        color: default_theme.palette?.grey["400"],
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
                    setDialogComponent(null);
                    setSelectedLinkData(null);
                  }}
                  defaultLinkLabel={selectedLinkData?.label}
                />
              </Suspense>
            }
          />
        </Suspense>
        <Suspense fallback={<></>}>
          <TestCaseSetup
            showTestCaseDialog={dialogComponent === TEST_CASE_DIALOG}
            onClose={() => {
              setDialogComponent(null);
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
              setDialogComponent(TEST_CASE_RUN_DIALOG);
            }}
          />
        </Suspense>
        <Suspense fallback={<></>}>
          <TestCaseRun
            show={dialogComponent === TEST_CASE_RUN_DIALOG}
            runTestCasesPayload={runTestCasePayload}
            onClose={() => {
              setRunTestCasePayload(null);
              setDialogComponent(null);
            }}
            projectId={projectId}
          />
        </Suspense>
        <Suspense fallback={<></>}>
          <Dialog
            open={dialogComponent === ADD_ASSET_ID_DIALOG}
            showFullscreenIcon={false}
            onClose={() => {
              setDialogComponent(null);
            }}
            transition="none"
            dialogWidth="500px"
            dialogTitle={`Add Asset ID`}
            dialogContent={
              <Suspense fallback={<></>}>
                <AddAssetIdDialog
                  onSave={(value) => {
                    moduleTestIdRef.current = value;
                    setDialogComponent(null);
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
        {dialogComponent === PREVIEW_DIALOG && (
          <Suspense fallback={<></>}>
            <FormPreviewDialog
              params={paramsRef.current?.params}
              variables={variablesRef.current}
              payload={getFormPreviewPayload(assetDetails?.asset?.name)}
              workflowName={assetDetails?.asset?.name}
              theme={themeRef.current}
              onPublish={() => {
                setDialogComponent(null);
                publishBtnRef.current?.click();
              }}
              openNodeWithTheme={openNodeWithTheme}
              onClose={() => {
                setDialogComponent(null);
              }}
              onEvent={(event) => {
                setLogs((prev) => [...prev, formatSingleFormLog(event)]);
              }}
              onAnalyticsEvent={onNewEvent}
              assetId={assetDetails?.asset_id}
              hideBranding={
                !!assetDetails?.asset?.settings?.form?.remove_branding
              }
            />
          </Suspense>
        )}
        {dialogComponent === FORM_PUBLISH_DIALOG && (
          <Suspense fallback={<></>}>
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
                setDialogComponent(null);
              }}
              openNodeWithTheme={openNodeWithTheme}
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
            onEvent={(data) => {
              if (data.is_advance) return;
              setLogs((prev) => [...prev, formatSingleLog(data)]);
            }}
            onExecutionComplete={() => {
              setIsRunning(false);
              setLoading(null);
            }}
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
          onClose={() => setIsCommandPaletteOpen(false)}
          tabData={searchConfig}
          canvasRef={canvasRef}
          previousNode={
            linkedNodesRef.current
              ? canvasRef.current?.findNode(linkedNodesRef.current?.from)?.data
              : null
          }
          onNodeSelect={async (node) => {
            await onAddNewNodeHandler(node);
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
    </>
  );
};

export default IC;
