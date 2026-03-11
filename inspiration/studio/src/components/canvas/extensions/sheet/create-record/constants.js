import { CREATE_SHEET_RECORD_V3_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";

export const CREATE_SHEET_RECORD_NODE = {
  cmsId: "create-sheet-record",
  _src: extensionIcons.tinyTablesCreate,
  name: "Create Record",
  type: CREATE_SHEET_RECORD_V3_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16a34a",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
};

export const CREATE_TEMPLATES = [
  {
    id: "save-lead",
    name: "Save Lead",
    description: "Capture lead information from forms or integrations",
    icon: "UserPlus",
    defaults: {
      record: [],
    },
  },
  {
    id: "log-event",
    name: "Log Event",
    description: "Record events and activities in your sheet",
    icon: "Calendar",
    defaults: {
      record: [],
    },
  },
  {
    id: "store-result",
    name: "Store Result",
    description: "Save workflow results and outputs for later analysis",
    icon: "Database",
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
  primaryButtonBg: CREATE_SHEET_RECORD_NODE.dark,
};
