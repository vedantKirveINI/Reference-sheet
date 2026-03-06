import { UPDATE_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";

export const UPDATE_RECORD_V2_NODE = {
  cmsId: "update-record-v2",
  _src: extensionIcons.tinyTablesUpdate,
  name: "Update Record",
  type: UPDATE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#3B82F6",
  foreground: "#fff",
  dark: "#2563eb",
  light: "#3B82F6",
  hasTestModule: true,
  canSkipTest: true,
};

export const UPDATE_TEMPLATES = [
  {
    id: "update-profile",
    name: "Update Profile",
    description: "Modify user profile information in your database",
    icon: "UserCog",
    defaults: {
      record: [],
      whereClause: "",
    },
  },
  {
    id: "change-status",
    name: "Change Status",
    description: "Update the status field of records (orders, tasks, etc.)",
    icon: "RefreshCw",
    defaults: {
      record: [],
      whereClause: "",
    },
  },
  {
    id: "sync-record",
    name: "Sync Record",
    description: "Synchronize data between systems by updating records",
    icon: "ArrowRightLeft",
    defaults: {
      record: [],
      whereClause: "",
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
  primaryButtonBg: UPDATE_RECORD_V2_NODE.dark,
  accentColor: UPDATE_RECORD_V2_NODE.background,
};

export const MYSQL_UPDATE_RECORD_NODE = {
  ...UPDATE_RECORD_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1767852804242/Mysql.svg",
  cmsId: "mysql-update-record",
  name: "MySQL Update Record",
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

export const POSTGRES_UPDATE_RECORD_NODE = {
  ...UPDATE_RECORD_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1766727769847/Postgresql_black_outline.svg",
  cmsId: "postgres-update-record",
  name: "PostgreSQL Update Record",
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};
