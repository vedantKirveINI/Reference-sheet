import { INPUT_HEIGHT } from "../../../constants/constants";

const numericHeight = parseFloat(INPUT_HEIGHT);

export const styles = {
  getInputWrapperContainerStyle: ({ multiline }: { multiline?: boolean }) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      position: "relative",
      "& .MuiInputBase-root": {
        height: multiline
          ? `${numericHeight * 2}em !important`
          : `${numericHeight}em !important`,
      },
    } as const;
  },
};
