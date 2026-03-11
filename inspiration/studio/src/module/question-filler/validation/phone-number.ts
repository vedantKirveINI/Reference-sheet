import { countries } from "@src/module/constants";
import { isEmpty } from "lodash";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const phoneNumberValidation = (answer, node): string => {
  let error = "";
  const answerObj = answer[node?._id];

  if (
    answerObj === undefined ||
    isEmpty(answerObj["response"]) ||
    !answerObj["response"]["phoneNumber"]
  ) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
      return error;
    }
  }

  const phoneNumber = answerObj?.response?.phoneNumber;
  let regex = countries[answerObj?.response?.countryCode]?.regex;
  if (!regex) {
    regex =
      /^(?!.*(\d)\1{6,13}$)(?!^(123456|1234567|12345678|123456789|1234567890)$)\d{7,14}$/;
  }

  if (phoneNumber === 0 || (phoneNumber && !regex.test(phoneNumber))) {
    error = VALIDATION_MESSAGE.PHONE_NUMBER.INVALID_PHONE;
  }

  return error;
};
