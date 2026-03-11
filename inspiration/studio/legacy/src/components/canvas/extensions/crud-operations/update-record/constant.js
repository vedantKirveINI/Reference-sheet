import { UPDATE_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";
// import IfElseDialog from ".";

const UPDATE_RECORD_NODE = {
  cmsId: "update-record",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1741762832051/UpdateRecord.svg",
  name: "Update Record",
  description: "",
  type: UPDATE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: true,
  canSkipTest: true,
};

// MySQL variant
export const MYSQL_UPDATE_RECORD_NODE = {
  ...UPDATE_RECORD_NODE,
  cmsId: "mysql-update-record",
  name: "MySQL Update Record",
  type: UPDATE_TYPE, // Same type!
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

// PostgreSQL variant
export const POSTGRES_UPDATE_RECORD_NODE = {
  ...UPDATE_RECORD_NODE,
  cmsId: "postgres-update-record",
  name: "PostgreSQL Update Record",
  type: UPDATE_TYPE, // Same type!
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};

export default UPDATE_RECORD_NODE;
