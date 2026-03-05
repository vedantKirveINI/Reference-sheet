import { FIND_ONE_SHEET_RECORD_V3_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";

export const FIND_ONE_SHEET_RECORD_NODE = {
  cmsId: "find-one-sheet-record",
  _src: extensionIcons.tinyTablesFindOne,
  name: "Find One Record",
  type: FIND_ONE_SHEET_RECORD_V3_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16A34A",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
};

export const FIND_ONE_TEMPLATES = [
  {
    id: "lookup-by-id",
    name: "Lookup by ID",
    description: "Find a record using its unique identifier",
    icon: "Hash",
    defaults: {
      lookupField: null,
      lookupValue: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "find-by-email",
    name: "Find by Email",
    description: "Search for a record by email address",
    icon: "Mail",
    defaults: {
      lookupField: null,
      lookupValue: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "get-latest",
    name: "Get Latest",
    description: "Retrieve the most recent record from a sheet",
    icon: "Clock",
    defaults: {
      lookupField: null,
      lookupValue: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
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
  primaryButtonBg: FIND_ONE_SHEET_RECORD_NODE.dark,
};
