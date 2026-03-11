import { FIND_ALL_SHEET_RECORD_V3_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";

export const FIND_ALL_SHEET_RECORD_NODE = {
  cmsId: "find-all-sheet-record",
  _src: extensionIcons.tinyTablesFindAll,
  name: "Find All Records",
  type: FIND_ALL_SHEET_RECORD_V3_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16A34A",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
};

export const FIND_ALL_TEMPLATES = [
  {
    id: "get-all-records",
    name: "Get All Records",
    description: "Retrieve all rows from a sheet without filtering",
    icon: "Table",
    defaults: {
      filter: {},
      orderBy: [],
      limit: 100,
    },
  },
  {
    id: "filter-by-status",
    name: "Filter by Status",
    description: "Find records matching a specific status or category",
    icon: "Filter",
    defaults: {
      filter: {},
      orderBy: [],
      limit: 100,
    },
  },
  {
    id: "search-by-date",
    name: "Search by Date",
    description: "Query records within a date range",
    icon: "Calendar",
    defaults: {
      filter: {},
      orderBy: [],
      limit: 100,
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
  primaryButtonBg: FIND_ALL_SHEET_RECORD_NODE.dark,
};
