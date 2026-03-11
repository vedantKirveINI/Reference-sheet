import { isEmpty, get } from "lodash";

// TODO: Move this to a shared utils file
export const convertRecallQuestionToAnswer = (
  questionTitle: string,
  answers: any
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(questionTitle, "text/html");
  const spans = doc.querySelectorAll("span[node-id]");

  if (!spans || spans.length === 0) return questionTitle;

  spans.forEach((span) => {
    const nodeId = span.getAttribute("node-id");
    const pathStr = span.getAttribute("data-lexical-recall-path");
    const answerSpan = doc.createElement("span");
    answerSpan.textContent = isEmpty(pathStr)
      ? answers[nodeId]?.response
      : get(answers[nodeId], pathStr);
    span.parentNode.insertBefore(answerSpan, span.nextSibling);

    span.remove();
  });

  const modifiedHtmlString = doc.body.innerHTML;
  return modifiedHtmlString;
};
