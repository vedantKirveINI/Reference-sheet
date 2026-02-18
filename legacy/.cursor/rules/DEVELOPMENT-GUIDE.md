# Sheet Frontend Development Guide
**Complete Reference for Building Sheet's React + Vite Frontend**

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Rules & Standards](#rules--standards)
4. [Development Phases](#development-phases)
5. [Reference Learning](#reference-learning)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Before You Code

1. **Read the Architecture**
   ```
   /ARCHITECTURE.md - Functional requirements & tech stack
   ```

2. **Understand the Rules**
   ```
   /cursor/technical/ - Technical implementation rules
   /cursor/functional/ - Feature requirements
   ```

3. **Follow the Phases**
   ```
   /cursor/development-phases/README.md - Phase roadmap
   /cursor/development-phases/phase-0-*.md - Individual phases
   ```

### Starting a Phase

```
1. Open: cursor/development-phases/phase-X-*.md
2. Read: Phase Overview + Reference Analysis
3. Copy: Implementation Prompt (verbatim)
4. Paste: Into Cursor AI with project context
5. Verify: Against Acceptance Criteria
```

---

## 🏗️ Architecture Overview

### Frontend Stack

**Technology Choices:**
- **Framework:** React 18 (Functional components, Hooks)
- **Build Tool:** Vite (Fast dev, optimized builds)
- **Routing:** React Router v6 (Client-side)
- **State Management:** 
  - Zustand (UI state)
  - React Query (Server state)
- **UI Components:** OUTE-DS (MUI-based design system)
- **Grid:** Canvas 2D API (Custom renderer, Teable-inspired)
- **Styling:** SCSS Modules + CSS Variables
- **Package Manager:** pnpm (Workspaces)

### Project Structure

```
frontend/
├── apps/web/                    # Main React SPA
│   ├── src/
│   │   ├── pages/              # Page components (Router)
│   │   ├── features/           # Feature modules
│   │   ├── components/         # Reusable components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── store/              # Zustand stores
│   │   ├── utils/              # Utilities
│   │   ├── api/                # API client
│   │   ├── types/              # TypeScript types
│   │   ├── styles/             # Global styles
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── Router.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── packages/
│   ├── ui-lib/                 # OUTE-DS wrapper components
│   │   └── src/
│   │       ├── components/
│   │       ├── types/
│   │       └── index.ts
│   │
│   └── sdk/                    # Grid + shared logic
│       └── src/
│           ├── grid/           # Canvas renderer
│           ├── types/
│           ├── utils/
│           └── index.ts
│
├── package.json                # Root monorepo
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### Backend Integration (NO CHANGES)

**Keep As-Is:**
- NestJS backend
- Keycloak authentication
- Existing API endpoints
- WebSocket (Socket.io) for real-time
- Prisma ORM (schema unchanged)

---

## 📋 Rules & Standards

### React Component Structure (TECH-REACT-STRUCT-001)

**16-Step Component Order:**
```
1. Imports (organized by groups)
2. Type definitions
3. Component declaration
4. Props destructuring
5. Route params
6. Redux/Store selectors
7. Custom hooks
8. Local state (useState)
9. React Query (useQuery/useMutation)
10. Early return guards
11. Derived values
12. Memoized computations
13. Event handlers
14. Memoized callbacks
15. Effects (useEffect)
16. Final JSX return
```

### Custom Hook Structure (TECH-REACT-STRUCT-002)

**13-Step Hook Order:**
```
1. Imports
2. Type definitions
3. Hook declaration
4. Router & i18n
5. Redux hooks
6. Local state
7. React Query
8. Derived values
9. Memoization
10. Internal functions
11. Memoized callbacks
12. Effects
13. Return
```

### Best Practices (TECH-REACT-STRUCT-003)

- ✅ Always use functional components
- ✅ Destructure props
- ✅ Use early returns for guards
- ✅ Encapsulate logic in custom hooks
- ✅ Use React Query for server data
- ✅ Memoize expensive computations
- ✅ Include all dependencies
- ✅ Separate Container/Presentation
- ✅ Type everything
- ✅ Handle errors explicitly

### CSS Architecture (TECH-CSS-001)

**Strategy: OUTE-DS + CSS Modules (NO Tailwind)**

```scss
// 80% OUTE-DS Components
import { Button, Dialog } from '@oute/oute-ds.*';

// 20% CSS Modules for layouts
import styles from './Component.module.scss';

// CSS Variables for theming
.container {
  background: var(--background);
  color: var(--text);
}

// Media queries for responsive
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
```

### Grid Architecture (TECH-FRONTEND-001)

**Canvas 2D Rendering with Virtual Scrolling**
- Built on Canvas API (not React components)
- Teable-inspired coordinate system
- Manager pattern for performance
- Context for state management
- Hooks for interactions

---

## 📅 Development Phases

### Phase Overview

| Phase | Name | Duration | Priority | Status |
|-------|------|----------|----------|--------|
| 0 | Project Setup | 1-2 days | CRITICAL | Not Started |
| 1 | Auth & Routing | 2-3 days | CRITICAL | Not Started |
| 2 | Layout Structure | 2-3 days | CRITICAL | Not Started |
| 3 | Canvas Grid Foundation | 5-7 days | CRITICAL | Not Started |
| 4 | Cell Rendering | 3-4 days | CRITICAL | Not Started |
| 5 | Cell Editing | 3-4 days | HIGH | Not Started |
| 6 | Selection & Interaction | 2-3 days | HIGH | Not Started |
| 7 | Column & Row Operations | 2-3 days | HIGH | Not Started |
| 8 | Views Switching | 3-4 days | HIGH | Not Started |
| 9 | Real-time Sync | 2-3 days | HIGH | Not Started |
| 10 | Forms UI | 2-3 days | MEDIUM | Not Started |
| 11 | Filters & Sorting | 2-3 days | MEDIUM | Not Started |
| 12 | Mobile Responsive | 2-3 days | MEDIUM | Not Started |

### Phase Structure

Each phase file includes:
1. **🎯 Overview** - What & why
2. **📚 Reference Analysis** - Teable + old code patterns
3. **📋 Rules Checklist** - Applicable rules
4. **🚀 Implementation Prompt** - Copy-paste for Cursor AI
5. **✅ Acceptance Criteria** - Verification checklist

### Recommended Workflow

```
Phase 0 (Foundation Setup)
    ↓
Phase 1 (Auth & Router)
    ↓
Phase 2 (Layout)
    ↓
Phases 3-7 (Core Grid)
    ↓
Phases 8-9 (Views & Sync)
    ↓
Phases 10-11 (Features)
    ↓
Phase 12 (Mobile Polish)
```

---

## 📚 Reference Learning

### Learn from Teable

**Monorepo Structure:**
- `reference/teable/apps/nextjs-app/` - Main app
- `reference/teable/packages/sdk/` - Shared logic
- `reference/teable/packages/ui-lib/` - Design system

**Key Files:**
- `src/features/app/layouts/BaseLayout.tsx` - Layout pattern
- `src/features/app/blocks/table/Table.tsx` - Table component
- `src/features/app/blocks/view/*/` - View implementations
- `src/pages/base/[baseId]/[tableId]/[viewId].tsx` - Page routing

**Concepts:**
- Provider pattern for global state
- Feature-based organization
- Server-side data hydration
- Layout hierarchy

### Learn from Old Frontend

**Integration Patterns:**
- `frontend/src/routes/index.jsx` - Router setup
- `frontend/src/pages/WelcomeScreen/` - Main page
- `frontend/src/components/AuthRoute/` - Auth protection
- `frontend/src/websocket/` - Socket.io client
- `frontend/src/hooks/` - Custom hooks

**Concepts:**
- Keycloak integration (keep as-is)
- WebSocket connection setup
- OUTE-DS component usage
- Router protection patterns

---

## 🎯 Common Patterns

### Component with Data Fetching

```typescript
// Following TECH-REACT-STRUCT-001 (16-step order)

export const RecordDetail = ({ recordId }: Props) => {
  // 1. Props destructured
  
  // 2. Store selectors
  const user = useSelector(selectUser);
  
  // 3. Custom hook (encapsulates logic)
  const { record, isLoading, updateRecord } = useRecord(recordId);
  
  // 4. Early returns (guards)
  if (!recordId) return null;
  if (isLoading) return <Skeleton />;
  if (!record) return <NotFound />;
  
  // 5. Memoized computations
  const canEdit = record.createdBy === user?.id;
  
  // 6. Memoized callbacks
  const handleSave = useCallback(async (data) => {
    await updateRecord(data);
  }, [updateRecord]);
  
  // 7. Effects
  useEffect(() => {
    // sync data
  }, [recordId]);
  
  // 8. JSX return
  return <div>{/* content */}</div>;
};
```

### Custom Hook for Data

```typescript
// Following TECH-REACT-STRUCT-002 (13-step order)

export const useRecord = (recordId: string) => {
  // 1. Local state
  const [error, setError] = useState(null);
  
  // 2. React Query
  const { data: record, isLoading } = useQuery(
    ['record', recordId],
    () => api.getRecord(recordId)
  );
  
  const updateMutation = useMutation(
    (data) => api.updateRecord(recordId, data)
  );
  
  // 3. Memoized callback
  const updateRecord = useCallback(
    (data) => updateMutation.mutateAsync(data),
    [updateMutation]
  );
  
  // 4. Return
  return { record, isLoading, error, updateRecord };
};
```

### CSS Module Styling

```typescript
// Component
import styles from './GridView.module.scss';

export const GridView = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Records</h1>
      </header>
      <div className={styles.grid}>{/* Grid content */}</div>
    </div>
  );
};
```

```scss
// GridView.module.scss
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--background);
}

.header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.grid {
  flex: 1;
  overflow: auto;
}

// Mobile responsive
@media (max-width: 768px) {
  .container {
    height: 100%;
  }
  
  .header {
    padding: 12px;
  }
}
```

### OUTE-DS Component Usage

```typescript
import { Button, Dialog, TextField } from '@oute/oute-ds.*';

export const RecordForm = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
      >
        Add Record
      </Button>
      
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New Record"
      >
        <TextField
          label="Name"
          fullWidth
          margin="normal"
        />
        
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          Save
        </Button>
      </Dialog>
    </>
  );
};
```

---

## 🆘 Troubleshooting

### Path Alias Not Working

**Solution:** Verify `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@features/*": ["./features/*"]
    }
  }
}
```

### CSS Module Types Missing

**Solution:** Ensure `vite.config.ts` has:
```typescript
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
});
```

### React Query Cache Issues

**Solution:** Initialize QueryClient properly:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000
    }
  }
});
```

### WebSocket Connection Failed

**Solution:** Ensure Socket.io client initialized:
```typescript
import { io } from 'socket.io-client';

const socket = io(process.env.VITE_WS_URL, {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

---

## 📖 File Structure Reference

```
cursor/
├── README.md                           # Cursor AI overview
├── DEVELOPMENT-GUIDE.md                # This file
│
├── functional/                         # Feature requirements
│   ├── data-model.rules.md
│   ├── field-types.rules.md
│   ├── views.rules.md
│   ├── data-operations.rules.md
│   └── relationships.rules.md
│
├── technical/                          # Implementation rules
│   ├── backend-architecture.rules.md
│   ├── frontend-architecture.rules.md
│   ├── react-component-structure.rules.md
│   ├── css-styling.rules.md
│   ├── database-operations.rules.md
│   ├── dto-validation.rules.md
│   ├── realtime-websocket.rules.md
│   └── README.md
│
└── development-phases/                 # Phase roadmap
    ├── README.md                       # Phase overview
    ├── phase-0-project-setup.md
    ├── phase-1-auth-routing.md
    ├── phase-2-layout-structure.md
    ├── phase-3-canvas-grid-foundation.md
    ├── ... (phases 4-12)
```

---

## ✅ Quality Checklist

Before committing each phase:

- [ ] All TypeScript errors resolved
- [ ] Component structure follows TECH-REACT-STRUCT-001
- [ ] Hook structure follows TECH-REACT-STRUCT-002
- [ ] CSS uses OUTE-DS + CSS Modules (no Tailwind)
- [ ] All props typed
- [ ] All rules applied
- [ ] Acceptance criteria met
- [ ] Tests pass (if applicable)
- [ ] No backend changes made
- [ ] Keycloak auth unchanged

---

## 🎓 Learning Resources

1. **React Patterns:** [React Docs](https://react.dev/)
2. **Vite Guide:** [Vite Docs](https://vitejs.dev/)
3. **React Query:** [React Query Docs](https://tanstack.com/query/)
4. **Zustand:** [Zustand GitHub](https://github.com/pmndrs/zustand)
5. **Canvas API:** [MDN Canvas Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
6. **Teable Reference:** `reference/teable/` (architecture patterns)
7. **Old Frontend Reference:** `frontend/src/` (integration patterns)

---

## 🚀 Ready to Start?

1. Read `/ARCHITECTURE.md` for overall vision
2. Review `/cursor/technical/` rules
3. Open `/cursor/development-phases/phase-0-project-setup.md`
4. Follow the Implementation Prompt
5. Verify against Acceptance Criteria
6. Move to Phase 1

**Happy coding! 🎉**

