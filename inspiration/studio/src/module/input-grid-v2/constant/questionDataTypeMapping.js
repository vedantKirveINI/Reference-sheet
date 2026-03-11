import { lowerCase } from "lodash";

const questionDataTypeMapping = {
  SHORT_TEXT: {
    alias: "Short Text",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741761897530/Short-text.svg",
  },
  LONG_TEXT: {
    alias: "Long Text",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741761703117/LongText.svg",
  },
  NUMBER: {
    alias: "Number",
    type: "Number",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741759605326/Number.svg",
  },
  EMAIL: {
    alias: "Email",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741760530699/Email.svg",
  },
  CURRENCY: {
    alias: "Currency",
    type: "Object",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741759302457/Currency.svg",
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: true,
    disableDelete: true,
    disableCheckboxSelection: true,
    allowMapping: false,
    schema: [
      {
        key: "countryCode",
        displayKeyName: "Country Code",
        type: "String",
      },
      {
        key: "currencyCode",
        displayKeyName: "Currency Code",
        type: "String",
      },
      {
        key: "currencyValue",
        displayKeyName: "Currency Value",
        type: "String",
      },
      {
        key: "currencySymbol",
        displayKeyName: "Currency Symbol",
        type: "String",
      },
    ],
  },
  ADDRESS: {
    alias: "Address",
    type: "Object",
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: true,
    disableDelete: true,
    disableCheckboxSelection: true,
    allowMapping: false,
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741762129628/Address.svg",
    schema: [
      {
        key: "fullName",
        displayKeyName: "Full Name",
        type: "String",
      },
      {
        key: "addressLineOne",
        displayKeyName: "Address Line 1",
        type: "String",
      },
      {
        key: "addressLineTwo",
        displayKeyName: "Address Line 2",
        type: "String",
      },
      {
        key: "city",
        displayKeyName: "City",
        type: "String",
      },
      {
        key: "state",
        displayKeyName: "State",
        type: "String",
      },
      {
        key: "zipCode",
        displayKeyName: "Zip Code",
        type: "String",
      },
      {
        key: "country",
        displayKeyName: "Country",
        type: "String",
      },
    ],
  },
  MCQ: {
    alias: "MCQ",
    type: "Array",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741761589947/Mcq.svg",
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: false,
    disableDelete: false,
    disableCheckboxSelection: true,
    schema: [{ type: "String" }],
  },

  SCQ: {
    alias: "SCQ",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1742541141311/SingleChoice.svg",
  },
  DATE: {
    alias: "Date",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741760179749/Date.svg",
  },

  FILE_PICKER: {
    alias: "File Picker",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741759812576/Filepicker.svg",
  },
  PHONE_NUMBER: {
    alias: "Phone Number",
    type: "Object",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741760967713/PhoneNumber.svg",
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: true,
    disableDelete: true,
    disableCheckboxSelection: true,
    allowMapping: false,
    schema: [
      {
        key: "countryCode",
        displayKeyName: "Country Short Name",
        type: "String",
      },
      {
        key: "phoneNumber",
        displayKeyName: "Phone Number",
        type: "String",
      },
      {
        key: "countryNumber",
        displayKeyName: "Country Code",
        type: "String",
      },
    ],
  },
  YES_NO: {
    alias: "Yes No",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741761365360/YesNo.svg",
  },
  DROP_DOWN: {
    alias: "Drop Down",
    type: "Array",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741761077015/Dropdown.svg",
    disableDelete: false,
    disableCheckboxSelection: true,
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: false,
    schema: [
      {
        type: "Object",
        disableAdd: true,
        disableDelete: true,
        allowMapping: false,
        schema: [
          { key: "id", type: "String" },
          { key: "label", type: "String" },
        ],
      },
    ],
  },
  TIME: {
    alias: "Time",
    type: "Object",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741760082965/Time.svg",
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: true,
    disableDelete: true,
    disableCheckboxSelection: true,
    allowMapping: false,
    schema: [
      {
        key: "time",
        displayKeyName: "Time",
        type: "String",
      },
      {
        key: "ISOValue",
        displayKeyName: "ISO Value",
        type: "String",
      },
      {
        key: "meridiem",
        displayKeyName: "Meridiem",
        type: "String",
      },
      {
        key: "timeZone",
        displayKeyName: "Time Zone",
        type: "String",
      },
    ],
  },
  ZIP_CODE: {
    alias: "Zip Code",
    type: "Object",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741760875136/Zipcode.svg",
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: true,
    disableDelete: true,
    disableCheckboxSelection: true,
    allowMapping: false,
    schema: [
      {
        key: "zipCode",
        displayKeyName: "Zip Code",
        type: "String",
      },
      {
        key: "countryCode",
        displayKeyName: "Country Code",
        type: "String",
      },
    ],
  },
  DROP_DOWN_STATIC: {
    alias: "Drop Down Static",
    type: "Array",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741761077015/Dropdown.svg",
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: false,
    disableDelete: false,
    disableCheckboxSelection: true,
    schema: [{ type: "String" }],
  },
  SIGNATURE: {
    alias: "Signature",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741760405590/Signature.svg",
  },
  RANKING: {
    alias: "Ranking",
    type: "Array",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1741760620438/Ranking.svg",
    disableDelete: false,
    disableCheckboxSelection: true,
    disableKeyEditing: true,
    disableTypeEditing: true,
    disableAdd: false,
    schema: [
      {
        type: "Object",
        disableAdd: true,
        disableDelete: true,
        allowMapping: false,
        schema: [
          { key: "id", type: "String" },
          { key: "label", type: "String" },
          { key: "rank", type: "String" },
        ],
      },
    ],
  },
  FORMULA: {
    alias: "Formula",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1748944544593/FxRoundedBlack.svg",
  },
  LIST: {
    alias: "List",
    type: "String",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1755002704385/icon-black.svg",
  },
  RATING: {
    alias: "Rating",
    type: "Number",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1756817171072/rating-icon.svg",
  },
  OPINION_SCALE: {
    alias: "Opinion Scale",
    type: "Number",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1762326865834/opinion%20scale.svg",
  },
  SLIDER: {
    alias: "Slider",
    type: "Number",
    icon: "https://cdn-v1.tinycommand.com/1234567890/1762326867882/slider.svg",
  },
};

export const questionDataType = Object.keys(questionDataTypeMapping).map(
  (item) => lowerCase(item)
);

export const SKIP_QUESTION_DATA_TYPES = ["formula", "created time"];

export default questionDataTypeMapping;
