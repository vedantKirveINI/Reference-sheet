import React, { useCallback, useEffect } from "react";
// import TextField from "oute-ds-text-field";
// import Label from "oute-ds-label";
import classes from "../../CreateRecord.module.css";
import SheetsAutocomplete from "../../../common-components/SheetsAutocomplete";
import SubSheetsAutocomplete from "../../../common-components/SubSheetsAutocomplete";
// import ViewsAutocomplete from "../../../common-components/ViewsAutocomplete";
import { SHEET_ERRORS } from "../../../../../utils/errorEnums";

const Initialize = ({
  // nodeLabel,
  // setNodeLabel,
  sheets,
  onSheetChange,
  sheet,
  subSheets,
  onSubSheetChange,
  subSheet,
  // selectedView,
  // views,
  // onViewChange,
  setValidTabIndices,
  setErrorMessages,
  getSheetList,
  createSheet,
}) => {
  const validateData = useCallback(() => {
    const errors = [];
    if (!sheet) errors.push(SHEET_ERRORS.SHEET_MISSING);
    if (!subSheet) errors.push(SHEET_ERRORS.TABLE_MISSING);
    // if (!selectedView) errors.push(SHEET_ERRORS.VIEW_MISSING);

    setErrorMessages((prev) => ({ ...prev, 0: errors }));

    setValidTabIndices((prev) => {
      if (errors.length === 0) {
        if (prev.includes(0)) return prev; // if 0 is already in the array, return the array as is
        return [0]; // if 0 is not in the array, reset the array to [0], discarding rest of the indices
      }
      return []; // if there are errors, reset the array to []
    });
  }, [setErrorMessages, setValidTabIndices, sheet, subSheet]);

  useEffect(() => {
    validateData();
  }, [validateData]);

  return (
    <div className={classes["input-container"]}>
      {/* <div>
        <Label variant="h6" fontWeight="600">
          Select Label
        </Label>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}
        >
          <Label variant="subtitle1" color="#607D8B">
            Modify the node label by entering a new name in the input field.
          </Label>

          <TextField
            fullWidth
            placeholder="Enter Node Label"
            value={nodeLabel}
            className="black"
            data-testid="create-record-label-input"
            onChange={(e) => setNodeLabel(e.target.value)}
          />
        </div>
      </div> */}
      <SheetsAutocomplete
        label="Select sheet"
        description="Select the sheet where you want to monitor the records."
        sheets={sheets}
        onChange={onSheetChange}
        sheet={sheet}
        getSheetList={getSheetList}
        createSheet={createSheet}
      />

      <SubSheetsAutocomplete
        label="Select table"
        description="Select the table in the sheet where you want to monitor the records."
        subSheets={subSheets}
        onChange={onSubSheetChange}
        table={subSheet}
        disabled={!sheet}
        searchable={true}
      />
      {/* <ViewsAutocomplete
        label="Select view"
        description="Select the view of the sheet."
        view={selectedView}
        views={views}
        onChange={onViewChange}
        disabled={!sheet || !subSheet}
        searchable={true}
      /> */}
    </div>
  );
};

export default Initialize;
