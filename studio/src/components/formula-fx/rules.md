# FormulaFX Development Rules

## Core Principle

**FormulaFX must be completely independent from the legacy `formula-bar` module.**

## Rules

### 1. No Imports from formula-bar

**DO NOT** import any components, utilities, constants, or data from `@src/module/ods/formula-bar` or any relative paths pointing to `formula-bar`.

**Examples of FORBIDDEN imports:**
```javascript
// ❌ FORBIDDEN
import { blocks } from "../../formula-bar/src/data/data.jsx";
import DataBlock from "@src/module/ods/formula-bar/src/components/data-block/index.jsx";
import { NODE_VARIABLES } from "@src/module/ods/formula-bar/src/constants/types.jsx";
import { addBlock } from "../../../formula-bar/src/utils/fx-utils.jsx";
```

**Examples of CORRECT imports:**
```javascript
// ✅ CORRECT
import { blocks } from "./data/data.jsx";
import DataBlock from "./components/data-block/index.jsx";
import { NODE_VARIABLES } from "./constants/types.jsx";
import { addBlock } from "./utils/fx-utils.jsx";
```

### 2. Create Local Components

If you need a component that exists in `formula-bar`, **create a new version** in `formula-fx/src/components/` instead of importing it.

**Example:**
- If `formula-bar` has `DataBlock`, create `formula-fx/src/components/data-block/DataBlock.jsx`
- If `formula-bar` has `EvaluateFx`, create `formula-fx/src/components/EvaluateFx.jsx`

### 3. Create Local Utilities

If you need utility functions from `formula-bar`, **copy and adapt them** to `formula-fx/src/utils/` instead of importing.

**Example:**
- Copy `fx-utils.jsx` to `formula-fx/src/utils/fx-utils.jsx` and update all internal imports

### 4. Create Local Constants

If you need constants from `formula-bar`, **create them** in `formula-fx/src/constants/` instead of importing.

**Example:**
- Create `formula-fx/src/constants/types.jsx` with all necessary type constants

### 5. Create Local Data

If you need data files from `formula-bar`, **copy them** to `formula-fx/src/data/` instead of importing.

**Example:**
- Copy `data.jsx` to `formula-fx/src/data/data.jsx`
- Copy `other-data.jsx` to `formula-fx/src/data/other-data.jsx`

### 6. Update Internal Imports

When creating new files in `formula-fx`, ensure all internal imports use **relative paths** or **@src/module/ods** for ODS components, never pointing to `formula-bar`.

**Correct import patterns:**
```javascript
// Relative imports within formula-fx
import DataBlock from "./components/data-block/index.jsx";
import { blocks } from "../data/data.jsx";
import { NODE_VARIABLES } from "../constants/types.jsx";

// ODS components (allowed)
import { ODSTooltip, ODSIcon } from "@src/module/ods";
```

## Directory Structure

```
formula-fx/
├── src/
│   ├── components/        # All components (no imports from formula-bar)
│   │   ├── data-block/    # Local DataBlock component
│   │   └── ...
│   ├── constants/         # All constants (no imports from formula-bar)
│   │   └── types.jsx
│   ├── utils/             # All utilities (no imports from formula-bar)
│   │   └── fx-utils.jsx
│   ├── data/              # All data files (no imports from formula-bar)
│   │   ├── data.jsx
│   │   └── other-data.jsx
│   └── FormulaFX.jsx
└── rules.md               # This file
```

## Why This Rule Exists

1. **Independence**: FormulaFX should be a standalone module that can evolve independently
2. **Maintainability**: Reduces coupling between legacy and new implementations
3. **Flexibility**: Allows FormulaFX to diverge from legacy patterns when needed
4. **Clarity**: Makes dependencies explicit and easier to understand

## Enforcement

Before committing any changes to `formula-fx`:

1. Search for any imports containing `formula-bar`
2. Replace them with local implementations
3. Verify all imports use relative paths or `@src/module/ods` only
4. Ensure no circular dependencies exist

## Migration Checklist

When migrating functionality from `formula-bar`:

- [ ] Copy component files to `formula-fx/src/components/`
- [ ] Copy utility files to `formula-fx/src/utils/`
- [ ] Copy constant files to `formula-fx/src/constants/`
- [ ] Copy data files to `formula-fx/src/data/`
- [ ] Update all internal imports to use relative paths
- [ ] Remove any imports pointing to `formula-bar`
- [ ] Test that everything works independently
- [ ] Update this rules.md if new patterns emerge

