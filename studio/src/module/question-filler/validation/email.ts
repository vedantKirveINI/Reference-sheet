import { createRegex } from "@src/module/constants";
import { VALIDATION_MESSAGE } from "../constant/validationMessages";

/** Common free/personal email domains — used when noFreeEmails is enabled */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "mail.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "gmx.net",
  "tutanota.com",
  "fastmail.com",
  "mail.ru",
  "inbox.com",
  "outlook.co.uk",
  "btinternet.com",
  "virginmedia.com",
  "sky.com",
  "ymail.com",
  "rocketmail.com",
  "rediffmail.com",
  "qq.com",
  "163.com",
  "126.com",
  "web.de",
  "orange.fr",
  "free.fr",
  "laposte.net",
  "libero.it",
  "wp.pl",
  "o2.pl",
  "seznam.cz",
  "abv.bg",
  "rambler.ru",
  "mailfence.com",
  "titan.email",
]);

export const emailValidation = (answer, node) => {
  let error = "";
  const answerObj = answer[node?._id];

  if (
    answerObj === undefined ||
    answerObj["response"] === null ||
    answerObj?.response?.length === 0
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

    let inputRegex =
      node?.config?.settings?.regex?.value?.trim() ||
      "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)*\\.[a-zA-Z]{2,63}$";

    const slashAtStart = inputRegex?.indexOf("/") === 0;
    const slashAtEnd = inputRegex?.lastIndexOf("/") === inputRegex.length - 1;
    if (slashAtStart && slashAtEnd) {
      inputRegex = inputRegex.substring(1, inputRegex.length - 1);
    }
    const regex = createRegex(inputRegex);
    if (regex && !regex.test(answerObj?.response?.toString().trim())) {
      error = node?.config?.settings?.regex?.error
        ? node?.config?.settings?.regex?.error
        : VALIDATION_MESSAGE.EMAIL.INVALID_EMAIL;
    }

    const customDomainList = node?.config?.settings?.suggestDomains;
    const domainList = customDomainList
      ?.map((domain) => domain.trim().toLowerCase())
      .filter(Boolean);

    if (domainList && domainList.length > 0) {
      const domain = answerObj?.response.split("@")[1]?.toLowerCase();
      if (domain && !domainList.includes(domain)) {
        const domainListString = domainList.join(", ");
        error = VALIDATION_MESSAGE.EMAIL.DOMAIN_RESTRICTION(domainListString);
      }
    }

    if (!error && node?.config?.settings?.noFreeEmails) {
      const domain = answerObj?.response?.split("@")[1]?.toLowerCase();
      if (domain && FREE_EMAIL_DOMAINS.has(domain)) {
        error = VALIDATION_MESSAGE.EMAIL.PERSONAL_EMAIL_BLOCKED;
      }
    }
  }
  return error;
};
