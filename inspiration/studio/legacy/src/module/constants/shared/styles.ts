export const fontSizes = {
  title: "12em",
};

export const fontWeights = {
  primary: "",
};

export const lineHeights = {
  primary: "",
};

export const fontFamilies = {
  primary: "",
};

export const spacing = {
  primary: "",
};

export const colors = {
  red: "red",
};

export const commonStyles = {
  getScrollBarStyles: () => {
    return {
      "&::-webkit-scrollbar": {
        width: "5px",
      },
      "&::-webkit-scrollbar-track": {
        width: "5px",
        background: "none" as const,
        borderRadius: "10px",
      },
      "&::-webkit-scrollbar-thumb": {
        width: "5px",
        background: "#888" as const,
        borderRadius: "50px",
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#555" as const,
      },
    };
  },
};
