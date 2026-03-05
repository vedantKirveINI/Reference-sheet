import { QuestionType } from "./questionType";

export enum DataStructureType {
  PRIMITIVE = "primitive",
  OBJECT = "object",
  ARRAY = "array",
  ARRAY_OF_OBJECTS = "arrayOfObjects",
}

export interface FieldKeyConfig {
  key: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
}

export interface FieldTypeConfig {
  type: QuestionType;
  displayName: string;
  description: string;
  dataStructure: DataStructureType;
  icon: string;
  keys?: FieldKeyConfig[];
  arrayItemKeys?: FieldKeyConfig[];
  example: unknown;
  placeholder?: string;
  validationHints: string[];
}

const createFieldConfig = (config: FieldTypeConfig): FieldTypeConfig => config;

export const FIELD_TYPE_REGISTRY: Record<string, FieldTypeConfig> = {
  [QuestionType.SHORT_TEXT]: createFieldConfig({
    type: QuestionType.SHORT_TEXT,
    displayName: "Short Text",
    description: "A single line of text",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "Aa",
    example: "Hello World",
    placeholder: "Enter text...",
    validationHints: ["Accepts plain text", "Maximum 255 characters"],
  }),

  [QuestionType.LONG_TEXT]: createFieldConfig({
    type: QuestionType.LONG_TEXT,
    displayName: "Long Text",
    description: "Multiple lines of text",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "Aa",
    example: "This is a longer piece of text that can span multiple lines...",
    placeholder: "Enter detailed text...",
    validationHints: ["Accepts plain text", "Supports multiple paragraphs"],
  }),

  [QuestionType.EMAIL]: createFieldConfig({
    type: QuestionType.EMAIL,
    displayName: "Email",
    description: "An email address",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "@",
    example: "user@example.com",
    placeholder: "email@example.com",
    validationHints: ["Must be a valid email format"],
  }),

  [QuestionType.NUMBER]: createFieldConfig({
    type: QuestionType.NUMBER,
    displayName: "Number",
    description: "A numeric value",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "#",
    example: 42,
    placeholder: "0",
    validationHints: ["Must be a number"],
  }),

  [QuestionType.YES_NO]: createFieldConfig({
    type: QuestionType.YES_NO,
    displayName: "Yes/No",
    description: "A boolean choice",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "Y/N",
    example: "Yes",
    placeholder: "Yes or No",
    validationHints: ["Accepts 'Yes' or 'No'"],
  }),

  [QuestionType.SCQ]: createFieldConfig({
    type: QuestionType.SCQ,
    displayName: "Single Choice",
    description: "Select one option from a list",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "○",
    example: "Option A",
    placeholder: "Select an option",
    validationHints: ["Choose exactly one option"],
  }),

  [QuestionType.SIGNATURE]: createFieldConfig({
    type: QuestionType.SIGNATURE,
    displayName: "Signature",
    description: "A signature image URL",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "✍",
    example: "https://example.com/signature.png",
    placeholder: "Signature URL",
    validationHints: ["Must be a valid image URL"],
  }),

  [QuestionType.MCQ]: createFieldConfig({
    type: QuestionType.MCQ,
    displayName: "Multiple Choice",
    description: "Select multiple options from a list",
    dataStructure: DataStructureType.OBJECT,
    icon: "☑",
    keys: [
      {
        key: "value",
        label: "Selected Options",
        description: "Array of selected option values",
        placeholder: '["Option 1", "Option 2"]',
      },
      {
        key: "__to_string",
        label: "Text Summary",
        description: "Comma-separated text of selections",
        placeholder: "Option 1, Option 2",
      },
    ],
    example: {
      value: ["Option A", "Option B"],
      __to_string: "Option A, Option B",
    },
    validationHints: [
      "Expects an object with 'value' array",
      "Each selection should be a string",
    ],
  }),

  [QuestionType.PHONE_NUMBER]: createFieldConfig({
    type: QuestionType.PHONE_NUMBER,
    displayName: "Phone Number",
    description: "A phone number with country code",
    dataStructure: DataStructureType.OBJECT,
    icon: "📞",
    keys: [
      {
        key: "phoneNumber",
        label: "Phone Number",
        description: "The phone number without country code",
        placeholder: "1234567890",
        required: true,
      },
      {
        key: "countryCode",
        label: "Country Short Name",
        description: "Two-letter country code (e.g., US, IN)",
        placeholder: "US",
      },
      {
        key: "countryNumber",
        label: "Country Code",
        description: "Numeric country dialing code",
        placeholder: "+1",
      },
    ],
    example: {
      phoneNumber: "5551234567",
      countryCode: "US",
      countryNumber: "+1",
    },
    validationHints: [
      "Expects an object with phone details",
      "Phone number should be digits only",
    ],
  }),

  [QuestionType.ADDRESS]: createFieldConfig({
    type: QuestionType.ADDRESS,
    displayName: "Address",
    description: "A complete mailing address",
    dataStructure: DataStructureType.OBJECT,
    icon: "🏠",
    keys: [
      {
        key: "fullName",
        label: "Full Name",
        description: "Recipient's full name",
        placeholder: "John Doe",
      },
      {
        key: "addressLineOne",
        label: "Address Line 1",
        description: "Street address",
        placeholder: "123 Main Street",
        required: true,
      },
      {
        key: "addressLineTwo",
        label: "Address Line 2",
        description: "Apartment, suite, unit, etc.",
        placeholder: "Apt 4B",
      },
      {
        key: "city",
        label: "City/Town",
        description: "City or town name",
        placeholder: "New York",
        required: true,
      },
      {
        key: "state",
        label: "State/Region/Province",
        description: "State or region",
        placeholder: "NY",
      },
      {
        key: "zipCode",
        label: "Zip/Post Code",
        description: "Postal or ZIP code",
        placeholder: "10001",
      },
      {
        key: "country",
        label: "Country",
        description: "Country name",
        placeholder: "United States",
      },
      {
        key: "__to_string",
        label: "Complete Address",
        description: "Full address as a single string",
        placeholder: "123 Main Street, New York, NY 10001",
      },
    ],
    example: {
      fullName: "John Doe",
      addressLineOne: "123 Main Street",
      addressLineTwo: "Apt 4B",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "United States",
      __to_string: "John Doe, 123 Main Street, Apt 4B, New York, NY 10001, United States",
    },
    validationHints: [
      "Expects an object with address fields",
      "At minimum, provide address line 1 and city",
    ],
  }),

  [QuestionType.ZIP_CODE]: createFieldConfig({
    type: QuestionType.ZIP_CODE,
    displayName: "Zip Code",
    description: "A postal/ZIP code with country",
    dataStructure: DataStructureType.OBJECT,
    icon: "📮",
    keys: [
      {
        key: "zipCode",
        label: "Zip/Post Code",
        description: "The postal or ZIP code",
        placeholder: "10001",
        required: true,
      },
      {
        key: "countryCode",
        label: "Country Code",
        description: "Two-letter country code",
        placeholder: "US",
      },
    ],
    example: {
      zipCode: "10001",
      countryCode: "US",
    },
    validationHints: ["Expects an object with zipCode and countryCode"],
  }),

  [QuestionType.DATE]: createFieldConfig({
    type: QuestionType.DATE,
    displayName: "Date",
    description: "A calendar date",
    dataStructure: DataStructureType.OBJECT,
    icon: "📅",
    keys: [
      {
        key: "value",
        label: "Date Value",
        description: "Formatted date string",
        placeholder: "01/15/2024",
        required: true,
      },
      {
        key: "ISOValue",
        label: "ISO Date",
        description: "Date in ISO 8601 format",
        placeholder: "2024-01-15",
      },
    ],
    example: {
      value: "01/15/2024",
      ISOValue: "2024-01-15",
    },
    validationHints: [
      "Expects an object with date values",
      "ISOValue should be YYYY-MM-DD format",
    ],
  }),

  [QuestionType.TIME]: createFieldConfig({
    type: QuestionType.TIME,
    displayName: "Time",
    description: "A time value",
    dataStructure: DataStructureType.OBJECT,
    icon: "🕐",
    keys: [
      {
        key: "time",
        label: "Time",
        description: "Time in HH:MM format",
        placeholder: "09:30",
        required: true,
      },
      {
        key: "meridiem",
        label: "AM/PM",
        description: "Morning or afternoon indicator",
        placeholder: "AM",
      },
      {
        key: "timeZone",
        label: "Time Zone",
        description: "Time zone identifier",
        placeholder: "America/New_York",
      },
      {
        key: "ISOValue",
        label: "ISO Time",
        description: "Time in ISO format",
        placeholder: "09:30:00Z",
      },
    ],
    example: {
      time: "09:30",
      meridiem: "AM",
      timeZone: "America/New_York",
      ISOValue: "09:30:00-05:00",
    },
    validationHints: [
      "Expects an object with time details",
      "Time should be in HH:MM format",
    ],
  }),

  [QuestionType.CURRENCY]: createFieldConfig({
    type: QuestionType.CURRENCY,
    displayName: "Currency",
    description: "A monetary amount with currency",
    dataStructure: DataStructureType.OBJECT,
    icon: "$",
    keys: [
      {
        key: "currencyValue",
        label: "Amount",
        description: "The numeric amount",
        placeholder: "99.99",
        required: true,
      },
      {
        key: "currencyCode",
        label: "Currency Code",
        description: "Three-letter currency code",
        placeholder: "USD",
      },
      {
        key: "currencySymbol",
        label: "Currency Symbol",
        description: "Currency symbol",
        placeholder: "$",
      },
      {
        key: "countryCode",
        label: "Country Code",
        description: "Two-letter country code",
        placeholder: "US",
      },
    ],
    example: {
      currencyValue: "99.99",
      currencyCode: "USD",
      currencySymbol: "$",
      countryCode: "US",
    },
    validationHints: [
      "Expects an object with currency details",
      "Amount should be a numeric value",
    ],
  }),

  [QuestionType.AUTOCOMPLETE]: createFieldConfig({
    type: QuestionType.AUTOCOMPLETE,
    displayName: "Autocomplete",
    description: "A searchable selection field",
    dataStructure: DataStructureType.OBJECT,
    icon: "🔍",
    keys: [
      {
        key: "id",
        label: "ID",
        description: "Unique identifier for the selected item",
        placeholder: "item_123",
      },
      {
        key: "label",
        label: "Label",
        description: "Display text for the selected item",
        placeholder: "Selected Item",
        required: true,
      },
      {
        key: "searchString",
        label: "Search Text",
        description: "The text used to search",
        placeholder: "search term",
      },
    ],
    example: {
      id: "item_123",
      label: "Selected Option",
      searchString: "selected",
    },
    validationHints: [
      "Expects an object with id and label",
      "Label is the displayed value",
    ],
  }),

  [QuestionType.DROP_DOWN]: createFieldConfig({
    type: QuestionType.DROP_DOWN,
    displayName: "Dropdown",
    description: "A dropdown selection (single or multiple)",
    dataStructure: DataStructureType.OBJECT,
    icon: "▼",
    keys: [
      {
        key: "id",
        label: "ID",
        description: "Unique identifier for the selected option",
        placeholder: "option_1",
      },
      {
        key: "label",
        label: "Label",
        description: "Display text for the selected option",
        placeholder: "Option 1",
        required: true,
      },
    ],
    example: {
      id: "option_1",
      label: "First Option",
    },
    validationHints: [
      "Expects an object with id and label",
      "For dynamic options, provide array of {id, label} objects",
    ],
  }),

  [QuestionType.DROP_DOWN_STATIC]: createFieldConfig({
    type: QuestionType.DROP_DOWN_STATIC,
    displayName: "Static Dropdown",
    description: "A dropdown with predefined options",
    dataStructure: DataStructureType.PRIMITIVE,
    icon: "▼",
    example: "Option 1",
    placeholder: "Select an option",
    validationHints: ["Select from the available options"],
  }),

  [QuestionType.RANKING]: createFieldConfig({
    type: QuestionType.RANKING,
    displayName: "Ranking",
    description: "Rank items in order of preference",
    dataStructure: DataStructureType.OBJECT,
    icon: "↕",
    keys: [
      {
        key: "value",
        label: "Ranked Items",
        description: "Array of ranked items with their positions",
        placeholder: "[{rank: 1, label: 'First'}, ...]",
      },
      {
        key: "__to_string",
        label: "Text Summary",
        description: "Rankings as readable text",
        placeholder: "1. First, 2. Second",
      },
    ],
    arrayItemKeys: [
      {
        key: "id",
        label: "Item ID",
        description: "Unique identifier for the item",
      },
      {
        key: "rank",
        label: "Rank",
        description: "Position in the ranking (1 = highest)",
      },
      {
        key: "label",
        label: "Item Label",
        description: "Display name of the ranked item",
      },
    ],
    example: {
      value: [
        { id: "1", rank: 1, label: "Most Important" },
        { id: "2", rank: 2, label: "Second Choice" },
      ],
      __to_string: "1. Most Important, 2. Second Choice",
    },
    validationHints: [
      "Expects an object with ranked items array",
      "Each item needs id, rank, and label",
    ],
  }),

  [QuestionType.FILE_PICKER]: createFieldConfig({
    type: QuestionType.FILE_PICKER,
    displayName: "File Upload",
    description: "Upload one or more files",
    dataStructure: DataStructureType.ARRAY_OF_OBJECTS,
    icon: "📁",
    arrayItemKeys: [
      {
        key: "url",
        label: "File URL",
        description: "URL where the file is stored",
        placeholder: "https://example.com/file.pdf",
        required: true,
      },
      {
        key: "size",
        label: "File Size",
        description: "Size of the file in bytes",
        placeholder: "1024",
      },
      {
        key: "mimeType",
        label: "File Type",
        description: "MIME type of the file",
        placeholder: "application/pdf",
      },
    ],
    example: [
      {
        url: "https://example.com/document.pdf",
        size: 102400,
        mimeType: "application/pdf",
      },
    ],
    validationHints: [
      "Expects an array of file objects",
      "Each file needs at least a URL",
    ],
  }),

  [QuestionType.KEY_VALUE_TABLE]: createFieldConfig({
    type: QuestionType.KEY_VALUE_TABLE,
    displayName: "Key-Value Table",
    description: "A table of key-value pairs",
    dataStructure: DataStructureType.ARRAY_OF_OBJECTS,
    icon: "📊",
    arrayItemKeys: [
      {
        key: "key",
        label: "Key",
        description: "The identifier/name",
        placeholder: "Field Name",
        required: true,
      },
      {
        key: "value",
        label: "Value",
        description: "The associated value",
        placeholder: "Field Value",
      },
    ],
    example: [
      { key: "Name", value: "John" },
      { key: "Age", value: "30" },
    ],
    validationHints: [
      "Expects an array of key-value pairs",
      "Each item needs a key and value",
    ],
  }),

  [QuestionType.PICTURE]: createFieldConfig({
    type: QuestionType.PICTURE,
    displayName: "Picture Choice",
    description: "Select from image options",
    dataStructure: DataStructureType.ARRAY_OF_OBJECTS,
    icon: "🖼",
    arrayItemKeys: [
      {
        key: "id",
        label: "Image ID",
        description: "Unique identifier for the image",
        placeholder: "img_1",
      },
      {
        key: "label",
        label: "Image Label",
        description: "Caption or title for the image",
        placeholder: "Beach Photo",
      },
      {
        key: "imgSrc",
        label: "Image URL",
        description: "URL of the image",
        placeholder: "https://example.com/image.jpg",
        required: true,
      },
    ],
    example: [
      {
        id: "img_1",
        label: "Ocean View",
        imgSrc: "https://example.com/ocean.jpg",
      },
    ],
    validationHints: [
      "Expects an array of image objects",
      "Each image needs id, label, and imgSrc",
    ],
  }),

  [QuestionType.QUESTIONS_GRID]: createFieldConfig({
    type: QuestionType.QUESTIONS_GRID,
    displayName: "Questions Grid",
    description: "A matrix/grid of questions",
    dataStructure: DataStructureType.ARRAY_OF_OBJECTS,
    icon: "▦",
    arrayItemKeys: [
      {
        key: "rowId",
        label: "Row ID",
        description: "Identifier for the row",
      },
      {
        key: "values",
        label: "Row Values",
        description: "Values for each column in this row",
      },
    ],
    example: [],
    validationHints: [
      "Expects an array of row objects",
      "Structure depends on grid column configuration",
    ],
  }),
};

export const getFieldTypeConfig = (type: QuestionType | string): FieldTypeConfig | undefined => {
  return FIELD_TYPE_REGISTRY[type];
};

export const getDataStructureLabel = (structure: DataStructureType): string => {
  const labels: Record<DataStructureType, string> = {
    [DataStructureType.PRIMITIVE]: "Single Value",
    [DataStructureType.OBJECT]: "Object",
    [DataStructureType.ARRAY]: "List",
    [DataStructureType.ARRAY_OF_OBJECTS]: "List of Items",
  };
  return labels[structure];
};

export const getDataStructureBadge = (structure: DataStructureType): string => {
  const badges: Record<DataStructureType, string> = {
    [DataStructureType.PRIMITIVE]: "Aa",
    [DataStructureType.OBJECT]: "{ }",
    [DataStructureType.ARRAY]: "[ ]",
    [DataStructureType.ARRAY_OF_OBJECTS]: "[{ }]",
  };
  return badges[structure];
};

export const getKeyDisplayLabel = (type: QuestionType | string, key: string): string => {
  const config = getFieldTypeConfig(type);
  if (!config) return key;

  const keyConfig = config.keys?.find(k => k.key === key) 
    || config.arrayItemKeys?.find(k => k.key === key);
  
  return keyConfig?.label || key;
};

export const getAllKeysWithLabels = (type: QuestionType | string): FieldKeyConfig[] => {
  const config = getFieldTypeConfig(type);
  if (!config) return [];

  return [...(config.keys || []), ...(config.arrayItemKeys || [])];
};

export const isComplexType = (type: QuestionType | string): boolean => {
  const config = getFieldTypeConfig(type);
  if (!config) return false;

  return config.dataStructure !== DataStructureType.PRIMITIVE;
};

export const getExampleValue = (type: QuestionType | string): unknown => {
  const config = getFieldTypeConfig(type);
  return config?.example;
};

export const getValidationHints = (type: QuestionType | string): string[] => {
  const config = getFieldTypeConfig(type);
  return config?.validationHints || [];
};
