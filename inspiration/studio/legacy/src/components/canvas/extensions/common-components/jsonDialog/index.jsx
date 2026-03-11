import React, { useEffect, useState } from "react";
// import ODSDialog from "oute-ds-dialog";
// import AdvancedLabel from "oute-ds-advanced-label";
// import ODSIcon from "oute-ds-icon";
// import default_theme from "oute-ds-shared-assets";
import { ODSDialog, ODSAdvancedLabel as AdvancedLabel, ODSIcon, default_theme } from "@src/module/ods";
import JsonDialogContent from "./jsonDialogContent";

const JsonDialog = ({
  onModifyResponse,
  show = false,
  onJsonDialogClose = () => {},
}) => {
  const [showJSONEditorDialog, setShowJSONEditorDialog] = useState(false);

  useEffect(() => {
    setShowJSONEditorDialog(show);
  }, [show]);

  return (
    <ODSDialog
      open={showJSONEditorDialog}
      onClose={onJsonDialogClose}
      showFullscreenIcon={false}
      hideBackdrop={false}
      dividers={true}
      draggable={false}
      dialogTitle={
        <AdvancedLabel
          labelText="Edit Json"
          labelProps={{
            variant: "h6",
            color: default_theme.palette?.grey["A100"],
          }}
          leftAdornment={
            <ODSIcon
              outeIconName="OUTECurlyBracesIcon"
              outeIconProps={{
                sx: { color: default_theme.palette?.grey["A100"] },
              }}
            />
          }
        />
      }
      dialogContent={
        <JsonDialogContent
          onClose={onJsonDialogClose}
          onModify={onModifyResponse}
        />
      }
      dialogWidth="auto"
    />
  );
};

export default JsonDialog;
