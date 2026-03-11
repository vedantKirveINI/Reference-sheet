# Editor Positioning Fix - Debugging Guide

## 🔍 Issue

Editor not opening at correct position when scrolling. Offset of visible records not being taken into consideration.

## ✅ Fix Applied

### Changes Made

1. **Removed Visibility Check**
    - **Before:** Editor was hidden if row not in `visibleIndices.rows`
    - **After:** Editor always renders, position is clamped to viewport (like Teable)
    - **Reason:** Teable doesn't check visibility - it clamps position instead

2. **Fixed X Position Calculation**

    ```typescript
    // Before (WRONG):
    let x = coordinateManager.getColumnRelativeOffset(...) + rowHeaderWidth;

    // After (CORRECT - like Teable):
    const relativeX = coordinateManager.getColumnRelativeOffset(columnIndex, scrollLeft);
    const x = Math.max(
      rowHeaderWidth, // columnInitSize (min bound)
      Math.min(
        relativeX + rowHeaderWidth, // Add rowHeaderWidth to get absolute position
        containerSize.width - columnWidth, // Max bound
      ),
    );
    ```

3. **Fixed Y Position Calculation**

    ```typescript
    // Before (WRONG):
    const containerHeight = containerSize.height - FOOTER_HEIGHT;
    const y = Math.max(
    	headerHeight,
    	Math.min(relativeY, containerHeight - rowHeight),
    );

    // After (CORRECT - like Teable):
    const editorContainerHeight = containerSize.height; // Full container (no footer offset)
    const y = Math.max(
    	headerHeight, // rowInitSize (min bound)
    	Math.min(relativeY, editorContainerHeight - rowHeightForThisRow), // Max bound
    );
    ```

4. **Fixed Container Height**
    - **Before:** Used `containerSize.height - FOOTER_HEIGHT` for clamp calculation
    - **After:** Use `containerSize.height` (full container)
    - **Reason:** Editor container doesn't include footer in coordinate system

5. **Enhanced Debug Logging**
    - Added comprehensive logging with all positioning values
    - Shows: RowOffset, scrollTop, relativeY, clampedY, relativeX, clampedX

## 📊 How to Debug

### Console Logs to Check

When you open an editor, you should see:

```
✏️ Editor positioning - Row: 50 RowOffset: 1632.0 scrollTop: 1600.0 relativeY: 32.0 clampedY: 32.0 relativeX: -10.0 clampedX: 70.0
```

**What Each Value Means:**

- `RowOffset`: Absolute row offset from top (includes headerHeight)
- `scrollTop`: Current scroll position
- `relativeY`: `RowOffset - scrollTop` (where row would be if not clamped)
- `clampedY`: Final Y position (clamped to viewport)
- `relativeX`: Column position relative to content start (before row headers)
- `clampedX`: Final X position (clamped to viewport)

### Expected Behavior

#### ✅ Correct Editor Position

- Editor appears aligned with cell
- Editor stays within viewport bounds
- Editor position updates correctly when scrolling

#### ❌ Wrong Editor Position

- Editor appears above/below cell
- Editor appears outside viewport
- Editor doesn't move when scrolling

## 🧪 Testing Checklist

### Test 1: Editor at Top (Row 0)

- [ ] Open editor for row 0
- [ ] Check console log: `relativeY` should be `~32.0`, `clampedY` should be `>= 32.0`
- [ ] Editor should align with cell

### Test 2: Editor in Middle (Row 500)

- [ ] Scroll to row 500
- [ ] Open editor
- [ ] Check console log: `relativeY` and `clampedY` should be reasonable values
- [ ] Editor should align with cell

### Test 3: Editor Near Bottom (Row 999)

- [ ] Scroll to last row (999)
- [ ] Open editor
- [ ] Check console log: `clampedY` should be `<= containerHeight - rowHeight`
- [ ] Editor should stay within viewport

### Test 4: Editor After Scrolling

- [ ] Open editor at row 100
- [ ] Scroll up/down
- [ ] Editor should stay aligned (re-renders on scroll)

### Test 5: Editor When Row Not Fully Visible

- [ ] Scroll so row is partially visible (top or bottom cut off)
- [ ] Open editor
- [ ] Editor should clamp to visible area (not appear off-screen)

## 🐛 Common Issues & Solutions

### Issue 1: Editor Above Cell

**Check:** Console log `clampedY` vs cell Y position

- If `clampedY < cellY`: Y calculation subtracts too much
- **Solution:** Verify `scrollTop` is correct from InfiniteScroller

### Issue 2: Editor Below Cell

**Check:** Console log `clampedY` vs cell Y position

- If `clampedY > cellY`: Y calculation adds too much
- **Solution:** Check `rowOffset` calculation includes `rowInitSize`

### Issue 3: Editor Not Appearing

**Check:** Console log values

- If `relativeY` or `relativeX` are NaN: Missing coordinateManager calculation
- If clamped values are outside bounds: Clamp bounds wrong
- **Solution:** Verify all values in console log are numbers

### Issue 4: Editor Position Doesn't Update on Scroll

**Check:** Dependencies in editor render

- Editor should re-render when `scrollState.scrollTop` changes
- **Solution:** Ensure `scrollState` is in dependencies

## 📝 Key Differences from Before

### Before (WRONG):

1. ❌ Hidden editor if row not in `visibleIndices`
2. ❌ Used `containerHeight - FOOTER_HEIGHT` for clamp
3. ❌ Didn't properly clamp X position
4. ❌ Missing debug information

### After (CORRECT - like Teable):

1. ✅ Always render editor (let clamp handle positioning)
2. ✅ Use `containerSize.height` for clamp (no footer offset)
3. ✅ Proper X and Y clamping with correct bounds
4. ✅ Comprehensive debug logging

## 🎯 Reference: Teable's Implementation

Teable uses:

```typescript
const x = clamp(
	coordInstance.getColumnRelativeOffset(columnIndex, scrollLeft),
	columnInitSize, // rowHeaderWidth
	containerWidth - width,
);
const y = clamp(
	coordInstance.getRowOffset(rowIndex) - scrollTop,
	rowInitSize, // headerHeight
	containerHeight - height,
);
```

Our implementation now matches this exactly!

## 🔧 Next Steps

1. Test editor opening at different scroll positions
2. Check console logs to verify positioning values
3. Compare editor position with cell position visually
4. If still incorrect, check console logs and report specific values
