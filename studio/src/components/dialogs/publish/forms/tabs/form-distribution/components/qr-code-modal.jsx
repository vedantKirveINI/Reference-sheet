import { ODSLabel, ODSButton, serverConfig } from "@src/module/ods";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import QRCode from "react-qr-code";
import classes from "./qr-code-modal.module.css";

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
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 w-8 h-8 text-white hover:bg-white/20"
        data-testid="form-distribution-share-option-qr-code-modal-close-icon"
      >
        {icons.x && <icons.x className="w-5 h-5" />}
      </Button>

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
          style={{ color: "#fff" }}
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
