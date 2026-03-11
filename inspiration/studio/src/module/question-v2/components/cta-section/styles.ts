import { borderRadiusMappingForButton } from "@oute/oute-ds.core.constants";
import { TTheme } from "../../shared/lib/types";

export const styles = {
  editableText: {
    color: "#FD622D",
    textDecorationLine: "underline",
    fontStyle: "italic",
    cursor: "pointer",
    fontWeight: 600,
  },

  containerStyle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1em",
  } as const,

  buttonContainerStyles: ({
    theme,
    showHover,
    loading = false,
  }: {
    theme: TTheme;
    showHover: boolean;
    loading: boolean;
  }) => {
    return {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: ".6em",
      backgroundColor: theme?.styles?.buttons || "#000000",
      color: theme?.styles?.buttonText || "#ffffff",
      borderRadius:
        borderRadiusMappingForButton[theme?.styles?.buttonCorners] ||
        borderRadiusMappingForButton.rounded,
      border: `1px solid ${theme?.styles?.buttons}`,
      fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
      fontSize: "1.25em !important",
      padding: "0.5em 1em",
      minHeight: "2.3em",
      cursor: "pointer",
      ":hover": showHover
        ? {
            backgroundColor: theme?.styles?.buttonText || "#ffffff",
            color: theme?.styles?.buttons || "#000000",
            border: `1px solid ${theme?.styles?.buttons}`,
            boxShadow: " 0px 8px 20px 0px rgba(122, 124, 141, 0.20)",
          }
        : {},
      opacity: loading ? 0.5 : 1,
      transition: "all 0.3s ease-in-out",
    };
  },
  buttonStyles: {
    backgroundColor: "transparent",
    outline: "none",
    border: "none",
    fontFamily: "inherit",
    color: "inherit",
    cursor: "inherit",
    fontSize: "1.05em",
  },
};
