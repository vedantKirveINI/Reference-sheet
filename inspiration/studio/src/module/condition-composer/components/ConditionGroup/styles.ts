export const getConditionGrpContainerStyles = ({ nestedLevel }) => {
  return {
    padding: nestedLevel > 0 ? "0.75rem 1.12rem" : "1.25rem 0 1.25rem 0",
    backgroundColor: nestedLevel % 2 === 0 ? "#fff" : "#f3f5f7",
    border: nestedLevel > 0 ? "0.046rem solid #CFD8DC" : "none",
    borderRadius: "0.375rem",
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  };
};

export const getContainerGrpStyles = () => {
  return {
    display: "flex",
    // alignItems: "flex-start",
    gap: "1.5rem",
    flexDirection: "column" as const,
  };
};
