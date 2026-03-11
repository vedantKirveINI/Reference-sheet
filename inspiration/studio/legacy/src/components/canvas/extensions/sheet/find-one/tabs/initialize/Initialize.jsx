import React, { useCallback, useEffect } from "react";
import classes from "../../FindOneRecord.module.css";
import SheetsAutocomplete from "../../../common-components/SheetsAutocomplete";
import SubSheetsAutocomplete from "../../../common-components/SubSheetsAutocomplete";
import ViewsAutocomplete from "../../../common-components/ViewsAutocomplete";
import { SHEET_ERRORS } from "../../../../../utils/errorEnums";

const Initialize = ({
  sheets,
  onSheetChange,
  sheet,
  subSheets,
  onSubSheetChange,
  subSheet,
  selectedView,
  views,
  onViewChange,
  setValidTabIndices,
  setErrorMessages,
}) => {
  const validateData = useCallback(() => {
    const errors = [];
    if (!sheet) errors.push(SHEET_ERRORS.SHEET_MISSING);
    if (!subSheet) errors.push(SHEET_ERRORS.TABLE_MISSING);
    if (!selectedView) errors.push(SHEET_ERRORS.VIEW_MISSING);
    setErrorMessages((prev) => ({ ...prev, 0: errors }));
    setValidTabIndices(errors.length === 0 ? [0, 1] : []);
  }, [selectedView, setErrorMessages, setValidTabIndices, sheet, subSheet]);

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
      <ViewsAutocomplete
        label="Select view"
        description="Select the view of the sheet."
        view={selectedView}
        views={views}
        onChange={onViewChange}
        disabled={!sheet}
        searchable={true}
      />
    </div>
  );
};

export default Initialize;
