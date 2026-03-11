# Real-time & WebSocket Rules
**CURSOR: TECH-WS-001 through TECH-WS-004**

## TECH-WS-001: WebSocket Event Architecture (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `backend/src/gateway/`

### Purpose
Enforce event-driven real-time architecture for collaborative features.

### WebSocket Gateway Pattern

```typescript
// CURSOR: TECH-WS-001 - Gateway Pattern

import { WebSocketGateway, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  adapter: redisIoAdapter,  // Redis for multiple servers
})
export class GridGateway {
  constructor(
    private recordService: RecordService,
    private logger: LoggerService,
  ) {}

  // ✅ Handle user connection
  handleConnection(socket: Socket) {
    this.logger.log(`User connected: ${socket.id}`);
    // User joins default room
    socket.join('connected-users');
  }

  // ✅ Handle disconnection
  handleDisconnect(socket: Socket) {
    this.logger.log(`User disconnected: ${socket.id}`);
    socket.leave('connected-users');
  }

  // ✅ Listen for specific event
  @SubscribeMessage('grid:join-table')
  async handleJoinTable(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { tableId: string },
  ) {
    // 1. Validate user has access
    const user = await this.extractUser(socket);
    const hasAccess = await this.checkAccess(user.id, data.tableId);
    
    if (!hasAccess) {
      socket.emit('error', { message: 'Access denied' });
      return;
    }

    // 2. Join table room
    socket.join(`table:${data.tableId}`);
    
    // 3. Notify others in room
    this.server.to(`table:${data.tableId}`).emit('user:joined', {
      userId: user.id,
      userName: user.name,
    });

    this.logger.debug(`User ${user.id} joined table ${data.tableId}`);
  }

  // ✅ Handle record creation event
  @SubscribeMessage('record:create')
  async handleCreateRecord(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dto: CreateRecordDTO,
  ) {
    try {
      const user = await this.extractUser(socket);
      
      // 1. Create record
      const record = await this.recordService.create(dto, user.id);
      
      // 2. Broadcast to all users in table
      this.server.to(`table:${dto.tableId}`).emit('record:created', {
        record,
        userId: user.id,
        timestamp: new Date(),
      });
      
      // 3. Send confirmation back to sender
      socket.emit('record:created:ack', { recordId: record.id });
      
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  // ✅ Handle bulk updates
  @SubscribeMessage('records:batch-update')
  async handleBatchUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { tableId: string; updates: Record<string, any>[] },
  ) {
    const user = await this.extractUser(socket);
    
    // Wrapped in transaction
    const results = await this.recordService.batchUpdate(
      data.tableId,
      data.updates,
      user.id
    );
    
    // Broadcast changes
    this.server.to(`table:${data.tableId}`).emit('records:updated', {
      updates: results,
      userId: user.id,
    });
  }

  private async extractUser(socket: Socket): Promise<User> {
    // Extract from JWT token
    const token = socket.handshake.auth.token;
    return this.jwtService.verify(token);
  }
}
```

---

## TECH-WS-002: Event Naming & Structure (CRITICAL)
**Priority:** CRITICAL | Status: Baseline

### Event Naming Convention

```typescript
// CURSOR: TECH-WS-002 - Event Names

// Pattern: {resource}:{action}

// Resource Events
'record:created'        // ← CREATE
'record:updated'        // ← UPDATE
'record:deleted'        // ← DELETE
'record:restored'       // ← RESTORE

// Grid Events
'grid:column-resized'   // ← Column width changed
'grid:row-resized'      // ← Row height changed
'grid:cell-edited'      // ← Cell value changed
'grid:selection-changed' // ← Selection changed

// User Events
'user:joined'           // ← User entered table
'user:left'             // ← User left table
'user:cursor-moved'     // ← Cursor position changed

// Error Events
'error'                 // ← Generic error
'error:permission'      // ← Access denied
'error:conflict'        // ← Conflict (concurrent edit)
```

### Event Payload Structure

```typescript
// CURSOR: TECH-WS-002 - Payload Structure

// ✅ GOOD - Consistent structure
{
  // Always include resource ID
  recordId: 'abc123',
  tableId: 'table1',
  
  // Include user who made change
  userId: 'user1',
  
  // Include timestamp
  timestamp: 2024-01-15T10:30:00Z,
  
  // Actual data
  data: {
    cellValues: { field1: 'value' },
    status: 'active',
  },
  
  // Metadata
  source: 'user_action',  // vs 'system', 'import'
}

// ❌ BAD - Inconsistent
{
  record: { id: 'abc123', value: 'x' },
  user: 'user1',
  // Missing timestamp, source
}
```

---

## TECH-WS-003: Room Management (CRITICAL)
**Priority:** CRITICAL | Status: Baseline

### Room Pattern

```typescript
// CURSOR: TECH-WS-003 - Rooms

// ✅ Table-specific room (users editing same table)
socket.join(`table:${tableId}`);

// ✅ Broadcast to table
server.to(`table:${tableId}`).emit('record:updated', data);

// ✅ Broadcast to all EXCEPT sender
socket.broadcast.to(`table:${tableId}`).emit('event', data);

// ✅ User-specific room (only that user)
socket.join(`user:${userId}`);
socket.emit('notification:sent');  // Direct to user

// ✅ Base-specific (for base-level events)
socket.join(`base:${baseId}`);

// ✅ Leave room
socket.leave(`table:${tableId}`);
```

### Room Cleanup

```typescript
// CURSOR: TECH-WS-003 - Cleanup

@SubscribeMessage('table:leave')
handleLeaveTable(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: { tableId: string }
) {
  socket.leave(`table:${data.tableId}`);
  
  // Notify others user left
  socket.broadcast.to(`table:${data.tableId}`).emit('user:left', {
    userId: socket.id,
  });
}

// On disconnect, clean up all rooms
handleDisconnect(socket: Socket) {
  socket.rooms.forEach(room => {
    if (room !== socket.id) {
      socket.leave(room);
    }
  });
}
```

---

## TECH-WS-004: Conflict Resolution (HIGH)
**Priority:** HIGH | Status: Baseline

### Optimistic Updates with Rollback

```typescript
// CURSOR: TECH-WS-004 - Optimistic Updates

// Frontend: Assume success
async updateCell(recordId: string, fieldId: string, value: any) {
  // 1. Store old value
  const oldValue = this.grid.getCellValue(recordId, fieldId);
  
  // 2. Immediately update UI (optimistic)
  this.grid.setCellValue(recordId, fieldId, value);
  
  // 3. Send to server
  this.socket.emit('grid:cell-edit', {
    recordId,
    fieldId,
    value,
  });
  
  // 4. Wait for confirmation
  // If error, rollback
  socket.on('grid:cell-edited:error', (error) => {
    this.grid.setCellValue(recordId, fieldId, oldValue);
    showError(error.message);
  });
}

// Backend: Validate and send confirmation or error
@SubscribeMessage('grid:cell-edit')
async handleCellEdit(
  @ConnectedSocket() socket: Socket,
  @MessageBody() data: CellEditDTO,
) {
  try {
    const result = await this.recordService.updateCell(
      data.recordId,
      data.fieldId,
      data.value,
    );
    
    // Broadcast success
    server.to(`table:${result.tableId}`).emit('grid:cell-edited', {
      recordId: data.recordId,
      fieldId: data.fieldId,
      value: result.value,  // Potentially transformed value
      userId: user.id,
    });
    
  } catch (error) {
    // Send error to original requester
    socket.emit('grid:cell-edited:error', {
      message: error.message,
      code: 'INVALID_VALUE',
    });
  }
}
```

### Conflict Detection

```typescript
// CURSOR: TECH-WS-004 - Conflict Handling

// When multiple users edit same cell
@SubscribeMessage('grid:cell-edit')
async handleCellEdit(socket: Socket, data: CellEditDTO) {
  const record = await this.recordService.getRecord(data.recordId);
  
  // Check version (optimistic locking)
  if (record.version !== data.expectedVersion) {
    // Conflict! User editing stale data
    socket.emit('error:conflict', {
      message: 'Record was updated by another user',
      currentValue: record[data.fieldId],
      code: 'CONCURRENT_EDIT',
    });
    return;
  }
  
  // No conflict, proceed
  await this.recordService.updateCell(data.recordId, data.fieldId, data.value);
}
```

---

## Acceptance Criteria (All WebSocket Rules)

- [ ] WebSocket events follow naming convention
- [ ] Event payloads include: id, userId, timestamp
- [ ] Room management for isolation
- [ ] Proper cleanup on disconnect
- [ ] Error events emitted on failures
- [ ] Optimistic updates with rollback
- [ ] Conflict detection implemented
- [ ] Redis adapter for multi-server
- [ ] JWT validation for connections
- [ ] No unauthed events processed

