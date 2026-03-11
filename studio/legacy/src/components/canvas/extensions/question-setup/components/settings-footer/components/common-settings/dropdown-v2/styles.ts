import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  getInputWrapperContainerStyle: () => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      position: "relative",
      "& .MuiInputBase-root": {
        height: `${INPUT_HEIGHT} !important`,
      },
    } as const;
  },
};
