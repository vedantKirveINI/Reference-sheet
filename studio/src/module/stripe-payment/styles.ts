export const getContainerStyles = () => {
  return {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1em",
  };
};

export const getAmountDisplayStyles = (theme: any) => {
  return {
    fontSize: "1.5em",
    fontWeight: 600,
    color: theme?.styles?.questions || "#000",
    fontFamily: theme?.styles?.fontFamily || "Inter",
  };
};

export const getPaymentFormStyles = () => {
  return {
    display: "flex",
    flexDirection: "column",
    gap: "1em",
    padding: "1.5em",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "0.5em",
    backgroundColor: "#f5f7fa", // Light blue-grey background
  };
};

export const getErrorStyles = () => {
  return {
    color: "#C83C3C",
    fontSize: "0.875em",
    marginTop: "0.5em",
  };
};

export const getSuccessStyles = () => {
  return {
    display: "flex",
    alignItems: "center",
    gap: "0.5em",
    padding: "1em",
    backgroundColor: "#f0f9ff",
    borderRadius: "0.5em",
    color: "#0369a1",
    fontSize: "0.875em",
  };
};

export const getButtonStyles = (theme: any, disabled: boolean) => {
  return {
    padding: "0.75em 1.5em",
    backgroundColor: theme?.styles?.buttons || "#000",
    color: theme?.styles?.buttonTextColor || "#fff",
    border: "none",
    borderRadius: "0.375em",
    fontSize: "1em",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    fontFamily: theme?.styles?.fontFamily || "Inter",
    transition: "opacity 0.2s",
  };
};

export const getCardElementStyles = (theme: any) => {
  return {
    padding: "0.75em",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "0.375em",
    fontFamily: theme?.styles?.fontFamily || "Inter",
  };
};

export const getPaymentElementContainerStyles = (theme: any) => {
  return {
    fontFamily: theme?.styles?.fontFamily || "Inter",
  };
};
