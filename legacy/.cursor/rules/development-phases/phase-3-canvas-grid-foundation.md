# Phase 3: Canvas Grid Foundation
**CRITICAL | Duration: 5-7 days | Status: Not Started**

## 🎯 Phase Overview

Build the core Canvas-based grid engine:
- ✅ Canvas renderer with rendering loop
- ✅ Coordinate system (row, col → pixel x, y)
- ✅ Virtual scrolling for large datasets
- ✅ Mouse event handling (click, drag, wheel)
- ✅ Keyboard event system
- ✅ Grid context & providers
- ✅ Managers (Coordinate, Virtualization, Performance)

**Why:** Foundation for all grid interactions and rendering.

---

## 📚 Reference Analysis

### How Teable Does It

**Canvas Rendering Loop:**
- requestAnimationFrame for 60fps rendering
- Separate render and event loops
- Virtual scrolling with viewport calculation
- Coordinate transformation

**Grid Architecture:**
- CanvasRenderer: Core rendering engine
- Managers: Selection, Coordinate, Virtualization
- Events: Mouse, keyboard, touch
- Context: Share grid state

### How Old Frontend Does It

**Handsontable Integration:**
- Grid component wraps Handsontable
- Mouse events for selection
- Keyboard navigation
- Column/row headers

**Patterns to Adopt:**
- Virtual rendering for performance
- Selection management
- Keyboard shortcuts

---

## 🛠️ Technical Implementation

### Canvas Grid Architecture

```
CanvasGrid.tsx (Component)
├── useCanvasGrid() hook
├── CanvasRenderer (canvas rendering)
├── EventSystem (mouse, keyboard, touch)
├── Managers
│   ├── CoordinateManager
│   ├── VirtualizationManager
│   ├── SelectionManager
│   └── PerformanceTracker
└── GridContext Provider
```

### File Structure

```
packages/sdk/src/grid/
├── canvas/
│   ├── CanvasRenderer.ts        # Main rendering engine
│   ├── rendering/
│   │   ├── HeaderRenderer.ts
│   │   ├── CellRenderer.ts
│   │   └── theme.ts
│   │
│   └── events/
│       ├── MouseEvents.ts
│       ├── KeyboardEvents.ts
│       ├── TouchEvents.ts
│       └── ScrollEvents.ts
│
├── managers/
│   ├── CoordinateManager.ts     # Row/col → pixel conversion
│   ├── VirtualizationManager.ts # Viewport calculation
│   ├── SelectionManager.ts      # Cell selection state
│   └── PerformanceTracker.ts    # FPS, memory monitoring
│
├── contexts/
│   ├── GridContext.tsx
│   ├── RenderContext.tsx
│   └── InteractionContext.tsx
│
├── hooks/
│   ├── useCanvasGrid.ts
│   ├── useGridRendering.ts
│   ├── useGridInteraction.ts
│   └── useGridPerformance.ts
│
├── types/
│   ├── grid.types.ts
│   ├── canvas.types.ts
│   └── event.types.ts
│
└── components/
    └── CanvasGrid.tsx           # Main component
```

---

## 📋 Rules Checklist

- [ ] **TECH-FRONTEND-001** - Canvas grid architecture
- [ ] **TECH-REACT-STRUCT-001** - Components follow 16-step order
- [ ] **TECH-REACT-STRUCT-002** - Hooks follow 13-step order
- [ ] Virtual scrolling for large grids
- [ ] 60fps rendering performance
- [ ] No memory leaks
- [ ] requestAnimationFrame for smooth rendering
- [ ] Coordinate system tests

---

## 🚀 Implementation Prompt

```
## Build Canvas Grid Foundation (Phase 3)

Context: Core grid rendering engine using Canvas 2D API (like Teable, not React components).

### Key Requirements:
- Canvas-based rendering (not DOM)
- Virtual scrolling for performance
- 60fps rendering loop
- Coordinate transformation system
- Mouse/keyboard/touch events
- Manager pattern for separation of concerns
- Context providers for grid state
- All components follow 16-step structure
- All hooks follow 13-step structure

### Reference Files:
FROM TEABLE:
- reference/teable/packages/sdk/ (grid implementation)
  └─ Canvas rendering patterns

### Task: Build Canvas Grid Foundation

1. **CanvasRenderer (canvas/CanvasRenderer.ts)**
   - Main rendering engine
   - requestAnimationFrame loop
   - Clear canvas
   - Draw grid structure
   - Handle resize

2. **MouseEvents (canvas/events/MouseEvents.ts)**
   - Click handling
   - Drag handling
   - Hover detection
   - Context menu

3. **KeyboardEvents (canvas/events/KeyboardEvents.ts)**
   - Arrow keys for navigation
   - Enter/Escape handling
   - Shortcuts (Ctrl+C, etc.)

4. **CoordinateManager (managers/CoordinateManager.ts)**
   - Convert row/col to pixel x/y
   - Convert pixel x/y to row/col
   - Handle column widths
   - Handle row heights

5. **VirtualizationManager (managers/VirtualizationManager.ts)**
   - Calculate visible cells
   - Viewport calculation
   - Scrolling bounds

6. **SelectionManager (managers/SelectionManager.ts)**
   - Cell selection state
   - Range selection
   - Selection visual tracking

7. **PerformanceTracker (managers/PerformanceTracker.ts)**
   - FPS monitoring
   - Memory tracking
   - Render time measurement

8. **GridContext (contexts/GridContext.tsx)**
   - Share grid instance
   - Access to managers
   - Grid state

9. **useCanvasGrid (hooks/useCanvasGrid.ts)**
   - Initialize grid
   - Render data
   - Handle events

10. **CanvasGrid (components/CanvasGrid.tsx)**
    - Main component wrapper
    - Canvas element
    - Event listeners
    - Use 16-step structure

### Canvas Grid Specifications:

**Default Sizes:**
- Column width: 100px
- Row height: 32px
- Header height: 40px
- Row header width: 50px

**Performance:**
- Virtual viewport: Render only visible cells
- Batch updates: Update regions, not individual cells
- requestAnimationFrame: 60fps max

**Rendering Loop:**
```
1. Clear canvas
2. Draw background
3. Draw row headers
4. Draw column headers
5. Draw visible cells
6. Draw selection overlay
7. Draw cursor
8. Request next frame
```

### Acceptance Criteria:
- [ ] Canvas renders grid structure
- [ ] Rendering loop runs at 60fps
- [ ] Virtual scrolling works
- [ ] Coordinate system converts correctly
- [ ] Mouse events detected
- [ ] Keyboard events work
- [ ] No memory leaks
- [ ] No TypeScript errors
- [ ] All 16-step/13-step rules followed

### Output:
Generate all foundation files for Canvas grid with proper architecture.
```

---

## ✅ Acceptance Criteria

- [ ] **Canvas Rendering**
  - [ ] Grid renders on canvas
  - [ ] Smooth 60fps rendering
  - [ ] No flickering

- [ ] **Virtual Scrolling**
  - [ ] Only visible cells rendered
  - [ ] Smooth scrolling
  - [ ] Memory efficient

- [ ] **Coordinate System**
  - [ ] Row/col → pixel conversion works
  - [ ] Pixel → row/col conversion works
  - [ ] Column widths respected

- [ ] **Event System**
  - [ ] Mouse clicks detected
  - [ ] Keyboard input captured
  - [ ] Touch events handled

- [ ] **Performance**
  - [ ] 60fps sustained
  - [ ] No memory leaks
  - [ ] Smooth interactions

- [ ] **Code Quality**
  - [ ] No TypeScript errors
  - [ ] 16-step component structure
  - [ ] 13-step hook structure

---

## 📌 Next Phase

→ **Move to Phase 4: Cell Rendering**
