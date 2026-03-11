import { QuestionAlignments, TTheme } from "@oute/oute-ds.core.constants";

export const sliderStyles = {
  container: ({
    questionAlignment,
  }: {
    questionAlignment: keyof typeof QuestionAlignments;
  }) => {
    return {
      width: "100%",
      marginLeft: ".5em",
      display: "flex",
      justifyContent:
        questionAlignment === QuestionAlignments.CENTER
          ? "center"
          : "flex-start",
      alignItems:
        questionAlignment === QuestionAlignments.CENTER
          ? "center"
          : "flex-start",
    } as const;
  },
  sliderContainer: {
    width: "60%",
  } as const,
  sliderStyles: ({ customTheme }: { customTheme: TTheme }) => {
    return {
      color: customTheme?.styles?.buttons || "#52af77",
      height: ".5em",
    };
  },
} as const;
