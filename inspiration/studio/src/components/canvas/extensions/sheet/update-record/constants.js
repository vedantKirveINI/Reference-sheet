import { UPDATE_SHEET_RECORD_V3_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";

export const UPDATE_SHEET_RECORD_NODE = {
  cmsId: "update-sheet-record",
  _src: extensionIcons.tinyTablesUpdate,
  name: "Update Record",
  type: UPDATE_SHEET_RECORD_V3_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16A34A",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
};

export const UPDATE_TEMPLATES = [
  {
    id: "update-status",
    name: "Update Status",
    description: "Change status or state of existing records",
    icon: "RefreshCw",
    defaults: {
      record: [],
      rowIdentifier: { type: "fx", blocks: [] },
    },
  },
  {
    id: "modify-record",
    name: "Modify Record",
    description: "Edit specific fields in existing sheet rows",
    icon: "Edit",
    defaults: {
      record: [],
      rowIdentifier: { type: "fx", blocks: [] },
    },
  },
  {
    id: "sync-changes",
    name: "Sync Changes",
    description: "Keep data synchronized across systems",
    icon: "RefreshCcw",
    defaults: {
      record: [],
      rowIdentifier: { type: "fx", blocks: [] },
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
  primaryButtonBg: UPDATE_SHEET_RECORD_NODE.dark,
};
