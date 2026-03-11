export const getCellRender = ({ readOnly }) => ({
  width: "100%",
  height: "100%",
  overflow: "auto !important",
  display: "flex",
  alignItems: "center",
  gap: "0.188rem",
});

export const SCROLLBAR_CLASS = "scrollbar-hidden";
export const HOVER_CLASS = "hover-bg-subtle";

export const cellItem = {
  borderRadius: "0.25rem",
  font: "var(--body1, 400 1rem / 1.5rem 'Inter', sans-serif)",
  letterSpacing: "var(--body1-letter-spacing, 0.032rem)",
  fontWeight: "400",
  lineHeight: "1.18rem",
  color: "#263238",
  marginRight: "0.125rem",
};

export const getLabelContainer = ({ readOnly }) => ({
  display: "flex",
  alignItems: "center",
  padding: "0.625rem 0.25rem",
  boxSizing: "border-box" as const,
  height: "100%",
});
