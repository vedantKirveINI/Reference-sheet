import {
  QuestionAlignments,
  ViewPort,
  Mode,
} from "@oute/oute-ds.core.constants";

export const styles = {
  container: ({ defaultAlignment, isCreator, viewPort }) => {
    // console.log(isCreator, viewPort);
    return {
      display: "flex",
      flexDirection: "row",
      alignItems:
        defaultAlignment === QuestionAlignments.CENTER
          ? "center"
          : "flex-start",
      justifyContent:
        defaultAlignment === QuestionAlignments.CENTER
          ? "center"
          : "flex-start",
      width: "100%",
      flexWrap: !isCreator && viewPort === ViewPort.MOBILE ? "wrap" : "none",
      gap: "1em",
    } as const;
  },
  starWrap: {
    display: "flex",
    width: "3.5em",
    flexDirection: "column",
    alignItems: "center",

    gap: "0.75em",
  },
  IconSize: {
    width: "3.5rem",
    height: "3.5rem",
    aspectRatio: "1/1",
  },
  color: (theme) => {
    return {
      color: theme?.styles?.buttons,
      fontFamily: theme?.styles?.fontFamily,
    };
  },
} as const;
