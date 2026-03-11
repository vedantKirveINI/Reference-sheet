import React, { useEffect } from "react";
import SheetRecordV2Enhanced from "../../../common-components/SheetRecordV2Enhanced";
import TableLoader from "../../../common-components/tableLoader";

const Configure = ({
  fields,
  record,
  view,
  onChange,
  variables,
  enableCheckbox,
  setValidTabIndices,
  loading,
}) => {
  useEffect(() => {
    setValidTabIndices((prev) => {
      if (fields.length > 0) {
        if (prev.includes(1)) return prev;
        return [0, 1];
      }
      return [];
    });
  }, [fields.length, setValidTabIndices]);

  if (loading) {
    return <TableLoader />;
  }

  return (
    <SheetRecordV2Enhanced
      fields={fields}
      record={record}
      view={view}
      label={
        "Select the record you want to update, then fill in the data in the Value column for the selected fields."
      }
      onChange={onChange}
      variables={variables}
      enableCheckbox={enableCheckbox}
      showFieldTypeHelpers={true}
    />
  );
};

export default Configure;
