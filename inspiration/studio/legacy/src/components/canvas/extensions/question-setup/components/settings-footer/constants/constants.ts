export const TEXT_CASE_OPTIONS = [
  { label: "AA", value: "Uppercase" },
  { label: "Aa", value: "Capitalize" },
  { label: "aa", value: "Lowercase" },
  { label: "None", value: "None" },
];

export const RATING_OPTIONS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
];

export const INPUT_HEIGHT = "2.75em";

export enum NUMBERS {
  MIN_NUMBER = "min",
  MAX_NUMBER = "max",
}

export enum CHARACTERS {
  MIN_CHAR = "minChar",
  MAX_CHAR = "maxChar",
}

export type CharLimitProps = "minChar" | "maxChar";

export const COUNTRY_SELECTION_FOR = {
  CURRENCY: "CURRENCY",
  PHONE: "PHONE",
  ZIPCODE: "ZIPCODE",
};

export const MCQ_SELECTION_OPTIONS = ["Unlimited", "Exact Number", "Range"];
