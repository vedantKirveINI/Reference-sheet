const getHeaderContainerStyles = {
  display: "flex",
  width: "100%",
  minHeight: "4em",
  padding: "0 1em",
  alignItems: "center",
  borderBottom: "0.75px solid #CFD8DC",
  background:
    "linear-gradient(180deg, #F2F6FB 73.44%, rgba(242, 246, 251, 0.00) 100%)",

  "& .MuiTabs-root": {
    border: "none !important",
    overflow: "unset !important",
  } as any,
  "& .MuiTabs-scroller": {
    overflow: "unset !important",
    overflowX: "unset !important",
  } as any,
  "& .MuiBox-root": {
    marginTop: "1.27em",
  } as any,
} as const;

const getHeaderNamesContainerStyles = {
  display: "flex",
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "center",
  gap: "0.75em",
} as const;

const getIconsStyles = {
  width: "2.5em",
  height: "2.5em",
};

const getHeaderTabsContainerStyles = {
  display: "flex",
  alignItems: "flex-start",
  boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.20)",
};

const getHeaderActionContainerStyles = {
  display: "flex",
  flex: 1,
  justifyContent: "flex-end",
  alignItems: "center",
  gap: "0.75em",
};

const getActionButtonStyles = {
  display: "flex",
  height: "3.1em",
  padding: "0px 0.75em",
  justifyContent: "center",
  alignItems: "center",
  gap: "1em",
  textAlign: "center",
  fontFamily: "Inter",
  fontSize: "0.875em",
  fontStyle: "normal",
  fontWeight: 600,
  letterSpacing: "0.078125em",
  textTransform: "uppercase",
} as const;

export {
  getActionButtonStyles,
  getHeaderActionContainerStyles,
  getHeaderContainerStyles,
  getHeaderNamesContainerStyles,
  getHeaderTabsContainerStyles,
  getIconsStyles,
};
