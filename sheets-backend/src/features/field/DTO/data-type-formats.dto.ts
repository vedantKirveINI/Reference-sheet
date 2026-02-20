export const DATA_TYPE_FORMATS = {
  SHORT_TEXT: '',
  LONG_TEXT: '',
  MCQ: [''],
  SCQ: '',
  PHONE_NUMBER: {
    countryCode: '',
    countryNumber: '',
    phoneNumber: '',
  },
  ZIP_CODE: {
    countryCode: '',
    zipCode: '',
  },
  DROP_DOWN: [
    {
      id: '',
      label: '',
    },
  ],
  DROP_DOWN_STATIC: [''],
  YES_NO: '',
  EMAIL: '',
  DATE: '',
  CURRENCY: {
    countryCode: '',
    currencyCode: '',
    currencySymbol: '',
    currencyValue: 0,
  },
  NUMBER: 0,
  RATING: 0,
  FILE_PICKER: [
    {
      url: '',
      size: 0,
      mimeType: '',
    },
  ],
  TIME: {
    time: '',
    meridiem: '',
    ISOValue: '',
  },
  ADDRESS: {
    city: '',
    state: '',
    country: '',
    zipCode: '',
    fullName: '',
    addressLineOne: '',
    addressLineTwo: '',
  },
  SIGNATURE: '',
  FORMULA: null,
  LIST: [''],
  RANKING: [
    {
      id: '',
      label: '',
      rank: '',
    },
  ],
  SLIDER: 0,
  OPINION_SCALE: 0,
};

// Type for the format structure
export type DataTypeFormat = typeof DATA_TYPE_FORMATS;

// Helper function to get format for a specific data type
export function getDataTypeFormat(dataType: keyof DataTypeFormat): any {
  return DATA_TYPE_FORMATS[dataType];
}
