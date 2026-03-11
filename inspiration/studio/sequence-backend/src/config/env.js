const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.SEQUENCE_PORT || "3002", 10),

  DATABASE_URL: process.env.DATABASE_URL,
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGDATABASE: process.env.PGDATABASE,

  SCHEDULER_POLL_INTERVAL_MS: parseInt(process.env.SCHEDULER_POLL_INTERVAL_MS || "10000", 10),

  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_SLOW_QUERY_THRESHOLD_MS: parseInt(process.env.LOG_SLOW_QUERY_THRESHOLD_MS || "100", 10),
};

export function validateEnv() {
  const required = ["DATABASE_URL"];
  const missing = required.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return true;
}

export default env;
