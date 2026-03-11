export const getContainerStyles = ({ readOnly }) => ({
  boxSizing: "border-box" as const,
  pointerEvents: readOnly ? ("none" as const) : ("all" as const),
});

export const parentData = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.75rem 0.75rem 0",
};

export const getNestedContainerStyles = ({ hideHeaderAndMap, isCollapse }) => ({
  ...(hideHeaderAndMap && {
    padding: "0.75rem",
    transition: "max-height 0.2s linear, padding 0.1s linear",
    borderRadius: "0.75rem",
  }),

  ...(isCollapse && {
    padding: "0 0.75rem",
    maxHeight: "0",
    overflow: "hidden",
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
