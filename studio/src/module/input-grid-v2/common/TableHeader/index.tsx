
import React, { useState } from "react";
import { getContainerStyles, divider, cell, valueCell, addCell, emptySpace, chips, checkboxEmptySpace, addWidth,  } from "./styles";
import AddButton from "../add-button";
import CheckboxCell from "../Cell/CheckboxCell";
function TableHeader({
  dataType,
  onAddChildHandler,
  isValueMode,
  readOnly = false,
  warningModal,
  hideColumnType = false,
  variant = "black",
  childsCount = -1,
  isParentHeader = false,
  dataTestId = "row",
  disableAdd = false,
  enableCheckbox = false,
  checked = false,
  setChecked = ({}) => {},
  onCheckboxChange = ({}) => {},
}) {
  const { showAdd = true } = warningModal || {};

  return (
    <div
      style={getContainerStyles({
        hideColumnType,
        childsCount,
        enableCheckbox,
        showAdd:
          (dataType === "Object" || isValueMode) &&
          showAdd &&
          !readOnly &&
          !disableAdd,
      })}
    >
      {enableCheckbox ? (
        isParentHeader ? (
          <CheckboxCell
            checked={checked}
            variant={variant}
            onChange={(val: boolean) => {
              setChecked({ isChecked: val });
              onCheckboxChange({ isChecked: val });
            }}
            dataTestId="root"
          />
        ) : (
          <div style={checkboxEmptySpace} />
        )
      ) : null}

      <div style={emptySpace}></div>
      {!hideColumnType && <div style={{ ...cell, ...divider }}>Type</div>}

      <div style={{ ...cell, ...divider, ...(hideColumnType ? addWidth : {}) }}>
        {dataType === "Array" && isValueMode ? "Index" : "Key"}
      </div>

      <div style={{ ...cell, ...valueCell }}>
        {isValueMode ? "Value" : "Default Value"}
      </div>

      {childsCount > 0 && <span style={chips}>{childsCount} fields</span>}

      {(dataType === "Object" || isValueMode) &&
      showAdd &&
      !readOnly &&
      !disableAdd ? (
        <div style={addCell} data-testid={`add_${dataType}_${dataTestId}`}>
          <AddButton onClick={onAddChildHandler} variant={variant} />
        </div>
      ) : null}
    </div>
  );
}

export default TableHeader;
