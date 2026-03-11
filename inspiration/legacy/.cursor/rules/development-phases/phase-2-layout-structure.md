# Phase 2: Layout Structure
**CRITICAL | Duration: 2-3 days | Status: Not Started**

## 🎯 Phase Overview

Build the main application layout with:
- ✅ Sidebar navigation (spaces, bases, tables)
- ✅ Header with user menu & controls
- ✅ Main content area
- ✅ Modal/overlay container
- ✅ Responsive layout structure
- ✅ Context for managing layout state
- ✅ Zustand store for UI state (sidebar collapsed, etc.)

**Why:** All future pages will nest inside this layout structure.

---

## 📚 Reference Analysis

### How Teable Does It

**Layout Hierarchy:**
```typescript
// From reference/teable/apps/nextjs-app/src/features/app/layouts/BaseLayout.tsx
<AppLayout>
  <AppProvider>
    <SessionProvider>
      <NotificationProvider>
        <Sidebar>
          {/* Sidebar content */}
        </Sidebar>
        <div className="main">
          {children}
        </div>
      </NotificationProvider>
    </SessionProvider>
  </AppProvider>
</AppLayout>
```

**Key Components:**
- AppLayout: Global layout wrapper
- Sidebar: Navigation sidebar
- Multiple layout types (BaseLayout, SpaceLayout)
- Provider nesting for context

### How Old Frontend Does It

**Structure:**
```typescript
// From frontend/src/pages/WelcomeScreen/index.jsx
<div className="container">
  <Header /> {/* Top navigation */}
  <TabBar /> {/* Table tabs */}
  <TableSubHeader /> {/* View controls */}
  <div className="content">
    <Handsontable /> {/* Main grid */}
  </div>
</div>
```

**Patterns:**
- Nested layout sections
- Sticky header
- Flex layout
- OUTE-DS components for UI

---

## 🛠️ Technical Implementation

### Layout Structure

```
App
├── AuthProvider
└── AppLayout
    ├── Sidebar (left)
    │   ├── Header (logo, user)
    │   ├── Navigation (spaces, bases)
    │   └── Footer (user menu)
    │
    ├── Main (right, flex grow)
    │   ├── Header (top bar)
    │   │   ├── Breadcrumb
    │   │   ├── Search
    │   │   └── User menu
    │   │
    │   └── Content (scrollable)
    │       └── Page content here
    │
    └── Modals/Portals
        ├── Dialog container
        └── Toast container
```

### File Structure After Phase 2

```
apps/web/src/
├── layouts/
│   ├── AppLayout.tsx               # Main app layout
│   ├── BaseLayout.tsx              # Base/table layout
│   ├── AppLayout.module.scss
│   └── index.ts
│
├── components/
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarHeader.tsx
│   │   ├── SidebarNav.tsx
│   │   ├── SidebarFooter.tsx
│   │   └── Sidebar.module.scss
│   │
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── UserMenu.tsx
│   │   └── Header.module.scss
│   │
│   ├── Modals/
│   │   ├── ModalRoot.tsx           # Portal root
│   │   └── index.ts
│   │
│   └── index.ts
│
├── store/
│   ├── ui.store.ts                 # UI state (sidebar, etc.)
│   └── index.ts
│
├── hooks/
│   ├── useLayout.ts                # Layout context hook
│   └── index.ts
│
├── contexts/
│   ├── LayoutContext.tsx           # Layout state
│   └── index.ts
│
└── types/
    ├── layout.ts
    └── index.ts
```

---

## 📋 Rules Checklist

- [ ] **TECH-REACT-STRUCT-001** - All components follow 16-step order
- [ ] **TECH-REACT-STRUCT-002** - All hooks follow 13-step order
- [ ] **TECH-CSS-001** - SCSS Modules + OUTE-DS (no Tailwind)
- [ ] Responsive layout (desktop & mobile)
- [ ] Sidebar collapsible on mobile
- [ ] All navigation links functional
- [ ] User menu working
- [ ] Modal portal container ready
- [ ] No backend modifications

---

## 🚀 Implementation Prompt

```
## Build Layout Structure (Phase 2)

Context: After Phase 1 (auth/routing), now build the main app layout.

### Key Requirements:
- Main AppLayout component
- Sidebar navigation (collapsible on mobile)
- Header with user menu
- Main content area (flex layout)
- Modal/dialog portal container
- Responsive design (desktop & mobile)
- All components follow 16-step order
- All hooks follow 13-step order
- Use OUTE-DS for UI components
- Use CSS Modules + SCSS

### Reference Files:
FROM TEABLE:
- reference/teable/apps/nextjs-app/src/features/app/layouts/BaseLayout.tsx
  └─ Layout hierarchy pattern

- reference/teable/apps/nextjs-app/src/features/app/components/sidebar/Sidebar.tsx
  └─ Sidebar component pattern

FROM OLD FRONTEND:
- frontend/src/pages/WelcomeScreen/index.jsx
  └─ Layout structure

### Task: Build Complete Layout

1. **AppLayout Component (layouts/AppLayout.tsx)**
   - Main wrapper for entire app
   - Contains: Sidebar, Header, Content area
   - Flex layout: sidebar (fixed) + content (flex-1)
   - Portal root for modals
   - Use 16-step component structure

2. **Sidebar Component (components/Sidebar/Sidebar.tsx)**
   - Left navigation panel
   - Collapsible on mobile (hamburger menu)
   - Sections: Spaces, Bases, Tables
   - Sticky header with logo
   - Footer with user menu
   - Responsive width (250px desktop, collapsed mobile)

3. **SidebarHeader (components/Sidebar/SidebarHeader.tsx)**
   - Logo/branding
   - Collapse button
   - Team selector

4. **SidebarNav (components/Sidebar/SidebarNav.tsx)**
   - Navigation items
   - Spaces list
   - Bases under selected space
   - Tables under selected base
   - Icons from OUTE-DS

5. **SidebarFooter (components/Sidebar/SidebarFooter.tsx)**
   - User profile preview
   - Settings icon
   - Logout button

6. **Header Component (components/Header/Header.tsx)**
   - Top bar (sticky)
   - Breadcrumb (current page path)
   - Search box (placeholder)
   - User menu dropdown
   - Action buttons (add table, etc.)
   - Height: 60px
   - Background: var(--header-bg)

7. **Breadcrumb (components/Header/Breadcrumb.tsx)**
   - Show: Space > Base > Table > View
   - Clickable navigation
   - Icons from OUTE-DS

8. **UserMenu (components/Header/UserMenu.tsx)**
   - Avatar + name dropdown
   - Settings option
   - Logout option
   - Use OUTE-DS Menu/Dropdown

9. **ModalRoot (components/Modals/ModalRoot.tsx)**
   - Portal container for modals
   - div id="modal-root"
   - Use React createPortal

10. **UI Store (store/ui.store.ts)**
    - sidebarCollapsed: boolean
    - toggleSidebar()
    - currentSpace: string | null
    - currentBase: string | null
    - setCurrentSpace()
    - setCurrentBase()

11. **Layout Styles (layouts/AppLayout.module.scss)**
    - Main container layout
    - Sidebar width & positioning
    - Header positioning
    - Content area flex
    - Responsive breakpoints (768px)
    - CSS variables for colors

12. **Types (types/layout.ts)**
    - ILayoutProps
    - ISidebarItem
    - IBreadcrumb

### Layout Specifications:

**Desktop:**
- Sidebar: 250px fixed left
- Header: Full width, 60px height
- Content: Flex grow, scrollable

**Mobile (< 768px):**
- Sidebar: Collapsible (hamburger)
- Header: Full width
- Content: Full width

**CSS Variables Used:**
- --header-bg: Header background
- --header-text: Header text color
- --sidebar-bg: Sidebar background
- --sidebar-text: Sidebar text color
- --border: Border color

### Acceptance Criteria:
- [ ] AppLayout component renders correctly
- [ ] Sidebar shows/hides on mobile
- [ ] Header visible and sticky
- [ ] All links clickable
- [ ] User menu functional
- [ ] Modal portal ready
- [ ] Responsive layout works
- [ ] No TypeScript errors
- [ ] All components follow 16-step order
- [ ] All hooks follow 13-step order
- [ ] All rules applied

### Output:
Generate all layout components with proper structure, styling, and responsiveness.
```

---

## ✅ Acceptance Criteria

- [ ] **Layout Structure**
  - [ ] AppLayout renders
  - [ ] Sidebar visible on desktop
  - [ ] Header sticky at top
  - [ ] Content area scrollable

- [ ] **Responsive Design**
  - [ ] Sidebar collapses on mobile
  - [ ] Hamburger menu appears
  - [ ] Touch-friendly sizes

- [ ] **Navigation**
  - [ ] All sidebar links clickable
  - [ ] Breadcrumb shows current page
  - [ ] User menu works

- [ ] **Styling**
  - [ ] OUTE-DS components used
  - [ ] CSS Modules for layout
  - [ ] Dark mode ready (CSS variables)

- [ ] **Code Quality**
  - [ ] No TypeScript errors
  - [ ] 16-step component structure
  - [ ] 13-step hook structure
  - [ ] No `any` types

---

## 📌 Next Phase

→ **Move to Phase 3: Canvas Grid Foundation**
