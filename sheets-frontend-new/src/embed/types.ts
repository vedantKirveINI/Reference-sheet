/**
 * TinyTable Embed – Type definitions
 *
 * Defines the postMessage protocol and data structures used for
 * embedding TinyTable previews inside host applications (e.g. AI Builder).
 */

import { CellType } from "@/types/cell";

// ---------------------------------------------------------------------------
// PostMessage protocol – inbound (host → embed)
// ---------------------------------------------------------------------------

export interface EmbedSetAuthMessage {
  action: "setAuth";
  mode: "stub" | "authenticated";
  token?: string;
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  serverConfig?: {
    apiServer?: string;
    socketServer?: string;
  };
}

export interface EmbedTableField {
  id: string;
  name: string;
  type: CellType;
  options?: Record<string, unknown>;
}

export interface EmbedTableDefinition {
  id: string;
  name: string;
  fields: EmbedTableField[];
  sampleRecords?: Record<string, unknown>[];
}

export interface EmbedLoadTableMessage {
  action: "loadTable";
  data: {
    tables: EmbedTableDefinition[];
    activeTableId?: string;
  };
}

export interface EmbedUpdateTableMessage {
  action: "updateTable";
  data: {
    /** Update a specific table; if omitted, updates the active table. */
    tableId?: string;
    /** Replace or merge fields. */
    fields?: EmbedTableField[];
    /** Replace or merge sample records. */
    sampleRecords?: Record<string, unknown>[];
  };
}

export interface EmbedSetThemeMessage {
  action: "setTheme";
  theme: {
    mode?: "light" | "dark";
    primaryColor?: string;
    accentColor?: string;
  };
}

export interface EmbedSetModeMessage {
  action: "setMode";
  mode: "preview" | "edit" | "readonly";
}

export type EmbedInboundMessage =
  | EmbedSetAuthMessage
  | EmbedLoadTableMessage
  | EmbedUpdateTableMessage
  | EmbedSetThemeMessage
  | EmbedSetModeMessage;

// ---------------------------------------------------------------------------
// PostMessage protocol – outbound (embed → host)
// ---------------------------------------------------------------------------

export interface EmbedReadyEvent {
  event: "ready";
}

export interface EmbedAuthConfiguredEvent {
  event: "authConfigured";
  mode: "stub" | "authenticated";
}

export interface EmbedTableLoadedEvent {
  event: "tableLoaded";
  tableCount: number;
  activeTableId: string;
}

export interface EmbedTableUpdatedEvent {
  event: "tableUpdated";
  tableId: string;
  fieldCount: number;
  recordCount: number;
}

export interface EmbedErrorEvent {
  event: "error";
  message: string;
  recoverable: boolean;
}

export type EmbedOutboundEvent =
  | EmbedReadyEvent
  | EmbedAuthConfiguredEvent
  | EmbedTableLoadedEvent
  | EmbedTableUpdatedEvent
  | EmbedErrorEvent;

// ---------------------------------------------------------------------------
// Internal embed state
// ---------------------------------------------------------------------------

export type EmbedStatus =
  | "initializing"
  | "waiting-for-auth"
  | "authenticated"
  | "loading-table"
  | "loaded"
  | "error";
