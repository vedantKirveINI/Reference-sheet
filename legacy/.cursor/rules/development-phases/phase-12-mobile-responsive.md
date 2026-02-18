# Phase 12: Mobile Responsive
**MEDIUM | Duration: 2-3 days | Status: Not Started**

## 🎯 Phase Overview

Mobile optimization:
- ✅ Touch gestures (tap, swipe, pinch)
- ✅ Mobile grid layout
- ✅ Responsive header
- ✅ Collapsible sidebar
- ✅ Touch-friendly inputs
- ✅ Landscape support
- ✅ Performance optimizations

---

## 📚 Reference Analysis

### How Teable Does It
- Touch-first design
- Responsive breakpoints
- Gesture handling
- Mobile-optimized components

### How Old Frontend Does It
- Responsive design
- Touch support (basic)

---

## 🛠️ Implementation

### Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: 640,    // < 640px
  tablet: 1024,   // 640-1024px
  desktop: 1024,  // > 1024px
};
```

---

## 📋 Rules Checklist

- [ ] **TECH-CSS-001** - CSS architecture (CSS Modules)
- [ ] Touch gestures work
- [ ] Layout responsive
- [ ] Header adaptive
- [ ] Inputs touch-friendly
- [ ] Performance optimized
- [ ] Dark mode works

---

## 🚀 Implementation Prompt

```
## Build Mobile Responsive (Phase 12)

Complete mobile and tablet support with touch gestures.

### Context:
After Phase 11 (filters & sorting), now optimize for mobile.
- Touch gestures
- Responsive layout
- Mobile header
- Collapsible sidebar
- Performance tuning

### Key Requirements:
- Touch gestures (tap, swipe, pinch-zoom)
- Responsive grid layout
- Mobile header (hamburger menu)
- Collapsible sidebar
- Touch-friendly button sizes (48px min)
- Landscape support
- Performance tuning for mobile
- Dark mode support
- No TypeScript errors
- All components follow 16-step structure

### Breakpoints:
- Mobile: < 640px
- Tablet: 640-1024px
- Desktop: > 1024px

### Task: Build Mobile Support

1. **Touch Gestures**
   - Tap to select/edit
   - Swipe to navigate
   - Pinch to zoom
   - Long-press for context menu

2. **Responsive Layout**
   - Mobile: Stack vertical
   - Tablet: Side-by-side
   - Desktop: Full layout

3. **Mobile Header**
   - Hamburger menu
   - Condensed buttons
   - Search integration

4. **Mobile Grid**
   - Vertical scrolling
   - Horizontal scroll for columns
   - Touch-friendly column width

5. **Mobile Forms**
   - Full-width inputs
   - Large touch targets
   - Clear scrolling

6. **Performance**
   - Lazy load images
   - Reduce animations on low-end devices
   - Optimize canvas rendering
   - Battery awareness

### Acceptance Criteria:
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on landscape
- [ ] Touch gestures work
- [ ] Layout responsive
- [ ] Performance good
- [ ] Dark mode works
```

---

## ✅ Acceptance Criteria

- [ ] All breakpoints work
- [ ] Touch gestures work
- [ ] Layout responsive
- [ ] Performance good
- [ ] Dark mode works
- [ ] Landscape support

## 📌 Completion

✅ **All 12 phases complete!**

→ Run full test suite
→ Deploy frontend rebuild
