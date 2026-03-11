# Reference Sheet - String & Number Table

A reference implementation of a spreadsheet component with String and Number data types, inspired by Teable's architecture.

## Features

- **100 Records × 26 Columns**: Full table with 100 rows and 26 columns (A-Z)
- **Two Data Types**: String and Number cells with appropriate renderers and editors
- **Dynamic Headers**: Support for both generated headers (A-Z) and backend-sourced headers
- **Virtual Scrolling**: High-performance rendering for large datasets
- **Canvas Rendering**: Hardware-accelerated 2D canvas for smooth performance
- **Cell Editing**: In-place editing with type-specific editors
- **Responsive Design**: Adapts to different screen sizes

## Architecture

### Core Components

- **Grid**: Main grid component with canvas rendering
- **Cell Renderers**: Type-specific renderers for String and Number cells
- **Cell Editors**: Type-specific editors for data input
- **Virtual Scrolling**: Efficient rendering of large datasets
- **Data Generator**: Sample data generation for testing

### Data Types

#### String Cells

- Multi-line text support with wrapping
- Ellipsis for overflow text
- Left-aligned display
- Text input editor

#### Number Cells

- Right-aligned display
- Number formatting support
- Numeric input validation
- Decimal and integer support

### File Structure

```
src/
├── components/
│   └── Grid.tsx              # Main grid component
├── renderers/
│   ├── baseRenderer.ts       # Base rendering utilities
│   └── cellRenderers/        # Cell type renderers
│       ├── stringCellRenderer.ts
│       ├── numberCellRenderer.ts
│       └── index.ts
├── editors/
│   ├── stringEditor.tsx      # String cell editor
│   ├── numberEditor.tsx      # Number cell editor
│   └── index.ts
├── hooks/
│   └── useVirtualScrolling.ts # Virtual scrolling logic
├── types/
│   └── index.ts              # TypeScript definitions
├── utils/
│   └── dataGenerator.ts      # Sample data generation
├── App.tsx                   # Main application
└── main.tsx                  # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
cd reference-sheet
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Usage

### Basic Grid

```tsx
import Grid from "./components/Grid";
import { generateTableData } from "./utils/dataGenerator";

const data = generateTableData();
const config = {
	rowHeight: 32,
	columnWidth: 120,
	headerHeight: 40,
	freezeColumns: 2,
	virtualScrolling: true,
	theme: defaultTheme,
};

<Grid
	data={data}
	config={config}
	onCellChange={handleCellChange}
	onCellClick={handleCellClick}
	onCellDoubleClick={handleCellDoubleClick}
/>;
```

### Dynamic Headers

```tsx
import {
	generateDynamicHeaders,
	mockBackendHeaders,
} from "./utils/dataGenerator";

// Use backend headers
const backendHeaders = mockBackendHeaders();
const columns = generateDynamicHeaders(backendHeaders);

// Or use generated A-Z headers
const columns = generateColumnHeaders();
```

## Configuration

### Grid Configuration

```typescript
interface IGridConfig {
	rowHeight: number; // Height of each row
	columnWidth: number; // Width of each column
	headerHeight: number; // Height of header row
	freezeColumns: number; // Number of frozen columns
	virtualScrolling: boolean; // Enable virtual scrolling
	theme: IGridTheme; // Visual theme
}
```

### Theme Configuration

```typescript
interface IGridTheme {
	cellTextColor: string; // Text color
	cellBackgroundColor: string; // Background color
	cellBorderColor: string; // Border color
	cellHoverColor: string; // Hover state color
	cellSelectedColor: string; // Selected state color
	cellActiveColor: string; // Active/editing state color
	fontFamily: string; // Font family
	fontSize: number; // Font size
	lineHeight: number; // Line height
}
```

## Performance

- **Virtual Scrolling**: Only renders visible cells
- **Canvas Rendering**: Hardware-accelerated 2D rendering
- **Text Caching**: LRU cache for text measurements
- **Efficient Updates**: Only re-renders changed regions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details.

## Inspiration

This implementation is inspired by:

- Teable's canvas rendering system
- Teable's cell renderer architecture
- Teable's virtual scrolling implementation
- Modern React patterns and TypeScript best practices

