import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const numberValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];

  if (
    answerObj === undefined ||
    answerObj?.response === undefined ||
    answerObj?.response === null ||
    answerObj?.response === ""
  ) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  } else {
    if (answerObj["response"] === undefined) {
      answerObj["response"] = "";
    }

    if (answerObj["response"] === "" && !node?.config?.settings?.required) {
      return error;
    }

    const allowNegative = node?.config?.settings?.allowNegative;
    const allowFraction = node?.config?.settings?.allowFraction;
    const decimalPlaces = node?.config?.settings?.decimalPlaces;
    
    // Check both settings.min/max and settings.minValue/maxValue for compatibility
    const minRange = node?.config?.settings?.min !== undefined && node?.config?.settings?.min !== ""
      ? node?.config?.settings?.min
      : node?.config?.settings?.minValue !== undefined && node?.config?.settings?.minValue !== ""
      ? node?.config?.settings?.minValue
      : null;
    
    const maxRange = node?.config?.settings?.max !== undefined && node?.config?.settings?.max !== ""
      ? node?.config?.settings?.max
      : node?.config?.settings?.maxValue !== undefined && node?.config?.settings?.maxValue !== ""
      ? node?.config?.settings?.maxValue
      : null;

    const responseValue = answerObj["response"];
    const responseStr = String(responseValue);
    const number = Number(responseValue);

    if (!allowNegative && number < 0) {
      error = VALIDATION_MESSAGE.NUMBER.NEGATIVE_NOT_ALLOWED;
    }

    // Check if decimalPlaces is configured - if so, it controls decimal validation independently
    const hasDecimalPlacesConfig = decimalPlaces !== undefined && decimalPlaces !== "" && decimalPlaces != null;
    
    if (hasDecimalPlacesConfig) {
      // If decimalPlaces is set, allow both integers and decimals (up to the limit)
      // Validate decimal places when decimal input is present
      if (responseStr.includes(".")) {
        const [, decimals] = responseStr.split(".");
        if (decimals) {
          const maxDecimals = Number(decimalPlaces);
          if (!isNaN(maxDecimals) && decimals.length > maxDecimals) {
            error = VALIDATION_MESSAGE.NUMBER.DECIMAL_PLACES(maxDecimals);
          }
        }
      }
      // Integers are always valid when decimalPlaces is configured
    } else {
      // If decimalPlaces is not set, use allowFraction setting
      if (!allowFraction) {
        // If allowFraction is disabled and decimalPlaces is not set, only integers are allowed
        if (responseStr.includes(".") || !/^[-+]?\d+$/.test(responseStr)) {
          error = VALIDATION_MESSAGE.NUMBER.INTEGER_ONLY;
        }
      } else {
        // When allowFraction is enabled and decimalPlaces is not set, default to 2 decimal places
        if (responseStr.includes(".")) {
          const [, decimals] = responseStr.split(".");
          if (decimals) {
            const maxDecimals = 2; // Default to 2 when allowFraction is enabled
            if (decimals.length > maxDecimals) {
              error = VALIDATION_MESSAGE.NUMBER.DECIMAL_PLACES(maxDecimals);
            }
          }
        }
      }
    }

    // Validate min constraint - only check if minRange is not null/undefined/empty
    if (minRange !== null && minRange !== undefined && minRange !== "") {
      const minValue = Number(minRange);
      if (!isNaN(minValue) && number < minValue) {
        error = VALIDATION_MESSAGE.NUMBER.MIN_RANGE(minRange);
      }
    }

    // Validate max constraint - only check if maxRange is not null/undefined/empty
    if (maxRange !== null && maxRange !== undefined && maxRange !== "") {
      const maxValue = Number(maxRange);
      if (!isNaN(maxValue) && number > maxValue) {
        error = VALIDATION_MESSAGE.NUMBER.MAX_RANGE(maxRange);
      }
    }
  }
  return error;
};
