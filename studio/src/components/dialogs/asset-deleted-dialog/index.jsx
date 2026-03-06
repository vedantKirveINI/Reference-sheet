import React from "react";
import { ODSAdvancedLabel, ODSLabel, ODSIcon as Icon } from "@src/module/ods";

export const DeletedAssetTitle = () => (
  <ODSAdvancedLabel
    labelText="File is in the bin"
    labelProps={{
      variant: "h6",
      color: "rgb(38, 50, 56)",
    }}
    leftAdornment={<Icon outeIconName="OUTEWarningIcon" />}
  />
);

export const DeletedAssetMessage = ({ assetName = "Asset" }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "37.5rem",
        gap: "1rem",
        padding: "1rem",
      }}
      data-testid="deleted-workflow-warning"
    >
      <ODSLabel variant="body1" color="rgb(38, 50, 56)">
        "{assetName}" will be deleted forever after 30 days.
      </ODSLabel>
      <ODSLabel variant="body1" color="rgb(38, 50, 56)">
        To access this file, take it out of the Bin.
      </ODSLabel>
    </div>
  );
};
