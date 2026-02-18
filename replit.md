# Reference Sheet Application

## Overview
A complex spreadsheet application migrated from Oute Design System (proprietary) and Material-UI to shadcn/ui + Tailwind CSS v4. The project is a Vite + React + TypeScript application.

## Recent Changes (Feb 2026)
- **Complete UI Framework Migration**: Migrated from Oute DS (oute-ds-*) + MUI (@mui/*) to shadcn/ui + Tailwind CSS v4
- All 17 shadcn/ui components created (Button, Dialog, Input, Label, Popover, Tooltip, Skeleton, Badge, Checkbox, RadioGroup, Switch, Separator, Slider, DropdownMenu, Command, Textarea, Sonner)
- Utility shims created: showAlert (toast), serverConfig (env-based), ODSIcon (lucide-react mapper), Error display
- All cell-level editors (40+ files), common/forms (11 files), views (20+ files), components (27+ files), pages (30+ files) migrated
- CSS modules converted to inline Tailwind classes across all files
- Dev stubs created for infrastructure packages (tiny-auth, signature, common-account-actions)

## Project Architecture
- **Framework**: React 18 + TypeScript + Vite 5
- **UI**: shadcn/ui components + Tailwind CSS v4
- **Styling**: Pure Tailwind utility classes (no MUI, no Emotion, no CSS modules)
- **Icons**: lucide-react (mapped via ODSIcon adapter in src/lib/oute-icon.tsx)
- **Toasts**: sonner (wrapped via showAlert in src/lib/toast.ts)
- **State**: Zustand stores
- **Routing**: react-router-dom
- **Monitoring**: Sentry
- **Socket**: socket.io-client

## Key Directories
```
legacy/
├── src/
│   ├── components/ui/       # shadcn/ui components
│   ├── lib/                 # Utility shims (toast, server-config, oute-icon, error-display)
│   ├── stubs/               # Dev stubs for infrastructure packages
│   ├── cell-level/          # Cell editors and renderers
│   ├── common/forms/        # Form controllers
│   ├── components/          # Shared components (Filter, Sort, GroupBy, etc.)
│   ├── pages/MainPage/      # Main page and sub-components
│   ├── views/               # Grid and Kanban views
│   ├── context/             # React contexts
│   ├── hooks/               # Custom hooks
│   ├── stores/              # Zustand stores
│   └── styles.css           # Tailwind v4 entry point with CSS variables
├── vite.config.ts           # Vite config with Tailwind, port 5000, stubs aliases
└── package.json
```

## Infrastructure Dependencies (Preserved)
These packages are NOT part of the design system migration. They're infrastructure SDKs:
- `@oute/oute-ds.common.molecule.tiny-auth` - Authentication controller
- `@oute/oute-ds.molecule.signature` - Signature capture widget
- `@oute/icdeployment.molecule.common-account-actions` - Account management

In dev mode, these are aliased to stub components in `src/stubs/`.

## User Preferences
- Pure Tailwind CSS approach - no MUI, no Emotion, no inline CSS, no CSS modules
- Complete migration in one go, not incremental
- Native HTML date/time inputs instead of complex MUI x-date-pickers
- Stubs for complex proprietary components (ConditionComposer, FormulaBar)
- Keep infrastructure SDK imports unchanged
