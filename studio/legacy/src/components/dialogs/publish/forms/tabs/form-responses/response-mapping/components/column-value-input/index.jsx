import React, { useMemo } from "react";
import { COLUMN_TYPES } from "../../constants";
import classes from "./index.module.css";
// import ODSAutocomplete from "oute-ds-autocomplete";
import { ODSAutocomplete } from "@src/module/ods";

const ColumnValueInput = ({
  value,
  columnType,
  questions,
  onChange,
  dataTestId,
}) => {
  const questionValue = useMemo(
    () => questions?.find((question) => question.key === value),
    [questions, value],
  );

  if (columnType === COLUMN_TYPES.QUESTION) {
    return (
      <div className={classes.container}>
        <ODSAutocomplete
          variant="black"
          data-testid={`${dataTestId}-question`}
          value={questionValue ?? null}
          onChange={(e, value) => {
            onChange(value);
          }}
          sx={{
            ".MuiAutocomplete-inputRoot": {
              background: "transparent", // to match hover state bg color
            },
          }}
          hideBorders={true}
          options={questions}
          renderOption={(props, option) => {
            const { key, ...rest } = props;

            return (
              <li
                {...rest}
                key={key}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {option.question || ""}
              </li>
            );
          }}
          getOptionLabel={(question) => question?.question}
          isOptionEqualToValue={(option, _value) => option?.key === _value?.key}
        />
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter static value"
        className={classes.input}
        data-testid={`${dataTestId}-static`}
      />
    </div>
  );
};

export default ColumnValueInput;
