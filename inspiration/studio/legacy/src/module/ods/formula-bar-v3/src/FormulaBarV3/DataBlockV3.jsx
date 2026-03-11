import React from "react";
import classes from "./DataBlockV3.module.css";

const DataBlockV3 = ({ block, onClick = () => {}, onHover = () => {}, isHovered = false, dataBlockId = null }) => {
  const displayName = block.displayValue || block.name || block.value;
  const nodeNumber = block.nodeNumber;

  return (
    <div
      className={`${classes.dataBlock} ${isHovered ? classes.hovered : ""} ${block.error ? classes.error : ""}`}
      data-testid={`data-block-${displayName}`}
      data-block-id={dataBlockId}
      onClick={(e) => onClick(e, block)}
      onMouseEnter={() => onHover(block)}
    >
      <div
        className={classes.indicator}
        style={{ backgroundColor: block.background || "#e5e5e5" }}
      />
      <span className={classes.name}>
        {nodeNumber ? `${nodeNumber}. ` : ""}
        {displayName}
      </span>
      {block.returnType && (
        <span className={classes.type}>{block.returnType}</span>
      )}
    </div>
  );
};

export default DataBlockV3;
