import { useEffect } from "react";
import { io } from "socket.io-client";
import { createLoggedSocket } from "@src/ICStudioContext";

const useSocket = ({ authenticated, assetServerUrl, logout, sessionId }) => {
  useEffect(() => {
    if (!authenticated || !assetServerUrl) return;
    const rawSocket = io(assetServerUrl, {
      transports: ["websocket", "webtransport", "polling"],
      query: {
        token: window.accessToken,
      },
    });
    const socket = createLoggedSocket(rawSocket);
    console.log("[SOCKET_CREATED] useSocket (tiny-auth, user_logged_out)", {
      source: "useSocket.js (tiny-auth-wrapper)",
      socket_id: rawSocket?.id,
      assetServerUrl,
    });
    socket.on("user_logged_out", (msg = {}) => {
      const eventSessionId = msg.session_id;
      if (!eventSessionId) {
        return;
      }
      if (sessionId && eventSessionId !== sessionId) {
        return;
      }
      logout(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [authenticated, assetServerUrl, logout, sessionId]);
};

export default useSocket;
