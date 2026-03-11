import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const addressValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];
  const { config } = node;
  const value = answerObj?.response;
  const fullNameRequired = config?.settings?.fullName;
  const addressLineOneRequired = config?.settings?.addressLineOne;
  const addressLineTwoRequired = config?.settings?.addressLineTwo;
  const cityRequired = config?.settings?.city;
  const stateRequired = config?.settings?.state;
  const zipCodeRequired = config?.settings?.zipCode;
  const countryRequired = config?.settings?.country;

  if (fullNameRequired && !value?.fullName?.trim()) {
    error = VALIDATION_MESSAGE.ADDRESS.FULL_NAME_REQUIRED;
    return error;
  }
  if (countryRequired && !value?.country?.trim()) {
    error = VALIDATION_MESSAGE.ADDRESS.COUNTRY_REQUIRED;
    return error;
  }

  if (addressLineOneRequired && !value?.addressLineOne?.trim()) {
    error = VALIDATION_MESSAGE.ADDRESS.ADDRESS_LINE_1_REQUIRED;
    return error;
  }

  if (addressLineTwoRequired && !value?.addressLineTwo?.trim()) {
    error = VALIDATION_MESSAGE.ADDRESS.ADDRESS_LINE_2_REQUIRED;
    return error;
  }

  if (cityRequired && !value?.city?.trim()) {
    error = VALIDATION_MESSAGE.ADDRESS.CITY_REQUIRED;
    return error;
  }

  if (zipCodeRequired && !value?.zipCode) {
    error = VALIDATION_MESSAGE.ADDRESS.ZIP_CODE_REQUIRED;
    return error;
  }

  if (stateRequired && !value?.state?.trim()) {
    error = VALIDATION_MESSAGE.ADDRESS.STATE_REQUIRED;
    return error;
  }

  return error;
};
