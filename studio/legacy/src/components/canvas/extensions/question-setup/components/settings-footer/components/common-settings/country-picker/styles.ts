export const countryPickerStyles = {
  autocomplete: {
    option: {
      cursor: "pointer !important",
      display: "flex !important",
      padding: "0.625em !important",
      alignItems: "center !important",
      gap: "0.75em !important",
      borderRadius: "0.5em !important",
      backdropFilter: "blur(10px) !important",
      background: "transparent !important",
      transition: "all .3s ease !important",
      "&[aria-selected='true']": {
        background: "#212121 !important",
        "& span": {
          color: "#fff !important",
        },
      },
      "&[aria-selected='false']": {
        background: "transparent !important",
      },
      "&:hover": {
        background: "#ECEFF1 !important",
      },
      text: (styles?: any) => {
        return {
          color: "#000",
          fontFamily: "Inter",
          fontSize: "0.9em",
          fontStyle: "normal",
          fontWeight: 400,
          letterSpacing: "0.01125em",
          ...styles,
        };
      },
    },
  },
} as const;
