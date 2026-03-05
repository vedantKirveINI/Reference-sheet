export enum Mode {
  CARD = "CARD",
  CLASSIC = "CLASSIC",
  CHAT = "CHAT",
}

export enum QuestionTab {
  DESIGN = "DESIGN",
  DATA = "DATA",
  SETTINGS = "SETTINGS",
  VALIDATIONS = "VALIDATIONS",
  IMAGE = "IMAGE",
}

export enum ViewPort {
  DESKTOP = "DESKTOP",
  MOBILE = "MOBILE",
}

export const CHARACTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export const QUESTION_RESPONSE_TYPES = {
  STRING: "STRING",
  INT: "INT",
  NUMBER: "NUMBER",
  BOOLEAN: "BOOLEAN",
  JSON: "JSON",
  ARRAY: "ARRAY",
  TEXT: "TEXT",
  HTML: "HTML",
  XML: "XML",
};

export const RATING_EMOJIS = {
  star: {
    label: "Star",
    emoji: "OUTEStarIcon",
  },
  smile: {
    label: "Smile",
    emoji: "OUTESmileIcon",
  },
  heart: {
    label: "Heart",
    emoji: "OUTEHeartIcon",
  },
  crown: {
    label: "Crown",
    emoji: "OUTECrownIcon",
  },
  thumbs: {
    label: "Thumbs",
    emoji: "OUTEThumbUpIcon",
  },
  cup: {
    label: "Cup",
    emoji: "OUTECupIcon",
  },
} as const;

export enum SETTINGS_INPUT_NAMES {
  "CTA_EDITOR" = "CTA_EDITOR",
  "DEFAULT_COUNTRY_PICKER" = "DEFAULT_COUNTRY_PICKER",
}

export const getCharacterByIndex = (index: number): string => {
  let label = "";
  let remaining = index;

  while (remaining >= 0) {
    const currentChar = CHARACTERS[remaining % 26];
    label = currentChar + label;
    remaining = Math.floor(remaining / 26) - 1;
    if (remaining < 0) break;
  }

  return label;
};

export const OTP_SUPPORTED_COUNTRIES = ["IN"];
