import React from "react";
import classes from './FxCellRenderer.module.css';

const FxCellRenderer = ({ data = [], ...props }) => {
  return (
    <div
      {...props}
      className={`${classes["container"]} ${props?.className || ""}`}
    >
      {data?.map((item, index) => {
        return (
          <span
            style={{
              backgroundColor: item?.background,
              color: item?.foreground,
              padding: item.type === "PRIMITIVES" ? "0rem" : ".25rem",
            }}
            className={classes["item"]}
            key={`${index}_${item?.displayValue || item?.value}`}
          >
            {item?.displayValue || item?.value}
          </span>
        );
      })}
    </div>
  );
};

export default FxCellRenderer;
