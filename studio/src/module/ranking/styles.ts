import { Mode, QuestionAlignments } from "@/module/constants";

export const styles = {
  container: ({
    mode,
    questionAlignment,
  }: {
    mode: Mode;
    questionAlignment: keyof typeof QuestionAlignments;
  }) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems:
        questionAlignment === QuestionAlignments.CENTER && mode === Mode.CARD
          ? "center"
          : "flex-start",
    } as const;
  },
  optionsContainer: {
    width: "max-content",
    display: "grid",
    gridTemplateColumns: `repeat(${1}, minmax(0, 1fr))`,
    gap: "1.25em",
  },
  button: (theme) => {
    return {
      width: "max-content",
      background: "none",
      border: "none",
      cursor: "pointer",
      color: theme?.styles?.buttons,
      fontFamily: theme?.styles?.fontFamily || "Inter",
      fontSize: "1.25em",
      fontStyle: "normal",
      fontWeight: 400,
      letterSpacing: "0.25px",
      textDecorationLine: "underline",
    };
  },
  dynamicOptionsHeader: (theme: any = {}) => {
    const questionColor = theme?.styles?.questions || "rgba(0, 0, 0, 1)";
    return {
      margin: 0,
      fontFamily: theme?.styles?.fontFamily || "Inter",
      fontSize: "1em",
      color: questionColor,
      padding: "1em",
      borderRadius: "0.375em",
      backdropFilter: "blur(7px) saturate(200%)",
      WebkitBackdropFilter: "blur(7px) saturate(200%)",
      backgroundColor: "rgba(255, 255, 255, 0.29)",
      border: `1px solid ${questionColor}20`,
      boxShadow: `0 4px 8px 0 ${questionColor}20`,
    };
  },
} as const;
