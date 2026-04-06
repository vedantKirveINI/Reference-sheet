# TinyTable Security Audit — Changes Made

**Date:** April 6, 2026
**Branch:** `security-audit-changes`
**Scope:** SQL injection prevention, identifier validation, secret management

---

## Changes Summary

### Fix 1: SQL Injection Prevention in DDL Statements (CRITICAL)

**Problem:** `ALTER TABLE ADD COLUMN`, `ALTER COLUMN TYPE`, and `RENAME COLUMN` statements used string interpolation for `data_type`, `column_name`, and identifiers. A malicious `data_type` like `TEXT; DROP TABLE users; --` would execute arbitrary SQL.

**Fix:** Created `src/utils/sql-safety.ts` with:
- `isValidDataType(dataType)` — validates against an allowlist of PostgreSQL types (TEXT, INTEGER, JSONB, VARCHAR(255), etc.)
- `isValidIdentifier(name)` — validates identifiers match `/^[a-zA-Z0-9_-]+$/`

**Files Changed:**
- NEW: `src/utils/sql-safety.ts` — validation utilities
- `src/features/record/record.service.ts:1764` — ADD COLUMN now validates data_type and column_name
- `src/features/record/record.service.ts:1924` — ALTER COLUMN TYPE now validates data_type and column_name
- `src/features/record/record.service.ts:3438` — RENAME COLUMN now validates all identifiers

**Breaking Changes:** None. Only rejects malicious input. Valid PostgreSQL types and column names pass validation.

---

### Fix 2: Schema Name Validation (CRITICAL)

**Problem:** `CREATE SCHEMA "${schema_name}"` used `$queryRawUnsafe` with string interpolation.

**Fix:** Added `isValidIdentifier()` check on `schema_name` before query execution.

**Files Changed:**
- `src/features/base/base.service.ts:100` — validates schema_name before CREATE SCHEMA

**Breaking Changes:** None. Schema names are auto-generated UUIDs which pass the identifier regex.

---

### Fix 3: String Filter SQL Injection (HIGH)

**Problem:** ILIKE/CONTAINS/STARTS_WITH/ENDS_WITH filter queries only stripped leading/trailing quotes but didn't escape internal single quotes. A filter value like `test' OR '1'='1` could break out of the SQL string.

**Fix:** All string filter operations now use the existing `escapeSqlValue()` utility which properly escapes backslashes and single quotes. Also added operator allowlist to prevent arbitrary operator injection in the fallback case.

**Files Changed:**
- `src/features/record/utils/record.utils.ts:426-444` — all string filter branches now use `escapeSqlValue()`

**Breaking Changes:** None. `escapeSqlValue()` only escapes special characters. Normal filter values work identically.

---

### Fix 4: JWT Secret to Environment Variable (CRITICAL)

**Problem:** JWT signing secret `hockeystick` was hardcoded in source code.

**Fix:** Changed to read from `process.env.APP_PASSWORD` with fallback to the current value for backward compatibility.

**Files Changed:**
- `src/utils/token.utils.ts:8` — reads from env var with fallback

**Breaking Changes:** None. Set `APP_PASSWORD=hockeystick` in env to maintain current behavior. Change to a strong value when ready to rotate.

---

### Fix 5: Rate Limiting on Public Record Creation Endpoints (HIGH)

**Problem:** `POST /record/create_record` and `POST /record/v2/create_record` are public (for form submissions). No rate limiting — anyone can spam unlimited records.

**Fix:** Replaced custom guard with NestJS Throttler (`@nestjs/throttler`) using in-memory limits (30 requests/minute per IP). Applied to both public create endpoints.

**Files Changed:**
- `src/app.module.ts` — added `ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }])`
- `src/features/record/record.controller.ts` — added `@Throttle()` and `ThrottlerGuard` on create endpoints
- REMOVED: `src/guards/rate-limit.guard.ts`

**Breaking Changes:** None. Legitimate form submissions won't hit 30/minute from a single IP.

---

### Fix 6: SQL Injection in updateRecordViaAPI (CRITICAL)

**Problem:** `updateRecordViaAPI` in `record.service.ts:1371` interpolated `value`, `db_field_name`, and `row_id` directly into an UPDATE query with ZERO escaping. A value like `'; DROP TABLE users; --` would execute arbitrary SQL.

**Fix:** All values now pass through `escapeSqlValue()`. Field names validated with `isValidIdentifier()`. Schema name and row_id also escaped. Table name quoted properly.

**Files Changed:**
- `src/features/record/record.service.ts:1371-1402` — full rewrite of UPDATE query builder

**Breaking Changes:** None. Only escapes special characters in values. Normal data works identically.

---

## What Was NOT Changed (Needs Investigation)

| Issue | Why Deferred |
|-------|-------------|
| Unauthenticated `POST /record/v2/create_record` | Need to verify which services call this endpoint without auth before adding a guard |
| Auth guard default `return true` when no decorator | Too risky without auditing every endpoint — could break undecorated endpoints |
| CORS `origin: '*'` | Requires knowing all valid frontend domains before restricting |

---

## How to Verify

1. Run the test suite: `npm test`
2. Create a table, add columns with valid types (TEXT, INTEGER, JSONB) — should work
3. Try adding a column with `data_type: "TEXT; DROP TABLE test; --"` — should return 400
4. Filter records with `contains` operator using value `test' OR '1'='1` — should escape properly, not inject
5. Rename a column with a valid name — should work
6. Try renaming with `column_name: "test; DROP TABLE --"` — should return 400
