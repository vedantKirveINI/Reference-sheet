import React, { useEffect, useState } from "react";
import { ODSDialog, ODSAdvancedLabel as AdvancedLabel, ODSIcon } from "@src/module/ods";
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
            color: "rgb(38, 50, 56)",
          }}
          leftAdornment={
            <ODSIcon
              outeIconName="OUTECurlyBracesIcon"
              outeIconProps={{
                style: { color: "rgb(38, 50, 56)" },
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
