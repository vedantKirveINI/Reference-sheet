import React from "react";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
// import ODSLabel from "oute-ds-label";
// import default_theme from "oute-ds-shared-assets";
// import Icon from "oute-ds-icon";
import { ODSAdvancedLabel, ODSLabel, sharedAssets as default_theme, ODSIcon as Icon } from "@src/module/ods";

export const DeletedAssetTitle = () => (
  <ODSAdvancedLabel
    labelText="File is in the bin"
    labelProps={{
      variant: "h6",
      color: default_theme.palette?.grey["A100"],
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
      <ODSLabel variant="body1" color={default_theme.palette?.grey["A100"]}>
        "{assetName}" will be deleted forever after 30 days.
      </ODSLabel>
      <ODSLabel variant="body1" color={default_theme.palette?.grey["A100"]}>
        To access this file, take it out of the Bin.
      </ODSLabel>
    </div>
  );
};
