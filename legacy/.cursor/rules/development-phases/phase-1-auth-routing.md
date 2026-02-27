# Phase 1: Auth & Routing
**CRITICAL | Duration: 2-3 days | Status: Not Started**

## 🎯 Phase Overview

This phase integrates Keycloak authentication and sets up React Router navigation. We'll build:
- ✅ Keycloak integration (from old frontend, no changes)
- ✅ React Router v6 with protected routes
- ✅ AuthRoute component for route protection
- ✅ Layout context for shared auth state
- ✅ Login redirect handling
- ✅ Session management with Zustand
- ✅ Environment variable setup for Keycloak

**Why:** Auth and routing are foundational - everything else depends on these working correctly.

---

## 📚 Reference Analysis

### How Teable Does It

**SessionProvider Pattern:**
```typescript
// From reference/teable/apps/nextjs-app/src/features/app/layouts/BaseLayout.tsx
<SessionProvider user={user}>
  <AppProvider>
    {children}
  </AppProvider>
</SessionProvider>
```

**Key Insights:**
- SessionProvider wraps app at top level
- User data passed as prop from SSR (we'll pass from API)
- Session context available everywhere
- Works with Keycloak or any auth provider

**Layout Pattern:**
- Multiple layouts (BaseLayout, SpaceLayout)
- Protected by auth guard
- User context shared through providers

### How Old Frontend Does It

**Keycloak Integration:**
```typescript
// From frontend/src/components/AuthRoute/index.jsx
import AuthRoute from "../components/AuthRoute";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute component={WelcomeScreen} />} />
      <Route path="/ai-enrichment" element={<AuthRoute component={AiEnrichment} />} />
    </Routes>
  );
}
```

**Key Patterns:**
- AuthRoute wraps protected components
- Checks if user is authenticated
- Redirects to Keycloak if not
- Keycloak server configured via env vars
- `serverConfig` from `oute-ds-utils` provides config

**What to Keep:**
- Keycloak server URL (from environment)
- AuthRoute pattern (wraps routes)
- Session initialization on app start
- No modifications to existing auth flow

---

## 🛠️ Technical Implementation

### Router Structure

```
App.tsx
├── Router.tsx (React Router v6)
│   ├── / → WelcomeScreen (protected)
│   ├── /workspace/:workspaceId → Workspace (protected)
│   ├── /base/:baseId → Base (protected)
│   ├── /table/:tableId → Table (protected)
│   └── * → Redirect (public)
│
└── Providers
    ├── AuthProvider (Keycloak state)
    ├── SessionProvider (User context)
    └── QueryClientProvider (React Query)
```

### Auth Flow

```
1. User visits app
2. Check localStorage for auth token
3. If no token → redirect to Keycloak login
4. If token exists → fetch user profile
5. Store user in Zustand store
6. Set in SessionProvider context
7. Allow access to protected routes
```

### File Structure After Phase 1

```
apps/web/src/
├── api/
│   ├── auth.ts                 # Keycloak API calls
│   ├── client.ts               # HTTP client with auth header
│   └── index.ts
│
├── store/
│   ├── auth.store.ts           # Zustand auth store
│   └── index.ts
│
├── components/
│   ├── AuthRoute.tsx           # Route protection wrapper
│   ├── AuthGuard.tsx           # Guard for manual checks
│   └── index.ts
│
├── hooks/
│   ├── useAuth.ts              # Auth hook
│   ├── useKeycloak.ts          # Keycloak-specific hook
│   └── index.ts
│
├── contexts/
│   ├── SessionContext.tsx       # User session context
│   └── index.ts
│
├── providers/
│   ├── AuthProvider.tsx        # Auth provider (Keycloak)
│   ├── SessionProvider.tsx     # Session provider
│   ├── QueryProvider.tsx       # React Query provider
│   └── index.ts
│
├── types/
│   ├── auth.ts                 # Auth types
│   └── index.ts
│
├── App.tsx
├── Router.tsx                  # React Router setup
└── main.tsx
```

---

## 📋 Rules Checklist

- [ ] **TECH-REACT-STRUCT-001** - All components follow 16-step order
- [ ] **TECH-REACT-STRUCT-002** - All hooks follow 13-step order
- [ ] **TECH-REACT-001** - Feature modules organized
- [ ] **TECH-CSS-001** - SCSS Modules + OUTE-DS
- [ ] All API calls typed with proper error handling
- [ ] Routes protected with AuthRoute
- [ ] Keycloak config from environment variables
- [ ] User session stored in Zustand
- [ ] No backend modifications
- [ ] Keycloak integration unchanged from old code

---

## 🚀 Implementation Prompt

Copy this entire section and provide it to Cursor AI:

```
## Build Auth & Routing (Phase 1)

Context: After Phase 0 project setup, now we need authentication and routing.

### Key Requirements:
- Keep existing Keycloak integration (NO changes to auth mechanism)
- Use React Router v6 for client-side routing
- Protect routes with AuthRoute component
- Store user session in Zustand store
- All components follow TECH-REACT-STRUCT-001 (16-step order)
- All hooks follow TECH-REACT-STRUCT-002 (13-step order)
- Use OUTE-DS for UI components
- Use CSS Modules for styling
- TypeScript strict mode

### Reference Files:
FROM OLD FRONTEND (patterns to copy):
- frontend/src/components/AuthRoute/index.jsx
  └─ AuthRoute component pattern (adapt to TypeScript/React Router v6)

- frontend/src/routes/index.jsx
  └─ Router structure (convert to React Router v6)

FROM TEABLE (patterns to learn):
- reference/teable/apps/nextjs-app/src/features/app/layouts/BaseLayout.tsx
  └─ SessionProvider pattern

### Task: Build Complete Auth & Routing

1. **API Client (api/client.ts)**
   - HTTP client that adds auth header automatically
   - Interceptor for token management
   - Error handling for 401/403
   - Base URL from environment

2. **Keycloak API (api/auth.ts)**
   - getUser(): Fetch current user profile
   - login(): Redirect to Keycloak
   - logout(): Clear session and redirect
   - getToken(): Get current token from localStorage
   - refreshToken(): Refresh expired token

3. **Auth Store (store/auth.store.ts)**
   - Store user data
   - Store auth token
   - Store loading/error states
   - Actions: setUser, logout, setLoading, setError

4. **Session Context (contexts/SessionContext.tsx)**
   - Provide user to entire app
   - Follow TECH-REACT-STRUCT-001 (16-step component order)

5. **Auth Hook (hooks/useAuth.ts)**
   - Return current user
   - Return loading state
   - Return error
   - Function to logout
   - Follow TECH-REACT-STRUCT-002 (13-step hook order)

6. **Keycloak Hook (hooks/useKeycloak.ts)**
   - Initialize Keycloak from old code pattern
   - Get current token
   - Handle token refresh
   - Handle login/logout redirect

7. **Auth Route Component (components/AuthRoute.tsx)**
   - Protect routes from unauthorized access
   - Redirect to Keycloak if not authenticated
   - Show loading state while checking auth
   - Follow TECH-REACT-STRUCT-001

8. **Auth Provider (providers/AuthProvider.tsx)**
   - Initialize Keycloak on app start
   - Fetch user profile
   - Handle auth state
   - Wrap app at top level

9. **Session Provider (providers/SessionProvider.tsx)**
   - Provide user context to app
   - Get user from auth store

10. **Query Provider (providers/QueryProvider.tsx)**
    - Create and provide QueryClient
    - Configure default options
    - Handle cache timing

11. **Router (Router.tsx)**
    - Define all routes
    - Protected routes use AuthRoute wrapper
    - Public fallback route
    - Route types exported for use in pages

12. **App Component (App.tsx)**
    - Wrap with all providers
    - Router at root level
    - Proper provider nesting order

13. **Environment Configuration**
    - Create .env.example with Keycloak vars:
      - VITE_KEYCLOAK_URL
      - VITE_KEYCLOAK_REALM
      - VITE_KEYCLOAK_CLIENT_ID
      - VITE_API_BASE_URL
      - VITE_WS_URL

### Implementation Details:

**AuthRoute Component (TypeScript):**
- Check if user authenticated
- If yes: render component
- If no: redirect to Keycloak
- Show Skeleton while loading
- Handle errors gracefully

**Auth Store (Zustand):**
- user: IUser | null
- token: string | null
- isLoading: boolean
- error: Error | null
- setUser(user)
- logout()
- setLoading(bool)
- setError(error)

**Keycloak Integration:**
- Get serverConfig from environment (same as old code)
- Use localStorage for token storage
- Add auth header to all API requests
- Handle token refresh before expiry

**Router Structure:**
```
/                      → WelcomeScreen (protected)
/workspace/:id         → WorkspaceView (protected)
/base/:baseId          → BaseView (protected)
/table/:tableId        → TableView (protected)
/*                     → Redirect to /
```

### Acceptance Criteria:
- [ ] Keycloak integration works (no changes from old code)
- [ ] AuthRoute component protects routes
- [ ] User redirected to Keycloak if not authenticated
- [ ] User session stored in Zustand
- [ ] All API calls include auth header
- [ ] Token refresh handled before expiry
- [ ] Logout clears session and redirects
- [ ] All components follow 16-step order
- [ ] All hooks follow 13-step order
- [ ] TypeScript strict mode (no errors)
- [ ] No backend changes
- [ ] Environment variables documented

### Output:
Generate all files listed above with complete implementation following the patterns from old frontend and Teable.
```

---

## ✅ Acceptance Criteria

After Phase 1, verify:

- [ ] **Keycloak Integration**
  - [ ] Login redirects to Keycloak
  - [ ] Token stored in localStorage
  - [ ] Token sent in Authorization header
  - [ ] Logout clears session

- [ ] **Router**
  - [ ] All routes defined
  - [ ] Protected routes use AuthRoute
  - [ ] Unauthorized redirects to Keycloak
  - [ ] Navigation works between pages

- [ ] **Auth Store (Zustand)**
  - [ ] User state persists
  - [ ] Actions update state correctly
  - [ ] Store accessible from all components

- [ ] **Hooks & Components**
  - [ ] useAuth() hook works
  - [ ] useKeycloak() hook works
  - [ ] AuthRoute component protects routes
  - [ ] All follow 16/13-step structure

- [ ] **Environment Configuration**
  - [ ] .env.example created
  - [ ] All Keycloak vars documented
  - [ ] API base URL configured

- [ ] **Type Safety**
  - [ ] No TypeScript errors
  - [ ] All types defined
  - [ ] No `any` types

- [ ] **No Backend Changes**
  - [ ] Backend untouched
  - [ ] Existing APIs used as-is
  - [ ] Keycloak config unchanged

---

## 📌 Next Phase

Once Phase 1 is complete:
1. ✅ Auth working (login/logout)
2. ✅ Routes protected
3. ✅ User session in Zustand
4. ✅ All components follow rules

→ **Move to Phase 2: Layout Structure**
