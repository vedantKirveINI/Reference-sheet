import { isEmpty } from "lodash";

export const formulaBarValidation = (answer, node): string => {
  let error = "";
  const answerObj = answer[node?._id];

  if (
    answerObj === undefined ||
    isEmpty(answerObj["response"]) ||
    isEmpty(answerObj["response"]?.blocks)
  ) {
    if (node?.config?.settings?.required) {
      error = "This field is required";
    }
  }

  if (node?.config?.settings?.regex) {
    if (!answerObj?.response?.blocks?.length) return error;
    const blocks = answerObj?.response?.blocks || [];

    if (blocks.find((block) => block?.type === "NODE")) return error;

    const regex = new RegExp(node?.config?.settings?.regex?.value);
    const value = blocks[0]?.value || "";

    if (!regex.test(value)) {
      error = node?.config?.settings?.regex?.error;
    }
  }

  return error;
};
