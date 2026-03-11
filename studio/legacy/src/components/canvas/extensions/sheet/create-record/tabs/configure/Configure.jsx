import React from "react";
import SheetRecord from "../../../common-components/SheetRecord";
import { CREATE_SHEET_RECORD_TYPE } from "../../../../constants/types";

const Configure = ({
  orderedSchemaFields,
  record,
  selectedView,
  onRecordFieldChanged,
  variables,
  columnsToShow,
}) => {
  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <SheetRecord
        fields={orderedSchemaFields}
        record={record}
        view={selectedView}
        onChange={onRecordFieldChanged}
        variables={variables}
        columnsToShow={columnsToShow}
        type={CREATE_SHEET_RECORD_TYPE}
      />
    </div>
  );
};

export default Configure;
