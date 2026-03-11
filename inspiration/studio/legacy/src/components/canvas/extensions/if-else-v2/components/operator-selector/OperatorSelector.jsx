import React from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import Label from "oute-ds-label";
import { ODSAutocomplete as Autocomplete, ODSLabel as Label } from "@src/module/ods";
import { getOperators } from "../../utils/utils";
import InfoTooltip from "../info-tooltip/InfoTooltip";
import styles from "../../styles/styles.module.css";
const OperatorSelector = ({ variableType, operation, onChange = () => {} }) => {
  const operatorOptions = getOperators(variableType);
  return (
    <div className={styles.flexContainer}>
      <Autocomplete
        data-testid="condition-operator"
        options={operatorOptions}
        value={operation}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option?.value === value?.value}
        variant="black"
        textFieldProps={{
          placeholder: "Select an operator",
          errorType: "icon",
          error: !operation,
          helperText: !operation ? "Please select an operator" : "",
        }}
        onChange={(e, newValue) => onChange(newValue)}
      />
      <InfoTooltip
        content={
          <Label variant="subtitle2" color="#fff">
            Choose how to compare the variable&apos;s value
          </Label>
        }
      />
    </div>
  );
};

export default OperatorSelector;
