import extensionIcons from "../../../assets/extensions";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

export const SHEET_TRIGGER_TYPE = "SHEET_TRIGGER_V2";

export const SHEET_TRIGGER_NODE = {
  cmsId: "sheet-trigger",
  _src: extensionIcons.sheetTrigger,
  name: "Table Trigger",
  hoverDescription: "Starts when activity or updates occur in any selected table you use.",
  type: SHEET_TRIGGER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F59E0B",
  foreground: "#fff",
  dark: "#D97706",
  light: "#F59E0B",
  hasTestModule: false,
  canSkipTest: true,
  denyFromLink: true,
};

export const TRIGGER_EVENT_TYPES = [
  {
    id: "new_row",
    label: "New Row Added",
    description: "Trigger when a new row is added to the table",
    eventKey: "CREATED",
  },
  {
    id: "row_updated",
    label: "Row Updated",
    description: "Trigger when an existing row is modified",
    eventKey: "UPDATED",
  },
  {
    id: "row_deleted",
    label: "Row Deleted",
    description: "Trigger when a row is removed from the table",
    eventKey: "DELETED",
  },
];

export const TRIGGER_TEMPLATES = [
  {
    id: "on-new-row",
    name: "On New Row",
    description: "Start workflow when a new row is added to your sheet",
    icon: "Plus",
    defaults: {
      eventTypes: ["new_row"],
      filterConditions: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "on-update",
    name: "On Update",
    description: "Start workflow when an existing row is modified",
    icon: "RefreshCw",
    defaults: {
      eventTypes: ["row_updated"],
      filterConditions: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "on-delete",
    name: "On Delete",
    description: "Start workflow when a row is deleted from your sheet",
    icon: "Trash2",
    defaults: {
      eventTypes: ["row_deleted"],
      filterConditions: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
];

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: SHEET_TRIGGER_NODE.dark,
};
