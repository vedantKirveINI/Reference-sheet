import { DatabaseConnectionConfig } from "../types";

interface ParsedConnectionString {
  isValid: boolean;
  config: Partial<DatabaseConnectionConfig>;
  error?: string;
}

export function parseConnectionString(connectionString: string): ParsedConnectionString {
  if (!connectionString || !connectionString.trim()) {
    return {
      isValid: false,
      config: {},
      error: "Connection string is empty",
    };
  }

  const trimmed = connectionString.trim();

  try {
    const postgresPattern = /^postgres(?:ql)?:\/\/(?:([^:]+)(?::([^@]+))?@)?([^:\/]+)(?::(\d+))?(?:\/([^?]+))?(?:\?(.*))?$/i;
    const match = trimmed.match(postgresPattern);

    if (match) {
      const [, username, password, host, port, database, queryString] = match;
      
      let schema: string | undefined;
      if (queryString) {
        const params = new URLSearchParams(queryString);
        schema = params.get("schema") || params.get("currentSchema") || undefined;
      }

      return {
        isValid: true,
        config: {
          username: username || "",
          password: password || "",
          host: host || "",
          port: port || "5432",
          databaseName: database || "",
          schema,
        },
      };
    }

    const mysqlPattern = /^mysql:\/\/(?:([^:]+)(?::([^@]+))?@)?([^:\/]+)(?::(\d+))?(?:\/([^?]+))?/i;
    const mysqlMatch = trimmed.match(mysqlPattern);

    if (mysqlMatch) {
      const [, username, password, host, port, database] = mysqlMatch;
      
      return {
        isValid: true,
        config: {
          username: username || "",
          password: password || "",
          host: host || "",
          port: port || "3306",
          databaseName: database || "",
        },
      };
    }

    const jdbcPattern = /^jdbc:(\w+):\/\/([^:\/]+)(?::(\d+))?\/([^?]+)/i;
    const jdbcMatch = trimmed.match(jdbcPattern);

    if (jdbcMatch) {
      const [, dbType, host, port, database] = jdbcMatch;
      const defaultPort = dbType.toLowerCase() === "postgresql" ? "5432" : "3306";
      
      return {
        isValid: true,
        config: {
          host: host || "",
          port: port || defaultPort,
          databaseName: database || "",
        },
      };
    }

    return {
      isValid: false,
      config: {},
      error: "Unrecognized connection string format. Supported formats: postgresql://, mysql://, jdbc:",
    };
  } catch (error) {
    return {
      isValid: false,
      config: {},
      error: "Failed to parse connection string",
    };
  }
}

export function buildConnectionString(
  config: Partial<DatabaseConnectionConfig>,
  databaseType: "mysql" | "postgres" = "postgres"
): string {
  const { username, password, host, port, databaseName, schema } = config;
  
  if (!host || !databaseName) {
    return "";
  }

  const isMySQL = databaseType === "mysql";
  const defaultPort = isMySQL ? "3306" : "5432";
  const protocol = isMySQL ? "mysql://" : "postgresql://";
  
  let connString = protocol;
  
  if (username) {
    connString += username;
    if (password) {
      connString += `:${password}`;
    }
    connString += "@";
  }
  
  connString += host;
  
  if (port && port !== defaultPort) {
    connString += `:${port}`;
  }
  
  connString += `/${databaseName}`;
  
  // Schema is only for PostgreSQL
  if (!isMySQL && schema && schema !== "public") {
    connString += `?schema=${schema}`;
  }
  
  return connString;
}
