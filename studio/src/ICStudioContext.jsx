import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { serverConfig } from "./module/ods";

const SOCKET_LOGGING_ENABLED = process.env.NODE_ENV === "development";

const safeStringify = (data) => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return "[Unable to stringify - circular reference or complex object]";
  }
};

const formatSocketLog = (direction, event, data) => {
  const timestamp = new Date().toISOString();
  const arrow = direction === "out" ? "→ OUTGOING" : "← INCOMING";
  const color = direction === "out" ? "color: #2563eb" : "color: #16a34a";

  console.groupCollapsed(
    `%c[SOCKET ${arrow}] ${timestamp} | ${event}`,
    `${color}; font-weight: bold;`
  );
  console.log("Event:", event);
  console.log("Payload:", safeStringify(data));
  console.log("Raw:", data);
  console.groupEnd();
};

export const createLoggedSocket = (rawSocket) => {
  if (!SOCKET_LOGGING_ENABLED) return rawSocket;

  const listenerMap = [];

  const originalEmit = rawSocket.emit.bind(rawSocket);
  rawSocket.emit = (event, ...args) => {
    formatSocketLog("out", event, args.length === 1 ? args[0] : args);
    return originalEmit(event, ...args);
  };

  const originalOn = rawSocket.on.bind(rawSocket);
  const originalOff = rawSocket.off.bind(rawSocket);

  rawSocket.on = (event, callback) => {
    const wrapper = (...args) => {
      formatSocketLog("in", event, args.length === 1 ? args[0] : args);
      callback(...args);
    };
    listenerMap.push({ event, callback, wrapper });
    return originalOn(event, wrapper);
  };

  rawSocket.off = (event, callback) => {
    if (callback === undefined) {
      const toRemove = listenerMap.filter((e) => e.event === event);
      toRemove.forEach((e) => originalOff(event, e.wrapper));
      for (let i = listenerMap.length - 1; i >= 0; i--) {
        if (listenerMap[i].event === event) listenerMap.splice(i, 1);
      }
      if (toRemove.length === 0) originalOff(event);
      return rawSocket;
    }
    const entry = listenerMap.find((e) => e.event === event && e.callback === callback);
    if (entry) {
      originalOff(event, entry.wrapper);
      const idx = listenerMap.indexOf(entry);
      if (idx !== -1) listenerMap.splice(idx, 1);
    } else {
      originalOff(event, callback);
    }
    return rawSocket;
  };

  return rawSocket;
};

export const ICStudioContext = createContext(null);
export const ICStudioContextProvider = ({ children }) => {
  const [assetId, setAssetId] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [eventType, setEventType] = useState(null);
  const [theme, setTheme] = useState(null);
  const [socket, setSocket] = useState(null);
  const [userData, setUserData] = useState(null);
  const [host, setHost] = useState(null);

  const [isEmbedMode, setIsEmbedMode] = useState(() => window.location.pathname === "/embed");
  const [isEmbedAuthenticated, setIsEmbedAuthenticated] = useState(false);
  const [pendingEmbedCanvasData, setPendingEmbedCanvasData] = useState(null);

  const socketInitializedRef = useRef(false);
  const embedSendMessageRef = useRef(null);

  const setEmbedSendMessage = useCallback((fn) => {
    embedSendMessageRef.current = fn;
  }, []);

  const embedSendMessage = useMemo(() => (...args) => {
    embedSendMessageRef.current?.(...args);
  }, []);

  const logout = async () => {};

  const updateAssetId = useCallback((id) => {
    setAssetId(id);
  }, []);

  const updateWorkspaceId = useCallback((id) => {
    setWorkspaceId(id);
  }, []);

  const updateParentId = useCallback((id) => {
    setParentId(id);
  }, []);

  const updateProjectId = useCallback((id) => {
    setProjectId(id);
  }, []);

  const updateEventType = useCallback((type) => {
    setEventType(type);
  }, []);

  const getTheme = useCallback(() => {
    return theme;
  }, [theme]);

  const updateTheme = useCallback((t) => {
    setTheme(t);
  }, []);

  const injectEmbedContext = useCallback(({ workspaceId: wsId, projectId: projId, parentId: parId, assetId: aId, eventType: et }) => {
    if (wsId !== undefined) setWorkspaceId(wsId);
    if (projId !== undefined) setProjectId(projId);
    if (parId !== undefined) setParentId(parId);
    if (aId !== undefined) setAssetId(aId);
    if (et !== undefined) setEventType(et);
  }, []);

  const initSocket = useCallback(() => {
    if (socketInitializedRef.current) return;
    socketInitializedRef.current = true;
    const rawSocket = io(serverConfig.SOCKET_URL, {
      reconnectionDelay: 5000,
      query: {
        token: window.accessToken,
        room_id: `IC_${Date.now()}`,
        room_type: "PROCESSOR",
      },
      transports: ["websocket", "webtransport", "polling"],
    });
    const loggedSocket = createLoggedSocket(rawSocket);
    setSocket(loggedSocket);
    console.log("[SOCKET_CREATED] ICStudioContext (embed initSocket)", {
      source: "ICStudioContext.jsx",
      socket_id: rawSocket?.id,
    });
  }, []);

  useEffect(() => {
    if (isEmbedMode) return;
    if (socketInitializedRef.current) return;
    socketInitializedRef.current = true;
    const rawSocket = io(serverConfig.SOCKET_URL, {
      reconnectionDelay: 5000,
      query: {
        token: window.accessToken,
        room_id: `IC_${Date.now()}`,
        room_type: "PROCESSOR",
      },
      transports: ["websocket", "webtransport", "polling"],
    });
    const loggedSocket = createLoggedSocket(rawSocket);
    setSocket(loggedSocket);
    console.log("[SOCKET_CREATED] ICStudioContext (main app, execute_flow)", {
      source: "ICStudioContext.jsx",
      socket_id: rawSocket?.id,
      room_id: `IC_${Date.now()}`,
    });
  }, [isEmbedMode]);

  return (
    <ICStudioContext.Provider
      value={{
        assetId,
        updateAssetId,
        workspaceId,
        updateWorkspaceId,
        parentId,
        updateParentId,
        projectId,
        updateProjectId,
        eventType,
        updateEventType,
        logout,
        getTheme,
        updateTheme,
        socket,
        userData,
        setUserData,
        host,
        setHost,
        isEmbedMode,
        setIsEmbedMode,
        isEmbedAuthenticated,
        setIsEmbedAuthenticated,
        injectEmbedContext,
        initSocket,
        pendingEmbedCanvasData,
        setPendingEmbedCanvasData,
        setEmbedSendMessage,
        embedSendMessage,
      }}
    >
      {children}
    </ICStudioContext.Provider>
  );
};
