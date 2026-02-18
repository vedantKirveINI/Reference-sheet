# Socket.IO Knowledge Base - Sheets Implementation

This document serves as a reference for implementing real-time sync in the reference-sheet project, based on the `sheets` and `sheets-backend` implementations.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Connection Setup](#connection-setup)
3. [Room Management](#room-management)
4. [Client Events (Frontend → Backend)](#client-events-frontend--backend)
5. [Server Events (Backend → Frontend)](#server-events-backend--frontend)
6. [Table Switching & Room Lifecycle](#table-switching--room-lifecycle)
7. [Data Flow Patterns](#data-flow-patterns)
8. [Error Handling](#error-handling)

---

## Architecture Overview

### Key Concepts

- **Sheet (Base)**: Top-level container that can have multiple tables
- **Table**: Contains records (rows) and fields (columns)
- **View**: Filtered/sorted representation of a table
- **Room**: Socket.io room identified by `tableId` - all users editing the same table join the same room

### Connection Pattern

```typescript
// Frontend: Singleton Socket Instance
const socket = io(BACKEND_URL, {
  transports: ["websocket", "webtransport", "polling"],
  query: { token: window.accessToken },
  timeout: 10000,
});

// Backend: WebSocket Gateway with JWT Auth
@WebSocketGateway({ cors: { origin: '*' } })
@UseGuards(WsJwtGuard)
export class GatewayService
```

---

## Connection Setup

### Frontend Connection

**File**: `sheets/src/websocket/client.js`

```javascript
// Singleton pattern - one socket instance per app
const getSocketInstance = () => {
	if (!socketInstance) {
		const token = window.accessToken;
		socketInstance = io(BACKEND_URL, {
			transports: ["websocket", "webtransport", "polling"],
			query: { token },
			timeout: 10000,
		});
	}
	return socketInstance;
};
```

### Backend Authentication

**File**: `sheets-backend/src/auth/ws-jwt.guard.ts`

- Token extracted from `handshake.query.token`
- Token validated and user data merged into `client.data`
- All events require valid JWT token

---

## Room Management

### Join Room

**Event**: `joinRoom`

**Client Emit**:

```typescript
socket.emit("joinRoom", tableId); // tableId is the room identifier
```

**Server Handler**:

```typescript
@SubscribeMessage('joinRoom')
async handleJoinRoom(client: Socket, roomId: string) {
  client.join(roomId);
  // Client now receives all events broadcast to this room
}
```

**When to Join**:

- On socket `connect` event
- When switching to a new table
- When `tableId` changes in URL

### Leave Room

**Event**: `leaveRoom`

**Client Emit**:

```typescript
socket.emit("leaveRoom", tableId);
```

**Server Handler**:

```typescript
@SubscribeMessage('leaveRoom')
handleLeaveRoom(clientSocket: Socket, roomId: string) {
  clientSocket.leave(roomId);
}
```

**When to Leave**:

- Before switching to a different table
- On component unmount
- When navigating away from table

### Automatic Cleanup

**Backend**: On disconnect, server automatically removes client from all rooms:

```typescript
handleDisconnect(client: Socket) {
  const rooms = Array.from(client.rooms).filter((room) => room !== client.id);
  for (const room of rooms) {
    client.leave(room);
  }
}
```

---

## Client Events (Frontend → Backend)

### 1. `getRecord` - Fetch Table Data

**Purpose**: Request records and fields for a table/view

**Payload**:

```typescript
{
	tableId: string; // Table ID
	baseId: string; // Sheet/Base ID
	viewId: string; // View ID
	should_stringify: boolean; // Whether to stringify data
}
```

**Example**:

```typescript
socket.emit("getRecord", {
	tableId: "table_123",
	baseId: "base_456",
	viewId: "view_789",
	should_stringify: true,
});
```

**Response Event**: `recordsFetched`

**When to Use**:

- On initial table load
- After joining a room
- When view changes

---

### 2. `row_update` - Update Cell Values

**Purpose**: Update one or more cell values in records

**Payload**:

```typescript
{
	tableId: string;
	baseId: string;
	viewId: string;
	column_values: Array<{
		row_id: string; // Record ID
		order: number; // Row order (for sorting)
		fields_info: Array<{
			field_id: string; // Field/Column ID
			data: any; // New cell value
		}>;
	}>;
}
```

**Example**:

```typescript
socket.emit("row_update", {
	tableId: "table_123",
	baseId: "base_456",
	viewId: "view_789",
	column_values: [
		{
			row_id: "record_001",
			order: 1,
			fields_info: [{ field_id: "field_abc", data: "New Value" }],
		},
	],
});
```

**Response Event**: `updated_row` (broadcast to all users in room)

**Notes**:

- Groups multiple cell changes by `row_id`
- Skips formula fields (they're computed, not editable)
- Includes `socket_id` in response to prevent echo

---

### 3. `row_create` - Create New Row

**Purpose**: Insert a new row/record

**Payload**:

```typescript
{
  tableId: string;
  baseId: string;
  viewId: string;
  fields_info: Array<{
    field_id: string;
    data: any;
  }>;  // Optional initial values
  order_info?: {              // Optional: position in table
    is_above: boolean;        // Insert above or below
    __id: string;             // Reference row ID
    order: number;             // Reference row order
  };
}
```

**Example**:

```typescript
socket.emit("row_create", {
	tableId: "table_123",
	baseId: "base_456",
	viewId: "view_789",
	fields_info: [],
	order_info: {
		is_above: true,
		__id: "record_001",
		order: 1,
	},
});
```

**Response Event**: `created_row` (broadcast to all users in room)

---

### 4. `update_record_orders` - Reorder Rows

**Purpose**: Change the order of rows (drag & drop)

**Payload**:

```typescript
{
	tableId: string;
	baseId: string;
	viewId: string;
	moved_rows: Array<{
		__id: string; // Record ID being moved
	}>;
	order_info: {
		is_above: boolean; // Insert above or below target
		__id: string; // Target row ID
		order: number; // Target row order
	}
}
```

**Example**:

```typescript
socket.emit("update_record_orders", {
	tableId: "table_123",
	baseId: "base_456",
	viewId: "view_789",
	moved_rows: [{ __id: "record_001" }, { __id: "record_002" }],
	order_info: {
		is_above: false,
		__id: "record_003",
		order: 5,
	},
});
```

**Response Event**: `updated_record_orders`

---

### 5. `update_field_order` - Reorder Columns

**Purpose**: Change the order of columns/fields

**Payload**:

```typescript
{
	tableId: string;
	baseId: string;
	viewId: string;
	fields: Array<{
		field_id: string;
		order: number; // New order value
		previous_index: number; // Old column index
		current_index: number; // New column index
	}>;
}
```

**Example**:

```typescript
socket.emit("update_field_order", {
	tableId: "table_123",
	baseId: "base_456",
	viewId: "view_789",
	fields: [
		{
			field_id: "field_abc",
			order: 0.5,
			previous_index: 2,
			current_index: 0,
		},
	],
});
```

**Response Event**: `recordsFetched` (full table refresh with new column order)

---

### 6. `update_column_meta` - Update Column Metadata

**Purpose**: Update column width, text wrap, or other visual properties

**Payload**:

```typescript
{
	tableId: string;
	baseId: string;
	viewId: string;
	columnMeta: Array<{
		id: string; // Field ID
		width?: number; // Column width in pixels
		text_wrap?: string; // "wrap" | "ellipses" | "clip"
	}>;
}
```

**Example**:

```typescript
socket.emit("update_column_meta", {
	tableId: "table_123",
	baseId: "base_456",
	viewId: "view_789",
	columnMeta: [
		{
			id: "field_abc",
			width: 200,
			text_wrap: "wrap",
		},
	],
});
```

**Response Event**: `updated_column_meta` (broadcast to all users in room)

**Notes**:

- Includes `socket_id` in response to prevent sender from re-rendering

---

## Server Events (Backend → Frontend)

### 1. `recordsFetched` - Table Data Received

**Purpose**: Receive full table data (records + fields)

**Payload**:

```typescript
{
	records: Array<{
		__id: string; // Record ID
		__status: string; // "active" | "inactive"
		[dbFieldName]: any; // Cell values keyed by field dbFieldName
	}>;
	fields: Array<{
		id: string; // Field ID
		name: string; // Field name
		type: string; // Field type (STRING, NUMBER, etc.)
		dbFieldName: string; // Database field name
		order: number; // Display order
		// ... other field properties
	}>;
}
```

**When Received**:

- After `getRecord` request
- After column reorder (`update_field_order`)
- After filter/sort changes

**Handler Example**:

```typescript
socket.on("recordsFetched", (data) => {
	const { records, fields } = data;
	// Update table with new data
	hotTableRef.current.hotInstance.loadData(records);
	setDataReceived({ records, fields });
});
```

---

### 2. `updated_row` - Cell Value Updated

**Purpose**: Receive cell update from another user

**Payload**:

```typescript
Array<{
	row_id: string;
	fields_info: Array<{
		field_id: string;
		data: any; // Updated cell value
	}>;
	enrichedFieldId?: string; // If enrichment field was updated
	socket_id: string; // Sender's socket ID (to prevent echo)
}>;
```

**When Received**:

- After another user updates a cell
- After `row_update` is processed by server

**Handler Example**:

```typescript
socket.on("updated_row", (updatedRows) => {
	// Skip if this update came from us
	if (updatedRows[0]?.socket_id === socket.id) return;

	// Update cells in table
	updatedRows.forEach((rowData) => {
		const { row_id, fields_info } = rowData;
		fields_info.forEach(({ field_id, data }) => {
			// Update cell at row_id, field_id with data
		});
	});
});
```

**Notes**:

- Check `socket_id` to prevent updating UI from own changes
- Handles formula field loading states
- Handles enrichment field auto-updates

---

### 3. `created_row` - New Row Created

**Purpose**: Receive new row created by another user

**Payload**:

```typescript
Array<{
	__id: string; // New record ID
	__status: string; // "active"
	socket_id: string; // Sender's socket ID
	field_id?: string; // If created via specific field
	// ... record data
}>;
```

**When Received**:

- After another user creates a row
- After `row_create` is processed

**Handler Example**:

```typescript
socket.on("created_row", (newRows) => {
	// Skip if this came from us
	if (newRows[0]?.socket_id === socket.id) return;

	// Insert new rows into table
	newRows.forEach((record) => {
		// Insert at appropriate position
	});
});
```

---

### 4. `created_rows` - Multiple Rows Created

**Purpose**: Receive multiple new rows (bulk creation)

**Payload**: Same as `created_row`, but array of multiple records

**When Received**:

- After bulk row creation
- After import operations

---

### 5. `deleted_records` - Rows Deleted

**Purpose**: Receive notification of deleted rows

**Payload**:

```typescript
Array<{
	__id: string;
	__status: "inactive";
}>;
```

**Handler Example**:

```typescript
socket.on("deleted_records", (deletedRows) => {
	const deletedIds = deletedRows.map((row) => row.__id);
	// Remove rows from table
	const updatedRecords = records.filter(
		(record) => !deletedIds.includes(record.__id),
	);
	setDataReceived({ ...dataReceived, records: updatedRecords });
});
```

---

### 6. `created_field` - New Column Created

**Purpose**: Receive new column/field created by another user

**Payload**:

```typescript
{
	id: string; // Field ID
	name: string; // Field name
	type: string; // Field type
	dbFieldName: string; // Database field name
	order: number; // Display order
	// ... other field properties
}
```

**Handler Example**:

```typescript
socket.on("created_field", (newField) => {
	// Add new column to table
	const updatedFields = [...fields, newField];
	setDataReceived({ ...dataReceived, fields: updatedFields });
});
```

---

### 7. `created_fields` - Multiple Columns Created

**Purpose**: Receive multiple new columns (bulk creation)

**Payload**: Array of field objects (same structure as `created_field`)

---

### 8. `updated_field` - Column Settings Updated

**Purpose**: Receive column/field settings update

**Payload**:

```typescript
{
  isExpressionUpdate?: boolean;  // If formula expression changed
  updatedFields: Array<{
    id: string;
    // ... updated field properties
  }>;
}
```

**Handler Example**:

```typescript
socket.on("updated_field", (data) => {
	const { updatedFields } = data;
	// Update field properties
	const updatedFieldsList = fields.map((field) => {
		const update = updatedFields.find((uf) => uf.id === field.id);
		return update ? { ...field, ...update } : field;
	});
	setDataReceived({ ...dataReceived, fields: updatedFieldsList });
});
```

---

### 9. `deleted_fields` - Columns Deleted

**Purpose**: Receive notification of deleted columns

**Payload**:

```typescript
Array<{
	id: string;
	dbFieldName: string;
	type: string;
}>;
```

**Handler Example**:

```typescript
socket.on("deleted_fields", (deletedFields) => {
	const deletedIds = deletedFields.map((f) => f.id);
	// Remove columns from table
	const updatedFields = fields.filter(
		(field) => !deletedIds.includes(field.id),
	);
	// Remove field data from records
	const updatedRecords = records.map((record) => {
		const updated = { ...record };
		deletedFields.forEach((field) => {
			delete updated[field.dbFieldName];
		});
		return updated;
	});
	setDataReceived({ records: updatedRecords, fields: updatedFields });
});
```

---

### 10. `updated_record_orders` - Row Order Changed

**Purpose**: Receive row reorder from another user

**Payload**: Same structure as `update_record_orders` request

**Handler Example**:

```typescript
socket.on("updated_record_orders", (data) => {
	// Refresh table data to reflect new order
	// Or manually reorder rows in UI
});
```

---

### 11. `updated_column_meta` - Column Metadata Updated

**Purpose**: Receive column width/text wrap update from another user

**Payload**:

```typescript
{
	columnMeta: Array<{
		id: string; // Field ID
		width?: number;
		text_wrap?: string;
	}>;
	socket_id: string; // Sender's socket ID
}
```

**Handler Example**:

```typescript
socket.on("updated_column_meta", (data) => {
	// Skip if this came from us
	if (data.socket_id === socket.id) return;

	// Update column widths/text wrap
	data.columnMeta.forEach((meta) => {
		const columnIndex = fields.findIndex((f) => f.id === meta.id);
		if (columnIndex >= 0) {
			// Update column width
			hotTableRef.current.hotInstance
				.getPlugin("manualColumnResize")
				.setManualSize(columnIndex, meta.width);

			// Update text wrap
			if (meta.text_wrap) {
				setTextWrapped((prev) => ({
					...prev,
					[meta.id]: { text_wrap: meta.text_wrap },
				}));
			}
		}
	});
});
```

---

### 12. `filter_updated` - Filter Changed

**Purpose**: Receive view filter update

**Payload**:

```typescript
{
	filter: {
		// Filter configuration object
	}
}
```

**Handler Example**:

```typescript
socket.on("filter_updated", (data) => {
	setView((prev) => ({ ...prev, filter: data.filter }));
	// Trigger data refresh
	socket.emit("getRecord", {
		tableId,
		baseId,
		viewId,
		should_stringify: true,
	});
});
```

---

### 13. `sort_updated` - Sort Changed

**Purpose**: Receive view sort update

**Payload**:

```typescript
{
	sort: {
		sortObjs: Array<{
			field_id: string;
			direction: "asc" | "desc";
		}>;
	}
}
```

**Handler Example**:

```typescript
socket.on("sort_updated", (data) => {
	setView((prev) => ({ ...prev, sort: data.sort }));
	// Trigger data refresh
	socket.emit("getRecord", {
		tableId,
		baseId,
		viewId,
		should_stringify: true,
	});
});
```

---

### 14. `formula_field_errors` - Formula Errors

**Purpose**: Receive formula field error information

**Payload**:

```typescript
Array<{
	id: string; // Field ID
	type: string; // Field type
	computedFieldMeta: {
		hasError: boolean; // Whether formula has error
	};
}>;
```

**Handler Example**:

```typescript
socket.on("formula_field_errors", (errors) => {
	// Update fields with error information
	const updatedFields = fields.map((field) => {
		const error = errors.find((e) => e.id === field.id);
		if (error) {
			return {
				...field,
				computedFieldMeta: {
					...field.computedFieldMeta,
					hasError: error.computedFieldMeta.hasError,
				},
			};
		}
		return field;
	});
	setDataReceived({ ...dataReceived, fields: updatedFields });
});
```

---

### 15. `enrichmentRequestSent` - Enrichment Started

**Purpose**: Notify that enrichment process started

**Payload**:

```typescript
{
	id: string; // Record ID
	enrichedFieldId: string; // Field ID being enriched
}
```

**Handler Example**:

```typescript
socket.on("enrichmentRequestSent", (data) => {
	// Set loading state for enrichment field
	setCellLoading((prev) => ({
		...prev,
		[data.id]: {
			...prev[data.id],
			[data.enrichedFieldId]: true,
		},
	}));
});
```

---

### 16. `connect` - Socket Connected

**Purpose**: Socket connection established

**Handler Example**:

```typescript
socket.on("connect", async () => {
	// Join room for current table
	await socket.emit("joinRoom", tableId);

	// Fetch table data
	if (socket.connected) {
		await socket.emit("getRecord", {
			tableId,
			baseId,
			viewId,
			should_stringify: true,
		});
	}
});
```

---

### 17. `connect_error` - Connection Error

**Purpose**: Socket connection failed

**Handler Example**:

```typescript
socket.on("connect_error", (error) => {
	console.error("Socket connection error", error);
	// Show user notification
	// Attempt reconnection (handled automatically by socket.io)
});
```

---

### 18. `exception` - Server Error

**Purpose**: Server-side error occurred

**Payload**:

```typescript
{
	message: string;
	// ... error details
}
```

**Handler Example**:

```typescript
socket.on("exception", (error) => {
	console.error("Socket error:", error);
	// Show error notification to user
});
```

---

## Table Switching & Room Lifecycle

### Flow Diagram

```
1. User navigates to Table A
   ↓
2. Leave previous room (if any)
   socket.emit("leaveRoom", previousTableId)
   ↓
3. Join new room
   socket.emit("joinRoom", newTableId)
   ↓
4. Fetch table data
   socket.emit("getRecord", { tableId: newTableId, ... })
   ↓
5. Listen for real-time updates
   socket.on("updated_row", ...)
   socket.on("created_row", ...)
   etc.
```

### Implementation Example

**File**: `sheets/src/pages/WelcomeScreen/hooks/useHandsontable.js`

```javascript
const handleTabClick = async ({ tableInfo, isReplace = false }) => {
	const { id: newTableId, views } = tableInfo || {};
	const currView = views?.[0] || "";

	// 1. Leave current room
	await leaveRoom({ roomId: tableId });

	// 2. Update URL params
	const updatedParams = {
		...decodedParams,
		t: newTableId || "",
		v: currView?.id || "",
	};
	const newEncodedParams = encodeParams(updatedParams);
	setSearchParams({ q: newEncodedParams });

	// 3. Clear selection state
	checkedRowsRef.current.selectedRow = {};
	checkedRowsRef.current.checkedRowsMap.clear();
};

// Effect: Join room and fetch data when tableId changes
useEffect(() => {
	if (socket && socket.connected) {
		(async function () {
			// Join room for new table
			await socket.emit("joinRoom", tableId);

			// Fetch table data
			await socket.emit("getRecord", {
				tableId,
				baseId,
				viewId,
				should_stringify: true,
			});
			setRecordLoading(true);
		})();
	}
}, [baseId, socket, tableId, viewId]);
```

---

## Data Flow Patterns

### Pattern 1: Optimistic Updates with Echo Prevention

```typescript
// 1. User edits cell
handleCellChange(newValue) {
  // 2. Update UI immediately (optimistic)
  updateCellInUI(rowId, fieldId, newValue);

  // 3. Send to server
  socket.emit("row_update", {
    tableId,
    column_values: [{
      row_id: rowId,
      fields_info: [{ field_id: fieldId, data: newValue }]
    }]
  });
}

// 4. Receive update from server
socket.on("updated_row", (data) => {
  // 5. Skip if this update came from us (prevent echo)
  if (data[0]?.socket_id === socket.id) return;

  // 6. Update UI with server response
  updateCellInUI(data[0].row_id, data[0].fields_info[0].field_id, data[0].fields_info[0].data);
});
```

### Pattern 2: Full Refresh After Structural Changes

```typescript
// After column reorder, server sends full refresh
socket.on("recordsFetched", (data) => {
	const { records, fields } = data;
	// Reload entire table
	hotTableRef.current.hotInstance.loadData(records);
	setDataReceived({ records, fields });
});
```

### Pattern 3: Incremental Updates for Cell Changes

```typescript
// For cell updates, only update changed cells
socket.on("updated_row", (updatedRows) => {
	updatedRows.forEach((rowData) => {
		const { row_id, fields_info } = rowData;
		fields_info.forEach(({ field_id, data }) => {
			// Update only this specific cell
			const rowIndex = records.findIndex((r) => r.__id === row_id);
			const colIndex = fields.findIndex((f) => f.id === field_id);
			hotTableRef.current.hotInstance.setDataAtCell(
				rowIndex,
				colIndex,
				data,
			);
		});
	});
});
```

---

## Error Handling

### Connection Errors

```typescript
socket.on("connect_error", (error) => {
	// Log error
	console.error("Connection failed:", error);

	// Show user notification
	showAlert({
		type: "error",
		message: "Connection lost. Attempting to reconnect...",
	});

	// Socket.io automatically attempts reconnection
});
```

### Server Errors

```typescript
socket.on("exception", (error) => {
	// Log error
	console.error("Server error:", error);

	// Show user notification
	showAlert({
		type: "error",
		message: error.message || "An error occurred",
	});

	// Optionally rollback optimistic updates
});
```

### Validation Errors

- Backend validates all payloads using Zod schemas
- Invalid payloads throw `WsException`
- Frontend should handle these in `exception` event handler

---

## Key Implementation Notes

### 1. Socket ID for Echo Prevention

Always include `socket_id` in server responses and check it on client:

```typescript
// Server includes sender's socket ID
const response = updated_records.map((result) => ({
	...result,
	socket_id: clientSocket.id,
}));

// Client skips own updates
if (data.socket_id === socket.id) return;
```

### 2. Room-Based Broadcasting

All events are broadcast to the table room:

```typescript
// Server broadcasts to all users in table room
this.server.to(tableId).emit("updated_row", response);
```

### 3. Formula Field Handling

- Formula fields are **read-only** - don't send updates for them
- Formula fields show loading state while computing
- Formula errors are sent via `formula_field_errors` event

### 4. Enrichment Field Auto-Update

- Enrichment fields can auto-update when identifier fields change
- Check `autoUpdate` flag and required identifiers
- Set loading state when enrichment is triggered

### 5. View-Level vs Table-Level

- **Table-level**: Records, fields, row order
- **View-level**: Filters, sorts, column order, column metadata (width, text wrap)

### 6. Record Ordering

- Records have an `order` field for custom sorting
- Row moves update `order` values
- Order is preserved across views

---

## Migration Checklist for Reference-Sheet

When implementing real-time sync in reference-sheet:

- [ ] Create WebSocketManager class with connection management
- [ ] Implement room join/leave logic
- [ ] Add event handlers for all server events
- [ ] Implement echo prevention using socket_id
- [ ] Add optimistic updates for cell changes
- [ ] Handle formula field loading states
- [ ] Implement column metadata sync (width, text wrap)
- [ ] Add error handling and reconnection logic
- [ ] Integrate with GridView component
- [ ] Add offline queue for pending updates
- [ ] Implement conflict resolution
- [ ] Add presence indicators (future)

---

## References

- **Frontend Socket Client**: `sheets/src/websocket/client.js`
- **Frontend Event Handlers**: `sheets/src/pages/WelcomeScreen/components/Handsontable/hooks/useSocketEvents.js`
- **Backend Gateway**: `sheets-backend/src/gateway/gateway.service.ts`
- **Backend Auth**: `sheets-backend/src/auth/ws-jwt.guard.ts`
- **Table Switching**: `sheets/src/pages/WelcomeScreen/hooks/useHandsontable.js`



