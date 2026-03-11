// import ODSLabel from "oute-ds-label";
// import ODSIcon from "oute-ds-icon";
// import ODSButton from "oute-ds-button";
import { ODSLabel, ODSIcon, ODSButton, serverConfig } from "@src/module/ods";
import QRCode from "react-qr-code";
import classes from "./qr-code-modal.module.css";
// import { serverConfig } from "oute-ds-utils";

export const QRCodeModal = ({
  assetId,
  mode,
  onClose,
  onDownloadQRCode,
  qrCodeRef,
}) => {
  return (
    <div
      className={classes.qrCodeModal}
      data-testid="form-distribution-share-option-qr-code-modal"
    >
      <ODSIcon
        outeIconName="OUTECloseIcon"
        outeIconProps={{
          sx: {
            color: "#fff",
            height: "2.5rem",
            width: "2.5rem",
          },
        }}
        onClick={onClose}
        buttonProps={{
          "data-testid":
            "form-distribution-share-option-qr-code-modal-close-icon",
          sx: {
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            width: "2rem",
            height: "2rem",
          },
        }}
      />

      <QRCode
        ref={qrCodeRef}
        value={`${serverConfig.FORM_URL}/${assetId}/${mode}`}
        style={{ width: "15.625rem", height: "15.625rem" }}
        bgColor="transparent"
        fgColor="#fff"
      />
      <div className={classes["qr-code-content"]}>
        <ODSLabel
          variant="body1"
          children="Scan the code to launch your Tiny Form. Works online and offline (though you’ll need a printer, obviously)."
          data-testid="qr-code-title"
          sx={{ color: "#fff" }}
        />
        <ODSButton
          variant="black"
          label="Download QR Code"
          onClick={onDownloadQRCode}
        />
      </div>
    </div>
  );
};
