export const getFlexBoxStyles = ({
  isPrevNonPrimitive,
  borderBottomCondition,
}) => {
  return {
    display: "flex",
    alignItems: "center",
    borderTop: isPrevNonPrimitive ? "0.75px solid #cfd8dc" : "",
    borderBottom: borderBottomCondition ? "0.75px solid #cfd8dc" : "",
    // width: "100%",
    // minWidth: "1258px",
    "&:hover": {
      backgroundColor: "#2196f31a",
    },
  };
};

export const colStyles = {
  padding: "0.5rem",
  borderRight: "0.75px solid #cfd8dc",
  width: "200px",
};

export const typeCol = {
  borderRight: "0.75px solid #cfd8dc",
  width: "200px",
};

export const keyCol = {
  alignSelf: "stretch",
};

export const getDisabledCol = ({ isTypeNonPrimitive }) => {
  if (!isTypeNonPrimitive) return null;

  return {
    cursor: "not-allowed",
    padding: "0",
    alignSelf: "stretch",
    width: "220px",
    backgroundColor: "#cfd8dc",
  };
};

export const valueCol = {
  flex: "1",
  padding: "0",
};

export const getAddIconStyles = ({ showAddIcon }) => {
  let flexStyles = {};

  if (showAddIcon) {
    flexStyles = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };
  }
  return {
    width: "auto",
    minWidth: "36px",
    alignSelf: "stretch",
    borderRight: "0.75px solid #cfd8dc",
    ...flexStyles,
  };
};

export const getDeleteColStyles = ({ hasOneElement = false }) => {
  return {
    padding: "0.5rem",
    width: "auto",
    cursor: hasOneElement ? "not-allowed" : "pointer",
  };
};
