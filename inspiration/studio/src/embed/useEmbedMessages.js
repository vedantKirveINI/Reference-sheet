import { useCallback, useEffect, useRef } from "react";

const embedDebug =
  process.env.NODE_ENV === "development" ||
  process.env.REACT_APP_EMBED_DEBUG === "true";

const embedLog = (...args) => {
  if (embedDebug) {
    console.log("[StudioEmbed]", ...args);
  }
};

const embedWarn = (...args) => {
  if (embedDebug) {
    console.warn("[StudioEmbed]", ...args);
  }
};

const getAllowedOrigins = () => {
  const envOrigins = process.env.REACT_APP_ALLOWED_EMBED_ORIGINS;
  if (!envOrigins) return null;
  return envOrigins.split(",").map((o) => o.trim()).filter(Boolean);
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!allowedOrigins) return true;
  return allowedOrigins.includes(origin);
};

const simpleHash = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch {
    return null;
  }
};

const useEmbedMessages = ({
  onSetAuth,
  onLoadAsset,
  onUpdateAsset,
  onSetTheme,
  onSetMode,
  onSetStickyNote,
  allowedOrigins: externalAllowedOrigins,
}) => {
  const embedStateRef = useRef("waiting_for_auth");
  const resolvedOrigins = useRef(externalAllowedOrigins !== undefined ? externalAllowedOrigins : getAllowedOrigins());
  const pendingMessages = useRef([]);
  const readySentRef = useRef(false);
  const lastAuthHashRef = useRef(null);
  const lastLoadHashRef = useRef(null);

  const callbacksRef = useRef({ onSetAuth, onLoadAsset, onUpdateAsset, onSetTheme, onSetMode, onSetStickyNote });
  callbacksRef.current = { onSetAuth, onLoadAsset, onUpdateAsset, onSetTheme, onSetMode, onSetStickyNote };

  const sendMessage = useCallback((message) => {
    if (message?.event) {
      const summary =
        message.event === "assetUpdated"
          ? `nodeCount=${message.nodeCount ?? "?"}`
          : message.event === "error"
            ? `message=${message.message ?? "?"}`
            : message.event === "ready" || message.event === "authConfigured"
              ? ""
              : "";
      embedLog("OUT", `event=${message.event}`, summary || "(no payload)");
    }
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(message, "*");
    }
  }, []);

  const processAction = useCallback((data) => {
    const currentState = embedStateRef.current;
    const cbs = callbacksRef.current;

    switch (data.action) {
      case "setAuth": {
        const hash = simpleHash({ mode: data.mode, token: data.token, userId: data.userId });
        if (hash && hash === lastAuthHashRef.current) return;
        lastAuthHashRef.current = hash;
        cbs.onSetAuth(data);
        embedStateRef.current = "ready";
        embedLog("state =>", "ready");
        sendMessage({ event: "authConfigured", mode: data.mode });
        const queue = [...pendingMessages.current];
        pendingMessages.current = [];
        embedLog("processing", queue.length, "queued messages");
        queue.forEach((msg) => processAction(msg));
        break;
      }

      case "loadAsset": {
        if (currentState === "waiting_for_auth") {
          pendingMessages.current.push(data);
          return;
        }
        const hash = simpleHash({ type: data.type, nodes: data.data?.canvasData?.nodes?.length });
        if (hash && hash === lastLoadHashRef.current) return;
        lastLoadHashRef.current = hash;
        cbs.onLoadAsset(data.type, data.data);
        embedStateRef.current = "loaded";
        embedLog("state =>", "loaded");
        break;
      }

      case "updateAsset": {
        if (currentState === "waiting_for_auth") {
          pendingMessages.current.push(data);
          return;
        }
        cbs.onUpdateAsset(data.data);
        break;
      }

      case "setTheme": {
        if (currentState === "waiting_for_auth") {
          pendingMessages.current.push(data);
          return;
        }
        cbs.onSetTheme(data.theme);
        break;
      }

      case "setMode": {
        if (currentState === "waiting_for_auth") {
          pendingMessages.current.push(data);
          return;
        }
        cbs.onSetMode(data.mode);
        break;
      }

      case "setStickyNote": {
        embedLog("IN setStickyNote", "data.data=", data.data);
        if (currentState === "waiting_for_auth") {
          pendingMessages.current.push(data);
          return;
        }
        cbs.onSetStickyNote?.(data.data);
        break;
      }

      default:
        break;
    }
  }, [sendMessage]);

  const handleMessage = useCallback(
    (event) => {
      const { data } = event;
      if (!data || !data.action) return;

      if (!isOriginAllowed(event.origin, resolvedOrigins.current)) {
        embedLog("IN rejected", `origin=${event.origin}`);
        return;
      }

      const payloadSummary = {
        action: data.action,
        ...(data.type != null && { type: data.type }),
      };
      embedLog("IN", `action=${data.action}`, `origin=${event.origin}`);
      embedLog("IN payload", payloadSummary);

      processAction(data);
    },
    [processAction]
  );

  useEffect(() => {
    embedLog("message listener registered");
    window.addEventListener("message", handleMessage);

    if (!readySentRef.current) {
      readySentRef.current = true;
      embedLog("sent ready");
      sendMessage({ event: "ready" });
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleMessage, sendMessage]);

  return { sendMessage };
};

export default useEmbedMessages;
