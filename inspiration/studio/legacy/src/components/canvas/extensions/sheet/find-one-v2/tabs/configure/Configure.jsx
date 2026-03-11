import React, { useCallback, useEffect } from "react";
import SheetRecord from "../../../common-components/SheetRecord";
import { FIND_ONE_SHEET_RECORD_TYPE } from "../../../../constants/types";
// import Label from "oute-ds-label";
import { ODSLabel as Label } from "@src/module/ods";
import styles from "../../FindOneRecord.module.css";
import { SHEET_ERRORS } from "../../../../../utils/errorEnums";
import TableLoader from "../../../common-components/tableLoader";

const Configure = (props) => {
  const {
    fields,
    record,
    selectedView,
    onChange,
    variables,
    columnsToShow,
    setValidTabIndices,
    setErrorMessages,
    loading,
  } = props;
  const validateData = useCallback(() => {
    const hasRecords = record?.length > 0;
    const anyChecked = record.some((r) => r?.checked === true);

    const errors = [];

    if (hasRecords && !anyChecked) {
      errors.push(SHEET_ERRORS.SELECT_MIN_ONE_COLUMN);
    }

    setErrorMessages((prev) => ({ ...prev, 1: errors }));
    setValidTabIndices((prev) => {
      if (!errors.length) {
        if (prev.includes(1)) return prev; // if 1 is already in the array, return the array as is
        return [0, 1]; // if 1 is not in the array, reset the array to [0, 1], discarding rest of the indices
      }
      return [0]; // if there are errors in config tab[1], make initialize tab[0] the only valid tab
    });
  }, [record, setErrorMessages, setValidTabIndices]);

  useEffect(() => {
    validateData();
  }, [validateData]);

  if (loading) {
    return <TableLoader />;
  }

  return (
    <div
      style={{
        padding: "1.5rem",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <div className={styles["box"]} data-testid="select-column-note">
        <p className={styles["text"]}>
          <span className={styles["text-bold"]}>Note: </span>
          <Label variant="body2" fontWeight="600" style={{ display: "inline" }}>
            Select the records to be found. Only the selected record will appear
            in the test output. If all records are selected, the output will
            display all records
          </Label>
        </p>
      </div>
      <SheetRecord
        fields={fields}
        record={record}
        view={selectedView}
        onChange={onChange}
        variables={variables}
        type={FIND_ONE_SHEET_RECORD_TYPE}
        columnsToShow={columnsToShow}
      />
    </div>
  );
};

export default Configure;
