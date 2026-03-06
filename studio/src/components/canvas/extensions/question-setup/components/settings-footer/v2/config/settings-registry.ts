import { QuestionType } from "@oute/oute-ds.core.constants";

export enum SettingsCardType {
  ESSENTIALS = "essentials",
  RULES = "rules",
  APPEARANCE = "appearance",
  INTEGRATIONS = "integrations",
}

export enum FieldType {
  REQUIRED_TOGGLE = "required_toggle",
  DEFAULT_VALUE = "default_value",
  DEFAULT_VALUE_FX = "default_value_fx",
  BUTTON_LABEL = "button_label",
  CHARACTER_LIMIT = "character_limit",
  REGEX = "regex",
  ACCESS_KEY = "access_key",
  QUESTION_ALIGNMENT = "question_alignment",
  TEXT_CASES = "text_cases",
  MASK_RESPONSE = "mask_response",
  TOOLTIP_TEXT = "tooltip_text",
  RANDOMIZE = "randomize",
  ALPHABETIZE = "alphabetize",
  VERTICAL_ALIGNMENT = "vertical_alignment",
  INCLUDE_OTHER = "include_other",
  ALLOW_OTHER_INPUT = "allow_other_input",
  SELECTION_TYPE = "selection_type",
  DATE_FORMAT = "date_format",
  DATE_SEPARATOR = "date_separator",
  DEFAULT_DATE = "default_date",
  DEFAULT_TIME = "default_time",
  INCLUDE_TIME = "include_time",
  USE_DATE_PICKER = "use_date_picker",
  FILE_TYPES = "file_types",
  FILE_COUNT = "file_count",
  MIN_VALUE = "min_value",
  MAX_VALUE = "max_value",
  DEFAULT_RATING = "default_rating",
  MAX_RATING = "max_rating",
  RATING_EMOJI = "rating_emoji",
  CURRENCY = "currency",
  AMOUNT = "amount",
  STRIPE_CONNECTION = "stripe_connection",
  SEND_RECEIPT = "send_receipt",
  SOCIAL_SHARE = "social_share",
  SUBMIT_ANOTHER = "submit_another",
  REDIRECT_URL = "redirect_url",
  PROMOTIONAL_TEXT = "promotional_text",
  SHOW_CTA = "show_cta",
  ADDRESS_FIELDS = "address_fields",
  ENABLE_MAP = "enable_map",
  IS_ADVANCED_FIELD = "is_advanced_field",
}

export interface FieldConfig {
  type: FieldType;
  label?: string;
  helpText?: string;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  condition?: (settings: any, question: any) => boolean;
}

export interface CardConfig {
  type: SettingsCardType;
  title: string;
  defaultExpanded?: boolean;
  fields: FieldConfig[];
  getSummary?: (settings: any, question: any) => string;
  disabled?: boolean;
  disabledMessage?: string;
}

export interface QuestionSettingsConfig {
  questionType: QuestionType;
  cards: CardConfig[];
}

const createSummaryBadge = {
  essentials: (settings: any): string => {
    const parts: string[] = [];
    if (settings?.required) parts.push("Required");
    if (settings?.defaultValue || settings?.defaultChoice) parts.push("Has default");
    return parts.length > 0 ? parts.join(" · ") : "";
  },
  rules: (settings: any): string => {
    const parts: string[] = [];
    if (settings?.minChar || settings?.maxChar) {
      const min = settings?.minChar || "0";
      const max = settings?.maxChar || "255";
      parts.push(`${min}-${max} chars`);
    }
    if (settings?.regex) parts.push("Regex");
    if (settings?.accessKey) parts.push("Has key");
    return parts.length > 0 ? parts.join(" · ") : "No rules set";
  },
  appearance: (settings: any): string => {
    const parts: string[] = [];
    if (settings?.maskResponse) parts.push("Masked");
    if (settings?.textTransformation?.case) parts.push(settings.textTransformation.case);
    if (settings?.randomize) parts.push("Randomized");
    if (settings?.isAlphabeticallyArranged) parts.push("Alphabetized");
    return parts.length > 0 ? parts.join(" · ") : "Default";
  },
  integrations: (settings: any): string => {
    if (settings?.stripe_connection_data?._id) return "Connected";
    if (settings?.enableMap) return "Map enabled";
    return "Not connected";
  },
};

const COMMON_ESSENTIALS_FIELDS: FieldConfig[] = [
  {
    type: FieldType.REQUIRED_TOGGLE,
    label: "Required",
    helpText: "Make this question mandatory for respondents",
  },
  {
    type: FieldType.BUTTON_LABEL,
    label: "Button Label",
    helpText: "Customize the text on the navigation button",
    placeholder: "Next",
  },
];

const COMMON_APPEARANCE_FIELDS: FieldConfig[] = [
  {
    type: FieldType.QUESTION_ALIGNMENT,
    label: "Question Alignment",
    helpText: "Choose how the question is positioned on screen",
  },
];

const TEXT_VALIDATION_FIELDS: FieldConfig[] = [
  {
    type: FieldType.CHARACTER_LIMIT,
    label: "Character Limit",
    helpText: "Set minimum and maximum character limits. Default max is 255.",
  },
  {
    type: FieldType.ACCESS_KEY,
    label: "Key",
    helpText: "A unique identifier used for data export and API integrations",
    placeholder: "Enter a key",
  },
];

export const settingsRegistry: Record<QuestionType, QuestionSettingsConfig> = {
  [QuestionType.SHORT_TEXT]: {
    questionType: QuestionType.SHORT_TEXT,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE_FX,
            label: "Default Value",
            helpText: "Pre-fill this field with a value or variable",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: TEXT_VALIDATION_FIELDS,
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.TEXT_CASES,
            label: "Text Cases",
            helpText: "Automatically transform text to uppercase, lowercase, or title case",
          },
          {
            type: FieldType.MASK_RESPONSE,
            label: "Mask Response",
            helpText: "Hide the entered text (like a password field)",
          },
          {
            type: FieldType.TOOLTIP_TEXT,
            label: "Tooltip Text",
            helpText: "Add helpful text that appears when users hover over the field",
            placeholder: "Enter tooltip text here",
          },
        ],
      },
    ],
  },

  [QuestionType.LONG_TEXT]: {
    questionType: QuestionType.LONG_TEXT,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE_FX,
            label: "Default Value",
            helpText: "Pre-fill this field with a value or variable",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: TEXT_VALIDATION_FIELDS,
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.TOOLTIP_TEXT,
            label: "Tooltip Text",
            helpText: "Add helpful text that appears when users hover over the field",
            placeholder: "Enter tooltip text here",
          },
        ],
      },
    ],
  },

  [QuestionType.EMAIL]: {
    questionType: QuestionType.EMAIL,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE_FX,
            label: "Default Value",
            helpText: "Pre-fill this field with a value or variable",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.TOOLTIP_TEXT,
            label: "Tooltip Text",
            helpText: "Add helpful text that appears when users hover over the field",
            placeholder: "Enter tooltip text here",
          },
        ],
      },
    ],
  },

  [QuestionType.NUMBER]: {
    questionType: QuestionType.NUMBER,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE_FX,
            label: "Default Value",
            helpText: "Pre-fill this field with a value or variable",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: (settings) => {
          const parts: string[] = [];
          if (settings?.minValue !== undefined || settings?.maxValue !== undefined) {
            const min = settings?.minValue ?? "0";
            const max = settings?.maxValue ?? "∞";
            parts.push(`${min}-${max}`);
          }
          if (settings?.accessKey) parts.push("Has key");
          return parts.length > 0 ? parts.join(" · ") : "No rules set";
        },
        fields: [
          {
            type: FieldType.MIN_VALUE,
            label: "Minimum Value",
            helpText: "Set the minimum allowed number",
          },
          {
            type: FieldType.MAX_VALUE,
            label: "Maximum Value",
            helpText: "Set the maximum allowed number",
          },
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.TOOLTIP_TEXT,
            label: "Tooltip Text",
            helpText: "Add helpful text that appears when users hover over the field",
            placeholder: "Enter tooltip text here",
          },
        ],
      },
    ],
  },

  [QuestionType.MCQ]: {
    questionType: QuestionType.MCQ,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE,
            label: "Default Value",
            helpText: "Pre-select options by default",
          },
          {
            type: FieldType.SELECTION_TYPE,
            label: "Multiple Selection",
            helpText: "Control how many options can be selected",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: (settings) => {
          const parts: string[] = [];
          if (settings?.selection?.type && settings.selection.type !== "Unlimited") {
            parts.push(settings.selection.type);
          }
          if (settings?.accessKey) parts.push("Has key");
          return parts.length > 0 ? parts.join(" · ") : "No rules set";
        },
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.RANDOMIZE,
            label: "Randomize",
            helpText: "Shuffle the order of options for each respondent",
          },
          {
            type: FieldType.VERTICAL_ALIGNMENT,
            label: "Arrange Options Vertically",
            helpText: "Display options in a vertical list instead of horizontal",
          },
          {
            type: FieldType.INCLUDE_OTHER,
            label: "Include Other",
            helpText: "Add an 'Other' option for custom responses",
          },
          {
            type: FieldType.ALLOW_OTHER_INPUT,
            label: "Allow Other Input",
            helpText: "Let users type their own response when selecting Other",
            condition: (settings) => settings?.other === true,
          },
        ],
      },
    ],
  },

  [QuestionType.SCQ]: {
    questionType: QuestionType.SCQ,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE,
            label: "Default Value",
            helpText: "Pre-select an option by default",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.RANDOMIZE,
            label: "Randomize",
            helpText: "Shuffle the order of options for each respondent",
          },
          {
            type: FieldType.VERTICAL_ALIGNMENT,
            label: "Arrange Options Vertically",
            helpText: "Display options in a vertical list instead of horizontal",
          },
          {
            type: FieldType.INCLUDE_OTHER,
            label: "Include Other",
            helpText: "Add an 'Other' option for custom responses",
          },
          {
            type: FieldType.ALLOW_OTHER_INPUT,
            label: "Allow Other Input",
            helpText: "Let users type their own response when selecting Other",
            condition: (settings) => settings?.other === true,
          },
        ],
      },
    ],
  },

  [QuestionType.DROP_DOWN]: {
    questionType: QuestionType.DROP_DOWN,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.SELECTION_TYPE,
            label: "Selection Type",
            helpText: "Choose single or multiple selection mode",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.RANDOMIZE,
            label: "Randomize",
            helpText: "Shuffle the order of options for each respondent",
          },
          {
            type: FieldType.ALPHABETIZE,
            label: "Arrange Alphabetically",
            helpText: "Sort options in alphabetical order",
          },
        ],
      },
      {
        type: SettingsCardType.INTEGRATIONS,
        title: "Integrations",
        defaultExpanded: false,
        getSummary: createSummaryBadge.integrations,
        fields: [
          {
            type: FieldType.ENABLE_MAP,
            label: "Enable Map",
            helpText: "Connect to external data source",
          },
          {
            type: FieldType.IS_ADVANCED_FIELD,
            label: "Show only in Advanced Settings",
            helpText: "Hide this field from basic view",
          },
        ],
      },
    ],
  },

  [QuestionType.YES_NO]: {
    questionType: QuestionType.YES_NO,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE,
            label: "Default Value",
            helpText: "Pre-select Yes or No by default",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.RANKING]: {
    questionType: QuestionType.RANKING,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: COMMON_ESSENTIALS_FIELDS,
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.RANDOMIZE,
            label: "Randomize",
            helpText: "Shuffle the initial order of items for each respondent",
          },
        ],
      },
    ],
  },

  [QuestionType.DATE]: {
    questionType: QuestionType.DATE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DATE_FORMAT,
            label: "Date Format",
            helpText: "Choose how dates are displayed (DD/MM/YYYY, MM/DD/YYYY, etc.)",
          },
          {
            type: FieldType.DATE_SEPARATOR,
            label: "Separator",
            helpText: "Choose the character between date parts (/, -, .)",
          },
          {
            type: FieldType.DEFAULT_DATE,
            label: "Default Date",
            helpText: "Pre-fill with a specific date",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: (settings) => {
          const parts: string[] = [];
          if (settings?.useDatePicker) parts.push("Date picker");
          if (settings?.includeTime) parts.push("With time");
          return parts.length > 0 ? parts.join(" · ") : "Default";
        },
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.USE_DATE_PICKER,
            label: "Use Date Picker",
            helpText: "Show a calendar picker instead of text input",
          },
          {
            type: FieldType.INCLUDE_TIME,
            label: "Include Time",
            helpText: "Also capture time along with the date",
          },
          {
            type: FieldType.DEFAULT_TIME,
            label: "Default Time",
            helpText: "Pre-fill with a specific time",
            condition: (settings) => settings?.includeTime === true,
          },
        ],
      },
    ],
  },

  [QuestionType.TIME]: {
    questionType: QuestionType.TIME,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_TIME,
            label: "Default Time",
            helpText: "Pre-fill with a specific time",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.FILE_PICKER]: {
    questionType: QuestionType.FILE_PICKER,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.FILE_TYPES,
            label: "File Types Allowed",
            helpText: "Specify which file formats users can upload",
          },
          {
            type: FieldType.FILE_COUNT,
            label: "Number of Files Allowed",
            helpText: "Maximum number of files users can upload",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.SIGNATURE]: {
    questionType: QuestionType.SIGNATURE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: COMMON_ESSENTIALS_FIELDS,
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.ADDRESS]: {
    questionType: QuestionType.ADDRESS,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: (settings) => {
          const fields = ["fullName", "country", "addressLineOne", "addressLineTwo", "city", "state", "zipCode"];
          const requiredCount = fields.filter(f => settings?.[f]).length;
          return requiredCount > 0 ? `${requiredCount} required fields` : "No required fields";
        },
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
          {
            type: FieldType.ADDRESS_FIELDS,
            label: "Required Fields",
            helpText: "Select which address components are mandatory",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.CURRENCY]: {
    questionType: QuestionType.CURRENCY,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.CURRENCY,
            label: "Currency",
            helpText: "Select the currency type for this field",
          },
          {
            type: FieldType.DEFAULT_VALUE_FX,
            label: "Default Value",
            helpText: "Pre-fill with a specific amount",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.MIN_VALUE,
            label: "Minimum Value",
            helpText: "Set the minimum allowed amount",
          },
          {
            type: FieldType.MAX_VALUE,
            label: "Maximum Value",
            helpText: "Set the maximum allowed amount",
          },
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.TOOLTIP_TEXT,
            label: "Tooltip Text",
            helpText: "Add helpful text that appears when users hover over the field",
            placeholder: "Enter tooltip text here",
          },
        ],
      },
    ],
  },

  [QuestionType.PHONE_NUMBER]: {
    questionType: QuestionType.PHONE_NUMBER,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE_FX,
            label: "Default Value",
            helpText: "Pre-fill with a phone number",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.TOOLTIP_TEXT,
            label: "Tooltip Text",
            helpText: "Add helpful text that appears when users hover over the field",
            placeholder: "Enter tooltip text here",
          },
        ],
      },
    ],
  },

  [QuestionType.ZIP_CODE]: {
    questionType: QuestionType.ZIP_CODE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE_FX,
            label: "Default Value",
            helpText: "Pre-fill with a zip/postal code",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: [
          ...COMMON_APPEARANCE_FIELDS,
          {
            type: FieldType.TOOLTIP_TEXT,
            label: "Tooltip Text",
            helpText: "Add helpful text that appears when users hover over the field",
            placeholder: "Enter tooltip text here",
          },
        ],
      },
    ],
  },

  [QuestionType.RATING]: {
    questionType: QuestionType.RATING,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_RATING,
            label: "Default Rating",
            helpText: "Pre-select a rating value",
          },
          {
            type: FieldType.MAX_RATING,
            label: "Max Rating",
            helpText: "Maximum number of rating options",
          },
          {
            type: FieldType.RATING_EMOJI,
            label: "Rating Emoji",
            helpText: "Choose the icon style for rating",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.SLIDER]: {
    questionType: QuestionType.SLIDER,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.MIN_VALUE,
            label: "Minimum Value",
            helpText: "Starting value of the slider",
          },
          {
            type: FieldType.MAX_VALUE,
            label: "Maximum Value",
            helpText: "Ending value of the slider",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.OPINION_SCALE]: {
    questionType: QuestionType.OPINION_SCALE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.MIN_VALUE,
            label: "Start Value",
            helpText: "Starting value of the scale",
          },
          {
            type: FieldType.MAX_VALUE,
            label: "End Value",
            helpText: "Ending value of the scale",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.STRIPE_PAYMENT]: {
    questionType: QuestionType.STRIPE_PAYMENT,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
        ],
      },
      {
        type: SettingsCardType.INTEGRATIONS,
        title: "Payment Settings",
        defaultExpanded: true,
        getSummary: createSummaryBadge.integrations,
        fields: [
          {
            type: FieldType.STRIPE_CONNECTION,
            label: "Stripe Connection",
            helpText: "Connect your Stripe account to accept payments",
          },
          {
            type: FieldType.AMOUNT,
            label: "Amount",
            helpText: "Set the payment amount (min $1, max $999,999.99)",
            condition: (settings) => !!settings?.stripe_connection_data?._id,
          },
          {
            type: FieldType.CURRENCY,
            label: "Currency",
            helpText: "Select the currency for payments",
            condition: (settings) => !!settings?.stripe_connection_data?._id,
          },
          {
            type: FieldType.SEND_RECEIPT,
            label: "Send Receipt",
            helpText: "Automatically send payment receipts to customers",
            condition: (settings) => !!settings?.stripe_connection_data?._id,
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.ENDING]: {
    questionType: QuestionType.ENDING,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: (settings) => {
          const parts: string[] = [];
          if (settings?.socialShareIcons) parts.push("Social sharing");
          if (settings?.submitAnotherResponse) parts.push("Submit another");
          return parts.length > 0 ? parts.join(" · ") : "";
        },
        fields: [
          {
            type: FieldType.SHOW_CTA,
            label: "Show CTA",
            helpText: "Display the call-to-action button",
          },
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the final button",
            placeholder: "Submit",
          },
          {
            type: FieldType.SOCIAL_SHARE,
            label: "Social Share Icons",
            helpText: "Show social media sharing buttons",
          },
          {
            type: FieldType.SUBMIT_ANOTHER,
            label: "Submit Another Response",
            helpText: "Allow users to submit multiple responses",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: (settings) => {
          return settings?.redirectURL ? "Has redirect" : "Default";
        },
        fields: [
          {
            type: FieldType.REDIRECT_URL,
            label: "Button Link",
            helpText: "Redirect users to a URL after submission",
            placeholder: "https://example.com",
          },
          {
            type: FieldType.PROMOTIONAL_TEXT,
            label: "Promotional Text",
            helpText: "Text shown above the submit again button",
            placeholder: "Enter text to show above submit again button",
          },
        ],
      },
    ],
  },

  [QuestionType.WELCOME]: {
    questionType: QuestionType.WELCOME,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the start button",
            placeholder: "Start",
          },
        ],
      },
    ],
  },

  [QuestionType.QUOTE]: {
    questionType: QuestionType.QUOTE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.LOADING]: {
    questionType: QuestionType.LOADING,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
    ],
  },

  [QuestionType.TEXT_PREVIEW]: {
    questionType: QuestionType.TEXT_PREVIEW,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.PDF_VIEWER]: {
    questionType: QuestionType.PDF_VIEWER,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.KEY_VALUE_TABLE]: {
    questionType: QuestionType.KEY_VALUE_TABLE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.AUTOCOMPLETE]: {
    questionType: QuestionType.AUTOCOMPLETE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: COMMON_ESSENTIALS_FIELDS,
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.CONNECTION]: {
    questionType: QuestionType.CONNECTION,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
    ],
  },

  [QuestionType.MULTI_QUESTION_PAGE]: {
    questionType: QuestionType.MULTI_QUESTION_PAGE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
    ],
  },

  [QuestionType.FORMULA_BAR]: {
    questionType: QuestionType.FORMULA_BAR,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: COMMON_ESSENTIALS_FIELDS,
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.QUESTIONS_GRID]: {
    questionType: QuestionType.QUESTIONS_GRID,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.PICTURE]: {
    questionType: QuestionType.PICTURE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: COMMON_ESSENTIALS_FIELDS,
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.QUESTION_REPEATER]: {
    questionType: QuestionType.QUESTION_REPEATER,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: () => "",
        fields: [
          {
            type: FieldType.BUTTON_LABEL,
            label: "Button Label",
            helpText: "Customize the text on the navigation button",
            placeholder: "Next",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
    ],
  },

  [QuestionType.COLLECT_PAYMENT]: {
    questionType: QuestionType.COLLECT_PAYMENT,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: COMMON_ESSENTIALS_FIELDS,
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.TERMS_OF_USE]: {
    questionType: QuestionType.TERMS_OF_USE,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: COMMON_ESSENTIALS_FIELDS,
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },

  [QuestionType.DROP_DOWN_STATIC]: {
    questionType: QuestionType.DROP_DOWN_STATIC,
    cards: [
      {
        type: SettingsCardType.ESSENTIALS,
        title: "Essentials",
        defaultExpanded: true,
        getSummary: createSummaryBadge.essentials,
        fields: [
          ...COMMON_ESSENTIALS_FIELDS,
          {
            type: FieldType.DEFAULT_VALUE,
            label: "Default Value",
            helpText: "Pre-select an option by default",
          },
        ],
      },
      {
        type: SettingsCardType.RULES,
        title: "Rules & Validation",
        defaultExpanded: false,
        getSummary: createSummaryBadge.rules,
        fields: [
          {
            type: FieldType.ACCESS_KEY,
            label: "Key",
            helpText: "A unique identifier used for data export and API integrations",
            placeholder: "Enter a key",
          },
        ],
      },
      {
        type: SettingsCardType.APPEARANCE,
        title: "Appearance & Behavior",
        defaultExpanded: false,
        getSummary: createSummaryBadge.appearance,
        fields: COMMON_APPEARANCE_FIELDS,
      },
    ],
  },
} as Record<QuestionType, QuestionSettingsConfig>;

export const getSettingsConfig = (questionType: QuestionType): QuestionSettingsConfig | null => {
  return settingsRegistry[questionType] || null;
};

export const hasCard = (questionType: QuestionType, cardType: SettingsCardType): boolean => {
  const config = getSettingsConfig(questionType);
  if (!config) return false;
  return config.cards.some(card => card.type === cardType);
};

export const getCardConfig = (questionType: QuestionType, cardType: SettingsCardType): CardConfig | null => {
  const config = getSettingsConfig(questionType);
  if (!config) return null;
  return config.cards.find(card => card.type === cardType) || null;
};
