import React from "react";
import { ODSDialog as Dialog, ODSButton } from "@src/module/ods";

function WarningModal({
  warningModal,
  setWarningModal,
  onConfirm,
  variant = "black",
}) {
  const { open, confirmParams } = warningModal || {};
  return (
    <Dialog
      open={open}
      onClose={() => {
        setWarningModal({ open: false });
      }}
      hideBackdrop={false}
      showFullscreenIcon={false}
      dialogWidth="auto"
      dialogHeight="auto"
      dialogTitle="Warning"
      showCloseIcon={true}
      dialogContent={
        <div>
          <h3>Are you sure you want to proceed?</h3>
          <p>
            This action will override the existing structure and you may loose
            the changes made
          </p>
        </div>
      }
      dialogActions={
        <>
          <ODSButton
            variant={variant === "black" ? "black-outlined" : "outlined"}
            color="primary"
            label="No"
            onClick={() => {
              setWarningModal(() => ({
                open: false,
              }));
            }}
          />

          <ODSButton
            autoFocus
            variant={variant}
            label="Yes"
            onClick={() => {
              onConfirm(confirmParams);
            }}
          />
        </>
      }
    />
  );
}

export default WarningModal;
