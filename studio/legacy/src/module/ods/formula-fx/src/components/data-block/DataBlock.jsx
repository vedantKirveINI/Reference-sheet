import React, { useEffect, useState } from "react";
import { ODSTooltip as Tooltip, ODSIcon as Icon } from "@src/module/ods";
import DataBlockTooltip from './DataBlockTooltip.jsx';
import classes from './DataBlock.module.css';
import { truncateMiddle } from '../../utils/fx-utils.jsx';

const DataBlock = ({ block, startChars, endChars, onClick = () => {} }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    const listener = (e) => {
      setShowTooltip(false);
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        alignItems: "center",
        border: "0.047rem solid",
        borderRadius: "0.25rem",
        borderColor: block.error ? "var(--error)" : "#cfd8dc",
        borderWidth: block.error ? "0.1rem" : "0.047rem",
      }}
    >
      <div
        className={`${classes["data-block"]}`}
        style={{
          background: block.error ? "#fff" : block.background || "#E5EAF1",
          color: block.error ? "#000" : block.foreground || "#000",
          opacity: block.error ? 0.5 : 1,
          paddingRight: block.error ? "1.719rem" : "0.219rem",
        }}
        data-testid={`data-block-${
          block.displayValue || block.name || block.value
        }`}
        data-has-error={block.error ? "true" : "false"}
        onMouseEnter={() => {
          setShowTooltip(true);
        }}
        onMouseLeave={() => setShowTooltip(false)}
        onKeyDown={() => setShowTooltip(false)}
        onMouseDown={() => setShowTooltip(false)}
        onClick={(e) => {
          onClick(e, block);
        }}
      >
        <div className={classes["data-block-name"]}>
          <Tooltip
            open={showTooltip}
            arrow={false}
            title={
              block.error ? (
                block.errorMessage
              ) : (
                <DataBlockTooltip block={block} />
              )
            }
            slotProps={{
              tooltip: {
                sx: {
                  background: block.error
                    ? "var(--error)"
                    : `${"rgba(38, 50, 56, 0.9)"}`,
                  maxWidth: "42rem",
                },
              },
            }}
            disableHoverListener
          >
            {truncateMiddle(
              `${block.nodeNumber ? `${block.nodeNumber}. ` : ""}${
                block.displayValue || block.name || block.value
              }`,
              startChars,
              endChars
            )}
          </Tooltip>
        </div>
      </div>
      {block.error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            top: 0,
            right: 0,
            width: "100%",
            height: "100%",
            justifyContent: "flex-end",
            pointerEvents: "none",
            padding: "0 0.25rem",
          }}
          data-testid={`data-block-error-${block.blockId}`}
        >
          <Icon
            outeIconName="OUTEWarningIcon"
            outeIconProps={{
              sx: {
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--error)",
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DataBlock;

