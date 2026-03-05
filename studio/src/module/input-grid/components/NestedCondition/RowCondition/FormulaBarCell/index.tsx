import React, { useRef } from "react";
import { FormulaBar } from "@src/module/ods";
import { cellContainer } from "./styles";

function FormulaBarCell({
  currIndex,
  variables,
  data,
  onFieldChangeHandler,
  isAppendEmptyRow = true,
}) {
  const { value = {} } = data || {};
  const fxRef = useRef(null);

  return (
    <div
      style={cellContainer}
      data-testid={`value_${currIndex}`}
    >
      <FormulaBar
        hideBorders
        ref={fxRef}
        variables={variables}
        defaultInputContent={value?.blocks}
        popperProps={{ className: "ag-custom-component-popup" }}
        onInputContentChanged={(fxUpdatedVal, fxUpdatedValStr) => {
          onFieldChangeHandler({
            fieldName: "value",
            updatedValue: {
              fxUpdatedVal,
              fxUpdatedValStr,
            },
            isAppendEmptyRow,
          });
        }}
      />
    </div>
  );
}

export default FormulaBarCell;
