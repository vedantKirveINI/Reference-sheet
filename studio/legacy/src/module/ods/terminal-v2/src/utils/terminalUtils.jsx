export const getLogColor = (type) => {
  switch (type) {
    case "error":
      return "#dc2626"; // Red for errors
    case "success":
      return "#16a34a"; // Green for success
    case "divider":
      return "#9ca3af"; // Gray for dividers
    default:
      return "#000000"; // Black for everything else (info, input, etc.)
  }
};

export const getDefaultStyles = (height, width, maxWidth) => ({
  container: {
    backgroundColor: "#ffffff",
    color: "#000000",
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: "14px",
    padding: "20px",
    paddingBottom: "60px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    height: height,
    width: width,
    maxWidth: maxWidth,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  output: {
    flex: 1,
    overflowY: "auto",
    marginBottom: "10px",
    lineHeight: "1.4",
  },
});
