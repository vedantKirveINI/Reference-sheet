import React, { useCallback, useState } from "react";
// import ODSButton from "oute-ds-button";
// import ODSLabel from "oute-ds-label";
// import TextField from "oute-ds-text-field";
// import ODSCheckbox from "oute-ds-checkbox";
import { ODSButton, ODSLabel, ODSTextField as TextField, ODSCheckbox } from "@src/module/ods";
import classes from "./InputParameters.module.css";

const InputParameters = ({
  rowData = [],
  onProceed = () => {},
  onCancel = () => {},
}) => {
  const [inputParamsData, setInputParamsData] = useState(rowData);

  const proceedHandler = useCallback(() => {
    onProceed(inputParamsData);
  }, [inputParamsData, onProceed]);

  // Function to replace the value with the default when a checkbox is checked
  const updateValuesWithDefault = useCallback(() => {
    const updatedData = inputParamsData.map((data) => {
      return {
        ...data,
        value: data.default,
      };
    });
    setInputParamsData(updatedData);
  }, [inputParamsData]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        justifyContent: "center",
      }}
    >
      <ODSLabel variant="h6">
        Provide the value to the input parameters
      </ODSLabel>
      <ODSCheckbox
        labelText="Use Default Values"
        labelProps={{ variant: "subtitle1" }}
        onChange={(e) => {
          /* The code `if (e.target.checked) { updateValuesWithDefault(); }` is checking if the checkbox
         is checked. If it is checked, it calls the `updateValuesWithDefault` function. This
         function loops through all the row nodes in the grid and updates the `value` field with the
         corresponding `default` value. It then commits the updated data to the row node.
         Essentially, it replaces the value with the default when the checkbox is checked. */
          if (e.target.checked) {
            updateValuesWithDefault();
          }
        }}
      />
      <div
        style={{
          maxHeight: "400px",
          overflow: "auto",
        }}
      >
        {inputParamsData?.length === 0 && <div>No Rows</div>}
        {inputParamsData?.length > 0 && (
          <div className={classes["input-params-grid"]}>
            <div className={classes["grid-header"]}>LOCATION</div>
            <div className={classes["grid-header"]}>KEY</div>
            <div className={classes["grid-header"]}>VALUE</div>
            {inputParamsData.map((p, idx) => {
              return (
                <React.Fragment key={`input_params_${idx}`}>
                  <ODSLabel variant="subtitle1">{p.location}</ODSLabel>
                  <ODSLabel variant="subtitle1">{p.key}</ODSLabel>
                  {p.type !== "data" ? (
                    <ODSLabel variant="subtitle1">{p.value}</ODSLabel>
                  ) : (
                    <TextField
                      value={p.value}
                      onChange={(e) => {
                        setInputParamsData((prev) => {
                          // Use a functional update to modify the state based on the previous state (prev)
                          return prev.map((item, i) => {
                            // Iterate over each item in the previous array
                            if (i === idx) {
                              // Check if the current index (i) matches the specified index (idx)
                              // If it matches, update the item
                              return { ...item, value: e.target.value };
                            } else {
                              // If it doesn't match, keep the item unchanged
                              return item;
                            }
                          });
                        });
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
        }}
      >
        <ODSButton
          size="small"
          label="CANCEL"
          variant="outlined"
          sx={{
            height: "40px",
          }}
          onClick={() => {
            onCancel();
          }}
        />
        <ODSButton
          size="small"
          label="PROCEED"
          sx={{
            height: "40px",
          }}
          onClick={proceedHandler}
        />
      </div>
    </div>
  );
};

export default InputParameters;
