# Kanban Field Type Support

## Why SingleSelect and User Fields?

Kanban views are designed to group records into **distinct, categorical columns**. Here's why SingleSelect and User fields are preferred:

### 1. **SingleSelect Fields**
- ✅ **Fixed set of choices** - You know all possible values upfront
- ✅ **Can show empty stacks** - Display all choices even if no records
- ✅ **Can create new stacks** - Add new choices on the fly
- ✅ **Can rename stacks** - Edit choice names directly
- ✅ **Can reorder stacks** - Drag columns to reorder choices
- ✅ **Limited columns** - Won't create hundreds of columns

**Example:** Status field with "To Do", "In Progress", "Done"
- Always shows all 3 columns
- Can add "Blocked" as a new column
- Can rename "To Do" to "Backlog"

### 2. **User Fields**
- ✅ **Fixed set of users** - All collaborators in the base
- ✅ **Can show empty stacks** - Display all users even if no assignments
- ✅ **Visual representation** - Show avatars, names, emails
- ✅ **Limited columns** - One column per user

**Example:** Assignee field
- Shows all team members as columns
- Empty columns for users with no tasks
- Easy to see who's overloaded

### 3. **Other Field Types - Why They're Problematic**

#### Text Fields (String)
- ❌ **Infinite possible values** - Every record could have a different value
- ❌ **Too many columns** - Could create 1000+ columns
- ❌ **No way to create new values** - Can't add new columns easily
- ⚠️ **Could work** - If you have a small, controlled set of values (like "Priority: High/Medium/Low" as text)

#### Number Fields
- ❌ **Infinite possible values** - Every number is unique
- ❌ **Too many columns** - Could create millions of columns
- ⚠️ **Could work** - If you group by ranges (0-10, 11-20, etc.) - but that's complex

#### Date Fields
- ❌ **Infinite possible dates** - Every date is unique
- ❌ **Too many columns** - Could create thousands of columns
- ⚠️ **Could work** - If you group by week/month/year - but that's complex

#### MultipleSelect (MCQ)
- ⚠️ **Partially supported** - Records can belong to multiple stacks
- ⚠️ **Complex UX** - A record appears in multiple columns
- ⚠️ **Not ideal** - Usually SingleSelect is better for Kanban

## Current Implementation

Looking at Teable's code, they actually **DO support other field types**, but with limitations:

```typescript
// From Teable's KanbanProvider
if (type === FieldType.SingleSelect) {
  // Special handling: ensure all choices are represented
  const choices = options?.choices;
  const stackList = choices.map(...);
  // Shows all choices, even empty ones
}

if (type === FieldType.User && !isMultipleCellValue && userList) {
  // Special handling: ensure all users are represented
  const stackList = userList.map(...);
  // Shows all users, even with no assignments
}

// For other field types:
// Just use whatever values come from groupPoints
// No special handling - only shows columns that have records
```

## How to Extend Support

You can extend Kanban to support other field types, but with different behaviors:

### Option 1: Support Any Field Type (Simple)
Just remove the field type check and use whatever groupPoints provides:

```typescript
// In groupPointsToStacks.ts
// Remove the SingleSelect/User checks
// Just process all groupPoints and create stacks
// This works for ANY field type, but:
// - Only shows columns that have records
// - Can't create new columns
// - Can't rename columns
```

### Option 2: Support Text Fields with Value Limits
Add support for text fields but limit the number of columns:

```typescript
if (stackField.type === CellType.String) {
  // Only create stacks for the first N unique values
  const maxStacks = 20;
  const uniqueValues = [...new Set(stackList.map(s => s.data))];
  if (uniqueValues.length > maxStacks) {
    // Show warning or group remaining into "Other"
  }
}
```

### Option 3: Support Date Fields with Grouping
Group dates by week/month/year:

```typescript
if (stackField.type === CellType.DateTime) {
  // Group dates into weeks/months
  const grouped = groupDatesByWeek(records);
  // Create stacks for each week
}
```

### Option 4: Support Number Fields with Ranges
Group numbers into ranges:

```typescript
if (stackField.type === CellType.Number) {
  // Group numbers into ranges: 0-10, 11-20, etc.
  const ranges = createNumberRanges(records, 10);
  // Create stacks for each range
}
```

## Recommendation

**Keep SingleSelect and User as primary support**, but **allow other field types** with these limitations:

1. ✅ **Allow any field type** - Don't restrict in the UI
2. ⚠️ **Show warning** - If field type might create too many columns
3. ⚠️ **Limit columns** - Max 50 columns, group rest into "Other"
4. ⚠️ **No special features** - Can't create/rename/reorder columns for non-Select fields

This gives flexibility while preventing performance issues.

## Implementation

To extend support, modify `groupPointsToStacks.ts`:

```typescript
// Current: Only handles SingleSelect specially
if (stackField.type === CellType.SCQ || stackField.type === CellType.DropDown) {
  // Special handling
}

// Extended: Handle all field types
if (stackField.type === CellType.SCQ || stackField.type === CellType.DropDown) {
  // Special handling for SingleSelect
} else if (stackField.type === CellType.String) {
  // Handle text fields (with limits)
} else if (stackField.type === CellType.DateTime) {
  // Handle date fields (with grouping)
} else {
  // Generic handling for other types
  // Just use groupPoints as-is
}
```

