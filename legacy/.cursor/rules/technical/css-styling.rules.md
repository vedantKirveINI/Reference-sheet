# CSS & Styling Rules
**CURSOR: TECH-CSS-001 through TECH-CSS-003**

## TECH-CSS-001: Styling Architecture & Strategy (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `frontend/apps/web/src/`

### Purpose
Define a focused styling strategy using OUTE-DS design system + CSS Modules for consistency and maintainability.

### Recommended Approach: **OUTE-DS + CSS Modules**

```
Styling Stack (in priority order):
1. OUTE-DS Components        (Pre-built, themed UI components from design system)
2. CSS Modules               (Component-scoped SCSS styles, no conflicts)
3. CSS Variables             (Dynamic values only - colors, spacing from OUTE theme)
```

### Why This Approach?

```
┌─────────────────────────────────────────────────┐
│          OUTE-DS (Design System)                │
│  Pre-built: Button, Dialog, Menu, TextField,   │
│  Alert, Checkbox, Radio, Card, etc.            │
│  ✅ Consistent design                          │
│  ✅ Themeable (dark/light mode)                │
│  ✅ No extra CSS needed                        │
│  ✅ MUI-based, production-ready               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      CSS Modules (Component-Scoped)             │
│  When: Complex layouts, custom styling         │
│  Where: features/*/components/*.module.scss    │
│  ✅ No naming conflicts                        │
│  ✅ Clear ownership                            │
│  ✅ Easy refactoring                           │
│  ✅ Zero runtime cost                          │
│  ✅ Better than utility classes                │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      CSS Variables (Dynamic Values)             │
│  When: Theme colors, dynamic spacing           │
│  Where: In CSS Module with var()               │
│  ✅ Runtime theming support                    │
│  ✅ Single source of truth                     │
│  ✅ Easy to maintain                           │
└─────────────────────────────────────────────────┘
```

---

## TECH-CSS-002: Implementation Patterns (CRITICAL)
**Priority:** CRITICAL | Status: Baseline

### Pattern 1: OUTE-DS Components (Primary - 80% of styling)

```typescript
// CURSOR: TECH-CSS-002 - OUTE-DS Components

// ✅ GOOD - Use pre-built components
import { Button, Dialog, TextField } from '@oute/oute-ds.*';

export const RecordForm = ({ record, onSave }: Props) => {
  return (
    <Dialog title="Edit Record">
      <TextField
        label="Name"
        defaultValue={record.name}
        fullWidth
      />
      
      <TextField
        label="Email"
        type="email"
        defaultValue={record.email}
        fullWidth
      />
      
      <Button 
        variant="contained" 
        color="primary"
        onClick={onSave}
      >
        Save
      </Button>
    </Dialog>
  );
};

// ❌ BAD - Custom styling for basic components
export const RecordForm = ({ record, onSave }: Props) => {
  return (
    <div className={styles.dialog}>
      <input
        type="text"
        className={styles.input}
        defaultValue={record.name}
      />
      
      <button className={styles.button} onClick={onSave}>
        Save
      </button>
    </div>
  );
};
```

### Pattern 2: CSS Modules for Complex Layouts (20% of styling)

```typescript
// CURSOR: TECH-CSS-002 - CSS Modules

// Component structure
// features/view/components/GridView.tsx
// features/view/components/GridView.module.scss

import styles from './GridView.module.scss';
import { Button } from '@oute/oute-ds-button';

export const GridView = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Records</h1>
        <div className={styles.toolbar}>
          <Button variant="outlined">Filter</Button>
          <Button variant="outlined">Sort</Button>
          <Button variant="outlined">Export</Button>
        </div>
      </header>
      
      <div className={styles.grid}>
        {/* Grid content - rendered on canvas */}
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </div>
  );
};

// GridView.module.scss
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--grid-background);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--grid-border);
  background: var(--header-background);
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.toolbar {
  display: flex;
  gap: 8px;
  
  button {
    padding: 8px 16px;
  }
}

.grid {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

### Pattern 3: Mixing OUTE-DS + CSS Modules (When needed)

```typescript
// CURSOR: TECH-CSS-002 - Hybrid Approach

import styles from './GridCell.module.scss';
import { Tooltip } from '@oute/oute-ds-tooltip';

export const GridCell = ({ value, field, isSelected }: Props) => {
  return (
    <Tooltip title={field.description}>
      <div
        className={`${styles.cell} ${isSelected ? styles.selected : ''}`}
      >
        {value}
      </div>
    </Tooltip>
  );
};

// GridCell.module.scss
.cell {
  min-width: 100px;
  min-height: 32px;
  padding: 8px;
  display: flex;
  align-items: center;
  border: 1px solid var(--cell-border);
  background: var(--cell-background);
  cursor: cell;
  user-select: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--cell-hover-background);
    border-color: var(--cell-hover-border);
  }
}

.selected {
  background: var(--cell-selected-background);
  border-color: var(--cell-selected-border);
  box-shadow: inset 0 0 0 2px var(--cell-selected-border);
  
  &:hover {
    background: var(--cell-selected-background);
  }
}
```

### Pattern 4: Responsive Layouts with CSS Media Queries

```typescript
// CURSOR: TECH-CSS-002 - Responsive Layout

import styles from './RecordDetail.module.scss';

export const RecordDetail = ({ record }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{record.name}</h1>
      </div>
      
      <div className={styles.content}>
        <aside className={styles.sidebar}>
          {/* Sidebar content */}
        </aside>
        
        <main className={styles.main}>
          {/* Main content */}
        </main>
      </div>
    </div>
  );
};

// RecordDetail.module.scss
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  
  h1 {
    margin: 0;
  }
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 16px;
  padding: 16px;
}

.sidebar {
  width: 250px;
  border-right: 1px solid var(--border-color);
  padding-right: 16px;
  overflow-y: auto;
}

.main {
  flex: 1;
  overflow-y: auto;
}

// Mobile: Stack layout
@media (max-width: 768px) {
  .content {
    flex-direction: column;
    gap: 8px;
    padding: 8px;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    padding-right: 0;
    padding-bottom: 8px;
  }
}
```

---

## TECH-CSS-003: File Organization & Best Practices (HIGH)
**Priority:** HIGH | Status: Baseline

### File Structure

```
frontend/apps/web/src/
├── features/
│   ├── record/
│   │   ├── components/
│   │   │   ├── RecordDetail.tsx
│   │   │   ├── RecordDetail.module.scss    # ← Scoped styles
│   │   │   ├── RecordForm.tsx
│   │   │   ├── RecordForm.module.scss
│   │   │   └── __tests__/
│   │   ├── hooks/
│   │   └── store/
│   │
│   ├── view/
│   │   └── components/
│   │       ├── grid/
│   │       │   ├── GridView.tsx
│   │       │   ├── GridView.module.scss
│   │       │   ├── GridCell.tsx
│   │       │   └── GridCell.module.scss
│   │       └── form/
│   │           ├── FormView.tsx
│   │           └── FormView.module.scss
│   │
│   └── common/
│       ├── components/
│       │   ├── Header/
│       │   │   ├── Header.tsx
│       │   │   └── Header.module.scss
│       │   └── Sidebar/
│       │       ├── Sidebar.tsx
│       │       └── Sidebar.module.scss
│       └── styles/
│           ├── variables.scss          # ← Design tokens
│           └── mixins.scss             # ← Reusable mixins
│
├── styles/
│   ├── globals.scss                   # ← Global resets
│   ├── variables.scss                 # ← CSS variables, SCSS vars
│   └── animations.scss                # ← Shared animations
│
└── index.css                          # ← Import global styles
```

### Best Practices (MANDATORY)

1. **Use CSS Modules by Default**
   ```typescript
   // ✅ GOOD - Scoped styles
   import styles from './Component.module.scss';
   
   <div className={styles.container} />
   
   // ❌ BAD - Global class (naming conflicts)
   <div className="container" />
   ```

2. **BEM Naming Within Modules (for clarity)**
   ```scss
   // ✅ GOOD - Clear hierarchy
   .gridView {
     &__header {
       padding: 16px;
     }
     
     &__row {
       display: flex;
       
       &--selected {
         background: var(--selected-bg);
       }
     }
     
     &__cell {
       border: 1px solid var(--border);
       
       &--header {
         font-weight: 600;
       }
     }
   }
   
   // ❌ BAD - Confusing naming
   .grid {
     .head { }
     .r { }
     .c { }
   }
   ```

3. **Use SCSS Variables for Design Tokens**
   ```scss
   // variables.scss
   $primary-color: #3b82f6;
   $secondary-color: #6b7280;
   $spacing-unit: 8px;
   $border-radius: 4px;
   $transition-duration: 0.2s;
   
   // Component.module.scss
   .button {
     background: $primary-color;
     padding: $spacing-unit * 2;
     border-radius: $border-radius;
     transition: all $transition-duration ease;
   }
   ```

4. **Use CSS Variables for Theme-able Values**
   ```scss
   // globals.scss
   :root {
     --primary: #3b82f6;
     --secondary: #6b7280;
     --background: #ffffff;
     --text-primary: #1f2937;
     --text-secondary: #6b7280;
     --border: #e5e7eb;
     --spacing-sm: 4px;
     --spacing-md: 8px;
     --spacing-lg: 16px;
   }
   
   // Component.module.scss
   .button {
     background: var(--primary);
     color: white;
     padding: var(--spacing-md) var(--spacing-lg);
   }
   ```

5. **No Inline Styles**
   ```typescript
   // ✅ GOOD - Use CSS
   <div className={styles.container} />
   
   // ❌ BAD - Inline styles
   <div style={{ background: '#fff', padding: '16px' }} />
   ```

6. **Dynamic Styles Use CSS Variables**
   ```typescript
   // ✅ GOOD - CSS variables for dynamic values
   export const Cell = ({ color }: Props) => {
     return (
       <div
         className={styles.cell}
         style={{ '--cell-color': color } as CSSProperties}
       />
     );
   };
   
   // Cell.module.scss
   .cell {
     background: var(--cell-color, #fff);
   }
   
   // ❌ BAD - Inline styles
   <div style={{ background: color }} />
   ```

### SCSS Setup

```scss
// globals.scss
@import './variables.scss';
@import './mixins.scss';

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  width: 100%;
  height: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
    'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
    'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--background);
  color: var(--text-primary);
  line-height: 1.5;
}

// variables.scss
// SCSS variables (compile-time)
$primary: #3b82f6;
$secondary: #6b7280;
$danger: #ef4444;
$success: #10b981;
$warning: #f59e0b;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

$font-size-xs: 12px;
$font-size-sm: 14px;
$font-size-base: 16px;
$font-size-lg: 18px;
$font-size-xl: 24px;

$border-radius-sm: 2px;
$border-radius-md: 4px;
$border-radius-lg: 8px;

$transition-fast: 150ms ease;
$transition-base: 200ms ease;
$transition-slow: 300ms ease;

// CSS custom properties (runtime)
:root {
  --primary: #{$primary};
  --secondary: #{$secondary};
  --danger: #{$danger};
  --success: #{$success};
  --warning: #{$warning};
  
  --background: #ffffff;
  --surface: #f9fafb;
  --overlay: rgba(0, 0, 0, 0.5);
  
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-disabled: #d1d5db;
  
  --border: #e5e7eb;
  --border-light: #f3f4f6;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

// mixins.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@mixin truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@mixin multiline-truncate($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@mixin grid-columns($cols: 1, $gap: $spacing-md) {
  display: grid;
  grid-template-columns: repeat($cols, 1fr);
  gap: $gap;
}

@mixin shadow($level: 'md') {
  @if $level == 'sm' {
    box-shadow: var(--shadow-sm);
  } @else if $level == 'md' {
    box-shadow: var(--shadow-md);
  } @else if $level == 'lg' {
    box-shadow: var(--shadow-lg);
  }
}

// animations.scss
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-4px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

---

## Styling Decision Matrix

| Use Case | Technology | Why |
|----------|-----------|-----|
| UI Components (Button, Dialog, etc.) | **OUTE-DS** | Pre-built, themed, consistent |
| Complex Layouts (Grid, Forms) | **CSS Modules** | Scoped, maintainable, no conflicts |
| Responsive Layout (Mobile/Tablet) | **CSS Modules + Media Queries** | Traditional, reliable, no dependencies |
| Dynamic Colors/Spacing | **CSS Variables** | Runtime theming, clean syntax |
| Animation/Transitions | **SCSS** | Powerful, reusable, keyframes support |
| Global Styles (Resets, Fonts) | **SCSS** | One place for all global styles |
| Theme Switching (Dark Mode) | **CSS Variables** | Single source of truth |

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│  OUTE-DS Components                     │
│  (Pre-styled, ready to use)             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  CSS Modules + Media Queries            │
│  (Component-scoped, responsive)         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  CSS Variables (Theme)                  │
│  (Dynamic values, colors, spacing)      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Global Styles (globals.scss)           │
│  (Resets, fonts, base styles)           │
└─────────────────────────────────────────┘
```

---

## Performance Considerations

```
OUTE-DS:
├─ ✅ Pre-compiled, no extra build
├─ ✅ Only loaded once (already in use)
└─ Size: Already in bundle

CSS Modules:
├─ ✅ Tree-shakeable
├─ ✅ Only loaded for components used
├─ ✅ Zero runtime overhead
└─ Size: ~2-3KB per 100 lines of SCSS

CSS Variables:
├─ ✅ Zero runtime overhead
├─ ✅ Native browser support
└─ Size: Minimal (stored efficiently)

Total Bundle Impact:
├─ SCSS compilation: Build-time only
├─ CSS output: ~50-100KB for full app (varies)
├─ Gzipped: ~15-25KB
└─ Zero runtime JS overhead
```

---

## Acceptance Criteria (CSS & Styling)

- [ ] All components use OUTE-DS or CSS Modules
- [ ] No inline styles (except CSS variables for dynamics)
- [ ] No global class names outside of globals.scss
- [ ] Responsive layouts use CSS Media Queries
- [ ] SCSS variables for all repeated values
- [ ] CSS variables for theme-able values
- [ ] CSS Modules used for component styles
- [ ] No CSS-in-JS, styled-components, or Tailwind
- [ ] Dark mode support via CSS variables
- [ ] Performance: Build size <400KB (gzipped)
