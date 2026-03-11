/**
 * Form question node type configs
 * These nodes are available ONLY on Form canvas (WORKFLOW_CANVAS mode)
 * applicableCanvases: ["WORKFLOW_CANVAS"]
 */

/**
 * @typedef {Object} FormQuestionTypeConfig
 * @property {string} configSchema - Short description of allowed JSON keys and types
 * @property {string} instructions - 1–3 sentences of type-specific semantics
 * @property {Array<string>} applicableCanvases - ["WORKFLOW_CANVAS"] for form-only nodes
 * @property {string} shortDescription - One-line description for prompt (e.g. "Short text input")
 * @property {string} category - Category for grouping: TEXT_INPUT, SELECTION, DATES_TIME, SPECIAL_INPUTS, RATINGS_SCALES, LAYOUT_DISPLAY, ADVANCED, PAYMENT, OTHER
 */

/** @type {Record<string, FormQuestionTypeConfig>} */
export const SETUP_FORM_QUESTION_TYPES = {
  SHORT_TEXT: {
    shortDescription: "Short text input",
    category: "TEXT_INPUT",
    configSchema: "label (string, required), placeholder (string, optional), required (boolean, optional), validation (object, optional)",
    instructions: "Configure the short text question. Use workflow goal to set appropriate label and placeholder. Set required if the field must be filled.",
    applicableCanvases: ["WORKFLOW_CANVAS"], // Form canvas only
  },
  LONG_TEXT: {
    shortDescription: "Long text (textarea)",
    category: "TEXT_INPUT",
    configSchema: "label (string, required), placeholder (string, optional), required (boolean, optional), validation (object, optional), rows (number, optional)",
    instructions: "Configure the long text (textarea) question. Use workflow goal for label. Set rows for textarea height.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  MCQ: {
    shortDescription: "Multiple choice (can select multiple)",
    category: "SELECTION",
    configSchema: "label (string, required), options (array of {label, value}), required (boolean, optional), allowMultiple (boolean, optional)",
    instructions: "Multiple choice question. Use workflow goal to create relevant options. Set allowMultiple if users can select multiple answers.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  SCQ: {
    shortDescription: "Single choice (select one)",
    category: "SELECTION",
    configSchema: "label (string, required), options (array of {label, value}), required (boolean, optional)",
    instructions: "Single choice question. Use workflow goal to create relevant options. Only one option can be selected.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  EMAIL: {
    shortDescription: "Email input",
    category: "TEXT_INPUT",
    configSchema: "label (string, required), placeholder (string, optional), required (boolean, optional), validation (object with email: true, optional)",
    instructions: "Email input question. Use workflow goal for label. Email validation is typically automatic.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  PHONE_NUMBER: {
    shortDescription: "Phone number input",
    category: "TEXT_INPUT",
    configSchema: "label (string, required), placeholder (string, optional), required (boolean, optional), validation (object, optional)",
    instructions: "Phone number input. Use workflow goal for label. Set validation rules if specific phone format is needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  ZIP_CODE: {
    shortDescription: "ZIP code input",
    category: "TEXT_INPUT",
    configSchema: "label (string, required), placeholder (string, optional), required (boolean, optional), validation (object, optional)",
    instructions: "ZIP code input. Use workflow goal for label. Set validation for specific country formats if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  DROP_DOWN: {
    shortDescription: "Dropdown select",
    category: "SELECTION",
    configSchema: "label (string, required), options (array of {label, value}), required (boolean, optional), placeholder (string, optional)",
    instructions: "Dropdown select question. Use workflow goal to create relevant options. Set placeholder for default text.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  DROP_DOWN_STATIC: {
    shortDescription: "Static dropdown",
    category: "SELECTION",
    configSchema: "label (string, required), options (array of {label, value}), required (boolean, optional)",
    instructions: "Static dropdown (options don't change). Use workflow goal to create relevant options.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  YES_NO: {
    shortDescription: "Yes/No question",
    category: "SELECTION",
    configSchema: "label (string, required), required (boolean, optional), trueLabel (string, optional), falseLabel (string, optional)",
    instructions: "Yes/No question. Use workflow goal for label. Customize true/false labels if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  RANKING: {
    shortDescription: "Ranking question",
    category: "OTHER",
    configSchema: "label (string, required), options (array of {label, value}), required (boolean, optional)",
    instructions: "Ranking question where users rank options. Use workflow goal to create options to rank.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  DATE: {
    shortDescription: "Date picker",
    category: "DATES_TIME",
    configSchema: "label (string, required), required (boolean, optional), format (string, optional), minDate (string, optional), maxDate (string, optional)",
    instructions: "Date picker question. Use workflow goal for label. Set format and date constraints if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  TIME: {
    shortDescription: "Time picker",
    category: "DATES_TIME",
    configSchema: "label (string, required), required (boolean, optional), format (string, optional)",
    instructions: "Time picker question. Use workflow goal for label. Set time format if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  CURRENCY: {
    shortDescription: "Currency input",
    category: "SPECIAL_INPUTS",
    configSchema: "label (string, required), required (boolean, optional), currency (string, optional), min (number, optional), max (number, optional)",
    instructions: "Currency input question. Use workflow goal for label. Set currency code and min/max values if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  NUMBER: {
    shortDescription: "Number input",
    category: "TEXT_INPUT",
    configSchema: "label (string, required), required (boolean, optional), min (number, optional), max (number, optional), step (number, optional)",
    instructions: "Number input question. Use workflow goal for label. Set min, max, and step values if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  FILE_PICKER: {
    shortDescription: "File upload",
    category: "SPECIAL_INPUTS",
    configSchema: "label (string, required), required (boolean, optional), accept (string, optional), maxSize (number, optional), maxFiles (number, optional)",
    instructions: "File upload question. Use workflow goal for label. Set accepted file types, max size, and max files if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  SIGNATURE: {
    shortDescription: "Signature capture",
    category: "SPECIAL_INPUTS",
    configSchema: "label (string, required), required (boolean, optional)",
    instructions: "Signature capture question. Use workflow goal for label. Typically required for legal/agreement forms.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  ADDRESS: {
    shortDescription: "Address input",
    category: "SPECIAL_INPUTS",
    configSchema: "label (string, required), required (boolean, optional), fields (array, optional), country (string, optional)",
    instructions: "Address input question. Use workflow goal for label. Configure which address fields to show.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  RATING: {
    shortDescription: "Rating (e.g., 1-5 stars)",
    category: "RATINGS_SCALES",
    configSchema: "label (string, required), required (boolean, optional), maxRating (number, optional), icon (string, optional)",
    instructions: "Rating question (e.g., 1-5 stars). Use workflow goal for label. Set max rating and icon type if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  SLIDER: {
    shortDescription: "Slider input",
    category: "RATINGS_SCALES",
    configSchema: "label (string, required), required (boolean, optional), min (number, optional), max (number, optional), step (number, optional)",
    instructions: "Slider input question. Use workflow goal for label. Set min, max, and step values.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  OPINION_SCALE: {
    shortDescription: "Opinion scale (e.g., 1-10)",
    category: "RATINGS_SCALES",
    configSchema: "label (string, required), required (boolean, optional), min (number, optional), max (number, optional), labels (object, optional)",
    instructions: "Opinion scale question (e.g., 1-10 scale). Use workflow goal for label. Set scale range and labels.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  KEY_VALUE_TABLE: {
    shortDescription: "Key-value table",
    category: "ADVANCED",
    configSchema: "label (string, required), required (boolean, optional), columns (array, optional), allowAddRows (boolean, optional)",
    instructions: "Key-value table question. Use workflow goal for label. Configure columns and whether users can add rows.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  QUESTION_FX: {
    shortDescription: "Formula-based question",
    category: "ADVANCED",
    configSchema: "label (string, required), expression (string, required), required (boolean, optional)",
    instructions: "Formula-based question. Use workflow goal for label. Set expression to calculate the value.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  WELCOME: {
    shortDescription: "Welcome page",
    category: "LAYOUT_DISPLAY",
    configSchema: "title (string, optional), description (string, optional), buttonText (string, optional)",
    instructions: "Welcome page/question. Use workflow goal for title and description. Set button text for next action.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  QUOTE: {
    shortDescription: "Quote display",
    category: "LAYOUT_DISPLAY",
    configSchema: "text (string, required), author (string, optional), citation (string, optional)",
    instructions: "Quote display question. Use workflow goal for quote text. Add author and citation if available.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  ENDING: {
    shortDescription: "Ending page",
    category: "LAYOUT_DISPLAY",
    configSchema: "title (string, optional), description (string, optional), buttonText (string, optional)",
    instructions: "Ending page/question. Use workflow goal for title and description. Set button text for completion action.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  LOADING: {
    shortDescription: "Loading indicator",
    category: "LAYOUT_DISPLAY",
    configSchema: "message (string, optional), duration (number, optional)",
    instructions: "Loading indicator question. Use workflow goal for message. Set duration if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  PDF_VIEWER: {
    shortDescription: "PDF viewer",
    category: "LAYOUT_DISPLAY",
    configSchema: "label (string, required), url (string, required), required (boolean, optional)",
    instructions: "PDF viewer question. Use workflow goal for label. Set PDF URL to display.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  TEXT_PREVIEW: {
    shortDescription: "Text preview",
    category: "LAYOUT_DISPLAY",
    configSchema: "label (string, optional), text (string, required)",
    instructions: "Text preview question. Use workflow goal for text content. Optional label for context.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  AUTOCOMPLETE: {
    shortDescription: "Autocomplete input",
    category: "ADVANCED",
    configSchema: "label (string, required), options (array or dataSource, required), required (boolean, optional), placeholder (string, optional)",
    instructions: "Autocomplete input question. Use workflow goal for label. Configure options or data source.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  CLOUD_FILE_EXPLORER: {
    shortDescription: "Cloud file explorer",
    category: "OTHER",
    configSchema: "label (string, required), connectionId (string, optional), required (boolean, optional)",
    instructions: "Cloud file explorer question. Use workflow goal for label. Set connection ID if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  MULTI_QUESTION_PAGE: {
    shortDescription: "Multiple questions on one page",
    category: "ADVANCED",
    configSchema: "label (string, optional), questions (array of question configs, required)",
    instructions: "Multi-question page. Use workflow goal to create multiple questions on one page.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  QUESTIONS_GRID: {
    shortDescription: "Grid layout for questions",
    category: "ADVANCED",
    configSchema: "label (string, optional), questions (array of question configs, required), columns (number, optional)",
    instructions: "Grid layout for multiple questions. Use workflow goal to create questions. Set columns for layout.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  PICTURE: {
    shortDescription: "Picture display",
    category: "LAYOUT_DISPLAY",
    configSchema: "label (string, required), url (string, required), required (boolean, optional), alt (string, optional)",
    instructions: "Picture display question. Use workflow goal for label. Set image URL and alt text.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  QUESTION_REPEATER: {
    shortDescription: "Repeating question block",
    category: "ADVANCED",
    configSchema: "label (string, required), questionTemplate (object, required), minItems (number, optional), maxItems (number, optional)",
    instructions: "Repeating question block. Use workflow goal for label. Configure question template and min/max items.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  COLLECT_PAYMENT: {
    shortDescription: "Payment collection",
    category: "PAYMENT",
    configSchema: "label (string, required), amount (number or formula, required), currency (string, optional), description (string, optional)",
    instructions: "Payment collection question. Use workflow goal for label. Set amount (can be formula), currency, and description.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  STRIPE_PAYMENT: {
    shortDescription: "Stripe payment",
    category: "PAYMENT",
    configSchema: "label (string, required), amount (number or formula, required), currency (string, optional), description (string, optional), stripeKey (string, optional)",
    instructions: "Stripe payment question. Use workflow goal for label. Set amount, currency, description, and Stripe key if needed.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  TERMS_OF_USE: {
    shortDescription: "Terms acceptance",
    category: "OTHER",
    configSchema: "label (string, required), termsText (string, required), required (boolean, optional), link (string, optional)",
    instructions: "Terms of use acceptance question. Use workflow goal for label. Set terms text and optional link.",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
  AUTHORIZATION: {
    shortDescription: "Connection/authorization",
    category: "OTHER",
    configSchema: "label (string, required), connectionType (string, required), required (boolean, optional)",
    instructions: "Connection/authorization question. Use workflow goal for label. Set connection type (e.g., OAuth, API key).",
    applicableCanvases: ["WORKFLOW_CANVAS"],
  },
};

/** Default config for form question types not yet in the map (fallback). */
export const DEFAULT_FORM_QUESTION_TYPE_CONFIG = {
  shortDescription: "Form question",
  category: "OTHER",
  configSchema: "label (string, required), required (boolean, optional)",
  instructions: "Configure the form question. Use workflow goal to set appropriate label and configuration.",
  applicableCanvases: ["WORKFLOW_CANVAS"],
};

/**
 * Get form question type config
 * @param {string} nodeType - Node type string
 * @returns {FormQuestionTypeConfig|null}
 */
export function getFormQuestionTypeConfig(nodeType) {
  return SETUP_FORM_QUESTION_TYPES[nodeType] || null;
}
