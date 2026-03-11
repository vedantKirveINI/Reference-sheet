import React from "react";
// import AdvancedLabel from "oute-ds-advanced-label";
// import Icon from "oute-ds-icon";
import { ODSAdvancedLabel as AdvancedLabel, ODSIcon as Icon } from "@src/module/ods";

const ExtensionDialogTitle = ({ titleText, icon, foreground, background }) => {
  return (
    <AdvancedLabel
      fullWidth={true}
      labelText={titleText}
      labelProps={{
        color: foreground,
        background,
        sx: {
          fontSize: 20,
        },
      }}
      leftAdornment={
        <Icon
          imageProps={{
            src: icon,
            width: 30,
            height: 30,
            style: { borderRadius: "50%" },
            "data-testid": "dialog-icon",
          }}
        />
      }
    />
  );
};

export default ExtensionDialogTitle;
