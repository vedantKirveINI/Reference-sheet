import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const signatureValidation = (answer, node, ref) => {
  let error = "";
  const isEmpty = ref?.isEmpty();
  if (isEmpty) {
    if (node?.config?.settings?.required) {
      error = VALIDATION_MESSAGE.COMMON.REQUIRED;
    }
  } else {
    const validateSign = ref?.validateSignature();
    if (!validateSign) {
      error = VALIDATION_MESSAGE.SIGNATURE.INVALID_SIGNATURE;
    }
  }
  return error;
};
