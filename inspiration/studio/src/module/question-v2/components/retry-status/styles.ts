import { CSSProperties } from "react";
import { TTheme, QuestionAlignments } from "@oute/oute-ds.core.constants";

interface RetryStatusStyles {
  container: any;
  constantMessage: any;
  retryMessage: any;
}

export const getRetryStatusStyles = ({
  theme,
  style,
  questionAlignment,
}: {
  theme?: TTheme;
  style?: CSSProperties;
  questionAlignment?: string;
}): RetryStatusStyles => {
  const isCenterAligned = questionAlignment === QuestionAlignments.CENTER;
  const textAlign = isCenterAligned ? "center" : "left";

  return {
    container: {
      width: "100%",
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5em",
      fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
      color: theme?.styles?.description || "#000000",
      fontSize: "1.15em",
      lineHeight: "1.4",
      ...style,
    },
    constantMessage: {
      fontWeight: 500,
      color: theme?.styles?.description || "#000000",
      opacity: 0.8,
      textAlign,
    },
    retryMessage: {
      fontWeight: 400,
      color: theme?.styles?.description || "#000000",
      opacity: 0.9,
      textAlign,
    },
  };
};
