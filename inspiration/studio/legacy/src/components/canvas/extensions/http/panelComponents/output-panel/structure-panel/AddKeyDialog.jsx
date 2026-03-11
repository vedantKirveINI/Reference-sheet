import React, { useState } from "react";
// import ODSButton from "oute-ds-button";
// import ODSTextField from "oute-ds-text-field";
import { ODSButton, ODSTextField } from "@src/module/ods";

const AddKeyDialog = ({
  onSave = () => {},
  onCancel = () => {},
  keyValue = "",
  aliasValue = "",
}) => {
  const [key, setKey] = useState(keyValue);
  const [alias, setAlias] = useState(aliasValue);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "1fr 1fr 1fr",
        gridGap: "1rem",
      }}
    >
      <ODSTextField
        placeholder="KEY"
        value={key}
        onChange={(e) => {
          setKey(e.target.value);
        }}
        autoFocus={true}
      />
      <ODSTextField
        placeholder="ALIAS"
        value={alias}
        onChange={(e) => {
          setAlias(e.target.value);
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <ODSButton
          size="small"
          label="CANCEL"
          variant="outlined"
          sx={{
            height: "40px",
          }}
          onClick={() => {
            onCancel();
          }}
        />
        <ODSButton
          size="small"
          label="Save"
          sx={{
            height: "40px",
          }}
          onClick={() => onSave(key, alias)}
        />
      </div>
    </div>
  );
};

export default AddKeyDialog;
