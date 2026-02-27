# Handling Duplicate Choice Names in Kanban

## The Problem

If a SingleSelect field has 2 options with the **same name** but different IDs:

```typescript
choices: [
  { id: "choice_1", name: "Hello" },
  { id: "choice_2", name: "Hello" }, // Same name!
]
```

**Question:** Which stack should records with value "Hello" be grouped into?

## Current Behavior

### In Our Code (`groupPointsToStacks.ts`)

```typescript
// Line 68: Maps by name (first one wins)
stackMap[value] = stackObj; // If "Hello" appears twice, second overwrites first

// Line 84: Uses first match
const existing = stackMap[choiceName];
if (existing) {
  return existing; // Returns the stack from groupPoints (first occurrence)
}
```

**Current behavior:**
1. When processing `groupPoints`, the **last** stack with name "Hello" overwrites previous ones
2. When building complete list from choices, uses the **first** existing stack found
3. **Result:** Records with "Hello" all go to one stack (the one from groupPoints)

### In Teable's Backend

**Teable prevents duplicate names at the backend level:**

```typescript
// From field-supplement.service.ts
const nameSet = new Set<string>();
const choices = optionsRo.choices.map((choice) => {
  if (nameSet.has(choice.name)) {
    throw new CustomHttpException(
      `choice name ${choice.name} is already exists`,
      HttpErrorCode.VALIDATION_ERROR
    );
  }
  nameSet.add(choice.name);
  return choice;
});
```

**Teable's approach:** Backend validation prevents duplicate names, so this edge case never happens.

## The Issue

If your backend **allows** duplicate choice names, you have a problem:

1. **Ambiguity:** Which option should records use?
2. **Stack ID conflict:** Two choices with same name but different IDs
3. **Filtering issues:** Can't distinguish between the two options

## Solutions

### Option 1: Prevent at Backend (Recommended - Like Teable)

**Best approach:** Validate at backend to prevent duplicate names.

```typescript
// In your backend field validation
const nameSet = new Set<string>();
for (const choice of choices) {
  if (nameSet.has(choice.name)) {
    throw new Error(`Choice name "${choice.name}" already exists`);
  }
  nameSet.add(choice.name);
}
```

**Benefits:**
- ✅ Prevents the problem entirely
- ✅ Matches Teable's approach
- ✅ Cleaner data model
- ✅ No ambiguity

### Option 2: Use Choice ID Instead of Name

**Alternative:** Group by choice ID instead of name.

```typescript
// In groupPointsToStacks.ts
// Instead of mapping by name, map by ID
if (stackField.type === CellType.SCQ) {
  // Get choice ID from groupPoint.id or choice.id
  const choiceId = extractChoiceId(groupId); // e.g., "choice_1"
  stackMap[choiceId] = stackObj;
}

// When building complete list
const existing = stackMap[choice.id]; // Use ID instead of name
```

**But this requires:**
- Backend to send choice IDs in groupPoints
- Records to store choice IDs (not names)
- More complex implementation

### Option 3: Handle Duplicates in Frontend

**Current approach with improvements:**

```typescript
// In groupPointsToStacks.ts
const stackMap: Record<string, IStackData> = {};
const stackMapById: Record<string, IStackData> = {}; // Track by ID too

// When processing groupPoints
if (stackField.type === CellType.SCQ) {
  const value = headerPoint.value as string;
  const choiceId = extractChoiceId(groupId);
  
  // Map by both name and ID
  stackMap[value] = stackObj;
  stackMapById[choiceId] = stackObj;
}

// When building complete list
const existingByName = stackMap[choiceName];
const existingById = stackMapById[choice.id];

// Prefer by ID if available, otherwise by name
const existing = existingById || existingByName;
```

**Issues:**
- Still ambiguous if records don't store IDs
- Complex logic
- Not ideal

## Recommended Solution

**Use Option 1: Prevent at Backend**

1. **Backend validation:** Reject fields with duplicate choice names
2. **Frontend:** Keep current implementation (assumes unique names)
3. **Error handling:** Show user-friendly error if duplicates detected

## Current Implementation Behavior

Given duplicate names exist, here's what happens:

```typescript
// Example: Two choices with name "Hello"
choices: [
  { id: "choice_1", name: "Hello" },
  { id: "choice_2", name: "Hello" },
]

// groupPoints might have:
[
  { type: 0, value: "Hello", id: "stack_hello_1" }, // From choice_1
  { type: 1, count: 5 },
  { type: 0, value: "Hello", id: "stack_hello_2" }, // From choice_2
  { type: 1, count: 3 },
]

// Current behavior:
// 1. First "Hello" creates stack with id: "stack_hello_1", data: "Hello"
// 2. Second "Hello" overwrites stackMap["Hello"] with id: "stack_hello_2"
// 3. When building complete list, both choices find the same existing stack
// 4. Result: One stack with id from the LAST groupPoint, containing ALL records (5 + 3 = 8)
```

**Problem:** Records from both choices get merged into one stack, losing the distinction.

## How to Fix in Current Code

If you must support duplicates (not recommended), update the code:

```typescript
// Use a combination of name + ID for uniqueness
const stackKey = `${choiceName}_${choiceId}`;
stackMap[stackKey] = stackObj;

// But this breaks filtering because records store names, not IDs
```

**This still won't work** because records store the choice **name**, not ID, so you can't distinguish which choice a record belongs to.

## Conclusion

**Best Practice:** Prevent duplicate choice names at the backend (like Teable does).

**If duplicates exist:**
- Current code will merge them into one stack
- Records from both choices will appear together
- This is likely a data integrity issue that should be fixed

**Recommendation:** Add backend validation to prevent duplicate names.

