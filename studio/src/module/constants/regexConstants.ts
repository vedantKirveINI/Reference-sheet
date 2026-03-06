export const REGEX_CONSTANTS = {
  NUMBER_REGEX: /^[0-9]*$/,
  DIGIT_REGEX: /^-?\d*\.?\d*$/, // allow negative positive and decimal number
  URL_REGEX: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/,
  DOMAIN_REGEX:
    /^(?=.{1,63}$)(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+(?!xn--)[a-zA-Z]{2,63}$/,
  TWELVE_HOUR_REGEX: /^(0?[1-9]|1[0-2]):([0-5][0-9])$/i,
  TWENTY_FOUR_HOUR_REGEX: /^(0?[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/i,
  ALLOW_NEGATIVE_NUMBER_REGEX: /^-?[0-9]*\.?[0-9]*$/,
  ALLOW_POSITIVE_NUMBER_REGEX: /^[0-9]*\.?[0-9]*$/,
};
