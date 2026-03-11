import React, { useCallback } from "react";
// import { FormulaBar } from "oute-ds-formula-bar";
// import TextField from "oute-ds-text-field";
// import Autocomplete from "oute-ds-autocomplete";
// import Label from "oute-ds-label";
import { ODSFormulaBar as FormulaBar, ODSTextField as TextField, ODSAutocomplete as Autocomplete, ODSLabel as Label } from "@src/module/ods";

import styles from "../../styles/styles.module.css";
import InfoTooltip from "../info-tooltip/InfoTooltip";
import { booleanOptions, MESSAGES, TYPES } from "../../constants/constants";

const ValueField = ({
  variable,
  variables,
  value,
  operation,
  isAdvanced,
  onChange = () => {},
}) => {
  const handleChange = useCallback(
    (type, newValue, index) => {
      let updatedValue = [];
      operation?.valueInputs?.map((input, i) => {
        if (i === index) {
          updatedValue.push({ type, value: newValue });
        } else {
          if (value[i]) {
            updatedValue.push(value[i]);
          } else {
            updatedValue.push({ type, value: "" });
          }
        }
      });
      onChange(updatedValue);
    },
    [onChange, operation?.valueInputs, value]
  );
  return (
    <div className={styles.flexContainer}>
      {isAdvanced ? (
        <FormulaBar
          variables={variables}
          defaultInputContent={value}
          onInputContentChanged={(content) =>
            onChange({ type: "fx", blocks: content })
          }
        />
      ) : (
        <>
          {operation?.valueInputs?.map((input, index) => {
            const allowOverrideNodes = [
              "MCQ",
              "SCQ",
              "DROP_DOWN_STATIC",
              "YES_NO",
            ];
            if (
              operation.allowOverride &&
              allowOverrideNodes.indexOf(variable?.variableData?.nodeType) !==
                -1
            ) {
              return (
                <Autocomplete
                  key={`${operation.value}_${index}`}
                  data-testid="condition-value-dropdown"
                  textFieldProps={{
                    errorType: "icon",
                    error: !value?.[index]?.value,
                    helperText: !value?.[index]?.value
                      ? "Please select an option"
                      : "",
                  }}
                  value={
                    variables?.NODE?.find(
                      (v) => v.key === variable.variableData.nodeId
                    )?.go_data?.options?.find(
                      (o) => o === value?.[index]?.value
                    ) || ""
                  }
                  options={
                    variables?.NODE?.find(
                      (v) => v.key === variable.variableData.nodeId
                    )?.go_data?.options || []
                  }
                  variant="black"
                  getOptionLabel={(option) => option}
                  onChange={(e, newValue) =>
                    handleChange(TYPES.STRING, newValue, index)
                  }
                />
              );
            } else if (input.type === "number") {
              return (
                <TextField
                  data-testid="condition-value"
                  defaultValue={value?.[index]?.value}
                  key={`${operation.value}_${index}`}
                  type="number"
                  fullWidth
                  error={!value?.[index]?.value}
                  errorType="icon"
                  helperText={
                    !value?.[index]?.value ? "Please enter a value" : ""
                  }
                  className="black"
                  placeholder={input.placeholder || "Enter value"}
                  onChange={(e) =>
                    handleChange(TYPES.NUMBER, e.target.value, index)
                  }
                />
              );
            } else if (input.type === "boolean") {
              return (
                <Autocomplete
                  data-testid="condition-value-dropdown"
                  key={`${operation.value}_${index}`}
                  value={booleanOptions?.find(
                    (option) => option.value === value?.[index]?.value
                  )}
                  textFieldProps={{
                    errorType: "icon",
                    error: !value?.[index]?.value,
                    helperText: !value?.[index]?.value
                      ? "Please select an option"
                      : "",
                  }}
                  options={booleanOptions}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) =>
                    option.value === value.value
                  }
                  variant="black"
                  onChange={(e, newValue) =>
                    handleChange(TYPES.BOOLEAN, newValue.value, index)
                  }
                />
              );
            } else {
              return (
                <TextField
                  data-testid="condition-value"
                  defaultValue={value?.[index]?.value}
                  key={`${operation.value}_${index}`}
                  errorType="icon"
                  error={!value?.[index]?.value}
                  helperText={
                    !value?.[index]?.value ? "Please enter a value" : ""
                  }
                  placeholder={input.placeholder || "Enter value"}
                  fullWidth
                  className="black"
                  onChange={(e) =>
                    handleChange(TYPES.STRING, e.target.value, index)
                  }
                />
              );
            }
          })}
        </>
      )}
      <InfoTooltip
        content={
          operation?.description?.length > 0 ? (
            operation.description.map((x, index) => {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    padding: "1rem 0.5rem",
                  }}
                  key={`${x.title}-${index}`}
                >
                  <Label variant="subtitle1" color="#fff">
                    {x.title}:
                  </Label>
                  <Label variant="subtitle2" color="#fff">
                    {x.value}
                  </Label>
                </div>
              );
            })
          ) : (
            <Label variant="subtitle2" color="#fff">
              {MESSAGES.DEFAULT_VALUE_INFO}
            </Label>
          )
        }
      />
    </div>
  );
};

export default ValueField;
