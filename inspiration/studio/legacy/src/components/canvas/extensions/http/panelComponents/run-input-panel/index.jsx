import React, { useCallback, useState } from "react";
// import TextField from "oute-ds-text-field";
// import Button from "oute-ds-button";
import { ODSTextField as TextField, ODSButton as Button } from "@src/module/ods";
import CSSGrid from "../../../common-components/CSSGrid";
const RunInputPanel = ({
  inputData = {},
  onProceed = () => {},
  onCancel = () => {},
}) => {
  const [runInputData, setRunInputData] = useState(inputData);
  const proceedHandler = () => onProceed(runInputData);

  const traverseNodeSchema = useCallback(
    (node, schemaIndices, returnData) => {
      if (node.schema?.length === 0 || !node.schema) {
        returnData.push([
          <TextField
            fullWidth
            readOnly
            hideBorders
            value={node.nodeName}
            sx={{ minWidth: "auto" }}
          />,
          <TextField
            fullWidth
            readOnly
            hideBorders
            value={node.pathStr}
            sx={{ minWidth: "auto" }}
          />,
          <TextField
            fullWidth
            hideBorders
            value={node.sample_value}
            onChange={(e) => {
              let _runInputData = JSON.parse(JSON.stringify(runInputData));
              schemaIndices.reduce((__runInputData, current, index) => {
                if (index !== schemaIndices.length - 1) {
                  if (index === 0) {
                    return __runInputData[node.nodeId].schema[current];
                  }
                  return __runInputData.schema[current];
                } else {
                  if (index === 0) {
                    __runInputData[node.nodeId].schema[current].sample_value =
                      e.target.value;
                  } else {
                    __runInputData.schema[current].sample_value =
                      e.target.value;
                    e.target.value;
                  }
                  setRunInputData({ ..._runInputData });
                }
              }, _runInputData);
            }}
            sx={{ minWidth: "auto" }}
          />,
        ]);
      } else {
        node.schema?.forEach((n, schemaIndex) => {
          traverseNodeSchema(
            { ...n, nodeName: node.nodeName },
            [...schemaIndices, schemaIndex],
            returnData
          );
        });
      }
    },
    [runInputData]
  );
  const createRowData = () => {
    let returnData = [];
    Object.values(runInputData).forEach((d) => {
      traverseNodeSchema(d, [], returnData);
    });
    return returnData;
  };
  const data = createRowData();
  const headers = {
    fields: ["NODE", "KEY", "VALUE"],
    gridTemplateColumns: "auto auto 1fr",
  };
  const actionRow = (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%, alignItems: center",
        gap: "0.5rem",
        justifyContent: "flex-end",
      }}
    >
      <Button
        size="small"
        label="CANCEL"
        variant="outlined"
        onClick={onCancel}
      />
      <Button size="small" label="PROCEED" onClick={proceedHandler} />
    </div>
  );
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        gap: "1rem",
      }}
    >
      <CSSGrid headers={headers} data={data} />
      {actionRow}
    </div>
  );
};

export default RunInputPanel;
