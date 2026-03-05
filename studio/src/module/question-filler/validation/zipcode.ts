import { isEmpty } from "lodash";
import { CountryCode, postcodeValidator } from "postcode-validator";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const zipCodeValidation = (answer, node): string => {
  let error = "";
  const answerObj = answer[node?._id];

  if (
    answerObj === undefined ||
    isEmpty(answerObj["response"]) ||
    !answerObj["response"]["zipCode"]
  ) {
    if (node?.config?.settings?.required) {
      return VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
    return error;
  }

  const zipCode = answerObj.response.zipCode;
  const country = answerObj.response?.countryCode;

  // checking if regex validation is there in the package that we are using
  if (CountryCode[country]) {
    const isValid = postcodeValidator(zipCode, country);
    if (!isValid) {
      error = VALIDATION_MESSAGE.ZIP_CODE.INVALID;
    }
  }

  return error;
};
