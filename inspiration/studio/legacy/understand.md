# IC Canvas / Tiny Studio - Codebase Navigation Map

## 1. Application Overview

**IC Canvas** (also known as **Tiny Studio**) is a React-based visual workflow builder that enables users to create powerful automations by connecting applications, executing logic, and integrating AI agents without complex coding. It's a no-code/low-code solution for workflow automation.

### Core Capabilities
- Visual drag-and-drop workflow building using a canvas interface
- Node-based architecture for building automation pipelines
- AI-powered features (TinyGPT, AI suggestions, contextual recommendations)
- Form creation and management
- Database operations (CRUD, sheets)
- HTTP/API integrations
- Time-based and event-based triggers
- Conditional logic (if/else branching)
- Data transformation and iteration

---

## 2. Technology Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 18.3.1 |
| **Build Tool** | Vite 5.x |
| **State Management** | Redux Toolkit + Redux Persist |
| **UI Library** | Material UI (MUI) 5.x |
| **Canvas/Diagrams** | GoJS |
| **Styling** | Emotion (CSS-in-JS), CSS Modules |
| **HTTP Client** | Axios |
| **Date Handling** | Day.js |
| **Animations** | Framer Motion, GSAP, Lottie |
| **Real-time** | Socket.io-client |
| **Error Tracking** | Sentry |
| **Analytics** | Microsoft Clarity, Intercom |
| **Authentication** | Keycloak (currently bypassed for dev) |

### Private Package Registry
- All `@oute/*`, `oute-ds-*`, and `oute-services-*` packages are hosted at `https://npm.gofo.app`

---

## 3. Project Structure Map

```
/
├── src/                          # Main source code
│   ├── App.jsx                   # Root application component
│   ├── index.jsx                 # Entry point with Sentry initialization
│   ├── ICStudioContext.jsx       # Main context provider (socket, user, theme)
│   │
│   ├── pages/                    # Page-level components (routes)
│   │   ├── landing/              # Landing/router page
│   │   ├── ic-canvas/            # Main canvas page (3000+ lines)
│   │   ├── asset-not-found/      # 404 for assets
│   │   ├── resource-not-found/   # 404 for resources
│   │   └── redirect/             # Redirect handler
│   │
│   ├── components/               # Reusable UI components
│   │   ├── canvas/               # Core canvas system (GoJS)
│   │   ├── Header/               # Top navigation header
│   │   ├── CommandPalette/       # Cmd+K command palette
│   │   ├── dialogs/              # Modal dialogs
│   │   ├── popper/               # Popover components
│   │   ├── loaders/              # Loading indicators
│   │   ├── buttons/              # Button components
│   │   └── ...                   # Other UI components
│   │
│   ├── module/                   # Feature modules
│   │   ├── ods/                  # Oute Design System (local wrappers)
│   │   ├── search/               # Node search/discovery system
│   │   └── constants/            # Shared module constants
│   │
│   ├── sdk-services/             # External API SDK wrappers
│   │   ├── canvas-sdk-services.js
│   │   ├── component-sdk-services.js
│   │   ├── asset-sdk-services.js
│   │   └── ...                   # Other SDK services
│   │
│   ├── services/                 # Internal business logic services
│   │   ├── apiService.js
│   │   ├── aiSuggestions.js
│   │   └── canvas-services.js
│   │
│   ├── redux/                    # State management
│   │   ├── store.js              # Redux store configuration
│   │   ├── persisitConfig.js     # Persist configuration
│   │   └── reducers/             # Redux slices
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCanvasContext.js
│   │   ├── useContextMenu.js
│   │   ├── useKeyDown.js
│   │   └── ...
│   │
│   ├── constants/                # Application constants
│   │   ├── keys.js
│   │   ├── mode.js
│   │   ├── node-rules.js
│   │   └── canvas-model-events.js
│   │
│   ├── config/                   # Configuration exports
│   │   └── config.jsx
│   │
│   ├── utils/                    # Utility functions
│   │   ├── utils.jsx
│   │   ├── flowBuilder.js
│   │   └── app-version.js
│   │
│   ├── tools/                    # Canvas toolbar tools
│   │   ├── auto-align/
│   │   ├── comment/
│   │   ├── cursor/
│   │   ├── group/
│   │   ├── help/
│   │   ├── menu/
│   │   ├── more/
│   │   ├── play/
│   │   └── upload/
│   │
│   ├── assets/                   # Static assets
│   │   ├── fonts/                # Proxima Nova fonts
│   │   ├── icons/                # SVG/PNG icons
│   │   ├── images/               # Image assets
│   │   └── lotties/              # Lottie animations
│   │
│   └── polyfills/                # Browser polyfills
│       └── path.js
│
├── public/                       # Static public assets
├── vite.config.ts                # Vite configuration
├── package.json                  # Dependencies and scripts
├── replit.md                     # Replit project documentation
└── understand.md                 # This file
```

---

## 4. Entry Points & Routing

### Application Bootstrap Flow
```
index.html
  └── src/index.jsx              # React root, Sentry init
       └── App.jsx               # Auth wrapper, Redux provider
            └── ICStudioContextProvider
                 └── Landing     # Route definitions
```

### Routes (defined in `src/pages/landing/index.jsx`)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `IC` (lazy loaded) | Main canvas editor |
| `/resource-not-found` | `AssetNotFound` | Resource not found page |
| `*` | `Redirect` | Fallback redirect |

### Key Context Providers
1. **Redux Provider** (`<Provider store={store}>`) - State management
2. **PersistGate** - Redux persistence
3. **BrowserRouter** - React Router
4. **ICStudioContextProvider** - App-wide context (socket, user, theme, asset IDs)
5. **MockAuthProvider** / **TinyCommandAuthController** - Authentication

---

## 5. Core Architecture Components

### 5.1 Main Canvas Page (`src/pages/ic-canvas/index.jsx`)

This is the heart of the application (~3000 lines). Key responsibilities:
- Canvas initialization and management
- Node CRUD operations
- Sidebar panel rendering
- Dialog management
- Event handling
- Data persistence

**Key State:**
- `diagram` - GoJS diagram instance
- `nodeArray` / `linkArray` - Canvas data
- `selectedNode` - Currently selected node
- `sidebarComponent` - Active sidebar content
- `dialogToShow` - Active dialog

**Key Functions:**
- `addNode()` - Add new node to canvas
- `saveCanvas()` - Persist canvas state
- `executeWorkflow()` - Run the workflow
- `handleNodeClick()` - Node selection handler

### 5.2 Canvas Component (`src/components/canvas/`)

The visual workflow editor built on GoJS.

```
canvas/
├── canvas.jsx           # Main canvas component
├── index.js             # Exports
├── constants.js         # Canvas constants (CANVAS_BG, etc.)
│
├── classes/             # GoJS class definitions
├── config/              # Node configuration and categories
├── extensions/          # Node type implementations
├── services/            # Canvas-specific SDK services
├── templates/           # GoJS node/link templates
└── utils/               # Canvas utility functions
```

### 5.3 Extensions System (`src/components/canvas/extensions/`)

Each node type has its own extension folder:

```
extensions/
├── constants/types.js   # All node type constants
├── getExtensionComponent.js  # Node component resolver
│
├── start/               # Start/trigger node
├── end/                 # End/success node
├── end-v2/              # End node v2
├── http/                # HTTP request node
├── if-else/             # Conditional branching
├── if-else-v2/          # Conditional branching v2
├── iterator/            # Loop/iteration node
├── delay/               # Delay/wait node
├── transformer/         # Data transformation
├── tiny-gpt/            # AI/GPT node
├── tiny-search/         # Search node
├── hitl/                # Human-in-the-loop
├── jump-to/             # Jump to another node
│
├── crud-operations/     # Database CRUD
│   ├── create-record/
│   ├── update-record/
│   ├── delete-record/
│   ├── find-one/
│   ├── find-all/
│   └── execute-query/
│
├── sheet/               # Tiny Tables operations
│   ├── create-record-v2/
│   ├── update-record-v2/
│   ├── find-one-v2/
│   ├── find-all-v2/
│   ├── delete-record/
│   └── trigger/
│
├── agent/               # AI agent nodes
│   ├── agent-scout/
│   ├── agent-composer/
│   └── input/
│
├── enrichment/          # Data enrichment
│   ├── person/
│   ├── email/
│   └── company/
│
├── triggers/            # Workflow triggers
├── time-based-trigger/  # Scheduled triggers
├── form/                # Form integration
├── question-setup/      # Question/form nodes
│
└── common-components/   # Shared extension components
```

---

## 6. Node Types Reference

### Triggers
| Type | Constant | Description |
|------|----------|-------------|
| Form Trigger | `FORM_TRIGGER` | Triggered by form submission |
| Webhook | `WEBHOOK_TYPE` | HTTP webhook trigger |
| Time-Based | `TIME_BASED_TRIGGER` | Scheduled execution |
| Sheet Trigger | `SHEET_TRIGGER` | Triggered by table changes |

### Flow Control
| Type | Constant | Description |
|------|----------|-------------|
| If/Else v2 | `IF_ELSE_TYPE_V2` | Conditional branching |
| Iterator | `ITERATOR_TYPE` | Loop over arrays |
| Delay | `DELAY_TYPE` | Wait/pause execution |
| Break | `BREAK_TYPE` | Exit loop |
| Skip | `SKIP_TYPE` | Skip iteration |
| Jump To | `JUMP_TO_TYPE` | Jump to another node |

### Data Operations
| Type | Constant | Description |
|------|----------|-------------|
| HTTP | `HTTP_TYPE` | HTTP request |
| Transformer | `TRANSFORMER_TYPE` | Data transformation |
| Array Aggregator | `ARRAY_AGGREGATOR_TYPE` | Aggregate array data |

### Database (CRUD)
| Type | Constant | Description |
|------|----------|-------------|
| Create Record | `CREATE_TYPE` | Insert record |
| Update Record | `UPDATE_TYPE` | Update record |
| Delete Record | `DELETE_TYPE` | Delete record |
| Find One | `FIND_ONE_TYPE` | Find single record |
| Find All | `FIND_ALL_TYPE` | Find multiple records |
| Execute Query | `EXECUTE_TYPE` | Raw SQL query |

### AI Nodes
| Type | Constant | Description |
|------|----------|-------------|
| TinyGPT | `TINY_GPT_TYPE` | AI text processing |
| Tiny Search | `TINY_SEARCH_V2` | AI-powered search |
| Agent Scout | `AGENT_TINY_SCOUT` | AI agent |
| Agent Composer | `AGENT_TINY_COMPOSER` | AI composition |

### Question Types (Forms)
Located in `extensions/question-setup/constants/questionNodes.js`
- Short Text, Long Text, Email, Phone Number
- MCQ, Dropdown, Yes/No, Ranking
- Date, Time, Number, Currency
- Address, Zip Code, File Picker
- Signature, and more...

---

## 7. SDK Services Map

### External SDK Services (`src/sdk-services/`)

| File | SDK | Purpose |
|------|-----|---------|
| `asset-sdk-services.js` | `oute-services-asset-sdk` | Asset management |
| `canvas-sdk-services.js` | `oute-services-canvas-sdk` | Canvas CRUD operations |
| `component-sdk-services.js` | `oute-services-component-sdk` | Component management |
| `domain-sdk-services.js` | `oute-services-domain-sdk` | Domain/workspace management |
| `flow-execution-sdk-services.js` | `oute-services-flow-exec-sdk` | Workflow execution |
| `flow-execution-logs-sdk-services.js` | `oute-services-flow-exec-logs-sdk` | Execution logs |
| `storage-sdk-services.js` | `oute-services-storage-sdk` | File storage |
| `uatu-sdk-services.js` | `oute-services-uatu-sdk` | Analytics/tracking |
| `user-sdk-services.js` | `oute-services-user-sdk` | User management |
| `variable-sdk-services.js` | `oute-services-variable-sdk` | Variables management |
| `baseConfig.js` | - | Base SDK configuration |

### Canvas-Specific Services (`src/components/canvas/services/`)

| File | Purpose |
|------|---------|
| `canvasSDKServices.ts` | Canvas-specific operations |
| `componentSDKServices.ts` | Component operations |
| `validationSDKServices.ts` | Validation rules |
| `variableSDKServices.ts` | Variable operations |
| `sheetSDKServices.js` | Sheet/table operations |
| `themeSDKServices.js` | Theme management |
| `authorizeDataSDKServices.js` | Data authorization |
| `dbConnectionSDKServices.ts` | Database connections |

---

## 8. UI Component Library (ODS - Oute Design System)

### Local Wrappers (`src/module/ods/`)

The ODS module provides local wrappers around external `oute-ds-*` packages:

```
ods/
├── index.jsx              # Main export file
│
├── accordion/             # Accordion component
├── alert/                 # Alert notifications
├── autocomplete/          # Autocomplete input
├── avatar/                # User avatar
├── breadcrumbs/           # Navigation breadcrumbs
├── button/                # Button component
├── card/                  # Card container
├── checkbox/              # Checkbox input
├── chip/                  # Chip/tag component
├── circular-progress/     # Loading spinner
├── context-menu/          # Right-click menu
├── dialog/                # Modal dialog
├── drawer/                # Side drawer
├── dropdown/              # Dropdown select
├── formula-bar/           # Formula input bar
├── grid/                  # Data grid (ag-grid wrapper)
├── icon/                  # Icon component
├── json-editor/           # JSON editor
├── label/                 # Text label
├── loading-button/        # Button with loading state
├── nested-list/           # Nested list component
├── number-input/          # Number input
├── popover/               # Popover component
├── popper/                # Popper positioning
├── radio/                 # Radio button
├── switch/                # Toggle switch
├── tab/                   # Tab navigation
├── terminal-v2/           # Terminal/console output
├── text-field/            # Text input
├── toggle-button/         # Toggle button
├── tooltip/               # Tooltip
└── utils/                 # Utility functions
```

### Key ODS Exports (from `src/module/ods/index.jsx`)
```javascript
export { ODSGrid }           // Data grid
export { ODSIcon }           // Icons
export { ODSTextField }      // Text inputs
export { ODSDialog }         // Modal dialogs
export { ODSContextMenu }    // Context menus
export { showAlert }         // Alert toasts
export { showConfirmDialog } // Confirmation dialogs
export { serverConfig }      // Server configuration
export { sharedAssets }      // Shared assets
```

---

## 9. State Management

### Redux Store (`src/redux/`)

```
redux/
├── store.js              # Store configuration
├── persisitConfig.js     # Persistence settings (localStorage)
└── reducers/
    └── godata-reducer.js # Main reducer (cache management)
```

### GoData Reducer Actions
- `getCache(key)` - Retrieve cached data
- `updateCache({ key, value })` - Update cache

### ICStudio Context (`src/ICStudioContext.jsx`)

Global context providing:
- `assetId` / `updateAssetId` - Current asset
- `workspaceId` / `updateWorkspaceId` - Current workspace
- `parentId` / `updateParentId` - Parent asset
- `projectId` / `updateProjectId` - Project ID
- `eventType` / `updateEventType` - Event type
- `theme` / `updateTheme` / `getTheme` - Theme settings
- `socket` - Socket.io connection
- `userData` / `setUserData` - User information
- `host` / `setHost` - Embedded host origin

---

## 10. Custom Hooks Reference

| Hook | File | Purpose |
|------|------|---------|
| `useCanvasContext` | `hooks/useCanvasContext.js` | Access canvas context |
| `useContextMenu` | `hooks/useContextMenu.js` | Context menu management |
| `useKeyDown` | `hooks/useKeyDown.js` | Keyboard shortcuts |
| `useProcessAiCanvas` | `hooks/useProcessAiCanvas.js` | AI canvas processing |
| `useSearchConfig` | `hooks/useSearchConfig.js` | Search configuration |
| `useUpdateHITLNode` | `hooks/useUpdateHITLNode.js` | HITL node updates |
| `useCanvasUatuEvents` | `hooks/use-canvas-uatu-events.js` | Analytics events |

---

## 11. Key Constants & Configuration

### Application Constants (`src/constants/`)

| File | Contains |
|------|----------|
| `keys.js` | URL parameter keys, success constants |
| `mode.js` | Application mode definitions |
| `node-rules.js` | Node validation rules, trigger detection |
| `canvas-model-events.js` | Canvas event constants |

### Canvas Constants (`src/pages/ic-canvas/constants/constants.js`)

```javascript
DELETED_STATE = "DELETED"
PERMANENT_DELETED_STATE = "PERMANENT_DELETED"
ACTIVE_STATE = "ACTIVE"

// Dialog identifiers
NODE_DIALOG = "node-dialog"
WORKFLOW_NAME_DIALOG = "workflow-name-dialog"
FORM_PUBLISH_DIALOG = "form-publish-dialog"
// ... etc
```

### Module Constants (`src/module/constants/`)

Exports from `index.ts`:
- `QuestionType` - Form question types
- `SidebarKey` - Sidebar panel identifiers
- `TextSize` - Text size options
- `ViewPort`, `Mode` - View/mode constants
- `localStorageConstants` - LocalStorage keys
- `stringHelpers`, `questionHelpers` - Utility helpers

---

## 12. Search & Node Discovery (`src/module/search/`)

The node search system provides:
- Fuzzy search for nodes
- Contextual suggestions based on workflow state
- Recipe templates for common patterns
- Category navigation

```
search/
├── index.jsx                    # Main AddNodeComponent
├── NodesContainer.jsx           # Node grid container
├── DisabledTooltip.jsx          # Disabled node tooltip
│
├── component/
│   ├── ContextualSuggestions/   # AI-based suggestions
│   ├── NodePreviewCard/         # Node preview card
│   ├── RecipeSnippets/          # Pre-built workflow recipes
│   ├── RenderNodes/             # Node rendering
│   ├── RequestIntegration/      # Integration requests
│   ├── SidebarNav/              # Category navigation
│   ├── SuggestedNodes/          # Smart suggestions
│   └── ViewModeToggle/          # View mode toggle
│
├── constant/
│   └── iconMapping.js           # Node to icon mapping
│
└── utils/
    ├── getCategoryLabelFromSectionId.js
    ├── highlightText.jsx        # Search highlighting
    └── recentNodes.js           # Recent nodes tracking
```

---

## 13. Dialogs System (`src/components/dialogs/`)

| Dialog | Path | Purpose |
|--------|------|---------|
| Add Component | `add-component-dialog/` | Add new nodes |
| Add Asset ID | `add-asset-id-dialog/` | Link assets |
| Form Preview | `form-preview-dialog/` | Preview forms |
| Form Publish | `form-publish-dialog/` | Publish forms |
| Link Rename | `link-rename-dialog/` | Rename links |
| Workflow Name | `workflow-name-dialog/` | Name workflows |
| Test API | `test-api-dialog/` | Test API calls |
| Logs | `logs-dialogs/` | View execution logs |
| Publish Workflow | `publish/workflow/` | Publish workflows |
| Deleted Asset | `deleted-asset-dialog/` | Handle deleted assets |

---

## 14. Assets Organization

### Icons (`src/assets/icons/`)
```
icons/
├── index.js                 # Main icon exports
├── flow-control-icons/      # Flow control node icons
├── link-context-menu-icons/ # Context menu icons
├── setup-icons/             # Setup/config icons
├── tools/                   # Toolbar icons
└── command-palette/         # Command palette icons
```

### Images (`src/assets/images/`)
- Error states (error-badge, error-node, invalid)
- Placeholder images
- Integration logos (Gmail, Slack)
- Success states
- Lottie previews

### Fonts (`src/assets/fonts/`)
- Proxima Nova (Regular, Semibold)

### Animations (`src/assets/lotties/`)
- `double-click.json` - Double click hint
- `idle.json` - Idle animation
- `publish-failure.json` - Publish failed
- `publish-success.json` - Publish success
- `tiny-ai.json` - AI processing
- `tinycommand-loading.json` - Loading state

---

## 15. Environment Variables

Key environment variables (prefixed with `REACT_APP_`):
- `REACT_APP_SENTRY_DSN` - Sentry error tracking
- `REACT_APP_ENABLE_SENTRY` - Enable/disable Sentry
- `REACT_APP_LOGIN_URL` - Keycloak login URL
- `REACT_APP_KEYCLOAK_*` - Keycloak configuration
- `REACT_APP_OUTE_SERVER` - Backend server URL
- `REACT_APP_HUB_ORIGIN` - Hub origin for auth
- `REACT_APP_WC_LANDING_URL` - Landing page URL
- `VITE_CARDS_PER_ROW` - Command palette grid columns

---

## 16. Development Quick Reference

### Start Development
```bash
npm run vitedev    # Start Vite dev server on port 5000
```

### Build
```bash
npm run vitebuild  # Production build
```

### Key Files to Start With
1. `src/App.jsx` - Application entry
2. `src/pages/ic-canvas/index.jsx` - Main canvas logic
3. `src/components/canvas/canvas.jsx` - GoJS canvas
4. `src/components/canvas/config/index.js` - Node configurations
5. `src/module/ods/index.jsx` - Component library exports

### Adding a New Node Type
1. Create folder in `src/components/canvas/extensions/[node-name]/`
2. Add `constant.js` with node configuration
3. Add `index.jsx` with node component
4. Register in `extensions/index.js`
5. Add to config in `canvas/config/index.js`

### Common Patterns
- Use `showAlert()` for toast notifications
- Use `showConfirmDialog()` for confirmations
- Access canvas via `useCanvasContext()` hook
- Use `ICStudioContext` for global state

---

## 17. Architecture Diagrams

### Data Flow
```
User Action
    │
    ▼
Canvas (GoJS) ─────► Redux Store
    │                    │
    ▼                    ▼
SDK Services ◄──── ICStudioContext
    │
    ▼
Backend APIs (oute-services-*)
```

### Component Hierarchy
```
App
 └─ ICStudioContextProvider
     └─ Landing (Router)
         └─ IC (Canvas Page)
             ├─ Header
             ├─ Canvas (GoJS)
             │   └─ Node Templates
             │       └─ Extensions
             ├─ Sidebar
             │   └─ Node Config Panels
             ├─ CommandPalette
             │   └─ Search/Suggestions
             └─ Dialogs
                 └─ Various Modals
```

---

*Last updated: December 2025*
