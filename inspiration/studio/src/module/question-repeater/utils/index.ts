import type { Collection } from "../types";

export const getDefaultAnswerByIndex = (
  defaultCollectionData: Collection
): Record<string, string> => {
  const answer = {};

  for (const child of defaultCollectionData.children) {
    answer[child.title] = "";
  }

  return answer;
};
