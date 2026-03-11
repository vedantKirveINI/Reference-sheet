import { UPDATE_SHEET_RECORDS_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";

export const UPDATE_SHEET_RECORDS_NODE = {
  cmsId: "update-sheet-records",
  _src: extensionIcons.tinyTablesUpdate,
  name: "Update Records",
  type: UPDATE_SHEET_RECORDS_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16A34A",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: false,
};

export const UPDATE_RECORDS_TEMPLATES = [
  {
    id: "bulk-status-update",
    name: "Bulk Status Update",
    description: "Change status on multiple records at once",
    icon: "RefreshCw",
    defaults: {
      record: [],
    },
  },
  {
    id: "batch-modify",
    name: "Batch Modify",
    description: "Edit specific fields across multiple records",
    icon: "Edit",
    defaults: {
      record: [],
    },
  },
  {
    id: "mass-update",
    name: "Mass Update",
    description: "Apply the same changes to all matching records",
    icon: "Layers",
    defaults: {
      record: [],
    },
  },
];

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: UPDATE_SHEET_RECORDS_NODE.dark,
};
