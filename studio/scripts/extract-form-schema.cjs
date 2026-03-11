#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const QuestionType = {
  SHORT_TEXT: "SHORT_TEXT",
  LONG_TEXT: "LONG_TEXT",
  MCQ: "MCQ",
  SCQ: "SCQ",
  PHONE_NUMBER: "PHONE_NUMBER",
  ZIP_CODE: "ZIP_CODE",
  DROP_DOWN: "DROP_DOWN",
  DROP_DOWN_STATIC: "DROP_DOWN_STATIC",
  YES_NO: "YES_NO",
  RANKING: "RANKING",
  EMAIL: "EMAIL",
  CONNECTION: "AUTHORIZATION",
  FORMULA_BAR: "QUESTION_FX",
  WELCOME: "WELCOME",
  QUOTE: "QUOTE",
  ENDING: "ENDING",
  DATE: "DATE",
  CURRENCY: "CURRENCY",
  KEY_VALUE_TABLE: "KEY_VALUE_TABLE",
  NUMBER: "NUMBER",
  FILE_PICKER: "FILE_PICKER",
  TIME: "TIME",
  SIGNATURE: "SIGNATURE",
  LOADING: "LOADING",
  ADDRESS: "ADDRESS",
  PDF_VIEWER: "PDF_VIEWER",
  TEXT_PREVIEW: "TEXT_PREVIEW",
  AUTOCOMPLETE: "AUTOCOMPLETE",
  MULTI_QUESTION_PAGE: "MULTI_QUESTION_PAGE",
  QUESTIONS_GRID: "QUESTIONS_GRID",
  PICTURE: "PICTURE",
  QUESTION_REPEATER: "QUESTION_REPEATER",
  COLLECT_PAYMENT: "COLLECT_PAYMENT",
  RATING: "RATING",
  SLIDER: "SLIDER",
  OPINION_SCALE: "OPINION_SCALE",
  TERMS_OF_USE: "TERMS_OF_USE",
  STRIPE_PAYMENT: "STRIPE_PAYMENT",
};

const QuestionAlignments = {
  LEFT: "LEFT",
  CENTER: "CENTER",
  RIGHT: "RIGHT",
};

const TextTransformations = {
  NONE: "NONE",
  UPPERCASE: "UPPERCASE",
  LOWERCASE: "LOWERCASE",
  CAPITALIZE: "CAPITALIZE",
};

const QUESTION_RESPONSE_TYPES = {
  STRING: "STRING",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  OBJECT: "OBJECT",
  ARRAY: "ARRAY",
};

const DEFAULT_QUESTION_TITLE = "";
const DEFAULT_QUESTION_DESCRIPTION = "";

const SHORT_TEXT_DEFAULT_SETUP = {
  _id: "123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.SHORT_TEXT,
  module: "Question",
  buttonLabel: "Next",
  value: "",
  placeholder: "",
  errors: {
    charLimitError: "",
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    maskResponse: false,
    textTransformation: {
      isActive: false,
      case: TextTransformations.NONE,
    },
    toolTipText: "",
    minChar: "",
    maxChar: "255",
    regex: {
      value: "",
      error: "",
    },
    defaultValue: "",
    accessKey: "",
  },
  response_type: QUESTION_RESPONSE_TYPES.STRING,
};

const LONG_TEXT_DEFAULT_SETUP = {
  _id: "long123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.LONG_TEXT,
  module: "Question",
  buttonLabel: "Next",
  value: "",
  placeholder: "",
  errors: {
    charLimitError: "",
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    editorMode: false,
    textTransformation: {
      isActive: false,
      case: TextTransformations.NONE,
    },
    minChar: "",
    maxChar: "",
    regex: {
      value: "",
      error: "",
    },
    accessKey: "",
  },
  response_type: QUESTION_RESPONSE_TYPES.STRING,
};

const EMAIL_DEFAULT_SETUP = {
  _id: "email123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.EMAIL,
  module: "Question",
  buttonLabel: "Next",
  value: "",
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    noDuplicates: false,
    confirmEmail: false,
    noFreeEmails: false,
    isReadOnly: false,
    prefill: false,
    verifyEmail: false,
    suggestDomains: [],
    defaultValue: "",
    accessKey: "",
    regex: {
      value: "",
      error: "",
    },
  },
  response_type: QUESTION_RESPONSE_TYPES.STRING,
};

const MCQ_DEFAULT_SETUP = {
  version: "1",
  _id: "mcq123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.MCQ,
  module: "Question",
  buttonLabel: "Next",
  options: [""],
  placeholder: "",
  errors: {
    defaultValueError: "",
  },
  value: {
    value: [""],
    __to_string: "",
  },
  key_config_map: {
    __to_string: {
      display_name: {
        key: "label",
        value: "String Value",
      },
    },
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    randomize: false,
    isAlignmentVertical: true,
    other: false,
    defaultValue: [],
    selection: {
      type: "Unlimited",
      range: {
        start: "1",
        end: "2",
      },
      exactNumber: "1",
    },
    accessKey: "",
  },
};

const SCQ_DEFAULT_SETUP = {
  _id: "mcq123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.SCQ,
  buttonLabel: "Next",
  options: [""],
  placeholder: "",
  value: "dummy",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    randomize: false,
    isAlignmentVertical: true,
    other: false,
    allowOtherInput: false,
    defaultValue: "",
    accessKey: "",
  },
};

const NUMBER_DEFAULT_SETUP = {
  _id: "number123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.NUMBER,
  module: "Question",
  buttonLabel: "Next",
  value: 1,
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    min: "",
    max: "",
    defaultValue: "",
    allowNegative: false,
    allowFraction: false,
    accessKey: "",
  },
};

const PHONE_NUMBER_DEFAULT_SETUP = {
  _id: "phone123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.PHONE_NUMBER,
  module: "Question",
  buttonLabel: "Next",
  value: {
    phoneNumber: "",
    countryCode: "",
    countryNumber: "",
  },
  key_config_map: {
    phoneNumber: {
      display_name: {
        key: "label",
        value: "Phone Number",
      },
    },
    countryCode: {
      display_name: {
        key: "label",
        value: "Country Short Name",
      },
    },
    countryNumber: {
      display_name: {
        key: "label",
        value: "Country Code",
      },
    },
  },
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    isCountryChangeEnabled: false,
    isPhoneValidationEnabled: false,
    defaultCountry: {
      countryCode: "US",
      countryNumber: "1",
    },
    accessKey: "",
  },
};

const DATE_DEFAULT_SETUP = {
  _id: "date123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.DATE,
  module: "Question",
  buttonLabel: "Next",
  value: {
    value: "",
    ISOValue: "",
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    useDatePicker: false,
    separator: "/",
    dateFormat: "DDMMYYYY",
    defaultValue: "",
    allowPastDate: true,
    allowFutureDate: true,
    startDate: "",
    endDate: "",
    includeTime: false,
    accessKey: "",
    enableMap: false,
    isAdvancedField: false,
  },
};

const TIME_DEFAULT_SETUP = {
  _id: "time123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.TIME,
  module: "Question",
  buttonLabel: "Next",
  value: {
    time: "",
    meridiem: "AM",
    timeZone: "",
    ISOValue: "",
  },
  errors: {
    defaultTimeError: "",
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    defaultTime: {
      time: "",
      meridiem: "AM",
      timeZone: "",
      ISOValue: "",
    },
    isTwentyFourHour: false,
    accessKey: "",
  },
};

const YES_NO_DEFAULT_SETUP = {
  _id: "123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.YES_NO,
  module: "Question",
  buttonLabel: "Next",
  options: ["Yes", "No"],
  value: "No",
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    vertical: false,
    defaultChoice: "",
    accessKey: "",
    enableMap: false,
    isAdvancedField: false,
  },
};

const DROP_DOWN_DEFAULT_SETUP = {
  _id: "long123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.DROP_DOWN,
  module: "Question",
  buttonLabel: "Next",
  value: {
    id: "",
    label: "",
  },
  options: [],
  errors: {
    defaultChoiceError: "",
  },
  placeholder: "Type or select an option",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    randomize: false,
    isAlphabeticallyArranged: false,
    includeOtherOption: false,
    defaultChoice: [],
    selectionType: "Single",
    exactNumber: "1",
    minNumber: "1",
    maxNumber: "2",
    optionsType: "Custom",
    accessKey: "",
    dynamicInputs: {
      variable: {},
      idAccessor: "",
      labelAccessor: "",
      mapObjectItems: false,
    },
    enableMap: false,
    isAdvancedField: false,
  },
};

const DROP_DOWN_STATIC_DEFAULT_SETUP = {
  version: "1",
  _id: "long123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.DROP_DOWN_STATIC,
  module: "Question",
  buttonLabel: "Next",
  value: "value",
  options: [],
  errors: {
    defaultChoiceError: "",
  },
  placeholder: "Type or select an option",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    randomize: false,
    isAlphabeticallyArranged: false,
    includeOtherOption: false,
    defaultChoice: [],
    selectionType: "Single",
    exactNumber: "1",
    minNumber: "1",
    maxNumber: "2",
    accessKey: "",
    enableMap: false,
    isAdvancedField: false,
  },
};

const RANKING_DEFAULT_SETUP = {
  version: "1",
  _id: "123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.RANKING,
  module: "Question",
  buttonLabel: "Next",
  options: [{ id: "ranking_1", rank: null, label: "" }],
  value: {
    value: [],
    __to_string: "",
  },
  key_config_map: {
    __to_string: {
      display_name: {
        key: "label",
        value: "String Value",
      },
    },
  },
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    randomize: false,
    dynamicInput: {
      isActive: false,
      variable: {},
    },
    accessKey: "",
  },
};

const RATING_DEFAULT_SETUP = {
  _id: "rating_123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.RATING,
  module: "Question",
  buttonLabel: "Next",
  value: 0,
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    defaultRating: "",
    maxRating: "10",
    ratingEmoji: "star",
  },
  response_type: QUESTION_RESPONSE_TYPES.NUMBER,
};

const SLIDER_DEFAULT_SETUP = {
  _id: "slider_123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.SLIDER,
  module: "Question",
  buttonLabel: "Next",
  value: 0,
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    minValue: 0,
    maxValue: 10,
    accessKey: "",
  },
  response_type: QUESTION_RESPONSE_TYPES.NUMBER,
};

const OPINION_SCALE_DEFAULT_SETUP = {
  _id: "opinion_scale_123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.OPINION_SCALE,
  module: "Question",
  buttonLabel: "Next",
  value: 0,
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    defaultValue: 0,
    maxValue: 10,
  },
  response_type: QUESTION_RESPONSE_TYPES.NUMBER,
};

const FILE_PICKER_DEFAULT_SETUP = {
  _id: "file123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.FILE_PICKER,
  module: "Question",
  buttonLabel: "Next",
  value: [
    {
      url: "",
      size: 1,
      mimeType: "",
    },
  ],
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    noOfFilesAllowed: "1",
    allowedFileTypes: [],
    accessKey: "",
    isAdvancedField: false,
  },
};

const ADDRESS_DEFAULT_SETUP = {
  _id: "address123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.ADDRESS,
  module: "Question",
  buttonLabel: "Next",
  value: {
    fullName: "",
    country: "",
    addressLineOne: "",
    addressLineTwo: "",
    city: "",
    zipCode: "",
    state: "",
    __to_string: "",
  },
  key_config_map: {
    fullName: { display_name: { key: "label", value: "Full Name" } },
    country: { display_name: { key: "label", value: "Country" } },
    addressLineOne: { display_name: { key: "label", value: "Address Line 1" } },
    addressLineTwo: { display_name: { key: "label", value: "Address Line 2" } },
    city: { display_name: { key: "label", value: "City/Town" } },
    zipCode: { display_name: { key: "label", value: "Zip/Post Code" } },
    state: { display_name: { key: "label", value: "State/Region/Province" } },
    __to_string: { display_name: { key: "label", value: "Complete Address" } },
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    fullName: false,
    addressLineOne: false,
    addressLineTwo: false,
    city: false,
    state: false,
    zipCode: false,
    country: false,
    accessKey: "",
  },
};

const ZIP_CODE_DEFAULT_SETUP = {
  _id: "zipcode123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.ZIP_CODE,
  module: "Question",
  buttonLabel: "Next",
  value: {
    countryCode: "US",
    zipCode: "",
  },
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    isCountryChangeEnabled: false,
    allowOtherZipCodes: false,
    defaultCountry: {
      countryCode: "US",
    },
    accessKey: "",
  },
};

const CURRENCY_DEFAULT_SETUP = {
  _id: "currency123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.CURRENCY,
  module: "Question",
  buttonLabel: "Next",
  value: {
    countryCode: "US",
    currencyValue: "",
    currencySymbol: "$",
    currencyCode: "USD",
  },
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    allowFraction: 0,
    minRange: "",
    maxRange: "",
    defaultCountry: {
      countryCode: "US",
      currencySymbol: "$",
      currencyCode: "USD",
    },
    allowedCountries: [],
    accessKey: "",
  },
};

const WELCOME_DEFAULT_SETUP = {
  _id: "welcome123",
  question: "",
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.WELCOME,
  buttonLabel: "Let's Start",
  settings: {
    questionAlignment: QuestionAlignments.CENTER,
  },
  has_output: false,
};

const ENDING_DEFAULT_SETUP = {
  _id: "ending123",
  question: "",
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.ENDING,
  buttonLabel: "Tiny Command",
  settings: {
    questionAlignment: QuestionAlignments.CENTER,
    socialShareIcons: false,
    submitAnotherResponse: false,
    redirectURL: "",
  },
  has_output: false,
};

const QUOTE_DEFAULT_SETUP = {
  _id: "quote123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.QUOTE,
  buttonLabel: "Next",
  settings: {
    questionAlignment: QuestionAlignments.CENTER,
    quotationMark: true,
  },
  has_output: false,
};

const LOADING_DEFAULT_SETUP = {
  _id: "loading123",
  question: "",
  type: QuestionType.LOADING,
  loadingUrl: "https://ccc.oute.app/forms/loader-question-type/RingLoader.gif",
  settings: {
    questionAlignment: QuestionAlignments.CENTER,
  },
  response_type: QUESTION_RESPONSE_TYPES.BOOLEAN,
  has_output: false,
};

const PDF_VIEWER_DEFAULT_SETUP = {
  _id: "pdfviewer123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.PDF_VIEWER,
  module: "Question",
  buttonLabel: "Next",
  has_output: false,
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    showToolbar: true,
  },
};

const TEXT_PREVIEW_DEFAULT_SETUP = {
  _id: "textpreview123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.TEXT_PREVIEW,
  module: "Question",
  buttonLabel: "Next",
  value: "",
  settings: {
    contentType: "Static",
    staticContent: "",
    dynamicContent: {},
  },
  has_output: false,
};

const SIGNATURE_DEFAULT_SETUP = {
  _id: "signature123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.SIGNATURE,
  module: "Question",
  buttonLabel: "Next",
  value: "url",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    penColor: "#000000",
    backgroundColor: "#ffffff",
    accessKey: "",
  },
};

const AUTOCOMPLETE_DEFAULT_SETUP = {
  _id: "autocomplete123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.AUTOCOMPLETE,
  module: "Question",
  buttonLabel: "Next",
  value: {
    searchString: "",
    id: "",
    label: "",
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    accessKey: "",
  },
};

const FORMULA_BAR_DEFAULT_SETUP = {
  _id: "formula-bar123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.FORMULA_BAR,
  buttonLabel: "Next",
  variables: {},
  value: "",
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    isAdvancedField: false,
  },
};

const MULTI_PAGE_QUESTION_DEFAULT_SETUP = {
  _id: "multi-question-page-default-setup",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.MULTI_QUESTION_PAGE,
  questions: {
    "default-question-id": {
      ...SHORT_TEXT_DEFAULT_SETUP,
      _id: "default-question-id",
      id: "default-question-id",
    },
  },
  module: "Question",
  buttonLabel: "Next",
  value: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
  },
};

const QUESTIONS_GRID_DEFAULT_SETUP = {
  _id: "123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.QUESTIONS_GRID,
  module: "Question",
  buttonLabel: "Next",
  value: [],
  placeholder: "",
  columns: [
    { name: "Column1", type: QuestionType.AUTOCOMPLETE },
    { name: "Column2", type: QuestionType.NUMBER },
  ],
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    accessKey: "",
  },
};

const PICTURE_DEFAULT_SETUP = {
  _id: "phone123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.PICTURE,
  module: "Question",
  buttonLabel: "Next",
  value: [
    {
      id: "123",
      label: "Rock",
      imgSrc: "https://www.example.com",
    },
  ],
  options: [
    {
      id: "123",
      label: "",
      imgSrc: "",
    },
  ],
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    accessKey: "",
    randomize: false,
    other: false,
    defaultValue: [],
    selection: {
      type: "Unlimited",
      range: {
        start: "1",
        end: "2",
      },
      exactNumber: "1",
    },
  },
};

const QUESTION_REPEATER_DEFAULT_SETUP = {
  _id: "question-repeater-default-setup",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.QUESTION_REPEATER,
  module: "Question",
  buttonLabel: "Next",
  value: [],
  questions: {
    "default-question-id": {
      ...FORMULA_BAR_DEFAULT_SETUP,
      _id: "default-question-id",
      id: "default-question-id",
    },
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    accessKey: "",
    groupName: "",
  },
};

const TERMS_OF_USE_DEFAULT_SETUP = {
  _id: "terms_of_use_123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.TERMS_OF_USE,
  module: "Question",
  buttonLabel: "I Agree",
  value: "",
  termsContent: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
  },
  response_type: QUESTION_RESPONSE_TYPES.BOOLEAN,
  has_output: false,
};

const QUESTIONS_NODES_METADATA = {
  [QuestionType.SHORT_TEXT]: {
    displayName: "Short Text",
    aliases: [
      "text", "text input", "text field", "short text",
      "name", "full name", "first name", "single line",
      "one liner", "input box", "small input", "url", "website"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "placeholder", "buttonLabel"],
  },
  [QuestionType.LONG_TEXT]: {
    displayName: "Long Text",
    aliases: [
      "long text", "paragraph", "text area", "paragraph input",
      "large text field", "essay box", "comment box", "notes", "textarea"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "placeholder", "buttonLabel"],
  },
  [QuestionType.EMAIL]: {
    displayName: "Email",
    aliases: [
      "email", "email address", "email input", "email field",
      "contact email", "e-mail"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "placeholder", "buttonLabel"],
  },
  [QuestionType.MCQ]: {
    displayName: "Multi Choice",
    aliases: [
      "mcq", "multiple choice", "multi choice", "checkboxes",
      "multi-select", "choose multiple", "select many", "checkbox options"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "options", "buttonLabel"],
  },
  [QuestionType.SCQ]: {
    displayName: "Single Choice",
    aliases: [
      "scq", "single choice", "radio", "radio button",
      "single answer", "choose one", "pick one", "one option"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "options", "buttonLabel"],
  },
  [QuestionType.NUMBER]: {
    displayName: "Number",
    aliases: [
      "number", "numeric", "numeric input", "quantity",
      "number box", "digit entry", "counter", "integer", "age"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "placeholder", "buttonLabel"],
  },
  [QuestionType.PHONE_NUMBER]: {
    displayName: "Phone Number",
    aliases: [
      "phone", "phone number", "contact number", "mobile",
      "phone field", "telephone", "mobile number"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "placeholder", "buttonLabel"],
  },
  [QuestionType.DATE]: {
    displayName: "Date",
    aliases: [
      "date", "date picker", "calendar", "date field",
      "select date", "schedule date", "birthday", "dob"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.TIME]: {
    displayName: "Time",
    aliases: [
      "time", "time picker", "clock", "time field",
      "select time", "hour", "timestamp"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.YES_NO]: {
    displayName: "Yes/No",
    aliases: [
      "yes no", "yes/no", "binary", "boolean",
      "true false", "toggle", "confirm", "decision"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.DROP_DOWN]: {
    displayName: "Dynamic Dropdown",
    aliases: [
      "dropdown", "drop down", "select", "select menu",
      "dropdown list", "pick list", "choose from options"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "options", "placeholder", "buttonLabel"],
  },
  [QuestionType.DROP_DOWN_STATIC]: {
    displayName: "Dropdown Static",
    aliases: [
      "static dropdown", "fixed dropdown", "collection dropdown"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "options", "placeholder", "buttonLabel"],
  },
  [QuestionType.RANKING]: {
    displayName: "Ranking",
    aliases: [
      "ranking", "rank", "priority", "order",
      "sort options", "list ranking", "ordering"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "options", "buttonLabel"],
  },
  [QuestionType.RATING]: {
    displayName: "Rating",
    aliases: [
      "rating", "star rating", "stars", "score",
      "rate", "feedback rating", "review"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.SLIDER]: {
    displayName: "Slider",
    aliases: [
      "slider", "range", "scale", "range slider"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.OPINION_SCALE]: {
    displayName: "Opinion Scale",
    aliases: [
      "opinion scale", "nps", "net promoter", "likelihood scale"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.FILE_PICKER]: {
    displayName: "File Upload",
    aliases: [
      "file upload", "file picker", "upload", "attachment",
      "document upload", "file selector", "image upload", "photo"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.ADDRESS]: {
    displayName: "Address",
    aliases: [
      "address", "location", "street address", "mailing address",
      "home address", "shipping address"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.ZIP_CODE]: {
    displayName: "Zip Code",
    aliases: [
      "zip code", "postal code", "zipcode", "postcode",
      "pin code", "area code"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "placeholder", "buttonLabel"],
  },
  [QuestionType.CURRENCY]: {
    displayName: "Currency",
    aliases: [
      "currency", "money", "price", "amount",
      "cost", "payment amount", "dollar"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "placeholder", "buttonLabel"],
  },
  [QuestionType.WELCOME]: {
    displayName: "Welcome",
    aliases: [
      "welcome", "intro", "start", "greeting",
      "welcome screen", "introduction", "landing"
    ],
    category: "Flow",
    safeOverrides: ["label", "description", "buttonLabel"],
  },
  [QuestionType.ENDING]: {
    displayName: "Ending",
    aliases: [
      "ending", "end", "thank you", "finish",
      "completion", "submit", "done", "close"
    ],
    category: "Flow",
    safeOverrides: ["label", "description", "buttonLabel"],
  },
  [QuestionType.QUOTE]: {
    displayName: "Quote",
    aliases: [
      "quote", "statement", "message", "text block",
      "info", "information"
    ],
    category: "Flow",
    safeOverrides: ["label", "description", "buttonLabel"],
  },
  [QuestionType.LOADING]: {
    displayName: "Loading",
    aliases: [
      "loading", "spinner", "wait", "progress",
      "loading screen"
    ],
    category: "Flow",
    safeOverrides: ["label"],
  },
  [QuestionType.PDF_VIEWER]: {
    displayName: "PDF Viewer",
    aliases: [
      "pdf", "pdf viewer", "document viewer", "file preview"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "buttonLabel"],
  },
  [QuestionType.TEXT_PREVIEW]: {
    displayName: "Text Preview",
    aliases: [
      "text preview", "preview", "display text", "read only text",
      "static text"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "buttonLabel"],
  },
  [QuestionType.SIGNATURE]: {
    displayName: "Signature",
    aliases: [
      "signature", "sign", "e-signature", "digital signature",
      "signature pad"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.AUTOCOMPLETE]: {
    displayName: "Autocomplete",
    aliases: [
      "autocomplete", "auto complete", "search", "search field",
      "typeahead", "suggest", "autofill"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.FORMULA_BAR]: {
    displayName: "Formula Bar",
    aliases: [
      "formula", "formula bar", "calculation", "computed field",
      "calculated field", "formula field"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.MULTI_QUESTION_PAGE]: {
    displayName: "Multi Question Page",
    aliases: [
      "multi question page", "multi page", "page with multiple questions",
      "multiple questions", "question group", "question page"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.QUESTIONS_GRID]: {
    displayName: "Questions Grid",
    aliases: [
      "questions grid", "grid", "table of questions",
      "question table", "grid layout"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.PICTURE]: {
    displayName: "Picture",
    aliases: [
      "picture", "image", "photo", "image choice",
      "picture choice", "visual choice", "image selection"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "options", "buttonLabel"],
  },
  [QuestionType.QUESTION_REPEATER]: {
    displayName: "Question Repeater",
    aliases: [
      "question repeater", "repeater", "repeatable question",
      "repeatable group", "repeatable section"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
  [QuestionType.TERMS_OF_USE]: {
    displayName: "Terms of Use",
    aliases: [
      "terms of use", "terms", "terms and conditions",
      "agreement", "accept terms", "terms acceptance"
    ],
    category: "Question",
    safeOverrides: ["label", "description", "required", "buttonLabel"],
  },
};

const DEFAULT_SETUPS = {
  [QuestionType.SHORT_TEXT]: SHORT_TEXT_DEFAULT_SETUP,
  [QuestionType.LONG_TEXT]: LONG_TEXT_DEFAULT_SETUP,
  [QuestionType.EMAIL]: EMAIL_DEFAULT_SETUP,
  [QuestionType.MCQ]: MCQ_DEFAULT_SETUP,
  [QuestionType.SCQ]: SCQ_DEFAULT_SETUP,
  [QuestionType.NUMBER]: NUMBER_DEFAULT_SETUP,
  [QuestionType.PHONE_NUMBER]: PHONE_NUMBER_DEFAULT_SETUP,
  [QuestionType.DATE]: DATE_DEFAULT_SETUP,
  [QuestionType.TIME]: TIME_DEFAULT_SETUP,
  [QuestionType.YES_NO]: YES_NO_DEFAULT_SETUP,
  [QuestionType.DROP_DOWN]: DROP_DOWN_DEFAULT_SETUP,
  [QuestionType.DROP_DOWN_STATIC]: DROP_DOWN_STATIC_DEFAULT_SETUP,
  [QuestionType.RANKING]: RANKING_DEFAULT_SETUP,
  [QuestionType.RATING]: RATING_DEFAULT_SETUP,
  [QuestionType.SLIDER]: SLIDER_DEFAULT_SETUP,
  [QuestionType.OPINION_SCALE]: OPINION_SCALE_DEFAULT_SETUP,
  [QuestionType.FILE_PICKER]: FILE_PICKER_DEFAULT_SETUP,
  [QuestionType.ADDRESS]: ADDRESS_DEFAULT_SETUP,
  [QuestionType.ZIP_CODE]: ZIP_CODE_DEFAULT_SETUP,
  [QuestionType.CURRENCY]: CURRENCY_DEFAULT_SETUP,
  [QuestionType.WELCOME]: WELCOME_DEFAULT_SETUP,
  [QuestionType.ENDING]: ENDING_DEFAULT_SETUP,
  [QuestionType.QUOTE]: QUOTE_DEFAULT_SETUP,
  [QuestionType.LOADING]: LOADING_DEFAULT_SETUP,
  [QuestionType.PDF_VIEWER]: PDF_VIEWER_DEFAULT_SETUP,
  [QuestionType.TEXT_PREVIEW]: TEXT_PREVIEW_DEFAULT_SETUP,
  [QuestionType.SIGNATURE]: SIGNATURE_DEFAULT_SETUP,
  [QuestionType.AUTOCOMPLETE]: AUTOCOMPLETE_DEFAULT_SETUP,
  [QuestionType.FORMULA_BAR]: FORMULA_BAR_DEFAULT_SETUP,
  [QuestionType.MULTI_QUESTION_PAGE]: MULTI_PAGE_QUESTION_DEFAULT_SETUP,
  [QuestionType.QUESTIONS_GRID]: QUESTIONS_GRID_DEFAULT_SETUP,
  [QuestionType.PICTURE]: PICTURE_DEFAULT_SETUP,
  [QuestionType.QUESTION_REPEATER]: QUESTION_REPEATER_DEFAULT_SETUP,
  [QuestionType.TERMS_OF_USE]: TERMS_OF_USE_DEFAULT_SETUP,
};

function buildFormNodesSchema() {
  const nodes = {};
  
  for (const [canonicalType, metadata] of Object.entries(QUESTIONS_NODES_METADATA)) {
    const defaultSetup = DEFAULT_SETUPS[canonicalType];
    if (!defaultSetup) {
      console.warn(`Warning: No default setup found for ${canonicalType}`);
      continue;
    }
    
    nodes[canonicalType] = {
      canonicalType,
      displayName: metadata.displayName,
      aliases: metadata.aliases,
      category: metadata.category,
      safeOverrides: metadata.safeOverrides,
      defaultSetup: JSON.parse(JSON.stringify(defaultSetup)),
    };
  }
  
  const aliasIndex = {};
  for (const [canonicalType, node] of Object.entries(nodes)) {
    aliasIndex[canonicalType.toLowerCase()] = canonicalType;
    aliasIndex[node.displayName.toLowerCase()] = canonicalType;
    for (const alias of node.aliases) {
      aliasIndex[alias.toLowerCase()] = canonicalType;
    }
  }
  
  return {
    version: "1.0.0",
    extractedAt: new Date().toISOString(),
    source: "studio/src/module/constants",
    excludedTypes: [
      "CONNECTION",
      "KEY_VALUE_TABLE",
      "COLLECT_PAYMENT",
      "STRIPE_PAYMENT",
      "CLOUD_FILE_EXPLORER"
    ],
    nodes,
    aliasIndex,
    canonicalTypes: Object.keys(nodes),
  };
}

const schema = buildFormNodesSchema();
const outputPath = path.resolve(__dirname, '../../server/src/schemas/form-nodes.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

console.log(`Schema extracted successfully!`);
console.log(`Output: ${outputPath}`);
console.log(`Nodes: ${Object.keys(schema.nodes).length}`);
console.log(`Aliases: ${Object.keys(schema.aliasIndex).length}`);
