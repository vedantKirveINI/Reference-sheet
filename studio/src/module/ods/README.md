# ODS (Oute Design System) Components

A comprehensive design system library of reusable React components built on Material-UI.

## Installation

The ODS components are available as part of the `oute-ds` package. Import them directly from the main index file.

## Usage

### Basic Import

You can import individual components or multiple components from the main index:

```javascript
// Import individual components
import { ODSButton, ODSTextField, ODSIcon } from "oute-ds";

// Or import with utilities
import { ODSAlert, showAlert } from "oute-ds";
import { ODSDialog, showConfirmDialog } from "oute-ds";
```

### Component Examples

#### Button

```javascript
import { ODSButton } from "oute-ds";

function MyComponent() {
  return (
    <ODSButton
      label="Click Me"
      variant="contained"
      onClick={() => console.log("Clicked!")}
    />
  );
}
```

**Props:**
- `label` (string): Button text
- `variant` ("contained" | "outlined" | "text" | "black" | "black-outlined" | "black-text"): Button style variant
- `size` ("small" | "medium" | "large"): Button size
- `onClick` (function): Click handler
- `type` (string): Button type (e.g., "file" for file upload)
- `disabled` (boolean): Disabled state

#### Text Field

```javascript
import { ODSTextField } from "oute-ds";

function MyForm() {
  return (
    <ODSTextField
      label="Username"
      placeholder="Enter username"
      type="text"
      errorType="default"
      helperText="Enter your username"
    />
  );
}
```

**Props:**
- `label` (string): Field label
- `placeholder` (string): Placeholder text
- `type` (string): Input type ("text", "password", "email", etc.)
- `errorType` ("default" | "icon"): Error display style
- `hideBorders` (boolean): Hide input borders
- `allowShowPasswordToggle` (boolean): Show password toggle for password fields
- `onEnter` (function): Handler for Enter key press

#### Alert

```javascript
import { ODSAlert, showAlert } from "oute-ds";

// Component usage
function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <ODSAlert
      open={open}
      type="success"
      onClose={() => setOpen(false)}
    >
      Success message!
    </ODSAlert>
  );
}

// Or use the utility function
showAlert({
  message: "Operation successful!",
  type: "success",
  autoHideDuration: 3000
});
```

**Props:**
- `open` (boolean): Control alert visibility
- `type` ("success" | "error" | "warning" | "info"): Alert type
- `autoHideDuration` (number): Auto-hide duration in milliseconds
- `anchorOrigin` (object): Position of the alert
- `showProgress` (boolean): Show progress bar

#### Dialog

```javascript
import { ODSDialog, showConfirmDialog } from "oute-ds";

// Component usage
function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <ODSDialog
      open={open}
      dialogTitle="Confirm Action"
      dialogContent="Are you sure you want to proceed?"
      dialogActions={
        <>
          <ODSButton label="Cancel" onClick={() => setOpen(false)} />
          <ODSButton label="Confirm" variant="contained" onClick={handleConfirm} />
        </>
      }
      onClose={() => setOpen(false)}
    />
  );
}

// Or use the utility function
const result = await showConfirmDialog({
  dialogTitle: "Delete Item?",
  dialogContent: "This action cannot be undone.",
  okLabel: "Delete",
  cancelLabel: "Cancel",
  onOk: () => {
    // Handle OK
  },
  onCancel: () => {
    // Handle Cancel
  }
});
```

**Props:**
- `open` (boolean): Control dialog visibility
- `dialogTitle` (string | ReactNode): Dialog title
- `dialogContent` (string | ReactNode): Dialog content
- `dialogActions` (ReactNode): Action buttons
- `draggable` (boolean): Enable dragging
- `showCloseIcon` (boolean): Show close icon
- `showFullscreenIcon` (boolean): Show fullscreen toggle
- `dialogWidth` (string): Dialog width (e.g., "400px")
- `dialogHeight` (string): Dialog height (e.g., "auto")

#### Icon

```javascript
import { ODSIcon } from "oute-ds";

function MyComponent() {
  return (
    <ODSIcon
      outeIconName="OUTESaveIcon"
      outeIconProps={{
        sx: { color: "#2196F3" }
      }}
      onClick={() => console.log("Icon clicked")}
    />
  );
}
```

**Props:**
- `outeIconName` (string): Name of the icon (e.g., "OUTESaveIcon", "OUTEEditIcon")
- `outeIconProps` (object): Props passed to the icon SVG
- `buttonProps` (object): Props for the icon button wrapper (when onClick is provided)
- `onClick` (function): Click handler (wraps icon in button if provided)
- `imageProps` (object): Props for image icon alternative

#### Accordion

```javascript
import { ODSAccordion } from "oute-ds";

function MyComponent() {
  return (
    <ODSAccordion
      title="Section Title"
      content={<div>Accordion content goes here</div>}
    />
  );
}
```

**Props:**
- `title` (string | ReactNode): Accordion header title
- `content` (ReactNode): Accordion content
- `summaryProps` (object): Props for the summary section
- `detailsProps` (object): Props for the details section

#### Tab

```javascript
import { ODSTab } from "oute-ds";

function MyComponent() {
  const tabData = [
    {
      label: "Tab 1",
      component: TabOneComponent,
      componentProps: { prop1: "value1" }
    },
    {
      label: "Tab 2",
      component: TabTwoComponent,
      componentProps: { prop2: "value2" }
    }
  ];

  return <ODSTab tabData={tabData} defaultTabIndex={0} />;
}
```

**Props:**
- `tabData` (array): Array of tab objects with `label`, `component`, and `componentProps`
- `defaultTabIndex` (number): Initially selected tab index
- `variant` (string): Tab variant style
- `showConfirmDialogOnTabSwitch` (boolean): Show confirmation on tab switch
- `onTabSwitch` (function): Handler for tab change

#### Breadcrumbs

```javascript
import { ODSBreadcrumbs } from "oute-ds";

function MyComponent() {
  const breadcrumbItems = [
    { label: "Home", onClick: () => navigate("/") },
    { label: "Products", onClick: () => navigate("/products") },
    { label: "Details" }
  ];

  return (
    <ODSBreadcrumbs
      breadcrumbItems={breadcrumbItems}
      maxItems={3}
      separator="/"
    />
  );
}
```

**Props:**
- `breadcrumbItems` (array): Array of breadcrumb items with `label` and optional `onClick`
- `maxItems` (number): Maximum items to show before using dropdown
- `separator` (string): Separator between items
- `labelKey` (string): Key to use for label in items array

#### Grid

```javascript
import { ODSGrid } from "oute-ds";

function MyComponent() {
  const columnDefs = [
    { field: "name", headerName: "Name" },
    { field: "age", headerName: "Age" }
  ];
  
  const rowData = [
    { name: "John", age: 30 },
    { name: "Jane", age: 25 }
  ];

  return (
    <ODSGrid
      columnDefs={columnDefs}
      rowData={rowData}
      // ... other ag-grid props
    />
  );
}
```

#### Checkbox

```javascript
import { ODSCheckbox } from "oute-ds";

function MyComponent() {
  const [checked, setChecked] = useState(false);

  return (
    <ODSCheckbox
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
      label="Accept terms"
    />
  );
}
```

#### Radio Group

```javascript
import { ODSRadioGroup } from "oute-ds";

function MyComponent() {
  const [value, setValue] = useState("option1");

  return (
    <ODSRadioGroup
      value={value}
      onChange={(e) => setValue(e.target.value)}
      options={[
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" }
      ]}
    />
  );
}
```

## Utilities

### Date Utils

```javascript
import { dateUtils } from "oute-ds";

// Use date utilities
dateUtils.formatDate(new Date());
dateUtils.parseDate("2024-01-01");
```

### Cookie Utils

```javascript
import { cookieUtils } from "oute-ds";

cookieUtils.set("key", "value");
const value = cookieUtils.get("key");
cookieUtils.remove("key");
```

### Server Config

```javascript
import { serverConfig } from "oute-ds";

const apiUrl = serverConfig.getApiUrl();
```

### Constants

```javascript
import { constants } from "oute-ds";

// Access shared constants
```

### Base64 Utils

```javascript
import { base64Encode, base64Decode } from "oute-ds";

const encoded = base64Encode("Hello World");
const decoded = base64Decode(encoded);
```

### Scroll Utils

```javascript
import { executeScroll } from "oute-ds";

executeScroll(elementRef.current, "nearest", "smooth");
```

## Available Components

- **ODSAccordion** - Collapsible content sections
- **ODSAdvancedLabel** - Enhanced label component
- **ODSAlert** / **showAlert** - Notification alerts
- **ODSArtefactCard** - Card component for artefacts
- **ODSAutocomplete** - Autocomplete input field
- **ODSAvatar** - User avatar display
- **ODSAvatarGroup** - Group of avatars
- **ODSBreadcrumbs** - Navigation breadcrumbs
- **ODSBreadcrumbsV2** - Enhanced breadcrumbs
- **ODSButton** - Button component
- **ODSButtonGroup** - Group of buttons
- **ODSCard** - Card container
- **ODSCheckbox** - Checkbox input
- **ODSChip** - Chip/tag component
- **ODSCircularProgress** - Loading spinner
- **ODSCodeBlock** - Code display block
- **ODSColorInput** - Color picker input
- **ODSContextMenu** - Context menu
- **CurlConverter** - cURL command converter
- **ODSDialog** / **showConfirmDialog** - Modal dialogs
- **ODSDrawer** - Side drawer component
- **ODSDynamicSection** - Dynamic content section
- **ODSFormControl** - Form control wrapper
- **ODSFormGroup** - Form group container
- **FormulaBar** - Formula input bar (with DataBlock, SchemaList utilities)
- **ODSGrid** - Data grid (based on ag-grid)
- **ODSIcon** - Icon component
- **ODSInlineEditor** - Inline text editor
- **ODSJsonEditor** - JSON editor
- **JsonViewer** - JSON viewer/display
- **ODSLabel** - Label component
- **ODSLoadingButton** - Button with loading state
- **LogTerminal** - Terminal log display
- **ODSMarkdown** - Markdown renderer
- **ODSNestedList** - Nested list component
- **ODSNumberInput** - Number input field
- **ODSPopover** - Popover component
- **ODSPopper** - Popper component
- **ODSRadio** - Radio button
- **ODSRadioGroup** - Radio button group
- **ODSSelectionBar** - Selection toolbar
- **ODSSkeleton** - Loading skeleton
- **ODSSpeedDial** - Speed dial action menu
- **ODSSwitch** - Toggle switch
- **ODSTab** - Tab component
- **Terminal** - Terminal component
- **ODSTextField** - Text input field
- **ODSToggleButton** - Toggle button
- **ODSToggleButtonGroup** - Toggle button group
- **ODSTooltip** - Tooltip component
- **ODSVTab** - Vertical tab component

## Best Practices

1. **Import only what you need**: Import specific components to optimize bundle size
   ```javascript
   import { ODSButton } from "oute-ds"; // Good
   import * as ODS from "oute-ds"; // Avoid unless needed
   ```

2. **Use utility functions for programmatic components**: Use `showAlert` and `showConfirmDialog` for programmatic displays
   ```javascript
   showAlert({ message: "Success!", type: "success" }); // Good
   ```

3. **Leverage TypeScript/PropTypes**: Check component prop types for available options

4. **Follow Material-UI patterns**: ODS components extend Material-UI, so many MUI patterns apply

5. **Use shared assets for theming**: Import theme from `oute-ds-shared-assets` for consistency

## Theming

ODS components use the shared theme from `oute-ds-shared-assets`. Customize the theme at the application level:

```javascript
import { createTheme } from "@mui/material/styles";
import default_theme from "oute-ds-shared-assets";

const theme = createTheme({
  ...default_theme,
  // Your customizations
});

<ThemeProvider theme={theme}>
  <YourApp />
</ThemeProvider>
```

## Contributing

When adding new components:
1. Create component in its own directory under `src/module/ods/[component-name]/src/index.jsx`
2. Export the component from the main `index.jsx` file
3. Update this README with component documentation
4. Follow the naming convention: `ODS[ComponentName]`

## Support

For issues, questions, or contributions, please contact the design system team.
