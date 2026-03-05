export const getContainerStyles = ({
  hideColumnType = false,
  childsCount,
  enableCheckbox,
  showAdd,
}) => {
  let columns = ["auto", "auto", "auto", "1fr"]; // emptySpace, type, key, value

  if (hideColumnType) {
    columns = ["auto", "auto", "1fr"]; //emptySpace, key, value
  }

  if (enableCheckbox) columns.unshift("auto");
  if (childsCount > 0) columns.push("auto");
  if (showAdd) columns.push("auto");

  // let gridTemplateColumns = hideColumnType
  //   ? "auto 1fr auto"
  //   : "auto auto auto 1fr auto";

  // if (childsCount > 0) {
  //   gridTemplateColumns += " auto";
  // }
  // if (enableCheckbox) {
  //   gridTemplateColumns = `auto ${gridTemplateColumns}`;
  // }

  let gridTemplateColumns = columns.join(" ");

  return {
    display: " grid",
    gridTemplateColumns,
    alignItems: "center",
    background: "#ECEFF1",
    borderRadius: "0.375rem 0.375rem 0rem 0rem",
    border: "0.047rem solid  #CFD8DC",
    height: "3rem",
    boxSizing: "border-box" as const,
  };
};

export const divider = {
  borderRight: "0.047rem solid  #CFD8DC",
};

export const cell = {
  //   display: "flex",
  //   alignItems: "center",
  //   alignSelf: "stretch",
  alignSelf: "center",
  color: "#263238",
  fontWeight: "600",
  letterSpacing: "0.078rem",
  textTransform: "uppercase" as const,
  width: "10.344rem",
  padding: "0.875rem 0.625rem",
  boxSizing: "border-box" as const,
};

export const valueCell = {
  flex: "1",
  width: "auto",
};

export const emptySpace = {
  width: "2.5rem",
  // width: "1.75rem",
  alignSelf: "stretch",
};

export const checkboxEmptySpace = {
  width: "2.75rem",
  alignSelf: "stretch",
};

export const addCell = {
  alignSelf: "center",
  borderLeft: "0.047rem solid  #CFD8DC",
};

export const chips = {
  backgroundColor: "#f5f5f5",
  color: "#666",
  fontSize: "0.875rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "0.375rem",
  marginRight: "1rem",
};

export const addWidth = {
  width: "20.344rem",
};
