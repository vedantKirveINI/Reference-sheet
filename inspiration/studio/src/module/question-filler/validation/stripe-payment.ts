import { VALIDATION_MESSAGE } from "../constant/validationMessages";

export const stripePaymentValidation = (
  answer: any,
  node: any,
  ref: any
): string => {
  const nodeId = node?._id || node?.id;
  const response = answer[nodeId]?.response;
  const isRequired = node?.config?.settings?.required;
  const sendReceipt = node?.config?.settings?.sendReceipt;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const name = response?.name?.trim() || "";
  const MIN_NAME_LENGTH = 3;

  if (isRequired) {
    if (!name) {
      return VALIDATION_MESSAGE.STRIPE_PAYMENT.NAME_REQUIRED;
    }
    if (name.length < MIN_NAME_LENGTH) {
      return VALIDATION_MESSAGE.STRIPE_PAYMENT.INVALID_NAME;
    }
  } else {
    if (response?.name && response.name.trim() !== "") {
      if (name.length < MIN_NAME_LENGTH) {
        return VALIDATION_MESSAGE.STRIPE_PAYMENT.INVALID_NAME;
      }
    }
  }

  if (sendReceipt) {
    const email = response?.email?.trim() || "";
    if (isRequired) {
      if (!email) {
        return VALIDATION_MESSAGE.STRIPE_PAYMENT.SEND_RECEIPT_REQUIRED;
      }
      if (!emailRegex.test(email)) {
        return VALIDATION_MESSAGE.STRIPE_PAYMENT.INVALID_EMAIL;
      }
    } else {
      if (response?.email && email) {
        if (!emailRegex.test(email)) {
          return VALIDATION_MESSAGE.STRIPE_PAYMENT.INVALID_EMAIL;
        }
      }
    }
  }

  return "";
};
