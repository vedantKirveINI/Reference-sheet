import React from "react";
import { ODSDialog, ODSButton, ODSTextField } from "@src/module/ods";
import { ViewPort } from "@oute/oute-ds.core.constants";
import { connectionStyles } from "../styles";
const NameDialog = ({
  open,
  onNextClick,
  viewPort,
  connectionName,
  setConnectionName,
  onDiscard,
}) => {
  const getDialogLeftPosition = () => {
    const windowWidth = window.innerWidth;
    const extra = viewPort === ViewPort.MOBILE ? 243 : 400;
    const positionFromLeft = windowWidth / 2 + extra;
    if (positionFromLeft + 486 >= windowWidth) {
      return {
        top: 215,
        right: 70,
      };
    }
    return { top: 215, left: positionFromLeft };
  };

  const dialogCoordinates = getDialogLeftPosition();
  return (
    <ODSDialog
      open={open}
      onClose={onDiscard}
      dialogWidth="400px"
      dialogTitle="Create Connection"
      transition="none"
      data-testid="connection-name-dialog"
      dialogContent={
        <div
          style={{ padding: "1em" }}
          data-testid="connection-name-dialog-content"
        >
          <p style={{ color: "#000", marginTop: "0" }}>Connection Name</p>
          <ODSTextField
            textType="SHORT_TEXT"
            isCreator={false}
            placeholder="Enter the name of connection"
            value={connectionName}
            onChange={(e, value) => {
              setConnectionName(value);
            }}
            autoFocus
            highlightBorderOnFocus
            style={connectionStyles.textFieldStyle}
            data-testid="connection-name-dialog-text-field"
          />
          <div style={connectionStyles.odsButtonStyle}>
            <ODSButton
              label="DISCARD"
              variant="outlined"
              onClick={onDiscard}
              data-testid="connection-name-dialog-discard-button"
            />
            <ODSButton
              label="NEXT"
              onClick={onNextClick}
              data-testid="connection-name-dialog-next-button"
            />
          </div>
        </div>
      }
      showFullscreenIcon={false}
      dialogActions={false}
      removeContentPadding
      dialogCoordinates={dialogCoordinates}
      dialogPosition="coordinates"
    />
  );
};

export default NameDialog;
