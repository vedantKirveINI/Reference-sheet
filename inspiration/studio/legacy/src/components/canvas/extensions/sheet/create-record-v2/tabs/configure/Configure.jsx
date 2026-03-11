import React, { useEffect } from "react";
import SheetRecordV2Enhanced from "../../../common-components/SheetRecordV2Enhanced";
import TableLoader from "../../../common-components/tableLoader";

const Configure = ({
  orderedSchemaFields,
  record,
  selectedView,
  onRecordFieldChanged,
  variables,
  setValidTabIndices,
  loading,
}) => {
  useEffect(() => {
    setValidTabIndices(orderedSchemaFields.length > 0 ? [0, 1] : []);
  }, [orderedSchemaFields.length, setValidTabIndices]);

  if (loading) {
    return <TableLoader />;
  }

  return (
    <SheetRecordV2Enhanced
      fields={orderedSchemaFields}
      record={record}
      view={selectedView}
      label={
        "Fill the data in the Value column to create the record with the entered data."
      }
      onChange={onRecordFieldChanged}
      variables={variables}
      showFieldTypeHelpers={true}
    />
  );
};

export default Configure;
