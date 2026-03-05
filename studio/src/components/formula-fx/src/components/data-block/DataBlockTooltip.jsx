import React from "react";
import { capitalize } from "../../utils/fx-utils.jsx";

const DataBlockTooltip = ({ block }) => {
  const name = block.displayValue || block.name || block.value;
  const displayName = capitalize(String(name ?? ""));

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-[auto_1fr] items-center gap-1">
        <div className="text-base font-medium text-foreground">
          {displayName}
        </div>
        {block.args?.length > 0 && (
          <div className="flex gap-1 items-center text-base text-muted-foreground">
            <div>{"("}</div>
            {block.args.map((v, index) => (
              <div
                key={`dbt-arg-${index}`}
                className="grid grid-cols-[auto_auto] gap-x-2"
              >
                <div className="grid grid-rows-[auto_auto_auto]">
                  <div>
                    {v.name}
                    {v.required && <sup className="text-destructive">*</sup>}
                  </div>
                  <div className="text-sm">{v.type}</div>
                </div>
                <div>{index === block.args.length - 1 ? "" : ";"}</div>
              </div>
            ))}
            <div>{")"}</div>
          </div>
        )}
      </div>
      {block.description && (
        <div
          className="text-base text-muted-foreground leading-normal"
          dangerouslySetInnerHTML={{ __html: block.description }}
        />
      )}
    </div>
  );
};

export default DataBlockTooltip;
