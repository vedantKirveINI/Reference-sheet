export const getCellContainer = ({ hideBorders, showEditor, readOnly }) => {
  return {
    padding: "0 0.5rem",
    // height: "2.5rem",

    ...(!hideBorders && {
      border: "0.047rem solid #cfd8dc",
      borderRadius: "0.375rem",

      "&:hover": {
        borderColor: "#333",
      },
    }),
    pointerEvents: "all" as const,

    ...(showEditor || readOnly
      ? {
          // minHeight: "2.5rem",
          maxHeight: "16rem",
          overflow: "auto",
        }
      : {
          height: "3rem",
        }),
  };
};

export const disabledContainer = {
  // background: "#CFD8DC",
  background: "transparent",
  // borderBottom: " 0.047rem solid #CFD8DC",
  height: "100%",
  cursor: "not-allowed",
  // display: "grid",
  // justifyContent: "flex-end",
  // alignItems: "center",
  padding: "0 0.5rem",
  boxSizing: "border-box" as const,
};
