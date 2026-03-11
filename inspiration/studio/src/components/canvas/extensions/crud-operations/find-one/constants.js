import { FIND_ONE_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";

export const FIND_ONE_V2_NODE = {
  cmsId: "find-one-v2",
  _src: extensionIcons.tinyTablesFindOne,
  name: "Find One",
  type: FIND_ONE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#8B5CF6",
  foreground: "#fff",
  dark: "#7c3aed",
  light: "#8B5CF6",
  hasTestModule: true,
  canSkipTest: false,
};

export const FIND_ONE_TEMPLATES = [
  {
    id: "find-by-id",
    name: "Find by ID",
    description: "Get a record using its unique identifier",
    icon: "Hash",
    defaults: {
      whereClause: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "id = " }] },
    },
  },
  {
    id: "lookup-by-email",
    name: "Lookup by Email",
    description: "Find a user or record by email address",
    icon: "Mail",
    defaults: {
      whereClause: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "email = " }] },
    },
  },
  {
    id: "get-latest",
    name: "Get Latest",
    description: "Retrieve the most recently created record",
    icon: "Clock",
    defaults: {
      whereClause: { type: "fx", blocks: [] },
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
  primaryButtonBg: FIND_ONE_V2_NODE.dark,
  accentColor: FIND_ONE_V2_NODE.light,
};

export const MYSQL_FIND_ONE_RECORD_NODE = {
  ...FIND_ONE_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1767852804242/Mysql.svg",
  cmsId: "mysql-find-one",
  name: "MySQL Find One",
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

export const POSTGRES_FIND_ONE_RECORD_NODE = {
  ...FIND_ONE_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1766727769847/Postgresql_black_outline.svg",
  cmsId: "postgres-find-one",
  name: "PostgreSQL Find One",
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};
