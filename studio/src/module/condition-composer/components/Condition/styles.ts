import { EMPTY_OPERATOR } from "./constant/operator";

export const deleteIconStyles = () => {
  return {
    cursor: "pointer",
    borderRadius: "0.375rem",
    boxSizing: "border-box" as const,
    padding: "0.625rem",
  };
};

export const conditionRowStyles = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
};

export const conditionSelectorStyles = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
};

export const conditionContentStyles = {
  flex: 1,
  display: "flex",
  flexDirection: "column" as const,
  gap: "1.5rem",
  minWidth: 0,
};

export const conditionContainerStyles = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "1.5rem",
};
