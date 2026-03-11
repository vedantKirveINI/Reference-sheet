import React, {
  forwardRef,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import classes from "./ExecuteQuery.module.css";
import Label from "oute-ds-label";
import { connectionSDKServices } from "./../../../services/dbConnectionSDKServices";
import DBConnectionsAutocomplete from "../common-components/DBConnectionsAutocomplete";
import { EXECUTE_TYPE } from "../../constants/types";

import TextField from "oute-ds-text-field";
import { FormulaBar } from "oute-ds-formula-bar";
const ExecuteQuery = forwardRef(({ data, parentId, variables }, ref) => {
  const [fxContent, setFxContent] = useState(data?.content);
  const [nodeLabel, setNodeLabel] = useState(data?.label || EXECUTE_TYPE);
  const [connections, setConnections] = useState([]);
  const [connection, setConnection] = useState(data?.connection || null);

  const getConnections = async (parentId) => {
    const response = await connectionSDKServices.getByParent({
      parent_id: parentId,
    });
    if (response?.status === "success") {
      setConnections(response?.result || []);
    }
  };

  useImperativeHandle(ref, () => {
    return {
      getData: () => {
        return {
          connection,
          label: nodeLabel,
          content: fxContent,
        }; //Execute data to be returned from here
      },
    };
  }, [connection, fxContent, nodeLabel]);

  useEffect(() => {
    if (parentId) {
      getConnections(parentId);
    }
  }, [parentId]);

  return (
    <div className={classes["execute-container"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}>
        <Label variant="h6" fontWeight="600">
          Label
        </Label>
        <TextField
          fullWidth
          placeholder="Enter Node Label"
          className="black"
          value={nodeLabel}
          onChange={(e) => setNodeLabel(e.target.value)}
        />
      </div>

      <DBConnectionsAutocomplete
        connections={connections}
        onChange={(_, connection) => setConnection(connection)}
        connection={connection}
      />
      <FormulaBar
        variables={variables}
        wrapContent
        placeholder="e.g. Variable 1 = 12345"
        defaultInputContent={fxContent?.blocks || []}
        onInputContentChanged={(blocks) => setFxContent({ type: "fx", blocks })}
      />
    </div>
  );
});

export default ExecuteQuery;
