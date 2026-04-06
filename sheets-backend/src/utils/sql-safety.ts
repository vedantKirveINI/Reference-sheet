/**
 * SQL safety utilities for preventing injection in DDL statements.
 * DDL (ALTER TABLE, CREATE SCHEMA, etc.) cannot use parameterized queries,
 * so we validate inputs against strict allowlists instead.
 */

/** Valid PostgreSQL data types for column creation/alteration */
const ALLOWED_DATA_TYPES = new Set([
  'text', 'TEXT',
  'varchar', 'VARCHAR',
  'integer', 'INTEGER', 'INT',
  'bigint', 'BIGINT',
  'smallint', 'SMALLINT',
  'boolean', 'BOOLEAN', 'BOOL',
  'numeric', 'NUMERIC',
  'decimal', 'DECIMAL',
  'real', 'REAL',
  'double precision', 'DOUBLE PRECISION',
  'date', 'DATE',
  'timestamp', 'TIMESTAMP',
  'timestamp with time zone', 'TIMESTAMP WITH TIME ZONE',
  'timestamptz', 'TIMESTAMPTZ',
  'time', 'TIME',
  'json', 'JSON',
  'jsonb', 'JSONB',
  'uuid', 'UUID',
  'bytea', 'BYTEA',
  'float', 'FLOAT',
  'float4', 'FLOAT4',
  'float8', 'FLOAT8',
  'serial', 'SERIAL',
  'bigserial', 'BIGSERIAL',
]);

/** Also allow types with length specifier like VARCHAR(255) or NUMERIC(10,2) */
const DATA_TYPE_WITH_LENGTH_REGEX = /^(varchar|character varying|char|character|numeric|decimal)\s*\(\s*\d+\s*(,\s*\d+\s*)?\)$/i;

/**
 * Validates that a data_type value is a safe PostgreSQL type.
 * Prevents SQL injection via ALTER TABLE ... TYPE <malicious>;
 */
export function isValidDataType(dataType: string): boolean {
  if (!dataType || typeof dataType !== 'string') return false;
  const trimmed = dataType.trim();
  if (ALLOWED_DATA_TYPES.has(trimmed)) return true;
  if (DATA_TYPE_WITH_LENGTH_REGEX.test(trimmed)) return true;
  // Allow array types like TEXT[], INTEGER[], JSONB[]
  const baseType = trimmed.replace(/\[\]$/, '').trim();
  if (ALLOWED_DATA_TYPES.has(baseType)) return true;
  return false;
}

/**
 * Validates that an identifier (column name, schema name, table name)
 * contains only safe characters. Prevents injection via identifier positions.
 */
export function isValidIdentifier(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  // Allow alphanumeric, underscores, hyphens (for UUIDs used as schema names)
  return /^[a-zA-Z0-9_-]+$/.test(name);
}
