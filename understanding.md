# TinyTable — Complete Product Understanding

## What Is TinyTable?

TinyTable is a **cloud-based collaborative spreadsheet/database application** — think Airtable meets Google Sheets with AI superpowers. It goes beyond traditional spreadsheets by offering multiple views (Kanban, Calendar, Gallery, Gantt, Form, List), AI-powered data enrichment, AI-generated columns, real-time collaboration, and an embeddable architecture.

**Target Users:** Business users, data analysts, and teams needing flexible structured data management with AI capabilities.

**Core Value:** A spreadsheet that's also a database — with multiple views of the same data, AI enrichment, real-time collaboration, and embeddability into other apps.

---

## Tech Stack

### Frontend (`sheets-frontend-new`)
- **React 18.3** + TypeScript + **Vite 6** (port 5000)
- **Zustand** for state management
- **Socket.IO** client for real-time updates
- **Radix UI** + **Tailwind CSS 4** for UI
- **React Router v7** for routing
- **React Hook Form** + **Zod** for validation
- **Axios** for HTTP
- **Custom canvas-based grid** rendering (Excel-like)
- **react-markdown** for markdown support
- **xlsx** library for export
- **i18next** for internationalization
- **react-dropzone** for file uploads
- **dayjs** for dates, **lodash** for utilities

### Backend (`sheets-backend`)
- **NestJS 10** + TypeScript (port 4545, actual NestJS on 3000)
- **PostgreSQL** with **Prisma ORM v5.22**
- **Socket.IO** server with **Redis Streams** adapter
- **Bull** (BullMQ) for async job queue with BullBoard UI
- **JWT** token authentication
- **Winston** for logging
- **New Relic** for APM
- Custom internal SDKs (asset, user, flow-utility, fx-validator, utility)
- **papaparse** + **csv-parser** for CSV handling

### AI Service (`ai-service`)
- **Express** + TypeScript (port 3001)
- **OpenAI API** integration
- Data enrichment, prompt engineering, data querying

### Infrastructure
- **PostgreSQL** — Main data store
- **Redis** — WebSocket stream adapter, caching, Bull queue backend
- **New Relic** — Monitoring

---

## Data Hierarchy

```
Space (workspace)
  └── Base (project/sheet)
      ├── Table (data table with schema)
      │   ├── Fields (columns with types and options)
      │   │   ├── Column metadata (width, visibility, order per view)
      │   │   └── Options (field-specific: decimal places, date format, etc.)
      │   └── Records (rows)
      │       └── Cells (field values with type-specific data)
      └── Views (different perspectives on same table)
          ├── Grid view (default)
          ├── Kanban view
          ├── Calendar view
          ├── Gallery view
          ├── Gantt view
          ├── Form view
          └── List view
```

---

## Field Types (30+)

### Text
- **String** — Short text
- **LongText** — Multi-line text
- **Email** — Email addresses
- **PhoneNumber** — Phone numbers
- **ZipCode** — Postal codes

### Numbers
- **Number** — Numeric values (configurable decimals)
- **Currency** — Money with currency symbol

### Selection
- **SingleSelect (SCQ)** — Pick one from predefined options
- **MultiSelect (MCQ)** — Pick multiple from predefined options
- **Dropdown** — Dropdown selector
- **YesNo** — Boolean toggle

### Date & Time
- **DateTime** — Full date+time
- **Date/Time** — Separate date or time
- **Time** — Time only

### Advanced Input
- **Address** — Full address
- **Signature** — Digital signature capture
- **Rating** — Star/number rating
- **Slider** — Range slider
- **Ranking** — Ordered ranking
- **OpinionScale** — Scale rating
- **FileUpload** — File attachments

### Relational
- **Link** — Foreign key to other records
- **Lookup** — Pull data from linked records
- **Rollup** — Aggregate data from linked records (sum, count, avg, etc.)

### Computed
- **Formula** — Excel-like expressions with dependency tracking
- **Enrichment** — AI-powered external data (company/person lookup)
- **AiColumn** — AI-generated values based on other columns

### System (Auto-Managed)
- **CreatedTime** — Record creation timestamp
- **CreatedBy** — Who created the record
- **LastModifiedBy** — Who last edited
- **LastModifiedTime** — When last edited
- **AutoNumber** — Auto-incrementing ID
- **ID** — Unique identifier

### Other
- **Button** — Action trigger buttons

---

## Multiple Views (Same Data, Different Presentations)

### Grid View (Default)
Traditional spreadsheet — rows, columns, infinite scrolling, column resizing, cell editing

### Kanban View
Cards organized by a status/category column, drag-and-drop between groups

### Calendar View
Events plotted on a calendar by date field

### Gallery View
Card/thumbnail view — ideal for visual data (images, profiles)

### Gantt View
Timeline/project view for date ranges and task dependencies

### Form View
Single-record form for data entry

### List View
Simplified list display

---

## Data Operations

### Sorting
Multiple sort rules, manual sort, per-view configuration

### Filtering
Complex filters with AND/OR logic, multiple operators per field type

### Grouping
Group by field with hierarchical display and collapsible sections

### Column Metadata (Per View)
Width, visibility, color, order — each view can show/hide and reorder columns independently

### Search
Cell-level search and filter across all data

### Conditional Formatting
Color cells and rows based on conditions

---

## AI Capabilities

### Data Enrichment
- Create an enrichment field (e.g., entity type "company")
- Trigger bulk enrichment on records
- AI fetches external data (company info, person data, etc.)
- Results stored in enrichment-type cells

### AI Column
- Define an AI-generated column with a prompt referencing other columns
- AI automatically fills values based on existing data
- Example: "Summarize the feedback in column A" → AI generates summaries

### AI Chat Interface
- Interactive AI assistant for data insights
- Ask questions about your data
- Perform operations via natural language
- Get analytics and summaries

---

## Real-Time Collaboration

### WebSocket Events (Socket.IO + Redis Streams)
```
emit_get_records          — New records fetched
emit_created_rows         — Rows created (bulk)
emitCreatedRow            — Single row created
emitUpdatedRecord         — Row updated
emit_deleted_records      — Rows deleted
emitCreatedField          — Field/column created
emit_updated_field        — Field updated
emit_deleted_fields       — Fields deleted
emit_filter_updated       — Filter changed
emit_sort_updated         — Sort changed
emit_group_by_updated     — Grouping changed
emit_updated_column_meta  — Column metadata changed
emitEnrichmentRequestSent — Enrichment started
recalc.broadcastChanges   — Formula/computed field updates
```

All changes broadcast to other users in real-time.

---

## Data Streams & Automation

### Webhook Integration
- Create data streams on tables
- Configure webhook URLs for event triggers
- Events trigger when records are created/updated/deleted

### Time-Based Triggers
- Schedule triggers on date fields
- Types: BEFORE, EXACT, AFTER (with offset in minutes)
- States: PENDING → PROCESSING → FIRED (or FAILED/CANCELLED)
- Automatic retry logic

---

## Embed Mode (iframe + postMessage)

TinyTable can be embedded in other apps (e.g., AI Builder).

### Embed Flow
1. Host app loads TinyTable at `/embed` route
2. Iframe sends `ready` event to parent
3. Parent sends `setAuth` with token and server config
4. Parent sends `loadTable` with table schema and sample data
5. Embedded app renders read-only table preview with tab bar
6. Parent sends `updateTable` to refresh data

### Message Protocol
**Inbound (Parent → TinyTable):**
- `setAuth` — Authenticate with token
- `loadTable` — Provide table schema + records
- `updateTable` — Refresh data
- `setTheme` — Theme customization (prepared)
- `setMode` — Read-only vs edit (prepared)

**Outbound (TinyTable → Parent):**
- `ready` — Signals embed is ready
- `authConfigured` — Auth received
- `tableLoaded` — Data loaded
- `tableUpdated` — Data refreshed

### State Machine
`initializing` → `waiting-for-auth` → `authenticated` → `loaded`

Message queue buffers messages until authenticated. Falls back to stub mode after 3s timeout.

---

## Database Schema (Prisma)

### Core Tables
| Table | Purpose |
|-------|---------|
| `Space` | Workspace container (name, credit, createdBy) |
| `Base` | Project/sheet (spaceId, name, order, icon, status) |
| `TableMeta` | Table schema (baseId, name, dbTableName, version, computedConfig) |
| `field` | Column definitions (name, type, cellValueType, options, expression) |
| `View` | View configurations (type, sort, filter, group, columnMeta, shareMeta) |
| `Ops` | Operations log for collaboration (docId, version, operation) |
| `Comment` | Threaded comments on records (tableId, recordId, parentId, reactions) |
| `DataStream` | Webhook integrations (webhookUrl, eventType, triggerType) |
| `TriggerSchedule` | Time-based trigger rules (fieldId, type, offsetMinutes) |
| `ScheduledTrigger` | Trigger instances (scheduledTime, state, retryCount) |
| `Reference` | Foreign key tracking (fromFieldId, toFieldId) |
| `AiConversation` | AI chat history (userId, title, currentBaseId) |
| `AiMessage` | AI chat messages (role, content, actionType, feedback) |
| `AiApprovedContext` | AI access permissions (conversationId, baseId, tableId) |

---

## API Endpoints

### Field Operations (`/field`)
```
POST /create_field                — Create single field
POST /create_multiple_fields      — Bulk create fields
PUT  /update_field                — Update field schema/options
GET  /getFields?tableId=          — Get all fields for table
POST /update_fields_status        — Enable/disable fields
POST /create_enrichment_field     — Create enrichment field
PUT  /update_enrichment_field     — Update enrichment config
POST /create_ai_column_field      — Create AI-generated column
POST /clear_fields_data           — Clear field data
```

### Record Operations (`/record`)
```
POST /create_record               — Create new row
GET  /get_records                  — Fetch rows with filter/sort/group
PUT  /update_records               — Batch update rows
GET  /group-points                 — Get grouping hierarchy
POST /process_bulk_enrichment      — Enrich multiple records
GET  /v1/enrichment/get_enriched_data — Get enriched data
PUT  /update_record_colors         — Conditional coloring
```

### Table Operations (`/table`)
```
POST /create_table                         — Create new table
GET  /get_table?tableId=                   — Get table schema
PUT  /update_table                         — Rename/update table
PUT  /update_tables                        — Bulk update (soft delete)
POST /add_csv_data_to_existing_table       — Import CSV to existing
POST /add_data_to_new_table_from_csv       — Create table from CSV
POST /export_csv                           — Export as CSV
POST /create_data_stream                   — Setup webhook
PUT  /set_is_streaming                     — Enable/disable streaming
```

### View Operations (`/view`)
```
POST /create_view           — Create new view
PUT  /update_filter          — Set filter rules
PUT  /update_sort            — Set sort rules
PUT  /update_group_by        — Set grouping
PUT  /update_column_meta     — Update widths/visibility/order
POST /update_view            — Rename view
POST /delete_view            — Soft delete view
```

### Sheet/Base Operations
```
POST /sheet/create_sheet              — Create full sheet (Space + Base + Table + View)
GET  /sheet/get_sheet                 — Fetch complete sheet data
PUT  /base/update_base_sheet_name     — Rename base/sheet
```

### Sharing & Permissions (`/asset`)
```
GET  /find_one?assetId=      — Get asset details
GET  /get_members?asset_id=  — List share members
POST /share                  — Share with users (roles: viewer, editor)
POST /invite_members         — Invite users
```

---

## Key User Workflows

### Create a Sheet
1. `POST /sheet/create_sheet` → auto-creates Space, Base, Table, default View
2. Default "Name" field created automatically
3. User sees empty grid view

### Add Data Manually
1. Click "Add row" → optimistic local insert
2. Edit cells → `PUT /record/update_records` on blur
3. Socket.IO broadcasts updates to collaborators
4. Grid re-renders

### Import CSV
1. Upload CSV → system parses headers, detects types
2. Creates fields as needed
3. Rows inserted in bulk with type conversion

### Create Computed Column
1. Create formula field with expression
2. Backend validates formula against field names
3. Dependency graph built for recalculation
4. Bull job queue handles bulk recalc
5. Results broadcast via Socket.IO

### Switch Views
1. Switch from Grid to Kanban (or Calendar, Gallery, etc.)
2. Same underlying data, different visual presentation
3. Kanban groups by selected column, supports drag-and-drop

### Share Sheet
1. Open sharing panel → list current members
2. Add emails with role assignment
3. Invitees get access token
4. All users see real-time changes via WebSocket

---

## Environment Variables

### Backend
```bash
DATABASE_URL=postgresql://user:pass@host:5432/sheet
JWT_SECRET=your-secret
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000  # (proxied at 4545 via Vite)
ENV=development
ENRICHMENT_SERVICE_URL=http://localhost:3333
OUTE_SERVER=https://heimdalldev.gofo.app
```

### Frontend
```bash
VITE_API_BASE_URL=http://localhost:4545/api
VITE_AUTH_TOKEN=  # Bypass auth in dev
VITE_FILE_UPLOAD_SERVER=
VITE_OUTE_SERVER=
```

### AI Service
```bash
PORT=3001
DATABASE_URL=
OPENAI_API_KEY=
```

### Ports
- Frontend: **5000** (Vite)
- Backend: **4545** (proxied, actual NestJS: 3000)
- AI Service: **3001**
- Redis: **6379**
- PostgreSQL: **5432**

---

## Key Source Files

| Area | Path | Purpose |
|------|------|---------|
| Frontend App | `sheets-frontend-new/` | Main React app |
| Grid View | `sheets-frontend-new/src/views/grid/` | Core grid rendering |
| Other Views | `sheets-frontend-new/src/views/{kanban,calendar,gallery,gantt,form,ai-enrichment}/` | Alternate views |
| Embed Mode | `sheets-frontend-new/src/embed/` | iframe integration |
| Zustand Stores | `sheets-frontend-new/src/stores/` | State management |
| Services | `sheets-frontend-new/src/services/{api.ts,socket.ts,formatters.ts}` | API and socket clients |
| Types | `sheets-frontend-new/src/types/` | TypeScript definitions (cell.ts, view.ts, grid.ts) |
| Backend App | `sheets-backend/` | NestJS server |
| Features | `sheets-backend/src/features/{field,record,table,view,sheet,base,space,comment}/` | Feature modules |
| DB Schema | `sheets-backend/prisma/schema.prisma` | Prisma schema |
| WebSocket | `sheets-backend/src/gateway/gateway.service.ts` | Socket.IO gateway |
| Job Queue | `sheets-backend/src/bullMq/` | Bull queue workers |
| AI Service | `ai-service/` | Express AI server |

---

## What Makes TinyTable Unique

1. **Multiple views** — Same data shown as Grid, Kanban, Calendar, Gallery, Gantt, Form, or List
2. **AI enrichment** — Automatically enrich records with external company/person data
3. **AI columns** — Generate column values using AI based on other columns
4. **AI chat** — Ask questions about your data in natural language
5. **Formula engine** — Excel-like expressions with dependency tracking and bulk recalculation
6. **Real-time collaboration** — WebSocket + Redis Streams for live multi-user editing
7. **30+ field types** — From basic text to relational lookups, rollups, and computed fields
8. **Embeddable** — Full iframe + postMessage integration for use in other apps
9. **Data streams** — Webhook integration with time-based triggers for automation
10. **Threaded comments** — Discussions on individual records with reactions
11. **CSV import/export** — Bulk data movement
12. **Conditional formatting** — Visual data highlighting
13. **Role-based sharing** — Asset-level permissions (viewer, editor)
