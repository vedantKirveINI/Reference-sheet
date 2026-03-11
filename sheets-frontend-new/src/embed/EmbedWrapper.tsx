/**
 * TinyTable Embed – Main wrapper
 *
 * Orchestrates the full embed lifecycle:
 * 1. Sends "ready" to parent
 * 2. Receives auth via postMessage
 * 3. Receives table data
 * 4. Renders table tab bar + table preview
 *
 * No sidebar, no header, no auth UI, no modals.
 */

import { useCallback, useRef } from "react";
import { useEmbedMessages, type EmbedMessageHandlers } from "./useEmbedMessages";
import { useEmbedTableData } from "./useEmbedTableData";
import { TableTabBar } from "./components/TableTabBar";
import { TablePreview } from "./components/TablePreview";
import type {
  EmbedSetAuthMessage,
  EmbedLoadTableMessage,
  EmbedUpdateTableMessage,
  EmbedSetThemeMessage,
  EmbedSetModeMessage,
} from "./types";

export function EmbedWrapper() {
  const tableData = useEmbedTableData();
  const sendMessageRef = useRef<((e: any) => void) | null>(null);

  // --- Message handlers ---

  const handleAuth = useCallback((msg: EmbedSetAuthMessage) => {
    console.log("[TinyTable Embed Wrapper] handleAuth:", { mode: msg.mode, hasToken: !!msg.token, workspaceId: msg.workspaceId });
    if (msg.token) {
      (window as any).accessToken = msg.token;
    }
    if (msg.serverConfig) {
      (window as any).__EMBED_SERVER_CONFIG__ = msg.serverConfig;
    }
    console.log("[TinyTable Embed Wrapper] → SENDING: authConfigured, mode:", msg.mode);
    sendMessageRef.current?.({ event: "authConfigured", mode: msg.mode });
  }, []);

  const handleLoadTable = useCallback(
    (msg: EmbedLoadTableMessage) => {
      tableData.loadTables(msg.data.tables, msg.data.activeTableId);
      sendMessageRef.current?.({
        event: "tableLoaded",
        tableCount: msg.data.tables.length,
        activeTableId: msg.data.activeTableId ?? msg.data.tables[0]?.id ?? "",
      });
    },
    [tableData.loadTables],
  );

  const handleUpdateTable = useCallback(
    (msg: EmbedUpdateTableMessage) => {
      tableData.updateTable(
        msg.data.tableId,
        msg.data.fields,
        msg.data.sampleRecords,
      );
      const targetId = msg.data.tableId ?? tableData.activeTableId;
      const targetTable = tableData.tables.find((t) => t.id === targetId);
      sendMessageRef.current?.({
        event: "tableUpdated",
        tableId: targetId,
        fieldCount: msg.data.fields?.length ?? targetTable?.fields.length ?? 0,
        recordCount:
          msg.data.sampleRecords?.length ??
          targetTable?.sampleRecords?.length ??
          0,
      });
    },
    [tableData.updateTable, tableData.activeTableId, tableData.tables],
  );

  const handleSetTheme = useCallback((_msg: EmbedSetThemeMessage) => {
    // Theme support - can apply CSS variables here in the future
  }, []);

  const handleSetMode = useCallback((_msg: EmbedSetModeMessage) => {
    // Mode support - preview is default; readonly/edit can be added later
  }, []);

  const handlers: EmbedMessageHandlers = {
    onAuth: handleAuth,
    onLoadTable: handleLoadTable,
    onUpdateTable: handleUpdateTable,
    onSetTheme: handleSetTheme,
    onSetMode: handleSetMode,
  };

  const { status, sendMessage } = useEmbedMessages(handlers);
  sendMessageRef.current = sendMessage;

  // --- Active table data ---

  const activeData = tableData.tableDataMap.get(tableData.activeTableId);
  const activeTableDef = tableData.tables.find(
    (t) => t.id === tableData.activeTableId,
  );

  const isWaitingForData =
    status === "waiting-for-auth" ||
    status === "authenticated" ||
    status === "initializing";

  // --- Render ---

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Table tabs (only shown when multiple tables) */}
      <TableTabBar
        tables={tableData.tables}
        activeTableId={tableData.activeTableId}
        onSelectTable={tableData.setActiveTable}
      />

      {/* Table preview */}
      <TablePreview
        data={activeData}
        tableName={activeTableDef?.name}
        isLoading={isWaitingForData}
      />
    </div>
  );
}
