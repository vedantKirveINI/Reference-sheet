import TextField from "oute-ds-text-field";
import React from "react";

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
