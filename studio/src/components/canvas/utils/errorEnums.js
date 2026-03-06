export const IF_ELSE_ERRORS = {
  IF_ELSE_MISSING_CONDITION:
    "Some endpoints are missing corresponding conditions. Ensure each endpoint has a related condition.",
  IF_ELSE_MISSING_JUMP_TO:
    "Some conditions are missing corresponding endpoints. Ensure each condition is mapped to an endpoint.",
  IF_ELSE_LABEL_MISSING: "Label cannot be empty.",
  IF_ELSE_NO_IF_CONDITION: "At least one 'if' condition is required",
};

export const HTTP_ERRORS = {
  INVALID_URL: "Empty or invalid URL",
  INVALID_AUTH: "Empty or invalid Auth",
  NOT_WHOLE_NUMBER: "Please provide a whole number in",
  EMPTY_FIELDS: "Empty fields detected",
  EMPTY_KEY_COLUMN: "Key cannot be empty",
  EMPTY_VALUE_COLUMN: "Value cannot be empty",
  EMPTY_KEY_COLUMN_BODY: "Key in body cannot be empty",
  EMPTY_VALUE_COLUMN_BODY: "Value in body cannot be empty",
  EMPTY_PARAMS_FIELDS: "Empty fields detected in Params",
  EMPTY_HEADERS_FIELDS: "Empty fields detected in Headers",
};

export const INPUT_SETUP_ERRORS = {
  EMPTY_KEY: "Key cannot be empty",
  EMPTY_TYPE: "Type cannot be empty",
};

export const END_NODE_ERRORS = {
  EMPTY_KEY: "Key cannot be empty",
  EMPTY_TYPE: "Type cannot be empty",
};

export const FAILURE_SETUP_ERRORS = {
  EMPTY_CODE: "Code cannot be empty",
  EMPTY_CONDITION: "Condition cannot be empty.",
  EMPTY_MESSAGE: "Message cannot be empty.",
};

export const DB_CONNECTION_ERRORS = {
  CONNECTION_MISSING: "Please select a connection.",
  TABLE_MISSING: "Please select a table.",
  MISSING_REQUIRED_FIELD: "Missing required field in record.",
  SELECT_MIN_ONE_COLUMN: "Select at least one column.",
};

export const SHEET_ERRORS = {
  SHEET_MISSING: "Please select a sheet.",
  TABLE_MISSING: "Please select a table.",
  VIEW_MISSING: "Please select a view.",
  MISSING_REQUIRED_FIELD: "Missing required field in record.",
  SELECT_MIN_ONE_COLUMN: "Select at least one column.",
  EVENT_TYPE_MISSING: "Please select an event type.",
  DATE_FIELD_MISSING: "Please select a date field.",
  AT_LEAST_ONE_TIMING_RULE_REQUIRED: "At least one timing rule is required.",
};

export const ENRICHMENT_ERRORS = {
  PERSON_NAME_MISSING: "Person's name is required.",
  COMPANY_DOMAIN_MISSING: "Company domain is required.",
  FULL_NAME_MISSING: "Person's full name is required.",
  ENRICHER_NAME_MISSING: "Enricher name is required.",
};
