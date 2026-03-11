export const styles = {
  container: (backgroundColor, error) => {
    return {
      width: "100%",
      height: 192,
      position: "relative",
      background: backgroundColor,
      borderRadius: "0.75em",
      boxShadow: !!error && "0 0 1px 2px #C83C3C",
    } as const;
  },
  canvas: () => {
    return {
      width: "100%",
      height: "100%",
      border: "0.75px solid rgba(0, 0, 0, 0.20)",
      borderRadius: "0.75em",
    } as const;
  },
  clearBtn: ({ theme, isCreator }) => {
    return {
      cursor: isCreator ? "default" : "pointer",
      textDecorationLine: "underline",
      textUnderlineOffset: 4,
      position: "absolute",
      bottom: "6.5px",
      right: "12px",
      fontFamily: theme?.styles?.fontFamily || "Inter",
    } as const;
  },
};
