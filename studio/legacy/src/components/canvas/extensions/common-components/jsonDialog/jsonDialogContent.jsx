import React, { useCallback, useState } from "react";
// import Editor from "oute-ds-json-editor";
// import Button from "oute-ds-button";
import { ODSJsonEditor as Editor, ODSButton as Button } from "@src/module/ods";

const JsonDialogContent = ({ onClose = () => {}, onModify = () => {} }) => {
  const [modifiedData, setModifiedData] = useState(JSON.stringify({}));
  const [isValidJSON, setIsValidJSON] = useState(true);
  const onJSONChangeHandler = (json) => {
    setModifiedData(json);
  };
  const modifyJSONHandler = useCallback(() => {
    onModify(JSON.parse(modifiedData));
  }, [modifiedData, onModify]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "1fr auto",
        gap: "0.5rem",
        height: "500px",
      }}
      data-testid="json-content"
    >
      <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
        <Editor
          json={modifiedData}
          onChangeText={onJSONChangeHandler}
          mode="text"
          isValid={(valid) => setIsValidJSON(valid)}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          label="Cancel"
          variant="text"
          onClick={onClose}
          data-testid={"cancel-json"}
        />
        <Button
          label="Save JSON"
          disabled={!isValidJSON || !modifiedData}
          onClick={modifyJSONHandler}
          data-testid={"save-json"}
        />
      </div>
    </div>
  );
};

export default JsonDialogContent;
