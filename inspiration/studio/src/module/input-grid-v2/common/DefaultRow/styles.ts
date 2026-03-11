export const getContainerStyles = ({
  hideColumnType,
  showAdd,
  showChildCount,
  showDelete,
}) => {
  // let columns = ["auto"]; // Start with the first column

  // if (!hideColumnType) {
  //   columns.push("auto"); // Include the column type if not hidden
  // }

  // columns.push("1fr", "auto"); // Add main content and default controls

  // if (showAdd) {
  //   columns.push("auto"); // Add an extra column for "Add"
  // }

  // if (showChildCount) {
  //   columns.push("auto"); // Add an extra column for "Child Count"
  // }

  let columns = ["auto", "auto", "1fr"]; // type, key, value

  if (hideColumnType) {
    columns = ["auto", "1fr"]; // key, value
  }

  if (showChildCount) columns.push("auto");
  if (showAdd) columns.push("auto");
  if (showDelete) columns.push("auto");

  let gridTemplateColumns = columns.join(" ");

  return {
    display: "grid",
    gridTemplateColumns,
    alignItems: "center",
    borderTop: "unset",
    // background: "#fff",
    minHeight: "3rem",
    flex: 1,
    borderLeft: "0",
  };
};

export const divider = {
  borderRight: "0.047rem solid #CFD8DC",
};

export const cellStyles = {
  width: "10.344rem",
  alignSelf: "stretch",
  boxSizing: "border-box" as const,
};

export const valueCell = {
  flex: "1",
  overflow: "auto",
};

export const disabledCell = {
  alignSelf: "stretch",
};

export const addWidth = {
  width: "20.344rem",
};

export const getDeleteBtnStyles = ({ hideBorder }) => ({
  borderLeft: "0.047rem solid #CFD8DC",
  alignSelf: "stretch",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ...(hideBorder && {
    borderLeft: "unset",
  }),
});

export const chips = {
  backgroundColor: "#f5f5f5",
  color: "#666",
  fontSize: "0.875rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.375rem",
  marginRight: "1rem",
};
