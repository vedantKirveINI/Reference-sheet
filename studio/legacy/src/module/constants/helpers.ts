import { Mode } from "./constants";

export function createUID(): string {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substr(0, 5);
}

export const createRegex = (pattern: string): RegExp | null => {
  try {
    return new RegExp(pattern);
  } catch (error) {
    return null;
  }
};

export const getCommandBarNudgeIdForQuestionHelper = ({ mode }: any) => {
  if (mode === Mode.CLASSIC) {
    return "13462";
  }
  if (mode === Mode.CHAT) {
    return "13492";
  }
  return "13491";
};
