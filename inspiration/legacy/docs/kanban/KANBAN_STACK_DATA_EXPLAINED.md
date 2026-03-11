# Kanban Stack Data Field Explained

## Your Assumption is Correct! ✅

Yes, `data` is the value from the **group header point** (`groupPoint.value`). It represents the actual grouping value that records in this stack have.

## What is `data`?

The `data` field in `IStackData` comes directly from the `value` property of the group header point in the `groupPoints` array.

### Flow

```
groupPoints Array
  ↓
Header Point: { type: 0, value: "Hello", id: "stack_hello", ... }
  ↓
Extract value: "Hello"
  ↓
IStackData: { id: "stack_hello", data: "Hello", count: 2 }
```

## Possible Values for `data`

The value of `data` depends on the **field type** used for stacking:

### 1. **SingleSelect (SCQ/DropDown)** → `string`

```typescript
{
  id: "stack_hello",
  data: "Hello",  // ✅ String - the choice name
  count: 2
}
```

**Example:**
- Field: Status (SingleSelect)
- Choices: "To Do", "In Progress", "Done"
- `data` values: `"To Do"`, `"In Progress"`, `"Done"`

### 2. **User Field** → `IUserCellValue` object

```typescript
{
  id: "user_123",
  data: {
    id: "user_123",
    title: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://..."
  },
  count: 5
}
```

**Example:**
- Field: Assignee (User)
- `data` values: User objects with id, name, email, avatar

### 3. **Text Field (String)** → `string`

```typescript
{
  id: "group_text_value",
  data: "High Priority",  // ✅ String - the text value
  count: 3
}
```

**Example:**
- Field: Priority (Text)
- `data` values: `"High"`, `"Medium"`, `"Low"`

### 4. **Number Field** → `number`

```typescript
{
  id: "group_25",
  data: 25,  // ✅ Number - the number value
  count: 4
}
```

**Example:**
- Field: Age (Number)
- `data` values: `25`, `30`, `35`

### 5. **Date Field** → `string` (ISO date) or `Date`

```typescript
{
  id: "group_2024-01-15",
  data: "2024-01-15T00:00:00Z",  // ✅ ISO date string
  count: 6
}
```

**Example:**
- Field: Due Date (DateTime)
- `data` values: ISO date strings

### 6. **MultipleSelect (MCQ)** → `string[]`

```typescript
{
  id: "group_tags",
  data: ["Tag1", "Tag2"],  // ✅ Array of strings
  count: 2
}
```

**Note:** For MCQ, a record can appear in multiple stacks (one per tag).

### 7. **Uncategorized** → `null`

```typescript
{
  id: "uncategorized",
  data: null,  // ✅ null for records with empty/null field values
  count: 38
}
```

**Example:**
- Records where the stack field is `null`, `undefined`, or empty string
- All grouped into the "Uncategorized" stack

## How `data` is Used

### 1. **Display Stack Title**

```typescript
// In KanbanStackTitle.tsx
const displayText = isUncategorized
  ? "Uncategorized"
  : data != null
  ? String(data)  // Convert to string for display
  : "Untitled";
```

### 2. **Filter Records**

```typescript
// In filterRecordsByStack.ts
const cellValue = record.cells[stackField.id].data;

// For SingleSelect
if (cellValue === stackData) {  // Compare with data
  // Record belongs to this stack
}
```

### 3. **Update Records (Drag & Drop)**

```typescript
// When moving a card to a new stack
updateRecord(recordId, {
  [stackFieldId]: stack.data  // Set field to the stack's data value
});
```

## Code Examples

### From groupPoints to IStackData

```typescript
// groupPoints array
[
  { type: 0, value: "Hello", id: "stack_hello", depth: 0, isCollapsed: false },
  { type: 1, count: 2 }
]

// Transformed to IStackData
{
  id: "stack_hello",
  data: "Hello",  // ← From groupPoint.value
  count: 2        // ← From next groupPoint.count
}
```

### Using data in Components

```typescript
// In KanbanStackTitle
const stack = { id: "stack_hello", data: "Hello", count: 2 };
const title = stack.data; // "Hello"

// In filterRecordsByStack
const records = filterRecordsByStack(allRecords, stack, stackField);
// Filters records where status_field === "Hello"
```

## Type Safety

Since `data` is `unknown`, you need to handle different types:

```typescript
// Safe way to use data
if (stack.data == null) {
  // Uncategorized
} else if (typeof stack.data === 'string') {
  // SingleSelect, Text, etc.
  const value = stack.data;
} else if (typeof stack.data === 'number') {
  // Number field
  const value = stack.data;
} else if (Array.isArray(stack.data)) {
  // MultipleSelect
  const values = stack.data;
} else if (typeof stack.data === 'object') {
  // User field
  const user = stack.data as IUserCellValue;
}
```

## Summary

- ✅ **Your assumption is correct**: `data` comes from `groupPoint.value`
- ✅ **It's the grouping value**: The actual value that records in this stack have
- ✅ **Type depends on field**: String for SingleSelect, object for User, number for Number, etc.
- ✅ **Used for filtering**: Matches records to stacks
- ✅ **Used for display**: Shows as stack title
- ✅ **Used for updates**: Sets field value when moving cards

The `data` field is the **core value** that defines what this stack represents!

