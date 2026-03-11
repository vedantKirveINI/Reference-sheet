import { useState } from "react";
// import ODSLabel from "oute-ds-label";
// import ODSIcon from "oute-ds-icon";
import { ODSLabel, ODSIcon } from "@src/module/ods";
import classes from "./copyable-text-field.module.css";

const CopyableTextField = ({ title, value, isEnabled = true, dataTestId }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <div
      className={classes.container}
      style={{
        pointerEvents: isEnabled ? "auto" : "none",
      }}
    >
      <ODSLabel
        variant="body1"
        children={title}
        data-testid={dataTestId ? `${dataTestId}-title` : ""}
        className={classes.title}
      />

      <div
        data-testid={dataTestId ? `${dataTestId}-value-container` : ""}
        className={classes.container2}
      >
        <div
          data-testid={dataTestId ? `${dataTestId}-value` : ""}
          className={classes.text}
        >
          {value}
        </div>
        <div className={classes.copyWrapper}>
          {isCopied && (
            <ODSLabel
              variant="caption"
              children="Copied!"
              className={classes.copiedLabel}
              data-testid={dataTestId ? `${dataTestId}-copied-label` : ""}
            />
          )}
          {isEnabled && (
            <ODSIcon
              outeIconName={isCopied ? "OUTEDoneIcon" : "OUTECopyContentIcon"}
              outeIconProps={{
                "data-testid": dataTestId ? `${dataTestId}-copy-icon` : "",
                sx: {
                  color: isCopied ? "#4CAF50" : "#607D8B",
                  cursor: "pointer",
                },
              }}
              onClick={isEnabled ? handleCopy : null}
            />
          )}
          {isEnabled && (
            <a style={{ display: "flex" }} href={value} target="_blank">
              <img
                style={{
                  height: 18,
                }}
                src="https://cdn-v1.tinycommand.com/1234567890/1757567966845/7612930.png"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyableTextField;
