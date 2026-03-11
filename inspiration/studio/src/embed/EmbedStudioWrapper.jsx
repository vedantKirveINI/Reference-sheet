import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import { ICStudioContext } from "@/ICStudioContext";
import useEmbedMessages from "@/embed/useEmbedMessages";
import { mapAssetDataToGoJSModel, validateAssetData } from "@/embed/dataMapper";
import PageProcessingLoader from "@/components/loaders/PageProcessingLoader";
import { CANVAS_MODES, setCanvasModeOverride } from "@/module/constants/canvasConstants";

const IC = lazy(() => import("@/pages/ic-canvas/index"));

const EMBED_TYPE_TO_CANVAS_MODE = {
  form: CANVAS_MODES.WORKFLOW_CANVAS,
  workflow: CANVAS_MODES.WC_CANVAS,
  sequence: CANVAS_MODES.WC_CANVAS,
};

const embedLog = (...args) => {
  console.log("[EmbedStudio]", ...args);
};

class EmbedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { event: "error", message: error.message, recoverable: false },
        "*"
      );
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            fontFamily: "system-ui, sans-serif",
            color: "#64748b",
          }}
        >
          <p style={{ margin: 0, fontSize: 14 }}>
            {this.state.error?.message || "Something went wrong"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 16,
              padding: "8px 20px",
              cursor: "pointer",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              background: "#fff",
              fontSize: 13,
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEV_AUTH_TIMEOUT_MS = 3000;

const EmbedStudioWrapper = ({ type }) => {
  const {
    setIsEmbedMode,
    setIsEmbedAuthenticated,
    injectEmbedContext,
    initSocket,
    setPendingEmbedCanvasData,
    setEmbedSendMessage,
  } = useContext(ICStudioContext);

  const [authConfigured, setAuthConfigured] = useState(false);
  const themeRef = useRef(null);
  const authReceivedRef = useRef(false);

  useEffect(() => {
    setIsEmbedMode(true);
    const canvasMode = EMBED_TYPE_TO_CANVAS_MODE[type] || CANVAS_MODES.WC_CANVAS;
    setCanvasModeOverride(canvasMode);
    embedLog("embed mode activated — canvasMode:", canvasMode, "type:", type);
    return () => {
      setCanvasModeOverride(null);
    };
  }, [setIsEmbedMode, type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authReceivedRef.current) return;
      const isInIframe = window.parent && window.parent !== window;
      embedLog("no setAuth after", DEV_AUTH_TIMEOUT_MS + "ms", "— isInIframe:", isInIframe);
      embedLog("proceeding in standalone/dev mode (unauthenticated)");
      injectEmbedContext({
        workspaceId: "dev",
        projectId: "dev",
        parentId: "dev",
        eventType: null,
      });
      setIsEmbedAuthenticated(false);
      setAuthConfigured(true);
    }, DEV_AUTH_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [injectEmbedContext, setIsEmbedAuthenticated]);

  const handleSetAuth = useCallback(
    (data) => {
      authReceivedRef.current = true;
      embedLog("setAuth received — mode:", data.mode, "workspaceId:", data.workspaceId);

      window.accessToken = data.token || undefined;

      if (data.serverConfig) {
        window.__EMBED_SERVER_CONFIG__ = {
          studioServer: data.serverConfig.studioServer || undefined,
          outeServer: data.serverConfig.outeServer || undefined,
          fileServer: data.serverConfig.fileServer || undefined,
        };
      }

      injectEmbedContext({
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        parentId: data.parentId || data.projectId,
        eventType: data.eventType,
      });

      setIsEmbedAuthenticated(!!data.token);

      if (data.token) {
        initSocket();
      }

      setAuthConfigured(true);
    },
    [injectEmbedContext, initSocket, setIsEmbedAuthenticated]
  );

  const handleLoadAsset = useCallback(
    (assetType, data) => {
      embedLog("loadAsset received — type:", assetType);
      const validation = validateAssetData(data);
      if (!validation.valid) {
        embedLog("loadAsset validation failed:", validation.errors.join(", "));
        return;
      }
      const model = mapAssetDataToGoJSModel(assetType || type, data);
      const nodeCount = (model?.nodeDataArray || []).length;
      embedLog("loadAsset mapped — nodeCount:", nodeCount);
      setPendingEmbedCanvasData(model);
    },
    [type, setPendingEmbedCanvasData]
  );

  const handleUpdateAsset = useCallback(
    (data) => {
      embedLog("updateAsset received");
      const validation = validateAssetData(data);
      if (!validation.valid) {
        embedLog("updateAsset validation failed:", validation.errors.join(", "));
        return;
      }
      const model = mapAssetDataToGoJSModel(type, data);
      setPendingEmbedCanvasData(model);
    },
    [type, setPendingEmbedCanvasData]
  );

  const handleSetTheme = useCallback((theme) => {
    embedLog("setTheme received");
    themeRef.current = theme;
  }, []);

  const handleSetMode = useCallback((mode) => {
    embedLog("setMode received — mode:", mode);
  }, []);

  const handleSetStickyNote = useCallback((data) => {
    embedLog("setStickyNote received");
  }, []);

  const { sendMessage } = useEmbedMessages({
    onSetAuth: handleSetAuth,
    onLoadAsset: handleLoadAsset,
    onUpdateAsset: handleUpdateAsset,
    onSetTheme: handleSetTheme,
    onSetMode: handleSetMode,
    onSetStickyNote: handleSetStickyNote,
  });

  useEffect(() => {
    setEmbedSendMessage(sendMessage);
  }, [sendMessage, setEmbedSendMessage]);

  if (!authConfigured) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100vw",
          height: "100vh",
          background: "#f8f9fa",
        }}
      >
        <PageProcessingLoader
          height="8rem"
          style={{ position: "unset", boxShadow: "none", background: "none" }}
          showLogo={true}
        />
      </div>
    );
  }

  return (
    <EmbedErrorBoundary>
      <Suspense fallback={null}>
        <IC />
      </Suspense>
    </EmbedErrorBoundary>
  );
};

export default EmbedStudioWrapper;
