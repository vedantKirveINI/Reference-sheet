import React from "react";
import classes from "./DataBlockTooltip.module.css";

const DataBlockTooltip = ({ block }) => {
  const displayName = block.displayValue || block.name || block.value;
  const hasUniqueDescription = block.description && 
    block.description !== displayName && 
    block.description !== block.name &&
    block.description !== block.label;

  return (
    <div className={classes["data-block-tooltip"]}>
      <div className={classes["data-block-tooltip-header"]}>
        <div
          className={classes["data-block-tooltip-name"]}
          dangerouslySetInnerHTML={{
            __html: displayName,
          }}
        />
        {block.args?.length > 0 && (
          <div className={classes["data-block-tooltip-args"]}>
            <div>{"("}</div>
            {block.args.map((v, index) => {
              return (
                <div
                  key={`dbt-arg-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: "auto auto auto",
                    }}
                  >
                    <div>
                      {v.name}
                      {v.required && <sup style={{ color: "red" }}>*</sup>}
                    </div>
                    <div>{v.type}</div>
                  </div>
                  <div>{index === block.args.length - 1 ? "" : ","}</div>
                </div>
              );
            })}
            <div>{")"}</div>
          </div>
        )}
      </div>
      {hasUniqueDescription && (
        <div
          className={classes["data-block-tooltip-descripion"]}
          dangerouslySetInnerHTML={{ __html: block.description }}
        />
      )}
      {block.example && (
        <div
          className={classes["data-block-tooltip-example"]}
          dangerouslySetInnerHTML={{ __html: block.example }}
        />
      )}
    </div>
  );
};

export default DataBlockTooltip;
