import { useState } from "react";
// import ODSLabel from "oute-ds-label";
// import ODSButton from "oute-ds-button";
// import ODSIcon from "oute-ds-icon";
import { ODSLabel, ODSButton, ODSIcon } from "@src/module/ods";
import classes from "./scrollable-text-field.module.css";

const ScrollableTextField = ({
  label,
  value,
  dataTestId,
  isEnabled = true,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!isEnabled || !value) return;

    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <div className={classes.container} data-testid={dataTestId}>
      {label && (
        <ODSLabel
          variant="body2"
          sx={{
            fontWeight: 400,
            color: "#607D8B",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            marginBottom: "0.5rem",
          }}
          data-testid={dataTestId ? `${dataTestId}-label` : ""}
        >
          {label}
        </ODSLabel>
      )}

      <div className={classes.fieldContainer}>
        <div className={classes.textContainer}>
          <div
            className={classes.text}
            data-testid={dataTestId ? `${dataTestId}-value` : ""}
          >
            {value || ""}
          </div>
        </div>

        <div className={classes.copyButtonWrapper}>
          <ODSButton
            variant="contained"
            label={isCopied ? "Copied!" : "Copy"}
            size="small"
            onClick={handleCopy}
            disabled={!isEnabled || !value}
            data-testid={dataTestId ? `${dataTestId}-copy-button` : ""}
            sx={{
              backgroundColor: isCopied ? "#4CAF50" : "#4285F4",
              color: "#ffffff",
              borderRadius: "20px",
              minWidth: "auto",
              padding: "0.5rem 1rem",
              height: "100%",
              "&:hover": {
                backgroundColor: isCopied ? "#45a049" : "#357ae8",
              },
            }}
            startIcon={
              <ODSIcon
                outeIconName={isCopied ? "OUTEDoneIcon" : "OUTECopyContentIcon"}
                outeIconProps={{
                  sx: {
                    color: "#ffffff",
                    fontSize: "1rem",
                  },
                }}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ScrollableTextField;
