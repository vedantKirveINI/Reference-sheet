import React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
// import { ODSButton } from '@src/module/ods';
import { ODSButton } from "../../index.js";
import ODSDialog from "./index.jsx";

export const showConfirmDialog = async ({
  dialogTitle,
  dialogContent,
  dialogProps = {},
  okLabel = "OK",
  cancelLabel = "CANCEL",
  okButtonColor = "primary",
  okButtonVariant = "contained",
  okButtonProps = {},
  cancelButtonColor = "primary",
  cancelButtonVariant = "outlined",
  cancelButtonProps = {},
  dialogWidth = "auto",
  dialogHeight = "auto",
  showCloseIcon = true,
  onOk = () => {},
  onCancel = () => {},
}) => {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    container.id = "ods-confirm-dialog";
    document.body.appendChild(container);
    let portal = null;
    let root = null;
    const unmountSnackbar = () => {
      root.unmount();
      container.remove();
    };
    const unmount = () => {
      unmountSnackbar();
    };
    const confirmDialog = (
      <ODSDialog
        open={true}
        onClose={(e, reason) => {
          if (reason === "escapeKeyDown" || reason === "close-clicked") {
            resolve("close");
            unmount();
          }
        }}
        hideBackdrop={false}
        showFullscreenIcon={false}
        dialogWidth={dialogWidth}
        dialogHeight={dialogHeight}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
        showCloseIcon={showCloseIcon}
        dialogActions={
          <>
            <ODSButton
              variant={cancelButtonVariant}
              color={cancelButtonColor}
              label={cancelLabel}
              onClick={() => {
                onCancel();
                resolve("cancel");
                unmount();
              }}
              data-testid={`${cancelLabel}-id`}
              {...cancelButtonProps}
            />
            <ODSButton
              color={okButtonColor}
              autoFocus
              variant={okButtonVariant}
              label={okLabel}
              onClick={() => {
                unmount();
                onOk();
                resolve("ok");
              }}
              data-testid={`${okLabel}-id`}
              {...okButtonProps}
            />
          </>
        }
        {...dialogProps}
      />
    );
    portal = createPortal(confirmDialog, container);
    root = createRoot(container);
    root.render(portal);
  });
};
