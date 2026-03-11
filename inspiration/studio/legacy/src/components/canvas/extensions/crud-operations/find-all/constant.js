import { FIND_ALL_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import { DATABASE_CONFIGS, DATABASE_TYPES } from "../utils/databaseConfig";

const FIND_ALL_RECORD_NODE = {
  cmsId: "find-all-record",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1741762986974/FindAllRecord.svg",
  name: "Find All Record",
  description: "",
  type: FIND_ALL_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: true,
  canSkipTest: true,
};

// MySQL variant
export const MYSQL_FIND_ALL_RECORD_NODE = {
  ...FIND_ALL_RECORD_NODE,
  cmsId: "mysql-find-all-record",
  name: "MySQL Find All Record",
  type: FIND_ALL_TYPE, // Same type!
  databaseType: DATABASE_TYPES.MYSQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.MYSQL].colorTheme.light,
};

// PostgreSQL variant
export const POSTGRES_FIND_ALL_RECORD_NODE = {
  ...FIND_ALL_RECORD_NODE,
  cmsId: "postgres-find-all-record",
  name: "PostgreSQL Find All Record",
  type: FIND_ALL_TYPE, // Same type!
  databaseType: DATABASE_TYPES.POSTGRESQL,
  background: `linear-gradient(180.4deg, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark} 27.7%, ${DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light} 100%)`,
  foreground: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.foreground,
  dark: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.dark,
  light: DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL].colorTheme.light,
};

export default FIND_ALL_RECORD_NODE;
