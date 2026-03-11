import { CREATE_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";

export const CREATE_RECORD_V2_NODE = {
  cmsId: "create-record-v2",
  _src: extensionIcons.tinyTablesCreate,
  name: "Create Record",
  type: CREATE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16a34a",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: false,
};

export const MYSQL_CREATE_RECORD_NODE = {
  ...CREATE_RECORD_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1767852804242/Mysql.svg",
  cmsId: "mysql-create-record",
  name: "MySQL Create Record",
  type: CREATE_TYPE, // Same type!
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

export const POSTGRES_CREATE_RECORD_NODE = {
  ...CREATE_RECORD_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1766727769847/Postgresql_black_outline.svg",
  cmsId: "postgres-create-record",
  name: "PostgreSQL Create Record",
  type: CREATE_TYPE, // Same type!
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};

export const CREATE_TEMPLATES = [
  {
    id: "insert-user",
    name: "Insert User",
    description: "Create a new user record in your database",
    icon: "UserPlus",
    defaults: {
      record: [],
    },
  },
  {
    id: "create-order",
    name: "Create Order",
    description: "Insert a new order into your orders table",
    icon: "ShoppingCart",
    defaults: {
      record: [],
    },
  },
  {
    id: "log-entry",
    name: "Log Entry",
    description: "Add a new log entry for tracking events",
    icon: "FileText",
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
  primaryButtonBg: CREATE_RECORD_V2_NODE.dark,
  accentColor: CREATE_RECORD_V2_NODE.background,
};
