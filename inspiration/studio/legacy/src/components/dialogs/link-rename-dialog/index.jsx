import React, { useCallback, useRef, useState } from "react";
// import ODSTextField from "oute-ds-text-field";
// import ODSButton from "oute-ds-button";
import { ODSTextField, ODSButton } from "@src/module/ods";

import classes from "./index.module.css";
// import { showAlert } from "oute-ds-alert";

const LinkRename = ({ onSave = () => {}, defaultLinkLabel = "" }) => {
  const [linkLabel, setLinkLabel] = useState(defaultLinkLabel);
  const linkLabelRef = useRef();
  const saveButtonRef = useRef();
  const saveClickHandler = useCallback(() => {
    // if (!linkLabel) {
    //   linkLabelRef.current?.focus();
    //   return showAlert({
    //     message: "Please enter link label",
    //     type: "error",
    //   });
    // }
    onSave(linkLabel);
  }, [onSave, linkLabel]);
  return (
    <div className={classes["link-rename-container"]}>
      <ODSTextField
        autoFocus={true}
        value={linkLabel}
        placeholder="Enter link name"
        fullWidth={true}
        onChange={(e) => {
          setLinkLabel(e.target.value);
        }}
        required={true}
        ref={linkLabelRef}
        onEnter={() => {
          saveButtonRef.current?.click();
        }}
      />
      <div className={classes["ctas-container"]}>
        <ODSButton
          ref={saveButtonRef}
          variant="outlined"
          label="DISCARD"
          onClick={saveClickHandler}
        />
        <ODSButton
          ref={saveButtonRef}
          label="SAVE"
          onClick={saveClickHandler}
        />
      </div>
    </div>
  );
};

export default LinkRename;
