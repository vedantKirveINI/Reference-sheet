export interface UserJoinedEvent {
  type: "user_joined";
  userId: string;
  userName: string;
  color: string;
}

export interface UserLeftEvent {
  type: "user_left";
  userId: string;
}

export interface CellChangedEvent {
  type: "cell_changed";
  userId: string;
  recordId: string;
  columnId: string;
  newValue: any;
}

export interface CursorMovedEvent {
  type: "cursor_moved";
  userId: string;
  row: number;
  col: number;
}

export interface SelectionChangedEvent {
  type: "selection_changed";
  userId: string;
  selection: {
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  };
}

export type CollaborationEvent =
  | UserJoinedEvent
  | UserLeftEvent
  | CellChangedEvent
  | CursorMovedEvent
  | SelectionChangedEvent;

export class CollaborationService {
  private _connected = false;
  private _listeners: Map<string, Function[]> = new Map();
  tableId: string | null = null;
  userId: string | null = null;

  connect(tableId: string, userId: string): void {
    console.log(`[CollaborationService] Connecting to table "${tableId}" as user "${userId}"`);
    this.tableId = tableId;
    this.userId = userId;
    this._connected = true;
    console.log("[CollaborationService] Connected (stub)");
  }

  disconnect(): void {
    console.log("[CollaborationService] Disconnecting...");
    this._connected = false;
    this.tableId = null;
    this.userId = null;
    this._listeners.clear();
    console.log("[CollaborationService] Disconnected (stub)");
  }

  sendCellChange(recordId: string, columnId: string, value: any): void {
    console.log(`[CollaborationService] Cell change: record=${recordId}, column=${columnId}, value=`, value);
  }

  sendCursorPosition(row: number, col: number): void {
    console.log(`[CollaborationService] Cursor moved: row=${row}, col=${col}`);
  }

  onEvent(event: string, callback: Function): void {
    const existing = this._listeners.get(event) ?? [];
    existing.push(callback);
    this._listeners.set(event, existing);
    console.log(`[CollaborationService] Registered listener for "${event}"`);
  }

  isConnected(): boolean {
    return this._connected;
  }
}

export const collaborationService = new CollaborationService();
