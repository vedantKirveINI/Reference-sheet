import React from "react";
// import Icon from "oute-ds-icon";
// import Tooltip from "oute-ds-tooltip";
import { ODSIcon as Icon, ODSTooltip as Tooltip } from "@src/module/ods";

const InfoTooltip = ({ content }) => {
  return (
    <Tooltip
      title={content}
      arrow={false}
      slotProps={{
        tooltip: {
          sx: {
            background: `${"rgba(38, 50, 56, 0.9)"}`,
            maxWidth: "16rem",
          },
        },
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
        }}
      >
        <Icon
          outeIconName="OUTEInfoIcon"
          // outeIconProps={{ sx: { cursor: "pointer" } }}
        />
      </div>
    </Tooltip>
  );
};

export default InfoTooltip;
