import { DELETE_SHEET_RECORD_V3_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";

export const DELETE_SHEET_RECORD_NODE = {
  cmsId: "delete-sheet-record",
  _src: extensionIcons.tinyTablesDelete,
  name: "Delete Record",
  type: DELETE_SHEET_RECORD_V3_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16A34A",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
};

export const DELETE_TEMPLATES = [
  {
    id: "delete-by-filter",
    name: "Delete by Filter",
    description: "Delete records matching specific conditions",
    icon: "Filter",
    defaults: {
      filter: null,
      orderBy: [],
      deleteMultiple: false,
      deleteAll: false,
    },
  },
  {
    id: "delete-multiple",
    name: "Delete Multiple",
    description: "Remove all rows matching filter conditions",
    icon: "Trash2",
    defaults: {
      filter: null,
      orderBy: [],
      deleteMultiple: true,
      deleteAll: false,
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
  primaryButtonBg: DELETE_SHEET_RECORD_NODE.dark,
};
