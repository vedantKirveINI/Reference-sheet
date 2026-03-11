import React, { createContext, useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
// import { serverConfig } from "oute-ds-utils";
import { serverConfig } from "./module/ods";

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

  // Host is used when app is embeded in an iframe - example recipe-builder
  const [host, setHost] = useState(null);

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

  const updateTheme = useCallback((theme) => {
    setTheme(theme);
  }, []);

  useEffect(() => {
    setSocket(
      io(serverConfig.SOCKET_URL, {
        reconnectionDelay: 5000,
        query: {
          token: window.accessToken,
          room_id: `IC_${Date.now()}`,
          room_type: "PROCESSOR",
        },
        transports: ["websocket", "webtransport", "polling"],
      }),
    );
  }, []);

  // useEffect(() => {
  //   if (window.accessToken) {
  //     if (socket) return socket;
  //     setSocket(
  //       io(serverConfig.SOCKET_URL, {
  //         reconnectionDelay: 5000,
  //         query: {
  //           token: window.accessToken,
  //           room_id: `IC_${Date.now()}`,
  //           room_type: "PROCESSOR",
  //         },
  //         transports: ["websocket"],
  //       }),
  //     );
  //   }
  // }, [window.accessToken]);

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
      }}
    >
      {children}
    </ICStudioContext.Provider>
  );
};
