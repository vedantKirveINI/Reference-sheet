import React from "react";
import { ODSIcon, ODSTooltip, ODSLabel } from "@src/module/ods";

function ShowInfo({ title }) {
  return (
    <ODSTooltip
      title={
        <ODSLabel variant="subtitle2" color="#fff">
          {title}
        </ODSLabel>
      }
      arrow={false}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -14],
              },
            },
          ],
        },
        tooltip: {
          style: {
            background: `${"rgba(38, 50, 56, 0.9)"}`,
            maxWidth: "40rem",
            maxHeight: "24rem",
            overflow: "auto",
          },
        },
      }}
    >
      <span style={{ pointerEvents: "auto" }}>
        <ODSIcon
          outeIconName="OUTEInfoIcon"
          outeIconProps={{
            style: {
              width: "1.25rem",
              height: "1.25rem",
            },
          }}
          buttonProps={{
            style: {
              verticalAlign: "text-bottom",
            },
          }}
        />
      </span>
    </ODSTooltip>
  );
}

export default ShowInfo;
