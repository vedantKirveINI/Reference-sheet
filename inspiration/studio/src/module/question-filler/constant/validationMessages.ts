export const VALIDATION_MESSAGE = {
  JUMP_TO_NODE: {
    GENERIC_MESSAGE: "Please change your response to proceed further.",
  },
  COMMON: {
    REQUIRED: "This field is required",
    INVALID_INPUT: "Invalid input",
  },
  ADDRESS: {
    ADDRESS_REQUIRED: "Address is Required",
    ADDRESS_LINE_1_REQUIRED: "Address Line 1 is Required",
    ADDRESS_LINE_2_REQUIRED: "Address Line 2 is Required",
    CITY_REQUIRED: "City/Town is Required",
    STATE_REQUIRED: "State/Region/Province is Required",
    ZIP_CODE_REQUIRED: "Zip/Post Code is Required",
    COUNTRY_REQUIRED: "Country is Required",
    FULL_NAME_REQUIRED: "Full Name is Required",
  },
  AUTOCOMPLETE: {
    REQUIRED: "This Field is Required, Please select an option",
  },
  CURRENCY: {
    MIN_RANGE: (min: number) =>
      `Amount should be greater than or equal to ${min}`,
    MAX_RANGE: (max: number) => `Amount should be less than or equal to ${max}`,
    NEGATIVE_NOT_ALLOWED: "Amount should be greater than or equal to 0",
  },
  DATE: {
    INVALID_DATE: "Invalid Date",
    PAST_DATE: "Date should not be past date",
    FUTURE_DATE: "Date should not be future date",
    MIN_DATE: (startDate: string) =>
      `Date should be greater than or equal to ${startDate}`,
    MAX_DATE: (endDate: string) =>
      `Date should be less than or equal to ${endDate}`,
  },
  DROPDOWN: {
    SINGLE_SELECTION: "Please select only one option",
    EXACT_NUMBER: (num: number) =>
      `Please select ${num} ${num > 1 ? "options" : "option"}`,
    RANGE: (min: number, max: number) =>
      `Please select between ${min} and ${max}`,
  },
  EMAIL: {
    INVALID_EMAIL: "Invalid Email",
    DOMAIN_RESTRICTION: (domains: string) =>
      `Please provide emails only from the specified domains: ${domains}.`,
    PERSONAL_EMAIL_BLOCKED:
      "Please use a work or business email address. Personal email addresses are not allowed.",
  },
  FILE_PICKER: {
    // Uses validation from the component itself
  },
  MCQ: {
    EXACT_NUMBER: (num: number) =>
      `You should select exactly ${num} ${num > 1 ? "options" : "option"} to proceed`,
    RANGE: (start: number, end: number) =>
      `You must select the options in the range from ${start} to ${end}`,
  },
  NUMBER: {
    NEGATIVE_NOT_ALLOWED: "Number should be greater than or equal to 0",
    INTEGER_ONLY: "Number should be an integer",
    DECIMAL_PLACES: (decimalPlaces: number) =>
      `Number should have only ${decimalPlaces} ${decimalPlaces === 1 ? "decimal place" : "decimal places"}`,
    MIN_RANGE: (min: number) =>
      `Number should be greater than or equal to ${min}`,
    MAX_RANGE: (max: number) => `Number should be less than or equal to ${max}`,
  },
  PHONE_NUMBER: {
    INVALID_PHONE: "Please enter a valid phone number",
  },
  PICTURE: {
    EXACT_NUMBER: (num: number) =>
      `You should select exactly ${num} ${num > 1 ? "options" : "option"} to proceed`,
  },
  RANKING: {
    // Uses COMMON.REQUIRED
  },
  SCQ: {
    // Uses COMMON.REQUIRED
  },
  SHORT_TEXT: {
    MIN_CHAR: (min: number) =>
      `Minimum ${min} ${min > 1 ? "characters" : "character"} required to proceed`,
    MAX_CHAR: (max: number) =>
      `Maximum ${max} ${max > 1 ? "characters" : "character"} required to proceed`,
  },
  LONG_TEXT: {
    MIN_CHAR: (min: number) =>
      `Minimum ${min} ${min > 1 ? "characters" : "character"} required to proceed`,
    MAX_CHAR: (max: number) =>
      `Maximum ${max} ${max > 1 ? "characters" : "character"} required to proceed`,
  },
  SIGNATURE: {
    INVALID_SIGNATURE: "Invalid Signature",
  },
  TIME: {
    INVALID_TIME: "Invalid Time",
    TIME_REQUIRED: "Time is required",
  },
  YES_NO: {
    // Uses COMMON.REQUIRED
  },
  ZIP_CODE: {
    INVALID: "Please enter a valid zip code",
  },
  STRIPE_PAYMENT: {
    NAME_REQUIRED: "Name on card is required",
    SEND_RECEIPT_REQUIRED: "Email is required for receipt",
    INVALID_NAME: "Name must be at least 3 characters",
    INVALID_EMAIL: "Please enter a valid email address",
    STRIPE_PAYMENT_QUESTION_NOT_FOUND:
      "Something went wrong. Please contact support.",
    STRIPE_QUESTION_NOT_CONFIGURED:
      "Stripe Question is not configured correctly. Please contact support.",
    STRIPE_INSTANCE_NOT_AVAILABLE:
      "Something went wrong. Please contact support.",
    INVALID_PAYMENT_AMOUNT:
      "Looks like there's nothing to charge. Please check the amount.",
    STRIPE_PAYMENT_FAILED: "Something went wrong. Please contact support.",
  },
};
