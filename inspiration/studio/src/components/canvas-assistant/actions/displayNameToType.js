/**
 * Resolve display name (from AI/UI) to internal node type.
 * Canvas-aware: Form uses question types + shared nodes; Workflow uses workflow nodes.
 */

/** Workflow canvas: display name -> internal type (from legacy TYPE_MAP) */
const WORKFLOW_DISPLAY_TO_TYPE = {
  "HTTP Request": "HTTP",
  "Data Transformer": "TRANSFORMER_V3",
  "If/Else": "IFELSE_V2",
  "Send Email": "SELF_EMAIL",
  "AI Text Generator": "GPT",
  "Create Record": "CREATE_RECORD_V2",
  "Find All Records": "DB_FIND_ALL_V2",
  Loop: "ITERATOR_V2",
  Delay: "DELAY_V2",
};

/** Form canvas: display name -> internal type. Form questions + shared nodes. */
const FORM_DISPLAY_TO_TYPE = {
  // Form question types (from FRIENDLY_TYPE_NAMES)
  "Short Text": "SHORT_TEXT",
  "Long Text": "LONG_TEXT",
  "Multiple Choice": "MCQ",
  "Single Choice": "SCQ",
  "Phone Number": "PHONE_NUMBER",
  "ZIP Code": "ZIP_CODE",
  "Yes/No": "YES_NO",
  Ranking: "RANKING",
  Email: "EMAIL",
  Authorization: "AUTHORIZATION",
  "Question (Formula)": "QUESTION_FX",
  Welcome: "WELCOME",
  Quote: "QUOTE",
  Ending: "ENDING",
  Date: "DATE",
  Currency: "CURRENCY",
  "Key-Value Table": "KEY_VALUE_TABLE",
  Number: "NUMBER",
  "File Picker": "FILE_PICKER",
  Time: "TIME",
  Signature: "SIGNATURE",
  Loading: "LOADING",
  Address: "ADDRESS",
  "PDF Viewer": "PDF_VIEWER",
  "Text Preview": "TEXT_PREVIEW",
  Autocomplete: "AUTOCOMPLETE",
  "Cloud File Explorer": "CLOUD_FILE_EXPLORER",
  "Multi Question Page": "MULTI_QUESTION_PAGE",
  "Questions Grid": "QUESTIONS_GRID",
  Picture: "PICTURE",
  "Question Repeater": "QUESTION_REPEATER",
  "Collect Payment": "COLLECT_PAYMENT",
  Rating: "RATING",
  Slider: "SLIDER",
  "Opinion Scale": "OPINION_SCALE",
  "Terms of Use": "TERMS_OF_USE",
  "Stripe Payment": "STRIPE_PAYMENT",
  // Aliases from QUESTION_TYPE_LABELS
  "Short Answer": "SHORT_TEXT",
  "Long Answer": "LONG_TEXT",
  "Email Address": "EMAIL",
  "Date Picker": "DATE",
  "Time Picker": "TIME",
  "File Upload": "FILE_PICKER",
  "Star Rating": "RATING",
  "Static Dropdown": "DROP_DOWN_STATIC",
  "Thank You Screen": "ENDING",
  "Welcome Screen": "WELCOME",
  Statement: "QUOTE",
  "Picture Choice": "PICTURE",
  "Search & Select": "AUTOCOMPLETE",
  "Calculated Field": "QUESTION_FX",
  "Data Table": "KEY_VALUE_TABLE",
  Payment: "COLLECT_PAYMENT",
  "Terms & Conditions": "TERMS_OF_USE",
  "Text Block": "TEXT_PREVIEW",
  "Loading Screen": "LOADING",
  Matrix: "QUESTIONS_GRID",
  "Repeating Section": "QUESTION_REPEATER",
  "Question Group": "MULTI_QUESTION_PAGE",
  Dropdown: "DROP_DOWN",
  // Shared nodes (Form + Workflow)
  "HTTP Request": "HTTP",
  "Data Transformer": "TRANSFORMER_V3",
  "If/Else": "IFELSE_V2",
  Logger: "LOG",
  "Jump To": "JUMP_TO",
};

function buildNormalizedMap(displayToType) {
  const out = {};
  for (const [display, type] of Object.entries(displayToType)) {
    const key = (display || "").trim().toLowerCase();
    if (key && !out[key]) out[key] = type;
  }
  return out;
}

const WORKFLOW_NORMALIZED = buildNormalizedMap(WORKFLOW_DISPLAY_TO_TYPE);
const FORM_NORMALIZED = buildNormalizedMap(FORM_DISPLAY_TO_TYPE);

/**
 * Resolve display name to internal node type.
 * @param {string} displayName - Display name (e.g. "Short Text", "HTTP Request")
 * @param {string} canvasType - WORKFLOW_CANVAS (Form) | WC_CANVAS (Workflow)
 * @returns {string} - Internal type (e.g. SHORT_TEXT, HTTP)
 */
export function getNodeTypeFromDisplayName(displayName, canvasType) {
  if (!displayName || typeof displayName !== "string") return displayName;
  const normalized = displayName.trim().toLowerCase();
  if (!normalized) return displayName;

  const map = canvasType === "WORKFLOW_CANVAS" ? FORM_NORMALIZED : WORKFLOW_NORMALIZED;
  const exact = canvasType === "WORKFLOW_CANVAS" ? FORM_DISPLAY_TO_TYPE : WORKFLOW_DISPLAY_TO_TYPE;

  // Exact match first (preserves casing like "Loop")
  const exactMatch = exact[displayName.trim()];
  if (exactMatch) return exactMatch;

  // Normalized lookup
  const type = map[normalized];
  if (type) return type;

  // Fallback: if displayName is already a valid type (e.g. "HTTP"), return as-is
  return displayName.trim();
}
