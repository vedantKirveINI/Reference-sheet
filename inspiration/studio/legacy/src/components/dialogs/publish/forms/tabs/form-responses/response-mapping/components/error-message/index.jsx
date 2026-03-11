import React, { useMemo } from "react";
// import {
//   validateColumnName,
//   validateColumnValue,
// } from "../../utils/validation";
import classes from "./index.module.css";
import { validateFormResponsesMapping } from "../../../../../utils/formResponses";

const ErrorMessage = ({ mappings, questions, dataTestId }) => {
  const hasErrors = useMemo(() => {
    // const names = mappings.map((row) => row.name.trim());

    // return mappings.some((row, index) => {
    //   const nameError = validateColumnName(row.name, names, index);
    //   const valueError = validateColumnValue(
    //     row.value,
    //     row.columnType,
    //     questions,
    //   );
    //   return nameError || valueError;
    // });

    return validateFormResponsesMapping({ mappings, questions });
  }, [mappings, questions]);

  if (!hasErrors) return null;

  return (
    <div className={classes.container} data-testid={dataTestId}>
      There are some errors in mapping.
    </div>
  );
};

export default ErrorMessage;
