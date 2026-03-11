/**
 * TinyTable Embed – postMessage hook
 *
 * Manages the bidirectional postMessage protocol between the host frame
 * (e.g. AI Builder) and this embedded TinyTable preview.
 *
 * State machine: initializing → waiting-for-auth → authenticated → loaded
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type {
  EmbedInboundMessage,
  EmbedOutboundEvent,
  EmbedStatus,
  EmbedSetAuthMessage,
  EmbedLoadTableMessage,
  EmbedUpdateTableMessage,
  EmbedSetThemeMessage,
  EmbedSetModeMessage,
  EmbedTableDefinition,
} from "./types";

// ---------------------------------------------------------------------------
// Allowed origins
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS: string[] = (() => {
  const raw =
    import.meta.env.VITE_ALLOWED_EMBED_ORIGINS ||
    import.meta.env.REACT_APP_ALLOWED_EMBED_ORIGINS ||
    "";
  return raw
    ? raw
        .split(",")
        .map((o: string) => o.trim())
        .filter(Boolean)
    : [];
})();

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.length === 0) return true; // allow all if not configured
  return ALLOWED_ORIGINS.includes(origin);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface EmbedMessageHandlers {
  onAuth: (msg: EmbedSetAuthMessage) => void;
  onLoadTable: (msg: EmbedLoadTableMessage) => void;
  onUpdateTable: (msg: EmbedUpdateTableMessage) => void;
  onSetTheme: (msg: EmbedSetThemeMessage) => void;
  onSetMode: (msg: EmbedSetModeMessage) => void;
}

export function useEmbedMessages(handlers: EmbedMessageHandlers) {
  const [status, setStatus] = useState<EmbedStatus>("initializing");
  const parentOriginRef = useRef<string | null>(null);
  const messageQueueRef = useRef<EmbedInboundMessage[]>([]);
  const statusRef = useRef<EmbedStatus>("initializing");

  // Keep ref in sync for use inside event listener
  statusRef.current = status;

  const sendMessage = useCallback((event: EmbedOutboundEvent) => {
    if (window.parent === window) return; // not in iframe
    const targetOrigin = parentOriginRef.current || "*";
    window.parent.postMessage(event, targetOrigin);
  }, []);

  const processMessage = useCallback(
    (msg: EmbedInboundMessage) => {
      console.log("[TinyTable Embed] ← RECEIVED:", msg.action, msg);
      switch (msg.action) {
        case "setAuth":
          console.log("[TinyTable Embed] Processing setAuth, mode:", msg.mode);
          handlers.onAuth(msg);
          setStatus("authenticated");
          statusRef.current = "authenticated";
          // Flush queued messages
          const queued = messageQueueRef.current;
          messageQueueRef.current = [];
          console.log("[TinyTable Embed] Flushing", queued.length, "queued messages");
          queued.forEach((m) => processMessage(m));
          break;
        case "loadTable":
          console.log("[TinyTable Embed] Processing loadTable:", {
            tableCount: msg.data?.tables?.length,
            activeTableId: msg.data?.activeTableId,
            firstTableFields: msg.data?.tables?.[0]?.fields?.length,
            firstTableRecords: msg.data?.tables?.[0]?.sampleRecords?.length,
          });
          handlers.onLoadTable(msg);
          setStatus("loaded");
          statusRef.current = "loaded";
          break;
        case "updateTable":
          console.log("[TinyTable Embed] Processing updateTable:", {
            tableId: msg.data?.tableId,
            fieldCount: msg.data?.fields?.length,
            recordCount: msg.data?.sampleRecords?.length,
          });
          handlers.onUpdateTable(msg);
          break;
        case "setTheme":
          console.log("[TinyTable Embed] Processing setTheme:", msg.theme);
          handlers.onSetTheme(msg);
          break;
        case "setMode":
          console.log("[TinyTable Embed] Processing setMode:", msg.mode);
          handlers.onSetMode(msg);
          break;
      }
    },
    [handlers],
  );

  // Listen for postMessages
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!isAllowedOrigin(e.origin)) return;
      const data = e.data as EmbedInboundMessage;
      if (!data || typeof data !== "object" || !("action" in data)) return;

      // Track parent origin for responses
      if (!parentOriginRef.current) {
        parentOriginRef.current = e.origin;
      }

      // Queue non-auth messages until authenticated
      if (
        data.action !== "setAuth" &&
        statusRef.current === "waiting-for-auth"
      ) {
        messageQueueRef.current.push(data);
        return;
      }

      processMessage(data);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [processMessage]);

  // Send ready event on mount, start auth timeout
  useEffect(() => {
    setStatus("waiting-for-auth");
    statusRef.current = "waiting-for-auth";
    console.log("[TinyTable Embed] → SENDING: ready event to parent");
    sendMessage({ event: "ready" });

    // Fallback to stub mode after 3 seconds if no auth received
    const timeout = setTimeout(() => {
      if (statusRef.current === "waiting-for-auth") {
        handlers.onAuth({ action: "setAuth", mode: "stub" });
        setStatus("authenticated");
        statusRef.current = "authenticated";
        sendMessage({ event: "authConfigured", mode: "stub" });
        // Flush queue
        const queued = messageQueueRef.current;
        messageQueueRef.current = [];
        queued.forEach((m) => processMessage(m));
      }
    }, 3000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, sendMessage };
}
