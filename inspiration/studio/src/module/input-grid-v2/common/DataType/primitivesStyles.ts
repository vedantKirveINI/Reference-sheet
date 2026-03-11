export const getParentRow = ({
  isLastRow,
  index,
  parentType,
  isValueMode,
  showHeaders,
  hideBorder,
  isChild,
  hideColumnType,
  enableCheckbox,
  isChecked,
}) => {
  let gridTemplateColumns = "auto 1fr"; // default

  if (enableCheckbox) {
    gridTemplateColumns = "auto auto 1fr";
  }

  // if (enableCheckbox && hideColumnType) {
  //   gridTemplateColumns = "auto 1fr";
  // } else if (enableCheckbox && !hideColumnType) {
  //   gridTemplateColumns = "auto auto 1fr";
  // } else if (!enableCheckbox && hideColumnType) {
  //   gridTemplateColumns = "1fr";
  // } else {
  //   // both are false
  //   gridTemplateColumns = "auto 1fr";
  // }

  return {
    display: "grid",
    gridTemplateColumns,
    border: "0.047rem solid #CFD8DC",
    borderTop: "0",

    ...(index === 0 &&
      parentType === "Array" &&
      !isValueMode && {
        borderTopLeftRadius: "0.375rem",
        borderTopRightRadius: "0.375rem",
        borderTop: "0.047rem solid #CFD8DC",
      }),

    ...(isLastRow && {
      borderBottomLeftRadius: "0.375rem",
      borderBottomRightRadius: "0.375rem",
    }),

    overflow: "hidden",

    ...(!showHeaders &&
      index === 0 && {
        borderTop: "0.047rem solid #CFD8DC",
        borderTopLeftRadius: "0.375rem",
        borderTopRightRadius: "0.375rem",
      }),

    ...(hideBorder &&
      !isLastRow && {
        borderBottom: "none",
      }),

    ...(isChild &&
      hideBorder && {
        border: "none !important",
      }),

    ...(isChild &&
      !hideBorder &&
      !showHeaders && {
        borderLeft: "none",
        borderRight: "none",
        borderRadius: "0",

        ...(isLastRow && {
          borderBottom: "none",
          borderRadius: "0 0 0.375rem 0.375rem",
        }),
      }),
    backgroundColor: enableCheckbox && isChecked ? "#E9E9E9" : "#fff",
  };
};

export const emptySpace = {
  width: "2.5rem",
  alignSelf: "stretch",
};
