import React from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import ODSAlert from ".";

export const showAlert = ({ message, ...props }) => {
  if (document.getElementById("ods-alert")) {
    document.getElementById("ods-alert").remove();
  }
  const container = document.createElement("div");
  container.id = "ods-alert";
  container.setAttribute("data-testid", "ods-alert");
  document.body.appendChild(container);
  let portal = null;
  let root = null;
  const unmountSnackbar = () => {
    root.unmount();
    container?.remove();
  };
  const handleClose = () => {
    unmountSnackbar();
  };
  const snackbar = (
    <ODSAlert open={true} onClose={handleClose} {...props}>
      {message}
    </ODSAlert>
  );
  portal = createPortal(snackbar, container);
  root = createRoot(container);
  root.render(portal);
};
