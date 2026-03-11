# Input Grid V3

A modern, shadcn/ui-based input grid component for building and editing JSON schema structures.

## Overview

Input Grid V3 is a complete rewrite of the input grid component using:
- **shadcn/ui** components (Button, Input, Card, Dropdown, Tooltip, etc.)
- **Tailwind CSS** for styling
- **TypeScript** for type safety
- Modern React patterns (hooks, forwardRef, useImperativeHandle)

## Features

- ✅ Schema mode (with type column) and Fields mode (key-value pairs)
- ✅ Support for nested Object and Array types
- ✅ Drag & drop JSON/CSV import
- ✅ Collapsible nested structures
- ✅ Type badges with visual indicators
- ✅ Boolean input with Yes/No buttons
- ✅ Empty state with helpful guidance
- ✅ Full keyboard navigation support

## Usage

```tsx
import InputGridV3 from '@src/module/input-grid-v3';

<InputGridV3
  initialValue={[]}
  onGridDataChange={(data) => console.log(data)}
  readOnly={false}
  isValueMode={false}
  hideColumnType={false}
  allowQuestionDataType={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialValue` | `any[]` | `[]` | Initial field data (v2 format compatible) |
| `onGridDataChange` | `(data: any[]) => void` | - | Callback when data changes |
| `readOnly` | `boolean` | `false` | Disable editing |
| `isValueMode` | `boolean` | `false` | Use value mode instead of default |
| `hideColumnType` | `boolean` | `false` | Hide the type column (fields mode) |
| `allowQuestionDataType` | `boolean` | `false` | Enable question data types (dev mode) |
| `disableAdd` | `boolean` | `false` | Disable adding fields |
| `disableDelete` | `boolean` | `false` | Disable deleting fields |

## API Compatibility

Input Grid V3 maintains API compatibility with Input Grid V2, so it can be used as a drop-in replacement:

```tsx
// Works with existing InputGridV2 usage
import { ODSInputGridV2 } from '@src/module/ods';
// Can be replaced with:
import InputGridV3 from '@src/module/input-grid-v3';
```

## Structure

```
input-grid-v3/
├── input-grid/          # Core component library
│   ├── InputGrid.tsx    # Main component
│   ├── FieldRow.tsx     # Row component
│   ├── GridHeader.tsx  # Header component
│   ├── TypeBadge.tsx   # Type selector badge
│   ├── EmptyState.tsx  # Empty state
│   ├── DropZone.tsx    # Drag & drop handler
│   ├── types.ts        # TypeScript types
│   ├── utils.ts        # Utility functions
│   └── index.ts        # Exports
├── components/          # Wrapper component
│   └── index.tsx       # API compatibility wrapper
├── index.ts            # Main export
├── package.json        # Package config
└── tsconfig.json       # TypeScript config
```

## Migration from Input Grid V2

Input Grid V3 is designed to be a drop-in replacement. The wrapper component handles data format conversion automatically.

## Dependencies

- React 19+
- shadcn/ui components
- Tailwind CSS
- lucide-react (for icons)

