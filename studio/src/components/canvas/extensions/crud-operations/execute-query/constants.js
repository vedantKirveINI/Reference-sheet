import { EXECUTE_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";

export const EXECUTE_V2_NODE = {
  cmsId: "execute-query-v2",
  _src: extensionIcons.tinyTablesExecute,
  name: "Execute Query",
  type: EXECUTE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#6366F1",
  foreground: "#fff",
  dark: "#4f46e5",
  light: "#6366F1",
  hasTestModule: true,
  canSkipTest: false,
};

export const EXECUTE_TEMPLATES = [
  {
    id: "custom-select",
    name: "Custom SELECT",
    description: "Run a custom SELECT query with dynamic parameters",
    icon: "Search",
    defaults: {
      sqlQuery: "SELECT * FROM table_name WHERE condition",
      parameters: { type: "fx", blocks: [] },
    },
  },
  {
    id: "aggregate-query",
    name: "Aggregate Query",
    description: "Run COUNT, SUM, AVG and other aggregate functions",
    icon: "Calculator",
    defaults: {
      sqlQuery: "SELECT COUNT(*) as total, SUM(amount) as sum FROM table_name",
      parameters: { type: "fx", blocks: [] },
    },
  },
  {
    id: "join-tables",
    name: "Join Tables",
    description: "Combine data from multiple tables using JOINs",
    icon: "GitMerge",
    defaults: {
      sqlQuery: "SELECT a.*, b.* FROM table_a a INNER JOIN table_b b ON a.id = b.a_id",
      parameters: { type: "fx", blocks: [] },
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
  primaryButtonBg: EXECUTE_V2_NODE.dark,
  accentColor: EXECUTE_V2_NODE.background,
};

export const MYSQL_EXECUTE_QUERY_NODE = {
  ...EXECUTE_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1767852804242/Mysql.svg",
  cmsId: "mysql-execute-query",
  name: "MySQL Execute Query",
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

export const POSTGRES_EXECUTE_QUERY_NODE = {
  ...EXECUTE_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1766727769847/Postgresql_black_outline.svg",
  cmsId: "postgres-execute-query",
  name: "PostgreSQL Execute Query",
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};
