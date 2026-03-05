import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  container: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: "2em",
    } as const;
  },
  wrapperContainer: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "0.8em",
      "& .MuiInputBase-root": {
        height: `${INPUT_HEIGHT} !important`,
      },
    } as const;
  },
};
