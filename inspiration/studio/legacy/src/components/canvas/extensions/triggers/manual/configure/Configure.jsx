import React, { useState } from "react";
import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";
// import Button from "oute-ds-button";
// import ODSIcon from "oute-ds-icon";
// import ODSDialog from "oute-ds-dialog";
import { ODSButton as Button, ODSIcon, ODSDialog } from "@src/module/ods";
import classes from "../StartNode.module.css";
import JsonDialogContent from "../../../common-components/jsonDialog/jsonDialogContent";

const Configure = ({ inputGridRef, variables, data }) => {
  const [showJSONDialog, setShowJSONDialog] = useState(false);
  const modifyHandler = (data) => {
    inputGridRef?.current?.setJsonData(data);
    setShowJSONDialog(false);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "1rem",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
        gap: "1rem",
      }}
    >
      <Button
        label="IMPORT JSON"
        variant="black"
        onClick={() => {
          setShowJSONDialog(true);
        }}
        data-testid={"import-json"}
      />
      <div style={{ overflow: "auto" }}>
        <InputGridV2
          ref={inputGridRef}
          variables={variables}
          initialValue={data}
          hideHeaderAndMap
          showNote={false}
        />
      </div>
      <ODSDialog
        open={showJSONDialog}
        onClose={() => setShowJSONDialog(false)}
        showFullscreenIcon={false}
        hideBackdrop={false}
        dividers={true}
        draggable={false}
        dialogWidth="800px"
        dialogTitle={
          <div className={classes["dialog-title"]}>
            <ODSIcon outeIconName="OUTEInfoIcon" />
            Import Json
          </div>
        }
        dialogContent={
          <JsonDialogContent
            onClose={() => setShowJSONDialog(false)}
            onModify={modifyHandler}
          />
        }
      />
    </div>
  );
};

export default Configure;
