# Phase 9: Real-time Sync
**HIGH | Duration: 2-3 days | Status: Not Started**

## 🎯 Phase Overview

Real-time collaboration:
- ✅ WebSocket connection
- ✅ Cell update events
- ✅ Column/row operations sync
- ✅ User presence
- ✅ Conflict resolution
- ✅ Offline support (queue)
- ✅ Undo/Redo with sync

---

## 📚 Reference Analysis

### How Teable Does It
- ShareDB for real-time sync
- Operational Transformation
- Event-driven updates
- Presence indicators
- Offline queue

### How Old Frontend Does It
- Socket.io for WebSocket
- Event emitters for state updates
- Real-time table sync

**What to Keep:**
- Socket.io for WebSocket
- Event-driven updates
- Room-based communication

---

## 🛠️ Implementation

### WebSocket Architecture

```typescript
interface IGridEvent {
  type: 'cell-update' | 'row-added' | 'column-resized' | 'cell-styled';
  payload: any;
  userId: string;
  timestamp: number;
  version: number;
}

interface IPresenceData {
  userId: string;
  userName: string;
  activeCell?: { row: number; col: number };
  color: string;
}
```

### Events

```
grid:cell-updated      → { row, col, value, userId }
grid:row-added         → { rowIndex, recordId }
grid:column-resized    → { col, width }
grid:cell-styled       → { row, col, style }
grid:user-joined       → { userId, userName }
grid:user-left         → { userId }
grid:presence-update   → { userId, activeCell }
```

---

## 📋 Rules Checklist

- [ ] **TECH-WS-001** - WebSocket event architecture
- [ ] WebSocket connected
- [ ] Events received & processed
- [ ] UI updates in real-time
- [ ] Conflicts handled
- [ ] No duplicates
- [ ] Offline queue working
- [ ] User presence shown

---

## 🚀 Implementation Prompt

```
## Build Real-time Sync (Phase 9)

Real-time WebSocket synchronization with conflict resolution.

### Context:
After Phase 8 (views), now add real-time collaboration.
- Multi-user editing
- Conflict-free updates
- Presence indicators
- Offline queue

### Key Requirements:
- WebSocket connection (Socket.io)
- Cell update events
- Column/row operations sync
- User presence tracking
- Conflict resolution
- Offline queue
- Version tracking
- No TypeScript errors

### Reference Files:
FROM TEABLE:
- ShareDB patterns
- Operational Transformation

FROM OLD FRONTEND:
- Socket.io client setup
- Event emitters
- Real-time updates

### Task: Build Real-time System

1. **WebSocketManager**
   - Connect to backend
   - Listen for events
   - Emit events
   - Handle reconnection

2. **Event Handlers**
   - Process cell-updated
   - Process row-added
   - Process column-resized
   - Process cell-styled
   - Process presence updates

3. **OfflineQueue**
   - Queue events when offline
   - Send on reconnect
   - Avoid duplicates

4. **Conflict Resolution**
   - Last-write-wins for cells
   - Operational Transformation for conflicts
   - Version tracking

5. **Presence Indicator**
   - Show active users
   - Show active cell per user
   - Color coding per user

### Acceptance Criteria:
- [ ] WebSocket connects
- [ ] Events sync
- [ ] Multiple users sync
- [ ] No duplicates
- [ ] Conflicts resolved
- [ ] Offline queue works
- [ ] Presence shows
- [ ] Reconnect works
```

---

## ✅ Acceptance Criteria

- [ ] Real-time sync works
- [ ] Multiple users sync
- [ ] Conflicts resolved
- [ ] No data loss
- [ ] Offline queue works
- [ ] User presence shown

## 📌 Next Phase

→ **Move to Phase 10: Forms UI**
