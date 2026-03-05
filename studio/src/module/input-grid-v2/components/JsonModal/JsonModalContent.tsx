import React from "react";
import { ODSGrid } from "@src/module/ods";

const overrideColDef = [
  { field: "key", headerName: "Key" },
  { field: "prevType", headerName: "Previous Type" },
  { field: "newType", headerName: "New Type" },
];

function Note(props) {
  return (
    <div
      style={{
        fontSize: 14,
        color: "var(--error)",
        margin: "0.5rem 0 ",
      }}
    >
      {props.children}
    </div>
  );
}

function JsonModalContent({ payload }) {
  const {
    compareJSONResult = {},
    inputJson,
    isDifferentDatatype,
  } = payload || {};

  const { changedTypeKeys = [], newKeys = [] } = compareJSONResult || {};

  const isJsonArray = Array.isArray(inputJson);

  if (isDifferentDatatype) {
    return (
      <div>
        <h3>Are you sure you want to proceed?</h3>
      </div>
    );
  }

  if (isJsonArray) {
    return (
      <div>
        <h3>Are you sure you want to proceed?</h3>
        <Note>
          Note: To replace the entire table with the imported JSON, please
          select "Override JSON".
          <br />
          Note: Please select "Append To JSON" to insert in to the existing
          table.
        </Note>
      </div>
    );
  }

  return (
    <>
      {changedTypeKeys?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            The data type of the following key(s) has been changed.
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--error)",
              margin: "0.5rem 0 ",
            }}
          >
            Note: This may cause unexpected behavior. Please select "Override
            JSON" to replace the existing table.
          </div>
          <ODSGrid
            rowData={compareJSONResult.changedTypeKeys}
            columnDefs={overrideColDef}
            onGridReady={(params) => {
              params.api.sizeColumnsToFit();
            }}
          />
        </div>
      )}
      {newKeys?.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            The following new key(s) were detected.
          </div>
          <Note>
            Note: Please select "Append To JSON" to insert the below keys to the
            existing table.
          </Note>
          <ODSGrid
            rowData={compareJSONResult.newKeys}
            onGridReady={(params) => {
              params.api.sizeColumnsToFit();
            }}
            columnDefs={[
              {
                headerName: "New Keys",
                valueGetter: (node) => node.data,
              },
            ]}
          />
        </div>
      )}
      <Note>
        Note: To replace the entire table with the imported JSON, please select
        "Override JSON".
      </Note>
    </>
  );
}

export default JsonModalContent;
