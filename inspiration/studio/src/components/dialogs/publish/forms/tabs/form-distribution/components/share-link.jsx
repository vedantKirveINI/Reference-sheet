import { useCallback, useState, useRef } from "react";
import { serverConfig, cookieUtils } from "@src/module/ods";
import ShareOption from "../../../components/share-option";
import CopyableTextField from "../../../../components/copyable-text-field";
import {
  localStorageConstants,
  Mode,
} from "../../../../../../../module/constants";
import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";
import { saveAs } from "file-saver";
import { QRCodeModal } from "./qr-code-modal";
import { ViewOption } from "./view-option";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { icons } from "@/components/icons";

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
    const svgContent = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    const svgBlob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          saveAs(blob, "QRCode.jpg");
          URL.revokeObjectURL(url);
        },
        "image/jpeg",
        0.95
      );
    };

    img.src = url;
  };

  return (
    <div className="space-y-5" data-testid="share-link-container">
      {showQRCode && (
        <QRCodeModal
          assetId={assetId}
          mode={selectedView}
          onClose={() => setShowQRCode(false)}
          onDownloadQRCode={downloadQRCode}
          qrCodeRef={qrCodeRef}
        />
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <h4
            className="text-sm font-semibold text-foreground"
            data-testid="select-view-title"
          >
            Select view
          </h4>
          <p
            className="text-xs text-muted-foreground leading-relaxed"
            data-testid="select-view-description"
          >
            Choose how your form appears to users. Each view offers a different experience.
          </p>
        </div>
        
        {/* Educational Alert */}
        <Alert className="bg-muted/50 border-border">
          {icons.info && <icons.info className="h-4 w-4" />}
          <AlertTitle className="text-xs font-semibold">View Types</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            <ul className="space-y-1 mt-1">
              <li><strong>Card:</strong> Visual, modern layout perfect for image-heavy forms</li>
              <li><strong>Classic:</strong> Traditional form layout ideal for data collection</li>
              <li><strong>Chat:</strong> Conversational experience great for engaging users</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div
          className="grid grid-cols-3 gap-2.5"
          data-testid="form-distribution-view-options"
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

      <div className="space-y-3">
        <div className="space-y-1.5">
          <h4
            className="text-sm font-semibold text-foreground"
            data-testid="share-in-title"
          >
            Share in
          </h4>
          <p
            className="text-xs text-muted-foreground leading-relaxed"
            data-testid="share-in-description"
          >
            Share your form directly on social media platforms or download a QR code for offline sharing.
          </p>
        </div>
        
        {/* Educational Card */}
        <Card className="p-3 bg-muted/50 border-border">
          <div className="flex items-start gap-2">
            {icons.share && <icons.share className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground mb-0.5">
                Quick Share Tips
              </p>
              <p className="text-xs text-muted-foreground">
                Use <strong>QR Code</strong> for print materials and events. Share on <strong>social media</strong> to reach your audience directly. Each platform will open with your form link pre-filled.
              </p>
            </div>
          </div>
        </Card>

        <div
          className="grid grid-cols-4 gap-2.5"
          data-testid="form-distribution-share-options-container"
        >
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
            iconColor="#1877F2"
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
            iconColor="#0A66C2"
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
