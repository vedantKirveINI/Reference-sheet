import React, { useCallback } from "react";
// import Label from "oute-ds-label";
// import Icon from "oute-ds-icon";
// import Tooltip from "oute-ds-tooltip";
import { ODSIcon as Icon } from "@src/module/ods";
import VariableSelector from "../variable-selector/VariableSelector";
import styles from "../../styles/styles.module.css";
import OperatorSelector from "../operator-selector/OperatorSelector";
import { getOperators } from "../../utils/utils";
import ValueField from "../value-field/ValueField";

const Condition = ({
  condition,
  index,
  variables,
  isAdvanced = false,
  onChange = () => {},
  onDelete = () => {},
}) => {
  const handleChange = useCallback(
    (type, value) => {
      if (type === "variable") {
        onChange(
          {
            ...condition,
            variable: value,
            operation: getOperators(value?.variableData?.type)?.[0],
            value: [],
          },
          index
        );
      } else if (type === "operation") {
        onChange(
          {
            ...condition,
            operation: value,
            value:
              condition.operation.valueInputs?.length ===
                value.valueInputs?.length &&
              condition.operation.valueInputs[0]?.type ===
                value.valueInputs[0]?.type
                ? condition.value
                : [],
          },
          index
        );
      } else if (type === "value") {
        onChange(
          {
            ...condition,
            value: [...(value || [])], // Ensure value is an array
          },
          index
        );
      }
    },
    [condition, index, onChange]
  );
  return (
    <div className={styles.flexContainer}>
      <div
        className={styles.condition}
        data-testid={`condition-field-${index}`}
      >
        <VariableSelector
          index={index}
          variables={variables}
          selectedVariable={condition?.variable}
          onChange={(variable) => {
            handleChange("variable", variable);
          }}
        />
        <div className={styles.conditionOperatorRow}>
          <OperatorSelector
            variableType={condition?.variable?.variableData?.type}
            operation={condition?.operation}
            onChange={(operation) => {
              handleChange("operation", operation);
            }}
          />
          {condition?.operation?.valueInputs?.length !== 0 && (
            <ValueField
              index={index}
              variable={condition?.variable}
              operation={condition.operation}
              value={condition?.value || []}
              isAdvanced={isAdvanced}
              variables={variables}
              onChange={(value) => {
                handleChange("value", value);
              }}
            />
          )}
        </div>
      </div>
      {index !== 0 && (
        <Icon
          outeIconName="OUTETrashIcon"
          outeIconProps={{
            "data-testid": "delete-condition",
            sx: { color: "#212121" },
          }}
          onClick={() => {
            onDelete(index);
          }}
        />
      )}
      {/* {(!condition?.variable || !condition?.value?.length) && (
        <Tooltip
          title={
            <Label variant="h6" color="#fff">
              There are missing fields in this condition.
            </Label>
          }
          slotProps={{
            tooltip: {
              sx: {
                background: `${"rgba(38, 50, 56, 0.9)"}`,
                maxWidth: "16rem",
              },
            },
          }}
        >
          <Icon
            outeIconName="OUTEWarningIcon"
            outeIconProps={{ sx: { color: "#FF5252" } }}
          />
        </Tooltip>
      )} */}
    </div>
  );
};

export default Condition;
