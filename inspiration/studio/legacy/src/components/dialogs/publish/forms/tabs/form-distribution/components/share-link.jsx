import { useCallback, useState, useRef } from "react";
// import ODSLabel from "oute-ds-label";
import { ODSLabel, serverConfig, cookieUtils } from "@src/module/ods";
import classes from "./share-link.module.css";
import ShareOption from "../../../components/share-option";
import CopyableTextField from "../../../../components/copyable-text-field";
import {
  localStorageConstants,
  Mode,
} from "../../../../../../../module/constants";
// import { serverConfig } from "oute-ds-utils";
import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";
import { saveAs } from "file-saver";
import { QRCodeModal } from "./qr-code-modal";
import { ViewOption } from "./view-option";
// import { cookieUtils } from "oute-ds-utils";

const getViewSuffixForShare = (view) => {
  if (view === Mode.CARD) {
    return "";
  }
  if (view === Mode.CHAT) {
    return "/c";
  }
  if (view === Mode.CLASSIC) {
    return "/classic";
  }
};
export const ShareLink = ({ assetId, isPublished, onAnalyticsEvent }) => {
  const [selectedView, setSelectedView] = useState(
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_MODE) ||
      Mode.CARD
  );
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef(null);
  const BASE_FORM_URL = process.env.REACT_APP_FORM_URL;
  const viewSuffixForShare = getViewSuffixForShare(selectedView);
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${BASE_FORM_URL}/${assetId}${viewSuffixForShare}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${BASE_FORM_URL}/${assetId}${viewSuffixForShare}`;
  const xHref = `https://x.com/intent/post?url=${BASE_FORM_URL}/${assetId}${viewSuffixForShare}`;

  const getURLtoDisplay = useCallback(() => {
    if (!isPublished) {
      return "Will be available after the form is published.";
    }
    const baseUrl = `${serverConfig.FORM_URL}/${assetId}`;

    if (selectedView === Mode.CARD) {
      return baseUrl;
    }

    if (selectedView === Mode.CLASSIC) {
      return `${baseUrl}/cl`;
    }

    if (selectedView === Mode.CHAT) {
      return `${baseUrl}/c`;
    }
  }, [isPublished, assetId, selectedView]);

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const downloadQRCode = () => {
    const svgElement = qrCodeRef.current;

    // Serialize the SVG to a string
    const svgContent = new XMLSerializer().serializeToString(svgElement);

    // Create an image from the SVG
    const img = new Image();
    const svgBlob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Create a canvas and draw the SVG image onto it
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert canvas to JPG
      canvas.toBlob(
        (blob) => {
          saveAs(blob, "QRCode.jpg"); // download as JPG
          URL.revokeObjectURL(url);
        },
        "image/jpeg",
        0.95
      );
    };

    img.src = url;
  };

  return (
    <div className={classes.container} data-testid="share-link-container">
      {showQRCode && (
        <QRCodeModal
          assetId={assetId}
          mode={selectedView}
          onClose={() => setShowQRCode(false)}
          onDownloadQRCode={downloadQRCode}
          qrCodeRef={qrCodeRef}
        />
      )}

      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <ODSLabel
            variant="body1"
            data-testid="select-view-title"
            className={classes.sectionTitle}
          >
            Select view
          </ODSLabel>
          <ODSLabel
            variant="body2"
            data-testid="select-view-description"
            className={classes.sectionDescription}
          >
            Please choose the view in which you would like the form to be
            shared.
          </ODSLabel>
        </div>

        <div
          data-testid="form-distribution-view-options"
          className={classes.viewOptions}
        >
          <ViewOption
            mode={Mode.CARD}
            isSelected={selectedView === Mode.CARD}
            isPublished={isPublished}
            onViewChange={handleViewChange}
          />
          <ViewOption
            mode={Mode.CLASSIC}
            isSelected={selectedView === Mode.CLASSIC}
            isPublished={isPublished}
            onViewChange={handleViewChange}
          />
          <ViewOption
            mode={Mode.CHAT}
            isSelected={selectedView === Mode.CHAT}
            isPublished={isPublished}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      <CopyableTextField
        title="Web URL to share"
        value={getURLtoDisplay()}
        isEnabled={isPublished}
        dataTestId="form-web-url-to-share"
      />

      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <ODSLabel
            variant="body1"
            data-testid="share-in-title"
            className={classes.sectionTitle}
          >
            Share in
          </ODSLabel>
          <ODSLabel
            variant="body2"
            data-testid="share-in-description"
            className={classes.sectionDescription}
          >
            Share the form directly by posting it to the social media platforms.
          </ODSLabel>
        </div>

        <div
          data-testid="form-distribution-share-options-container"
          className={classes.shareOptions}
        >
          {/* <ShareOption
            iconName={"WCEmailIcon"}
            label="Send Email"
            onClick={() => {
              console.log("Send Email clicked");
            }}
            disabled={!isPublished}
          /> */}
          <ShareOption
            iconName={"QRCodeIcon"}
            iconColor="#263238"
            label="Share QR"
            onClick={() => {
              onAnalyticsEvent(UATU_CANVAS, {
                subEvent: UATU_PREDICATE_EVENTS_CANVAS.QR_SHARE,
              });
              setShowQRCode(true);
            }}
            disabled={!isPublished}
            dataTestId="form-distribution-share-option-qr-code"
          />
          <ShareOption
            iconName={"FacebookIcon"}
            iconColor="#2196F3"
            label="Facebook"
            onClick={() => {
              onAnalyticsEvent(UATU_CANVAS, {
                subEvent: UATU_PREDICATE_EVENTS_CANVAS.FACEBOOK_SHARE,
              });
              window.open(facebookHref, "_blank");
            }}
            disabled={!isPublished}
            dataTestId="form-distribution-share-option-facebook"
          />
          <ShareOption
            iconName={"LinkedInIcon"}
            iconColor="#1565C0"
            label="LinkedIn"
            onClick={() => {
              onAnalyticsEvent(UATU_CANVAS, {
                subEvent: UATU_PREDICATE_EVENTS_CANVAS.LINKEDIN_SHARE,
              });
              window.open(linkedinHref, "_blank");
            }}
            disabled={!isPublished}
            dataTestId="form-distribution-share-option-linkedin"
          />
          <ShareOption
            iconName={"TwitterIcon"}
            iconColor="#000000"
            label="Twitter"
            onClick={() => {
              onAnalyticsEvent(UATU_CANVAS, {
                subEvent: UATU_PREDICATE_EVENTS_CANVAS.X_SHARE,
              });
              window.open(xHref, "_blank");
            }}
            disabled={!isPublished}
            dataTestId="form-distribution-share-option-twitter"
          />
        </div>
      </div>
    </div>
  );
};
