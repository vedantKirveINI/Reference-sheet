import React from "react";
// import { ODSButton as Button } from "@src/module/ods";
import { ODSButton as Button } from "@src/module/ods";

const CommonDrawerActions = ({ onDiscard = () => {}, onSave = () => {} }) => {
  return (
    <>
      <Button
        variant="outlined"
        data-testid="start-discard-cta"
        label="DISCARD"
        onClick={onDiscard}
      />
      <Button data-testid="start-save-cta" label="SAVE" onClick={onSave} />
    </>
  );
};

export default CommonDrawerActions;
