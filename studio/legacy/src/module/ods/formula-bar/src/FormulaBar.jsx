import React, { forwardRef } from "react";
import FormulaBarInput from './FormulaBarInput.jsx';

export const FormulaBar = forwardRef((props, ref) => {
  // const {
  //   showVariables = true,
  //   showArithmetic = true,
  //   showTextAndBinary = true,
  //   showLogical = true,
  //   showDateAndTime = true,
  //   showArray = true,
  //   showOther = true,
  //   defaultInputContent = [],
  //   variables,
  //   isReadOnly = false,
  //   startAdornment,
  //   showSeperatorAfterStartAdornment = true,
  //   onInputContentChanged = () => {},
  //   hideBorders = false,
  //   popperProps = {},
  //   wrapContent = false,
  //   placeholder,
  // } = props;
  return <FormulaBarInput ref={ref} {...props} />;
});
