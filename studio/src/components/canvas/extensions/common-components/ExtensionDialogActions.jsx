import React from "react";
// import { ODSButton as Button } from "@src/module/ods";
import { ODSButton as Button } from "@src/module/ods";

const ExtensionDialogActions = ({ onDiscard, onSave }) => {
  return (
    <>
      <Button
        variant="black-outlined"
        data-testid="dialog-discard"
        label="DISCARD"
        onClick={onDiscard}
      />
      <Button
        data-testid="dialog-save"
        variant="black"
        label="SAVE"
        onClick={onSave}
      />
    </>
  );
};

export default ExtensionDialogActions;
