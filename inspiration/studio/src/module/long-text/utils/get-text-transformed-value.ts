import { TextTransformations } from "@src/module/constants";

export const getTextTransformedValue = (
  value: string | any,
  caseType: string
): string => {
  if (typeof value !== "string") return;

  switch (caseType) {
    case TextTransformations.UPPERCASE:
      return value.toUpperCase();
    case TextTransformations.LOWERCASE:
      return value.toLowerCase();
    case TextTransformations.CAPITALIZE:
      return value.replace(/\b\w/g, (match) => match.toUpperCase());
    case TextTransformations.NONE:
      return value;
    default:
      return value;
  }
};
