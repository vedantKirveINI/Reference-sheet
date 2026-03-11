import { QUESTION_RESPONSE_TYPES } from "./constants";
import {
  DEFAULT_QUESTION_DESCRIPTION,
  DEFAULT_QUESTION_TITLE,
} from "./productCopy";
import { countries } from "./countries-list";
import { QuestionAlignments, TextTransformations } from "./question";
import { QuestionType } from "./questionType";
import { generateUUID } from "@/lib/utils";

// to get all countries for currency
const allCountries = Object.values(countries);

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
    defaultValue: "",
    accessKey: "",
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
      type: "Unlimited", // unlimited has no type in unlimited selection by user can be unlimited
      range: {
        start: "1",
        end: "2",
      },
      exactNumber: "1",
    },
    accessKey: "",
  },
};

const SIGNATURE_DEFAULT_SETUP = {
  _id: "123",
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
    accessKey: "",
  },

  // response_type: "STRING",
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
    // noFreeEmails: false, // Commented out - feature disabled
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
    // isPhoneNumberValid: {
    //   display_name: {
    //     key: "label",
    //     value: "Is Phone Number Valid",
    //   },
    // },
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

const ZIP_CODE_DEFAULT_SETUP = {
  _id: "phone123",
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

const YES_NO_DEFAULT_SETUP = {
  _id: "123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.YES_NO,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Next",
  options: ["Yes", "No"],
  value: "No",
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    // other: false,
    vertical: false,
    defaultChoice: "",
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
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Next",
  options: [{ id: "R1eLci_7B9y3TzFY", rank: null, label: "" }],
  value: {
    value: [
      {
        id: "ranking-options_1",
        rank: 1,
        label: "test",
      },
    ],
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

const DATE_DEFAULT_SETUP = {
  _id: "date123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.DATE,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Next",
  value: {
    value: "",
    ISOValue: "",
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    useDatePicker: true,
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
    // customDates: [],
    // verifyAge: "",
  },
};

const CONNECTION_DEFAULT_SETUP = {
  _id: "connection-questions",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.CONNECTION,
  module: "Question",
  URL: "https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=358736062251-jur4vtja7nlcmdbt8h4mjqtqm5epht3v.apps.googleusercontent.com&redirect_uri=https://d30gjq1edbp7eb.cloudfront.net&response_type=token&scope=https://www.googleapis.com/auth/spreadsheets&include_granted_scopes=true&disallow_webview=false&approval_prompt=force",
  authorization_id: "FRldyxUB1",
  value: "",
  required: true,
  buttonLabel: "Next",
};

export const FORMULA_BAR_DEFAULT_SETUP = {
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

const WELCOME_DEFAULT_SETUP = {
  _id: "welcome123",
  question: "",
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.WELCOME,
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Let's Start",
  settings: {
    questionAlignment: QuestionAlignments.CENTER,
  },
  has_output: false,
};

const QUOTE_DEFAULT_SETUP = {
  _id: "quote123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.QUOTE,
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Next",
  settings: {
    questionAlignment: QuestionAlignments.CENTER,
    quotationMark: true,
  },
  has_output: false,
};

const ENDING_DEFAULT_SETUP = {
  _id: "ending123",
  question: "",
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.ENDING,
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Tiny Command",
  settings: {
    questionAlignment: QuestionAlignments.CENTER,
    socialShareIcons: false,
    submitAnotherResponse: false,
    redirectURL: "",
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
    // backgroundImageUrl: "",
  },
  response_type: QUESTION_RESPONSE_TYPES.BOOLEAN,
  has_output: false,
};

const CURRENCY_DEFAULT_SETUP = {
  _id: "currency123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.CURRENCY,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
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
    allowedCountries: allCountries,
    accessKey: "",
  },
};

const KEY_VALUE_TABLE_DEFAULT_SETUP = {
  _id: "KEY_VALUE_TABLE_DEFAULT_SETUP-123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.KEY_VALUE_TABLE,
  module: "Question",
  buttonLabel: "Next",
  options: "",
  value: [
    {
      key: "A",
      value: {},
    },
    {
      key: "B",
      value: {},
    },
    {
      key: "C",
      value: {},
    },
  ],
  settings: {
    withDefaultValue: false,
    tableType: "STATIC",
    variables: {
      blocks: [],
    },
    allowAddRow: true,
    enableMap: false,
    isAdvancedField: false,
  },
};

const NUMBER_DEFAULT_SETUP = {
  _id: "number123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.NUMBER,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
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

const FILE_PICKER_DEFAULT_SETUP = {
  _id: "filel123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.FILE_PICKER,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
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

const TIME_DEFAULT_SETUP = {
  _id: "time123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.TIME,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
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

const ADDRESS_DEFAULT_SETUP = {
  _id: "address123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.ADDRESS,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
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
    fullName: {
      display_name: {
        key: "label",
        value: "Full Name",
      },
    },
    country: {
      display_name: {
        key: "label",
        value: "Country",
      },
    },
    addressLineOne: {
      display_name: {
        key: "label",
        value: "Address Line 1",
      },
    },
    addressLineTwo: {
      display_name: {
        key: "label",
        value: "Address Line 2",
      },
    },
    city: {
      display_name: {
        key: "label",
        value: "City/Town",
      },
    },
    zipCode: {
      display_name: {
        key: "label",
        value: "Zip/Post Code",
      },
    },
    state: {
      display_name: {
        key: "label",
        value: "State/Region/Province",
      },
    },
    __to_string: {
      display_name: {
        key: "label",
        value: "Complete Address",
      },
    },
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

const PDF_VIEWER_DEFAULT_SETUP = {
  _id: "123pdfviewer",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.PDF_VIEWER,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Next",
  has_output: false,
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    showToolbar: true,
  },
};

const TEXT_PREVIEW_DEFAULT_SETUP = {
  _id: "123textpreview",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.TEXT_PREVIEW,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
  buttonLabel: "Next",
  value: "",
  settings: {
    contentType: "Static",
    staticContent: "",
    dynamicContent: {},
  },
  has_output: false,
};

const AUTOCOMPLETE_DEFAULT_SETUP = {
  _id: "autocomplete123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.AUTOCOMPLETE,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
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

const getDefaultQuestion = (restData = {}) => {
  const DEFAULT_QUESTION_ID = generateUUID();

  return {
    [DEFAULT_QUESTION_ID]: {
      ...restData,
      _id: DEFAULT_QUESTION_ID,
      id: DEFAULT_QUESTION_ID,
    },
  };
};

const MULTI_PAGE_QUESTION_DEFAULT_SETUP = {
  _id: "multi-question-page-default-setup",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.MULTI_QUESTION_PAGE,
  questions: getDefaultQuestion(SHORT_TEXT_DEFAULT_SETUP),
  module: "Question",
  buttonLabel: "Next",
  value: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
  },
};

const DROP_DOWN_DEFAULT_SETUP = {
  _id: "long123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.DROP_DOWN,
  module: "Question",
  // cta: {
  //   label: "<i><strong>Lets Go!</strong></i>",
  // },
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
    selectionType: "Single", //["Single", "Unlimited", "Exact Number", "Range"]
    exactNumber: "1",
    minNumber: "1",
    maxNumber: "2",
    optionsType: "Custom", // Custom or Dynamic
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

export const PICTURE_DEFAULT_SETUP = {
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

export const QUESTION_REPEATOR_DEFAULT_SETUP = {
  _id: "question-repeater-default-setup",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.QUESTION_REPEATER,
  module: "Question",
  buttonLabel: "Next",
  value: [],
  questions: getDefaultQuestion(FORMULA_BAR_DEFAULT_SETUP),
  settings: {
    questionAlignment:
      QuestionAlignments.LEFT as keyof typeof QuestionAlignments,
    required: false,
    accessKey: "",
    groupName: "",
  },
};

const COLLECT_PAYMENT_DEFAULT_SETUP = {
  _id: "collect_payment_123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.COLLECT_PAYMENT,
  module: "Question",
  buttonLabel: "Next",
  value: {
    paymentId: "",
  },
  placeholder: "",
  errors: {
    charLimitError: "",
  },
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    paymentMethod: "RAZORPAY",
    authorization_data_id: "",
    currency: "INR",
    amount: "100",
    toolTipText: "",
  },
  response_type: QUESTION_RESPONSE_TYPES.STRING,
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
  has_output: true,
};

const STRIPE_PAYMENT_DEFAULT_SETUP = {
  _id: "stripe_payment_123",
  question: DEFAULT_QUESTION_TITLE,
  description: DEFAULT_QUESTION_DESCRIPTION,
  type: QuestionType.STRIPE_PAYMENT,
  module: "Question",
  buttonLabel: "Next",
  value: {
    amount: "",
    name: "",
    currency: "",
  },
  placeholder: "",
  settings: {
    questionAlignment: QuestionAlignments.LEFT,
    required: false,
    amount: "",
    currency: "USD",
    stripe_connection_data: null,
    sendReceipt: false,
    toolTipText: "",
  },
};

export const DEFAULT_QUESTION_CONFIG = {
  [QuestionType.SHORT_TEXT]: SHORT_TEXT_DEFAULT_SETUP,
  [QuestionType.LONG_TEXT]: LONG_TEXT_DEFAULT_SETUP,
  [QuestionType.MCQ]: MCQ_DEFAULT_SETUP,
  [QuestionType.SIGNATURE]: SIGNATURE_DEFAULT_SETUP,
  [QuestionType.EMAIL]: EMAIL_DEFAULT_SETUP,
  [QuestionType.SCQ]: SCQ_DEFAULT_SETUP,
  [QuestionType.PHONE_NUMBER]: PHONE_NUMBER_DEFAULT_SETUP,
  [QuestionType.ZIP_CODE]: ZIP_CODE_DEFAULT_SETUP,
  [QuestionType.CURRENCY]: CURRENCY_DEFAULT_SETUP,
  [QuestionType.CONNECTION]: CONNECTION_DEFAULT_SETUP,
  [QuestionType.YES_NO]: YES_NO_DEFAULT_SETUP,
  [QuestionType.RANKING]: RANKING_DEFAULT_SETUP,
  [QuestionType.DATE]: DATE_DEFAULT_SETUP,
  [QuestionType.WELCOME]: WELCOME_DEFAULT_SETUP,
  [QuestionType.QUOTE]: QUOTE_DEFAULT_SETUP,
  [QuestionType.ENDING]: ENDING_DEFAULT_SETUP,
  [QuestionType.AUTOCOMPLETE]: AUTOCOMPLETE_DEFAULT_SETUP,
  [QuestionType.DROP_DOWN_STATIC]: DROP_DOWN_STATIC_DEFAULT_SETUP,
  [QuestionType.FILE_PICKER]: FILE_PICKER_DEFAULT_SETUP,
  [QuestionType.NUMBER]: NUMBER_DEFAULT_SETUP,
  [QuestionType.TIME]: TIME_DEFAULT_SETUP,
  [QuestionType.PDF_VIEWER]: PDF_VIEWER_DEFAULT_SETUP,
  [QuestionType.TEXT_PREVIEW]: TEXT_PREVIEW_DEFAULT_SETUP,
  [QuestionType.DROP_DOWN]: DROP_DOWN_DEFAULT_SETUP,
  [QuestionType.FORMULA_BAR]: FORMULA_BAR_DEFAULT_SETUP,
  [QuestionType.KEY_VALUE_TABLE]: KEY_VALUE_TABLE_DEFAULT_SETUP,
  [QuestionType.LOADING]: LOADING_DEFAULT_SETUP,
  [QuestionType.ADDRESS]: ADDRESS_DEFAULT_SETUP,
  [QuestionType.MULTI_QUESTION_PAGE]: MULTI_PAGE_QUESTION_DEFAULT_SETUP,
  [QuestionType.QUESTIONS_GRID]: QUESTIONS_GRID_DEFAULT_SETUP,
  [QuestionType.PICTURE]: PICTURE_DEFAULT_SETUP,
  [QuestionType.QUESTION_REPEATER]: QUESTION_REPEATOR_DEFAULT_SETUP,
  [QuestionType.COLLECT_PAYMENT]: COLLECT_PAYMENT_DEFAULT_SETUP,
  [QuestionType.RATING]: RATING_DEFAULT_SETUP,
  [QuestionType.SLIDER]: SLIDER_DEFAULT_SETUP,
  [QuestionType.OPINION_SCALE]: OPINION_SCALE_DEFAULT_SETUP,
  [QuestionType.TERMS_OF_USE]: TERMS_OF_USE_DEFAULT_SETUP,
  [QuestionType.STRIPE_PAYMENT]: STRIPE_PAYMENT_DEFAULT_SETUP,
};

export {
  SHORT_TEXT_DEFAULT_SETUP,
  MCQ_DEFAULT_SETUP,
  SIGNATURE_DEFAULT_SETUP,
  LONG_TEXT_DEFAULT_SETUP,
  EMAIL_DEFAULT_SETUP,
  SCQ_DEFAULT_SETUP,
  PHONE_NUMBER_DEFAULT_SETUP,
  ZIP_CODE_DEFAULT_SETUP,
  CONNECTION_DEFAULT_SETUP,
  YES_NO_DEFAULT_SETUP,
  RANKING_DEFAULT_SETUP,
  DATE_DEFAULT_SETUP,
  WELCOME_DEFAULT_SETUP,
  QUOTE_DEFAULT_SETUP,
  ENDING_DEFAULT_SETUP,
  LOADING_DEFAULT_SETUP,
  KEY_VALUE_TABLE_DEFAULT_SETUP,
  NUMBER_DEFAULT_SETUP,
  FILE_PICKER_DEFAULT_SETUP,
  TIME_DEFAULT_SETUP,
  ADDRESS_DEFAULT_SETUP,
  TEXT_PREVIEW_DEFAULT_SETUP,
  PDF_VIEWER_DEFAULT_SETUP,
  MULTI_PAGE_QUESTION_DEFAULT_SETUP,
  DROP_DOWN_DEFAULT_SETUP,
  DROP_DOWN_STATIC_DEFAULT_SETUP,
  CURRENCY_DEFAULT_SETUP,
  AUTOCOMPLETE_DEFAULT_SETUP,
  QUESTIONS_GRID_DEFAULT_SETUP,
  COLLECT_PAYMENT_DEFAULT_SETUP,
  RATING_DEFAULT_SETUP,
  SLIDER_DEFAULT_SETUP,
  OPINION_SCALE_DEFAULT_SETUP,
  TERMS_OF_USE_DEFAULT_SETUP,
  STRIPE_PAYMENT_DEFAULT_SETUP,
};
