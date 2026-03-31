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

import { useCallback, useRef, useState } from "react";
import { Save, Loader2 } from "lucide-react";
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
  EmbedSaveMessage,
} from "./types";
import { apiClient, createMultipleFields } from "@/services/api";

export function EmbedWrapper() {
  const tableData = useEmbedTableData();
  const sendMessageRef = useRef<((e: any) => void) | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tableName, setTableName] = useState("Untitled Table");
  const [isSaving, setIsSaving] = useState(false);
  const authDataRef = useRef<{ workspaceId?: string; parentId?: string }>({});

  // --- Message handlers ---

  const handleAuth = useCallback((msg: EmbedSetAuthMessage) => {
    console.log("[TinyTable Embed Wrapper] handleAuth:", { mode: msg.mode, hasToken: !!msg.token, workspaceId: msg.workspaceId });
    if (msg.token) {
      (window as any).accessToken = msg.token;
    }
    if (msg.serverConfig) {
      (window as any).__EMBED_SERVER_CONFIG__ = msg.serverConfig;
    }
    setIsAuthenticated(msg.mode === "authenticated" && !!msg.token);
    authDataRef.current = { workspaceId: msg.workspaceId, parentId: msg.workspaceId };
    if ((msg as any).name) setTableName((msg as any).name);
    console.log("[TinyTable Embed Wrapper] → SENDING: authConfigured, mode:", msg.mode);
    sendMessageRef.current?.({ event: "authConfigured", mode: msg.mode });
  }, []);

  const handleLoadTable = useCallback(
    (msg: EmbedLoadTableMessage) => {
      tableData.loadTables(msg.data.tables, msg.data.activeTableId);
      // Pick up table name from loaded data
      const firstName = msg.data.tables?.[0]?.name;
      if (firstName) setTableName(firstName);
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

  const handleSave = useCallback(async (msg: EmbedSaveMessage) => {
    console.log("[TinyTable Embed Wrapper] handleSave:", { name: msg.name, workspaceId: msg.workspaceId });
    try {
      const tables = tableData.tables;
      if (!tables.length) {
        sendMessageRef.current?.({ event: "saveFailed", data: { error: "No table data to save" } });
        return;
      }

      const wsId = msg.workspaceId || "";
      const firstTable = tables[0];
      const tableName = msg.name || firstTable.name;

      // Step 1: Create sheet via the standard TinyTable backend API
      // This creates the Heimdall asset, base, table, view, and default field — all in one call
      const sheetRes = await apiClient.post("/sheet/create_sheet", {
        workspace_id: wsId,
        name: tableName,
      });

      const base = sheetRes?.data?.data?.base || sheetRes?.data?.base;
      const table = sheetRes?.data?.data?.tables?.[0] || sheetRes?.data?.data?.table || sheetRes?.data?.table;
      const view = sheetRes?.data?.data?.tables?.[0]?.views?.[0] || sheetRes?.data?.data?.view || sheetRes?.data?.view;

      const baseId = base?.id;
      const tableId = table?.id;
      const viewId = view?.id;

      if (!baseId || !tableId) {
        console.error("[TinyTable Embed Wrapper] create_sheet response:", sheetRes?.data);
        sendMessageRef.current?.({ event: "saveFailed", data: { error: "Failed to create table" } });
        return;
      }

      // Step 2: Add AI-generated fields (create_sheet only creates one default field)
      if (firstTable.fields.length > 0) {
        const fieldPayload = firstTable.fields.map((f) => ({
          name: f.name,
          type: String(f.type),
          ...(f.options && { options: f.options }),
        }));
        await createMultipleFields({ baseId, tableId, viewId, fields_payload: fieldPayload });
      }

      // baseId IS the Heimdall asset ID — TinyTable backend created it
      sendMessageRef.current?.({
        event: "assetCreated",
        data: { assetId: baseId, name: tableName, workspaceId: wsId },
      });
    } catch (err: any) {
      console.error("[TinyTable Embed Wrapper] Save failed:", err);
      sendMessageRef.current?.({ event: "saveFailed", data: { error: err.message || "Save failed" } });
    }
  }, [tableData.tables]);

  const handleHeaderSave = useCallback(async () => {
    setIsSaving(true);
    await handleSave({
      action: "save",
      name: tableName,
      workspaceId: authDataRef.current.workspaceId,
      parentId: authDataRef.current.parentId,
    });
    setIsSaving(false);
  }, [handleSave, tableName]);

  const handlers: EmbedMessageHandlers = {
    onAuth: handleAuth,
    onLoadTable: handleLoadTable,
    onUpdateTable: handleUpdateTable,
    onSetTheme: handleSetTheme,
    onSetMode: handleSetMode,
    onSave: handleSave,
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

  console.log("[TinyTable EmbedWrapper] Render", {
    status,
    isAuthenticated,
    tableName,
    isSaving,
    tableCount: tableData.tables.length,
    activeTableId: tableData.activeTableId,
    isWaitingForData,
  });

  // --- Render ---

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Header with table name + save button (only when authenticated) */}
      {isAuthenticated && (
        <header className="flex items-center justify-between px-4 h-[48px] border-b border-border/40 flex-shrink-0 bg-background">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm truncate max-w-[20rem]">
              {tableName}
            </span>
          </div>
          <button
            onClick={handleHeaderSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-full h-8 px-5 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </header>
      )}

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
