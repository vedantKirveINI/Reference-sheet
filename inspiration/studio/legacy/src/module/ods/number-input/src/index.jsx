import React, { forwardRef } from "react";
import { NumericFormat } from "react-number-format";
// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "../../index.jsx";

const OUTENumberInput = forwardRef(({ ...props }, ref) => {
  return (
    <NumericFormat
      getInputRef={ref}
      {...props}
      customInput={ODSTextField}
      data-testid="oute-ds-number-input"
    />
  );
});

export default OUTENumberInput;
