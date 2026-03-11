export const getContainerStyles = ({ nestedLevel }) => {
  return {
    padding: nestedLevel > 0 ? "12px" : "",
    paddingLeft: nestedLevel ? "1rem" : "0px",
    backgroundColor: nestedLevel % 2 === 0 ? "#fff" : "#f0f0f07a",
    borderRadius: nestedLevel === 0 ? "0 0 12px 12px" : "",
    // minWidth: "1700px",
    // minWidth: "1258px",
  };
};

export const getTableStyles = ({ nestedLevel }) => {
  return {
    borderRadius: nestedLevel > 0 ? "8px" : "",
    border: nestedLevel > 0 ? "0.75px solid #cfd8dc" : "",
    // width: "100%",
  };
};

export const switchContainer = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: "16px",
};
