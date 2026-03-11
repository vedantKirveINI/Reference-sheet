# IC Canvas - Tiny Studio

## Overview
IC Canvas / Tiny Studio is a React-based visual workflow builder enabling users to create powerful automations. It provides a no-code/low-code solution for connecting applications, executing logic, and integrating AI agents, focusing on ease of use and extensibility for workflow automation.

## User Preferences
I want iterative development.
Ask me before making major changes.
I prefer detailed explanations.
Do not make changes to the folder `Z`.
Do not make changes to the file `Y`.

## System Architecture
The application is built with React 18.3.1 and Vite. State management uses Redux Toolkit and Redux Persist. The UI is developed with Material UI (MUI) 5.x, visual workflow diagrams with GoJS, and styling with Emotion and CSS Modules. Data fetching is handled by Axios, date handling by Day.js, and animations by Framer Motion, GSAP, and Lottie.

**Key Architectural Features:**

*   **Time-Based Trigger V2**: A gold-standard scheduling interface supporting Interval, Daily, Weekly, Monthly, Once, and Custom schedules, including timezone awareness and advanced options. The UI is aligned with Figma designs, featuring pill-style tabs, horizontal day selectors, and dynamic labels.
*   **Date Field Trigger**: A standalone, scheduled trigger type allowing workflows to run relative to date fields in tables with multiple timing rules (before/on/after, offset, trigger-once).
*   **Trigger Setup UI Redesign**: A card-based design with island styling for trigger selection. Features include a `SelectTrigger` component (card grid), `CollapsedTriggerCard` (slim inline header), `StepIndicator` (multi-step process labeling), `TriggerSummary` (configuration status display), and `AuthConnectionManager` variants for streamlined integration. Keyboard navigation and search functionality are fully supported. Connection setup includes loading states, dynamic step labels, and auto-generated connection names.
*   **Add Node Component & Command Palette Redesign**: A comprehensive redesign of the node discovery interface, accessible via global shortcuts. Features include:
    *   **AI-Assisted Node Discovery**: Intent-based search, fuzzy matching, and contextual suggestions.
    *   **Workflow Intelligence**: Recipe templates, recent nodes, pinned favorites, and usage-based ranking.
    *   **User Experience**: Rotating placeholder examples, search highlighting, and Framer Motion animations.
    *   **Command Palette**: Floating overlay with keyboard navigation, inline preview panels, and section tabs.
    *   **Recipe Wizard**: Guided multi-step process for inserting recipe templates.
    *   **Trigger Replacement**: Triggers are discoverable but require confirmation before replacing existing ones, using a centralized detection system (`node-rules.js`).
    *   **Hierarchical Integration Support**: Integrations with child actions (e.g., Slack messages) support click-to-expand navigation and deep search.
    *   **Brand Design System**: Island design with opaque white surfaces, sharp drop shadows, primary blue accents, specific typography, and icon treatment.
    *   **Suggestion Pipeline Architecture**: A 5-stage pipeline (`suggestionPipeline.js`) for candidate pool building, hard constraint application, static signal ranking (fuzzy search, intent matching), AI re-ranking (placeholder), and presentation formatting.
    *   **Recipe Patterns Module**: Separates multi-node workflow composition from single-node intent biasing, with `NL_ACTION_PATTERNS` for detecting natural language workflow descriptions and requiring explicit user confirmation for implicit recipes.
*   **Single-Node vs Multi-Node Insertion Rules**: All multi-node insertions MUST go through the Recipes system via the Recipe Wizard (`setWizardRecipe()`) to ensure user confirmation, control, and analytics. Direct mutation of the canvas with multiple nodes or bypassing the Recipe Wizard is prohibited.
*   **FormulaBarV2 Component**: A modern formula editor replicating Notion's Formula 2.0 UX, located at `src/module/ods/formula-bar-v2/`. Features a 3-panel modal layout (input, elements, context help), multi-line code editor with syntax highlighting, visual property token chips, searchable elements panel, live preview, and error handling. Supports simple arithmetic, property arithmetic, chained expressions, and basic functions with type inference.
*   **FormulaFX Component with AI Backend**: An advanced formula editor at `src/module/ods/formula-fx/` with AI-powered capabilities:
    *   **AI Formula Generation**: Natural language to formula translation via GPT-4o-mini
    *   **AI Error Fix**: Automatic detection and correction of formula errors with "Fix with AI" button
    *   **AI Formula Explain**: Plain English explanations of complex formulas
    *   **AI Formula Optimize**: Suggestions for improving formula performance and readability
    *   **Backend Service**: Express server at `server/index.js` running on port 3001 with proxy via Vite
    *   **Endpoints**: `/api/ai-formula-journey`, `/api/ai-formula-fix`, `/api/ai-formula-explain`, `/api/ai-formula-optimize`
    *   **Integration**: Uses Replit AI Integrations for OpenAI access (no API key required, billed to credits)
    *   **Command Palette Integration**: FormulaFX is available as a canvas node (type: `FORMULA_FX`) in the Flow Control category. Located at `src/components/canvas/extensions/formula-fx/`. Search for "formula", "AI formula", "transform" in Command Palette to discover it.
*   **Settings Footer V2 Architecture**: A redesigned question settings interface for the form builder using a progressive disclosure card-based layout. Organized into four semantic cards (Essentials, Rules & Validation, Appearance & Behavior, Integrations) with inline help tooltips and summary badges on collapsed cards. Uses a unified settings registry (`settings-registry.ts`), reusable `SettingsCard` components, and enhanced field components.

## External Dependencies
*   **Private npm packages**: `@oute/*`, `oute-ds-*`, `oute-services-*` (hosted at `https://npm.gofo.app`).
*   **GoJS**: Visual workflow diagram rendering.
*   **Axios**: HTTP client.
*   **Day.js**: Date and time manipulation.
*   **Framer Motion, GSAP, Lottie**: Animations.
*   **Redux Toolkit & Redux Persist**: State management.
*   **Material UI (MUI)**: UI component library.
*   **Keycloak**: Intended for authentication (currently bypassed for development).