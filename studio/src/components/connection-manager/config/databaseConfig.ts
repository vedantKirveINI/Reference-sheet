export type DatabaseType = "mysql" | "postgres";

export interface FormFieldConfig {
  key: string;
  label: string;
  description: string;
  is_advanced: boolean;
  type: "STRING" | "INT";
  required: boolean;
  value?: string | number;
}

export interface DatabaseConfig {
  defaultPort: number;
  name: string;
  colorTheme: {
    dark: string;
    light: string;
    foreground: string;
  };
  supportsSchema: boolean;
  defaultSchema?: string;
  formConfig: FormFieldConfig[];
  connectionString: string;
}

export const DATABASE_TYPES = {
  MYSQL: "mysql" as const,
  POSTGRESQL: "postgres" as const,
} as const;

export const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  [DATABASE_TYPES.MYSQL]: {
    defaultPort: 3306,
    name: "MySQL",
    colorTheme: { dark: "#00758f", light: "#00a8cc", foreground: "#fff" },
    supportsSchema: false,
    connectionString: "mysql://username:password@host:3306/database",
    formConfig: [
      // {
      //   key: "name",
      //   label: "Connection Name",
      //   description: "Provide connection name",
      //   is_advanced: false,
      //   type: "STRING",
      //   required: true,
      // },
      {
        key: "host",
        label: "Host",
        description: "Provide hostname or ip address",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
      {
        key: "port",
        label: "Port",
        description: "Provide port number",
        is_advanced: false,
        type: "INT",
        required: true,
      },
      {
        key: "databaseName",
        label: "Database name",
        description: "Provide database name",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
      {
        key: "username",
        label: "Username",
        description: "Provide username",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
      {
        key: "password",
        label: "Password",
        description: "Provide database password",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
    ],
  },
  [DATABASE_TYPES.POSTGRESQL]: {
    defaultPort: 5432,
    name: "PostgreSQL",
    colorTheme: { dark: "#336791", light: "#4a9bd1", foreground: "#fff" },
    supportsSchema: true,
    defaultSchema: "public",
    connectionString: "postgresql://username:password@host:5432/database?schema=public",
    formConfig: [
      // {
      //   key: "name",
      //   label: "Connection Name",
      //   description: "Provide connection name",
      //   is_advanced: false,
      //   type: "STRING",
      //   required: true,
      // },
      {
        key: "host",
        label: "Host",
        description: "Provide hostname or ip address",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
      {
        key: "port",
        label: "Port",
        description: "Provide port number",
        is_advanced: false,
        type: "INT",
        required: true,
        value: 5432,
      },
      {
        key: "schema",
        label: "Schema name",
        description: "Provide schema name",
        is_advanced: false,
        type: "STRING",
        required: true,
        value: "public",
      },
      {
        key: "databaseName",
        label: "Database name",
        description: "Provide database name",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
      {
        key: "username",
        label: "Username",
        description: "Provide username",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
      {
        key: "password",
        label: "Password",
        description: "Provide database password",
        is_advanced: false,
        type: "STRING",
        required: true,
      },
    ],
  },
};

