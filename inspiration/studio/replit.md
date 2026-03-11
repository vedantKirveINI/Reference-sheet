# IC Canvas (Tiny Studio)

React-based visual workflow builder with AI-powered canvas assistant.

## Architecture

- **Frontend**: React + Vite, Tailwind CSS, Framer Motion
- **Backend API**: Node.js Express server for canvas assistant (`server/canvas-assistant-api.js`)
- **Workflows**: 
  - `Start application` — `npm run vitedev` (Vite dev server)
  - `Canvas Assistant API` — `node server/canvas-assistant-api.js` (port 3003)

## Key Components

### Chat UI (`src/components/TinyAI/`)
- `TinyAIMessage.jsx` — Message bubbles with floating icon-only copy button (absolutely positioned ghost button, appears on hover)
- `TinyAIChat.jsx` — Chat panel with message list, streaming support, `pb-6` bottom padding for floating buttons

### Guided Setup (`src/components/guided-setup/`)
- `GuidedProgressRail.jsx` — Compact iOS-style dot carousel progress bar
  - Fixed-width visible window of ~7 dots max, regardless of total node count
  - Edge dots shrink and fade (active: 22px, near: 14px, mid: 10px, far: 7px with 0.5 opacity)
  - Smart positioning: centers in viewport when drawer closed, shifts left when node config panel is open
  - Drawer-aware calc: `calc((100vw - drawerWidth - 7.25rem) / 2)` when drawer open
  - Navigation: completed/past dots are cursor-pointer (canClick), future dots are cursor-default
- `GuidedSetupOverlay.jsx` — Passes `isNodeDrawerOpen` to the rail for smart repositioning
- `hooks/useGuidedSetup.js` — Step state management (goToPrevious, completeStep, skipStep)

### Canvas Assistant (`src/components/canvas-assistant/`)
- `useCanvasAssistantChat.js` — Main hook for AI chat, flow generation, trigger icon resolution

### Trigger Setup (`src/components/canvas/extensions/trigger-setup/`)
- Trigger node configuration with icon resolution via `assetSDKServices`
- `resolveNodeTriggerType(nodeType)` — guards against non-trigger node types (e.g. `"SEQUENCE_TRIGGER"`) being mistaken for a valid trigger type. Only accepts values from the `TRIGGER_TYPES` map.

### Sequence Canvas (`src/pages/sequence/index.jsx`)
- Uses the same `TriggerSetupV3` component as ic-canvas for the trigger node
- `data={selectedNode?.go_data || {}}` — passes the saved trigger config (not the raw GoJS node) to the trigger drawer
- `handleDrawerSave(goData, updatedNodeData)` — accepts the trigger's save args and writes `go_data` back to the GoJS model node, preserving only safe fields (`name`, `_src`, `errors`) from `updatedNodeData` so the sequence-specific `type: "SEQUENCE_TRIGGER"` is never overwritten

### Node Config Panel (`src/module/drawer/WizardDrawer.jsx`)
- Width: `clamp(45rem, calc(45rem + 2vw), 50rem)`, right offset: `7.25rem`
- Footer: 3-column flex (Back | center | Save/Test buttons)
- `z-50`, lower than progress rail `z-[9998]`

## Embed Mode Architecture

The `/embed?type=form|workflow|sequence` route loads the **full IC studio** (`ic-canvas` page), not a stripped-down component. Auth comes from `postMessage` instead of Keycloak.

### Entry point
- `src/App.jsx` — detects `/embed` pathname, wraps with `EscapeStackProvider` + Redux `Provider` + `BrowserRouter`, then renders `EmbedRoute`
- `src/embed/EmbedRoute.jsx` — validates `?type=` param, wraps with `ICStudioContextProvider`, renders `EmbedStudioWrapper`

### Key files
- `src/embed/EmbedStudioWrapper.jsx` — orchestrator; calls `setIsEmbedMode(true)`, sets `isEmbedAuthenticated` based on token presence, handles `setAuth`/`loadAsset`/`updateAsset` postMessages, renders IC after auth; has 3-second dev fallback — if no `setAuth` is received, auto-proceeds with unauthenticated dev context
- `src/embed/useEmbedMessages.js` — postMessage protocol bridge (preserved unchanged)
- `src/embed/dataMapper.js` — transforms `loadAsset` payload into GoJS model format; auto-adds `category: "Question"` and `module: "Question"` to form question node types
- `src/ICStudioContext.jsx` — has `isEmbedMode` (auto-detected from pathname `/embed`), `isEmbedAuthenticated`/`setIsEmbedAuthenticated`, `setIsEmbedMode`, `injectEmbedContext`, `initSocket` (deferred), `pendingEmbedCanvasData`, `embedSendMessage`/`setEmbedSendMessage`
- `src/module/constants/canvasConstants.ts` — `CANVAS_MODE()` supports `setCanvasModeOverride()` for embed; maps `type=form` → `WORKFLOW_CANVAS`, `type=workflow` → `WC_CANVAS`
- `src/components/AuthRoute.jsx` — transparent in embed mode (skips URL parsing)
- `src/embed/components/EmbedAuthBanner.jsx` — bottom banner CTA for unauthenticated embed users; dismissible; fires `embedAuthRequired`
- `src/pages/ic-canvas/index.jsx` — loads `pendingEmbedCanvasData` instead of backend fetch; guards Clarity/Intercom/UATU/getUserData/fetchPremiumUser/fetchDomains with `!isEmbedMode`; suppresses Create Canvas Asset dialog; skips auto-save on node double-click; passes `embedMode={isEmbedMode}` to FormPreviewV2 (skips saveSnapshot); fires `assetCreated`/`assetUpdated` postMessages on save; renders EmbedAuthBanner for unauthenticated embed users; tracks node opens and shows sign-up nudge toast after 3 interactions; passes embed auth props to Header
- `src/hooks/useSearchConfig.js` — skips `getEvents` fetch in embed mode, returns static config only
- `src/module/ic-deployment/common-account-actions/CommonAccountActions.tsx` — skips `authUserInfo` fetch in embed mode

### Embed sign-up engagement funnel
- **Auth state**: `isEmbedAuthenticated` in ICStudioContext — `true` when `setAuth` has a real token, `false` otherwise
- **Header CTA**: `HeaderActions` replaces Save/Publish with "Sign up to save" button for unauthenticated embed users
- **Bottom banner**: `EmbedAuthBanner` — persistent (dismissible) banner at bottom of canvas
- **Nudge toast**: After 3 node opens by unauthenticated user, fires a one-time sonner toast with sign-up action
- **Ctrl+S gate**: `useKeyDown` fires `embedAuthRequired` instead of saving for unauthenticated embed users
- All sign-up actions fire `embedAuthRequired` postMessage to the parent app

### postMessage protocol (preserved)
- Inbound: `setAuth`, `loadAsset`, `updateAsset`, `setTheme`, `setMode`, `setStickyNote`
- Outbound: `ready`, `authConfigured`, `assetLoaded`, `assetUpdated`, `assetCreated`, `embedPublishRequest`, `embedAuthRequired`, `error`

### Deleted legacy files
- `src/embed/EmbedCanvas.jsx` (replaced by EmbedStudioWrapper + IC)
- `src/embed/EmbedStudioContext.jsx` (replaced by ICStudioContext embed extensions)
- `src/embed/components/EmbedNodeConfigPanel.jsx` (no longer needed)

## Sidebar Redesign (completed)
- **Icon rail removed**: The permanent 74px `CanvasSidebar` icon rail has been eliminated; canvas now uses full viewport width
- **Right panel**: Only appears contextually when a node is being edited (double-click) or a settings panel is open (Global Params, Theme Manager, Help)
- **Header settings dropdown**: Settings gear icon in `HeaderActions` provides access to Global Variables, Theme (form mode only), and Help & Resources
- **Command palette (Ctrl+K)**: Now includes a "Jump to" tab for navigating to existing canvas nodes; type `>` to enter navigation mode
- **Mode-colored bottom toolbar**: `BottomCtaContainer` uses `MODE_COLORS` from `src/components/studio/Header/config.js` — subtle background tint + colored action buttons per mode:
  - Form (`WORKFLOW_CANVAS`): orange/gold `#FFBA08`
  - Workflow (`WC_CANVAS`): blue `#358CFF`
  - Sequence: deep navy `#1C3693`
  - Agent: purple `#8133F1`
  - CMS: pink `#EA59ED`
- **Key files changed**: `config.js` (MODE_COLORS), `BottomCtaContainer/index.jsx`, `HeaderActions.jsx`, `Header/index.jsx`, `CommandPalette/index.jsx`, `ic-canvas/index.jsx`, `index.module.css`

## Important Files Not To Modify
- See scratchpad notes for restricted files

## User Preferences
- Co-founder relationship — honest opinions, push back on ideas, not yes-man
- Prefers visual dot indicators over progress bars
- Wants compact UI that doesn't interfere with other elements
