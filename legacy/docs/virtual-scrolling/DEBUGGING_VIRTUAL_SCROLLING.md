# Virtual Scrolling Debugging Guide

## 🔍 How to Verify Virtual Scrolling is Working

### Console Logs to Check

After implementing the fixes, you should see these console logs in the browser DevTools:

#### 1. **Virtual Scrolling Stats** (Every render)

```
🔍 Virtual Scrolling Stats: {
  totalRows: 1000,
  visibleRows: 25,              // Should be ~20-30, NOT 1000!
  visibleRowRange: "[0..24]",   // Only visible row indices
  totalColumns: 3,
  visibleColumns: 10,            // Only visible columns
  visibleColumnRange: "[0..9]",
  contentHeight: "32000.0",     // Total height of all 1000 rows
  contentWidth: "360.0"
}
```

**✅ Good Sign:** `visibleRows` is ~20-30 (only rendering what's visible)
**❌ Bad Sign:** `visibleRows` = 1000 (rendering all rows - virtual scrolling not working)

---

#### 2. **Rendering Cells Log** (Every render)

```
📊 Rendering cells - Visible rows: [0, 1, 2, ...] (total: 25), Visible cols: [0, 1, 2] (total: 3)
📊 Scroll state - scrollTop: 0.0 scrollLeft: 0.0
```

**✅ Good Sign:** Only rendering 25 rows (visible ones)
**❌ Bad Sign:** Rendering 1000 rows

---

#### 3. **Row Headers Log** (When row headers are drawn)

```
🎨 Drawing row headers for rows: [0, 1, 2, ...] (total visible: 25)
Row header 0: y=32.0, bottom=64.0, scrollTop=0.0, offset=32.0
Row header 1: y=64.0, bottom=96.0, scrollTop=0.0, offset=64.0
```

**✅ Good Sign:** Only drawing ~25 row headers
**❌ Bad Sign:** Drawing 1000 row headers

---

#### 4. **Cell Position Logs** (First 3 rows only, to avoid spam)

```
Cell row 0: offset=32.0, y=32.0, height=32
Cell row 1: offset=64.0, y=64.0, height=32
Cell row 2: offset=96.0, y=96.0, height=32
```

**✅ Good Sign:** Consistent row heights (all should be 32px for Short level)
**❌ Bad Sign:** Different heights for each row

---

#### 5. **Editor Positioning** (When opening editor)

```
✏️ Editor positioning - Row: 50 Offset: 1632.0 scrollTop: 1600.0 y: 32.0
```

**✅ Good Sign:** Editor Y position matches cell position
**❌ Bad Sign:** Editor appears above/below cell

---

## 📊 What Each Log Tells You

### Issue 1: All Rows in DOM?

**Check:** Virtual Scrolling Stats → `visibleRows` count

- ✅ **Working:** visibleRows = 20-30 (only visible)
- ❌ **Broken:** visibleRows = 1000 (all rows)

**Note:** Since we use Canvas rendering (not DOM), rows aren't in DOM. But if `visibleRows` = 1000, we're still processing all rows unnecessarily.

---

### Issue 2: Row Heights Different Sizes?

**Check:**

1. Row height map log: Should show `⚠️ Variable row heights detected: 0 rows`
2. Cell position logs: All heights should be same (32px for Short level)

**If heights differ:**

- Check `generateRowHeaders()` - all rows should use same `RowHeightLevel`
- Check `rowHeightMap` - should be empty `{}` for fixed heights

---

### Issue 3: Row Headers Not Visible?

**Check:**

1. "Drawing row headers for rows" log - should show row indices
2. Row header position logs - check if `y` values are within viewport
3. Visibility check: `y >= headerHeight && y <= maxY`

**Common Issues:**

- `y` values too large/small → ScrollTop mismatch
- No row headers drawn → `visibleIndices.rows` empty

---

### Issue 4: Editor Positioning Wrong?

**Check:**

1. Editor positioning log - compare `y` with cell position
2. Row offset should match cell's row offset
3. ScrollTop should be same for both

**Common Issues:**

- Editor Y doesn't match cell Y → Offset calculation wrong
- Editor appears above → Y calculation subtracts too much
- Editor appears below → Y calculation adds too much

---

## 🧪 Testing Checklist

### Test 1: Initial Load

- [ ] Virtual Scrolling Stats shows `visibleRows: ~25` (not 1000)
- [ ] Only first ~25 rows rendered in logs
- [ ] Row headers visible and aligned

### Test 2: Scroll Down

- [ ] Virtual Scrolling Stats updates (visibleRowRange changes)
- [ ] Only new visible rows are rendered (old ones disappear from logs)
- [ ] Row headers scroll with cells

### Test 3: Row Heights

- [ ] No "Variable row heights detected" warning
- [ ] All row heights same in cell logs (32px)
- [ ] No gaps or overlaps between rows

### Test 4: Editor

- [ ] Editor opens at correct position
- [ ] Editor Y matches cell Y
- [ ] Editor position correct after scrolling

### Test 5: Performance

- [ ] Console logs update smoothly (no lag)
- [ ] Only ~25 rows processed per render
- [ ] Smooth scrolling (60fps)

---

## 🐛 Common Issues & Solutions

### Issue: `visibleRows = 1000`

**Problem:** Virtual scrolling not working
**Solution:** Check `useVirtualScrolling` hook - `calculateVisibleRange` should use binary search

### Issue: Different row heights

**Problem:** RowHeightMap has entries when it shouldn't
**Solution:** Ensure all rows use same `RowHeightLevel` in `generateRowHeaders()`

### Issue: Row headers not visible

**Problem:** Visibility check too strict
**Solution:** Check `y >= headerHeight && y <= maxY` logic

### Issue: Editor position wrong

**Problem:** Offset calculation mismatch
**Solution:** Ensure editor uses same `coordinateManager.getRowOffset()` as cells

---

## 🎯 Expected Console Output (Good Example)

```
🔍 Virtual Scrolling Stats: {
  totalRows: 1000,
  visibleRows: 25,              ✅ Only visible!
  visibleRowRange: "[0..24]",
  ...
}
📊 Rendering cells - Visible rows: [0,1,2,...] (total: 25)  ✅ Only 25!
Row header 0: y=32.0, ...       ✅ Within viewport
Cell row 0: offset=32.0, ...    ✅ Consistent height
```

---

## 🚫 Bad Console Output (Problems)

```
🔍 Virtual Scrolling Stats: {
  visibleRows: 1000,            ❌ All rows!
  ...
}
⚠️ Variable row heights detected: 500 rows  ❌ Should be 0!
⚠️ No visible row indices to render row headers  ❌ Empty visible indices!
```

---

## 📝 Notes

- **Canvas Rendering:** We use Canvas (not DOM), so rows aren't technically "in DOM"
- **Virtual Scrolling:** Means we only _process/render_ visible rows (not all 1000)
- **Performance:** Should see ~25 rows processed per render, not 1000
- **Logs Frequency:** Logs appear on every render (might be frequent during scrolling - this is normal)

---

## 🎨 Disabling Logs

Once everything works, you can remove/comment out the console.log statements to reduce console noise during scrolling.
