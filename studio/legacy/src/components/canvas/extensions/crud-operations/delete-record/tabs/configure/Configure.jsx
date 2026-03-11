import React, { useEffect } from "react";
import DBFilter from "../../../common-components/DBFilter";
import DBFilterPlaceholder from "../../../common-components/DBFilterPlaceholder";

const Configure = ({
  schemaFields,
  filter,
  variables,
  setFilter,
  setWhereClause,
  setValidTabIndices,
}) => {
  useEffect(() => {
    setValidTabIndices(schemaFields.length > 0 ? [0, 1] : [0]);
  }, [schemaFields.length, setValidTabIndices]);

  return (
    <div
      style={{
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
      }}
    >
      {schemaFields?.length > 0 ? (
        <DBFilter
          schema={schemaFields}
          filter={filter}
          variables={variables}
          onChange={(updateFilterVal, whereClauseStr) => {
            setFilter(updateFilterVal);
            setWhereClause(whereClauseStr);
          }}
        />
      ) : (
        <DBFilterPlaceholder />
      )}
    </div>
  );
};

export default Configure;
