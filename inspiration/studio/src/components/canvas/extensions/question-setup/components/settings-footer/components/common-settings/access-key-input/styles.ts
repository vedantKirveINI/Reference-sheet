import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  getWrapperContainerStyle: (style) => {
    return {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "0.8em",
      width: "50%",
      paddingRight: "0.8em",
      ...style,
      "& .MuiInputBase-root": {
        height: `${INPUT_HEIGHT} !important`,
      },
    } as const;
  },
};
