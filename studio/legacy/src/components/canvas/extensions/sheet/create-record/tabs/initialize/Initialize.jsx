import React, { useCallback, useEffect } from "react";
// import Label from "oute-ds-label";
// import TextField from "oute-ds-text-field";
import { ODSLabel as Label, ODSTextField as TextField } from "@src/module/ods";
import classes from "../../CreateRecord.module.css";
import SheetsAutocomplete from "../../../common-components/SheetsAutocomplete";
import SubSheetsAutocomplete from "../../../common-components/SubSheetsAutocomplete";
import ViewsAutocomplete from "../../../common-components/ViewsAutocomplete";
import { SHEET_ERRORS } from "../../../../../utils/errorEnums";

const Initialize = ({
  nodeLabel,
  setNodeLabel,
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
      <div>
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
            onChange={(e) => setNodeLabel(e.target.value)}
          />
        </div>
      </div>
      <SheetsAutocomplete
        sheets={sheets}
        label="Select sheet"
        description="Select the sheet where you want to monitor the records."
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
        view={selectedView}
        label="Select view"
        description="Select the view of the sheet"
        views={views}
        onChange={onViewChange}
        disabled={!sheet}
        searchable={true}
      />
    </div>
  );
};

export default Initialize;
