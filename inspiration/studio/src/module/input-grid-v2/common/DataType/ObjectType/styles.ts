export const getNestedStyles = ({ isLastRow, isCollapse, showHeaders }) => ({
  // padding: "0.75rem 1rem",
  border: "0.047rem solid #CFD8DC",
  // background: "#FAFCFE",
  // ...(isLastRow && {
  //   borderRadius: "0 0 0.375rem 0.375rem",
  // }),

  ...(showHeaders && {
    padding: "1rem",
  }),

  ...(isLastRow && {
    borderBottomLeftRadius: "0.375rem",
    borderBottomRightRadius: "0.375rem",
    paddingBottom: "1rem",
  }),

  ...(isCollapse && {
    padding: "0 1rem",
    maxHeight: "0",
    overflow: "hidden",
    border: "none",
    paddingBottom: "0",
  }),

  transition: "max-height 0.2s linear, padding 0.1s linear",
  borderTop: "unset",
});

export const getParentRowStyles = ({
  isCollapse,
  enableCheckbox,
  isChecked = false,
  isLastRow = false,
}) => ({
  display: "grid",

  gridTemplateColumns: enableCheckbox ? "auto auto 1fr" : "auto 1fr",
  border: "0.047rem solid #CFD8DC",
  borderTop: "unset",

  //   borderRadius: "0.375rem 0.375rem 0 0",
  overflow: "hidden",

  ...(isCollapse && {
    borderBottom: "0.047rem solid #CFD8DC",
  }),

  ...(isLastRow &&
    isCollapse && {
      borderBottomLeftRadius: "0.375rem",
      borderBottomRightRadius: "0.375rem",
    }),

  backgroundColor: enableCheckbox && isChecked ? "#E9E9E9" : "#fff",
});

export const getContainerStyles = ({
  isLastRow,
  isFirstRow,
  isChild,
  hideBorder,
}) => ({
  //   padding: "1rem",
  //   border: "0.047rem solid #CFD8DC",

  ...(!isFirstRow && {
    borderTop: "none",
  }),

  ...(!isLastRow &&
    hideBorder && {
      borderBottom: "none",
    }),

  //   ...(isLastRow && {
  //     borderBottomLeftRadius: "0.375rem",
  //     borderBottomRightRadius: "0.375rem",
  //     paddingBottom: "1rem",
  //   }),

  //   ...(isFirstRow && {
  //     borderTopLeftRadius: "0.375rem",
  //     borderTopRightRadius: "0.375rem",
  //     paddingTop: "1rem",
  //   }),

  ...(isChild &&
    hideBorder && {
      border: "none !important",
    }),

  // ...(isFirstRow &&
  //   isLastRow && {
  //     border: "none !important",
  //     // padding: "0 !important",
  //   }),
});
