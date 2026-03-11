import React, { useRef, useState } from "react";
// import Icon from "oute-ds-icon";
// import Tooltip from "oute-ds-tooltip";
import { ODSIcon as Icon, ODSTooltip as Tooltip } from "../../index.jsx";
import classes from './index.module.css';

const CodeBlock = ({
  children,
  wrapCode = false,
  allowDownload = false,
  downloadFilename = "",
  disabled = false,
  ...props
}) => {
  const codeBlockRef = useRef();
  const [tooltipText, setTooltipText] = useState("Copy");
  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeBlockRef.current?.innerHTML);
    setTooltipText("Copied!");
    setTimeout(() => {
      setTooltipText("Copy");
    }, 3000);
  };
  return (
    <div
      {...props}
      className={`${classes["code-block-container"]} ${props?.className || ""
        } ${disabled && classes["disabled"]}`}
      data-testid="oute-ds-code-block"
    >
      <div className={classes["code-block"]}>
        <pre data-testid="oute-ds-code-block-pre">
          <code
            className={classes[wrapCode ? "wrap" : ""]}
            ref={codeBlockRef}
            data-testid="oute-ds-code-block-code"
          >
            {children}
          </code>
        </pre>
      </div>
      <div className={classes["copy-block"]}>
        <Tooltip
          title={tooltipText}
          arrow={false}
          enterDelay={200}
          leaveDelay={100}
          data-testid="oute-ds-code-block-copy-icon"
        >
          <Icon
            onClick={copyToClipboard}
            outeIconName="OUTECopyContentIcon"
            buttonProps={{ sx: { padding: "0rem" } }}
          />
        </Tooltip>
        {allowDownload && (
          <Tooltip
            title={"Download"}
            arrow={false}
            enterDelay={200}
            leaveDelay={100}
          >
            <a
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(
                children
              )}`}
              download={`${downloadFilename || "code"}`}
              data-testid="oute-ds-code-block-download-icon"
            >
              <Icon
                onClick={() => { }}
                outeIconName="OUTEDownloadIcon"
                buttonProps={{ sx: { padding: "0rem" } }}
              />
            </a>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
