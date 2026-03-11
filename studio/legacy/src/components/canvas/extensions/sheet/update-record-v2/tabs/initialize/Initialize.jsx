import React, { useCallback, useEffect } from "react";
import SheetsAutocomplete from "../../../common-components/SheetsAutocomplete";
import SubSheetsAutocomplete from "../../../common-components/SubSheetsAutocomplete";
// import ViewsAutocomplete from "../../../common-components/ViewsAutocomplete";
import classes from "../../UpdateRecord.module.css";
import { SHEET_ERRORS } from "../../../../../utils/errorEnums";
const Initialize = ({
  sheets,
  subSheets,
  // views,
  sheet,
  subSheet,
  // selectedView,
  onSheetChange,
  onSubSheetChange,
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
        return [0]; // if 0 is not in the array, reset the array to [0] dicarding rest of the indices
      }

      return []; // if there are errors, reset the array to []
    });
  }, [setErrorMessages, setValidTabIndices, sheet, subSheet]);

  useEffect(() => {
    validateData();
  }, [validateData]);

  return (
    <div className={classes["input-container"]}>
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
