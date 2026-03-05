import React from "react";
// import { ODSDialog as Dialog } from "@src/module/ods";
import { ODSDialog as Dialog } from "@src/module/ods";

import ExtensionDialogActions from "./ExtensionDialogActions";
import ExtensionDialogTitle from "./ExtensionDialogTitle";
const ExtensionDialog = ({
  dialogContent,
  titleProps,
  onDiscard,
  onSave,
  ...overrideDefaultProps
}) => {
  return (
    <Dialog
      open={true}
      dialogWidth="800px"
      dialogHeight="800px"
      dialogTitle={
        <ExtensionDialogTitle
          titleText={titleProps.label}
          icon={titleProps.icon}
          foreground={titleProps.foreground}
          background={titleProps.background}
        />
      }
      dialogTitleProps={{
        sx: {
          color: titleProps.foreground,
          background: titleProps.background,
        },
      }}
      onClose={onDiscard}
      transition="none"
      dialogContent={dialogContent}
      dialogActions={
        <ExtensionDialogActions onDiscard={onDiscard} onSave={onSave} />
      }
      {...overrideDefaultProps}
    />
  );
};

export default ExtensionDialog;
