import React, { useEffect } from "react";
import SheetFilter from "../../../common-components/SheetFilter";
import SheetFilterPlaceholder from "../../../common-components/SheetFilterPlaceholder";
// import Label from "oute-ds-label";
import { ODSLabel as Label } from "@src/module/ods";
import styles from "../../DeleteRecord.module.css";
import TableLoader from "../../../common-components/tableLoader";

const Configure = ({
  schemaFields,
  filter,
  variables,
  setFilter,
  setWhereClause,
  setIsSingleUpdate,
  isSingleUpdate,
  setValidTabIndices,
  loading,
}) => {
  useEffect(() => {
    setValidTabIndices(schemaFields.length > 0 ? [0, 1] : []);
  }, [schemaFields.length, setValidTabIndices]);

  if (loading) {
    return <TableLoader columns={1} />;
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        overflowY: "auto",
        padding: "1.5rem",
      }}
    >
      <div className={styles["box"]} data-testid="refine-data-note">
        <p className={styles["text"]}>
          <span className={styles["text-bold"]}>Note: </span>{" "}
          <Label variant="body2" fontWeight="600" style={{ display: "inline" }}>
            Filters must be applied to specify which records to delete. Set
            conditions (e.g., equals, contains) to ensure only matching records
            are removed. If no filter is applied, a random record will be
            deleted.
          </Label>
        </p>
      </div>
      {schemaFields?.length > 0 ? (
        <SheetFilter
          schema={schemaFields}
          filter={filter}
          showFilterSwitch={true}
          variables={variables}
          onChange={(updateFilterVal, whereClauseStr) => {
            setFilter(updateFilterVal);
            setWhereClause(whereClauseStr);
          }}
          setIsSingleUpdate={setIsSingleUpdate}
          isSingleUpdate={isSingleUpdate}
        />
      ) : (
        <SheetFilterPlaceholder />
      )}
    </div>
  );
};

export default Configure;
