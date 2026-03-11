# FormulaBarV2

A Notion-inspired formula editor component with a modern, intuitive UI/UX. This is a complete redesign of the original FormulaBar, built from the ground up with inspiration from Notion's Formula 2.0 editor.

## Features

### UI/UX (Inspired by Notion)
- **3-Panel Layout**: Input area, elements panel, and context help panel
- **Property Tokens**: Visual chips with type-specific icons (like Notion's property pills)
- **Syntax Highlighting**: Functions (purple), numbers (red), strings (green), comments (gray)
- **Multi-line Editing**: Shift+Enter for new lines, Tab for indentation
- **Inline Comments**: Support for `/* comment */` syntax
- **Live Preview**: Real-time result calculation with type inference
- **Error Handling**: Position-based errors with wavy underlines

### Core Functionality
- **Categorized Elements**: Properties, Built-ins, Functions organized by category
- **Search**: Quick filter across all available elements
- **Context Help**: Detailed documentation with copyable examples
- **Debug Mode**: Toggle for advanced debugging
- **AI Prompt** (optional): Natural language formula generation interface

## Usage

```jsx
import { FormulaBarV2 } from 'formula-bar-v2';

const properties = [
  { name: 'Amount', label: 'Amount', type: 'number' },
  { name: 'Status', label: 'Status', type: 'select' },
  { name: 'Due Date', label: 'Due Date', type: 'date' },
];

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FormulaBarV2
      isOpen={isOpen}
      properties={properties}
      defaultValue="prop('Amount') * 2"
      onClose={() => setIsOpen(false)}
      onSave={(formula, tokens) => {
        console.log('Saved formula:', formula);
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | `true` | Controls modal visibility |
| `properties` | array | `[]` | Available database properties |
| `variables` | object | `{}` | Additional variables available in formulas |
| `defaultValue` | string | `""` | Initial formula value |
| `title` | string | `"Edit formula"` | Modal header title |
| `showAIPrompt` | boolean | `false` | Show AI assistance input |
| `aiPromptPlaceholder` | string | `"Ask AI to..."` | AI input placeholder text |
| `debugMode` | boolean | `false` | Enable debug mode by default |
| `previewData` | any | `null` | Data for live preview calculation |
| `onValueChange` | function | - | Called on every formula change |
| `onSave` | function | - | Called when user saves the formula |
| `onDiscard` | function | - | Called when user discards changes |
| `onClose` | function | - | Called when modal is closed |

## Property Types

The component supports the following property types with corresponding icons:

| Type | Icon | Background |
|------|------|------------|
| text | # | Gray |
| number | # | Yellow |
| checkbox | ☑ | Green |
| select | ▼ | Blue |
| multiselect | ▤ | Purple |
| date | 📅 | Pink |
| person | 👤 | Indigo |
| relation | ↗ | Cyan |
| formula | Σ | Orange |
| rollup | ⊕ | Lime |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Indent code |
| Shift+Enter | New line |
| Escape | Cancel AI prompt / Close modal |

## Component Structure

```
formula-bar-v2/
├── src/
│   ├── FormulaBarV2.jsx          # Main component
│   ├── FormulaBarV2.module.css   # Main styles
│   ├── components/
│   │   ├── editor/
│   │   │   ├── FormulaEditor.jsx       # Code editor with syntax highlighting
│   │   │   └── FormulaEditor.module.css
│   │   ├── panels/
│   │   │   ├── ElementsPanel.jsx       # Left panel - available elements
│   │   │   ├── ElementsPanel.module.css
│   │   │   ├── HelpPanel.jsx           # Right panel - context help
│   │   │   └── HelpPanel.module.css
│   │   ├── preview/
│   │   │   ├── PreviewSection.jsx      # Live result preview
│   │   │   └── PreviewSection.module.css
│   │   └── tokens/
│   │       ├── PropertyToken.jsx       # Property chip component
│   │       └── PropertyToken.module.css
│   └── utils/
│       └── parser.js                   # Formula parsing & validation
└── index.jsx
```

## Comparison with FormulaBar v1

| Feature | v1 | v2 |
|---------|----|----|
| Multi-line editing | Limited | Full support |
| Syntax highlighting | Partial | Full (functions, numbers, strings, comments) |
| Property tokens | DataBlocks | Visual chips with type icons |
| Error display | Message only | Position `[line,col]` + wavy underlines |
| Documentation | Tooltip | Full help panel with examples |
| Type inference | Basic | Real-time with badge |
| Comments | No | Yes (`/* */`) |
| AI integration | No | Optional AI prompt bar |
| Debug mode | No | Yes |

## Migration from v1

The v2 component has a different API. Key changes:

1. **Props renamed**:
   - `defaultInputContent` → `defaultValue` (now string-based)
   - `onInputContentChanged` → `onValueChange`

2. **New modal behavior**:
   - v2 renders as a modal overlay by default
   - Control visibility with `isOpen` prop

3. **Property format**:
   ```js
   // v1
   { key: 'amount', label: 'Amount', type: 'NUMBER' }
   
   // v2
   { name: 'Amount', label: 'Amount', type: 'number' }
   ```

## Theming

The component uses CSS modules with semantic color variables that can be customized:

- Primary accent: `#2eaadc` (Notion blue)
- Error: `#eb5757`
- Text: `#37352f`
- Border: `#e8e8e8`
- Background: `#fbfbfa`

To customize, override the CSS module classes or create a theme wrapper.
