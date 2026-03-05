import { FIND_ALL_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";

export const FIND_ALL_V2_NODE = {
  cmsId: "find-all-v2",
  _src: extensionIcons.tinyTablesFindAll,
  name: "Find All",
  type: FIND_ALL_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#8B5CF6",
  foreground: "#fff",
  dark: "#7c3aed",
  light: "#8B5CF6",
  hasTestModule: true,
  canSkipTest: false,
};

export const FIND_ALL_TEMPLATES = [
  {
    id: "get-all",
    name: "Get All Records",
    description: "Retrieve all records from a table without filters",
    icon: "List",
    defaults: {
      whereClause: { type: "fx", blocks: [] },
      orderBy: "",
      limit: "",
    },
  },
  {
    id: "filter-by-status",
    name: "Filter by Status",
    description: "Get records matching a specific status",
    icon: "Filter",
    defaults: {
      whereClause: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "status = 'active'" }] },
      orderBy: "created_at DESC",
      limit: "100",
    },
  },
  {
    id: "search-records",
    name: "Search Records",
    description: "Find records matching search criteria",
    icon: "Search",
    defaults: {
      whereClause: { type: "fx", blocks: [] },
      orderBy: "",
      limit: "50",
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
  primaryButtonBg: FIND_ALL_V2_NODE.dark,
  accentColor: FIND_ALL_V2_NODE.background,
};

export const MYSQL_FIND_ALL_RECORD_NODE = {
  ...FIND_ALL_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1767852804242/Mysql.svg",
  cmsId: "mysql-find-all",
  name: "MySQL Find All",
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

export const POSTGRES_FIND_ALL_RECORD_NODE = {
  ...FIND_ALL_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1766727769847/Postgresql_black_outline.svg",
  cmsId: "postgres-find-all",
  name: "PostgreSQL Find All",
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};
