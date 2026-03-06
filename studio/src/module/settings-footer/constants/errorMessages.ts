export const ERROR_MESSAGE = {
  SHORT_TEXT: {
    minChar: "Min value cannot be greater than max value",
    maxChar: "Max value cannot be less than min value",
  },
  LONG_TEXT: {
    minChar: "Min value cannot be greater than max value",
    maxChar: "Max value cannot be less than min value",
  },
  EMAIL: {
    invalid: "Please enter a valid email address",
    domainError: "Invalid domain",
  },
  NUMBER: {
    minNumberError: "Min value cannot be greater than max value",
    maxNumberError: "Max value cannot be less than min value",
    allowFraction: "Only 2 decimal places are allowed",
    allowNegative: "Negative values are not allowed",
  },
  CURRENCY: {
    minRangeError: "Min Range should be less than Max Range",
    maxRangeError: "Max Range should be greater than Min Range",
  },
  DATE: {
    startDateError: "Start date cannot be in the past",
    endDateError: "End date cannot be in the future",
    invalidDateError: "Invalid Date",
  },
  TIME: {
    defaultTimeError: "Please enter a valid time",
  },
  DROP_DOWN: {
    defaultChoiceError: "Default Value should be less than or equal to {max}",
  },
  MCQ: {
    defaultValueError: "Default Value should be less than or equal to {max}",
  },
  SCQ: {},
  YES_NO: {},
  PHONE_NUMBER: {},
  ZIP_CODE: {},
  SIGNATURE: {},
  FILE_PICKER: {},
  ADDRESS: {},
  AUTOCOMPLETE: {
    curlCommandError: "Please provide API cUrl",
    labelError: "Please provide Label Accessor",
    idError: "Please provide ID Accessor",
  },
  STRIPE_PAYMENT: {
    minAmountError: "Amount must be at least 1",
    maxAmountError: "Amount cannot exceed 999,999.99",
  },
} as const;
