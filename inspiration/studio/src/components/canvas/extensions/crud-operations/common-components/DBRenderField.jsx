import React from "react";
import { ODSTextField as TextField } from "@src/module/ods";

const DBRenderField = ({ fieldConfig, formValue, handleFieldChange }) => {
  let fieldValue = formValue?.[fieldConfig.key]?.value || "";

  const placeholder = fieldConfig.description;

  let inputType = "text";
  if (fieldConfig.key === "password") {
    inputType = "password";
  } else if (fieldConfig.type === "INT") {
    inputType = "number";
  }

  return (
    <TextField
      key={fieldConfig.key}
      label={fieldConfig.label}
      placeholder={placeholder}
      value={fieldValue}
      onChange={(e) => {
        const newValue =
          fieldConfig.type === "INT"
            ? parseInt(e.target.value) || ""
            : e.target.value;
        handleFieldChange({ field: fieldConfig, fieldValue: newValue });
      }}
      type={inputType}
      required={fieldConfig.required}
      fullWidth
    />
  );
};

export default DBRenderField;
