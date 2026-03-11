import { useCallback, useEffect } from "react";
import DBRecord from "../../../common-components/DBRecord";
import { DB_CONNECTION_ERRORS } from "../../../../../utils/errorEnums";

const Configure = ({
  schemaFields,
  record,
  table,
  onRecordFieldChanged,
  variables,
  setValidTabIndices,
  setErrorMessages,
}) => {
  const validateData = useCallback(() => {
    const errors = [];

    const hasMissingRequired = record?.some(
      (r) => r?.required && (!r.value?.blocks || r?.value?.blocks?.length === 0)
    );

    if (hasMissingRequired) {
      errors.push(DB_CONNECTION_ERRORS.MISSING_REQUIRED_FIELD);
    }

    setErrorMessages((prev) => ({ ...prev, 1: errors }));
    setValidTabIndices(errors.length === 0 ? [0, 1] : []);
  }, [record, setErrorMessages, setValidTabIndices]);

  useEffect(() => {
    validateData();
  }, [validateData]);

  return (
    <DBRecord
      fields={schemaFields}
      record={record}
      table={table}
      onChange={onRecordFieldChanged}
      variables={variables}
      columnsToShow={["key", "type", "required", "value"]}
    />
  );
};

export default Configure;
