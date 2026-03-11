import React, { useCallback, useState } from "react";
// import Editor from "oute-ds-json-editor";
// import Button from "oute-ds-button";
import { ODSJsonEditor as Editor, ODSButton as Button } from "@src/module/ods";

const JsonEditorContent = ({
  data = {},
  onClose = () => {},
  onModify = () => {},
}) => {
  const [modifiedData, setModifiedData] = useState(JSON.stringify(data));
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
        width: "800px",
      }}
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
        <Button label="Cancel" variant="text" onClick={onClose} />
        <Button
          label="Modify"
          disabled={!isValidJSON || !modifiedData}
          onClick={modifyJSONHandler}
        />
      </div>
    </div>
  );
};

export default JsonEditorContent;
