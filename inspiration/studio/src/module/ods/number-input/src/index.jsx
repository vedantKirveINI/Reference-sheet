import React, { forwardRef } from "react";
import { NumericFormat } from "react-number-format";
import { ODSTextField } from "../../index.js";

const OUTENumberInput = forwardRef(({ ...props }, ref) => {
  // Keep react-number-format integration, underlying TextField already migrated to shadcn
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
