import { DELETE_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";

export const DELETE_V2_NODE = {
  cmsId: "delete-record-v2",
  _src: extensionIcons.tinyTablesDelete,
  name: "Delete Record",
  type: DELETE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#EF4444",
  foreground: "#fff",
  dark: "#dc2626",
  light: "#EF4444",
  hasTestModule: true,
  canSkipTest: false,
};

export const DELETE_TEMPLATES = [
  {
    id: "delete-by-id",
    name: "Delete by ID",
    description: "Remove a specific record by its unique identifier",
    icon: "Hash",
    defaults: {
      whereClause: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "id = " }] },
      requireConfirmation: true,
    },
  },
  {
    id: "delete-expired",
    name: "Delete Expired",
    description: "Remove records that have passed their expiration date",
    icon: "Clock",
    defaults: {
      whereClause: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "expires_at < NOW()" }] },
      requireConfirmation: true,
    },
  },
  {
    id: "cleanup",
    name: "Cleanup",
    description: "Remove old or unused records based on conditions",
    icon: "Trash2",
    defaults: {
      whereClause: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "status = 'deleted'" }] },
      requireConfirmation: true,
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
  primaryButtonBg: DELETE_V2_NODE.dark,
  accentColor: DELETE_V2_NODE.background,
};

export const MYSQL_DELETE_RECORD_NODE = {
  ...DELETE_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1767852804242/Mysql.svg",
  cmsId: "mysql-delete-record",
  name: "MySQL Delete Record",
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

export const POSTGRES_DELETE_RECORD_NODE = {
  ...DELETE_V2_NODE,
  _src: "https://cdn-v1.tinycommand.com/1234567890/1766727769847/Postgresql_black_outline.svg",
  cmsId: "postgres-delete-record",
  name: "PostgreSQL Delete Record",
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};
