# Kanban Permissions - Simplified

## Change Summary

Simplified Kanban permissions to match your backend's **view/edit** permission model instead of granular permissions.

## Before (Over-Engineered)

```typescript
export interface IKanbanPermission {
	stackCreatable: boolean; // Can create new stacks
	stackEditable: boolean; // Can edit stack names
	stackDeletable: boolean; // Can delete stacks
	stackDraggable: boolean; // Can reorder stacks
	cardCreatable: boolean; // Can create new cards
	cardEditable: boolean; // Can edit cards
	cardDeletable: boolean; // Can delete cards
	cardDraggable: boolean; // Can drag cards between stacks
}
```

**Problem:** Your backend only supports 2 permissions:
- **View** (`isViewOnly: true`) - Read-only
- **Edit** (`isViewOnly: false`) - Can do everything

## After (Matches Your Backend)

```typescript
export interface IKanbanPermission {
	canEdit: boolean; // If true, can do everything. If false, read-only.
}
```

**Benefits:**
- ✅ Matches your backend permission model
- ✅ Same as GridView (`isViewOnly` from `getAssetAccessDetails`)
- ✅ Simple and straightforward
- ✅ Easy to use in components

## Implementation

### KanbanProvider

Now gets permissions from `SheetsContext` (same as GridView):

```typescript
// Get permissions from context (same as GridView)
const context = useContext(SheetsContext);
const { isViewOnly } = useMemo(
	() => getAssetAccessDetails(context?.assetAccessDetails),
	[context?.assetAccessDetails]
);

// Permissions (matches GridView: isViewOnly = view, !isViewOnly = edit)
const permission: IKanbanPermission = useMemo(() => ({
	canEdit: !isViewOnly, // If not view-only, can edit (do everything)
}), [isViewOnly]);
```

## Usage in Components

### Before (Granular)

```typescript
const { permission } = useKanban();
if (permission.cardCreatable && permission.cardEditable) {
	// Can create and edit cards
}
```

### After (Simple)

```typescript
const { permission } = useKanban();
if (permission.canEdit) {
	// Can do everything (create/edit/delete cards and stacks)
} else {
	// Read-only mode
}
```

## Permission Mapping

| Backend Permission | `canEdit` Value | What User Can Do |
|-------------------|----------------|------------------|
| `isViewOnly: true` | `false` | Read-only: View cards, no editing |
| `isViewOnly: false` | `true` | Full edit: Create/edit/delete cards and stacks, drag & drop |

## Future: If You Add Granular Permissions

If your backend later adds granular permissions, you can extend the interface:

```typescript
export interface IKanbanPermission {
	canEdit: boolean; // Main permission (required)
	
	// Optional granular permissions (if backend supports)
	stackCreatable?: boolean;
	cardCreatable?: boolean;
	// etc.
}
```

Then in components:
```typescript
// Use granular if available, fallback to canEdit
const canCreateCard = permission.cardCreatable ?? permission.canEdit;
```

## Summary

- ✅ **Simplified** from 8 granular permissions to 1 simple `canEdit` boolean
- ✅ **Matches** your backend's view/edit model
- ✅ **Consistent** with GridView permission handling
- ✅ **Ready** for future extension if needed

