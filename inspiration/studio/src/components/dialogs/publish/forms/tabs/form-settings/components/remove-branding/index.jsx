import { useState, useRef, useCallback } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { icons } from "@/components/icons";
import InfoLabel from "./info-label";
import { REDIRECT_PATHS } from "../../../../../../../../pages/ic-canvas/constants/constants";
import storageSDKServices from "../../../../../../../../sdk-services/storage-sdk-services";
import { cn } from "@/lib/utils";

const LOGO_MAX_SIZE_MB = 2;
const LOGO_ALLOWED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "image/webp",
  "image/gif",
];

const RemoveBranding = ({
  settings,
  onSettingsChange,
  isPremiumUser,
  hideBrandingToogle,
}) => {
  console.log(isPremiumUser, "isPremiumUser");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > LOGO_MAX_SIZE_MB) {
      return `File size exceeds ${LOGO_MAX_SIZE_MB}MB. Please upload a smaller file.`;
    }

    if (!LOGO_ALLOWED_FORMATS.includes(file.type)) {
      const formats = LOGO_ALLOWED_FORMATS.map((f) =>
        f.split("/")[1].toUpperCase(),
      ).join(", ");
      return `Invalid file format. Only ${formats} are allowed.`;
    }

    return null;
  }, []);

  const handleFileUpload = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setLogoError("");

      const validationError = validateFile(file);
      if (validationError) {
        setLogoError(validationError);
        event.target.value = "";
        return;
      }

      setUploadingLogo(true);

      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          const fileBlob = new Blob([arrayBuffer], { type: file.type });

          const body = {
            fileName: file.name,
            fileType: file.type,
            file_obj: fileBlob,
          };

          try {
            const response = await storageSDKServices.uploadFile(body);

            if (response?.status === "success") {
              onSettingsChange({
                custom_logo: {
                  url: response.result.cdn,
                  fileName: file.name,
                  fileType: file.type,
                  filePath: response.result.filePath,
                },
              });
            } else {
              throw new Error("Upload failed");
            }
          } catch {
            setLogoError("Failed to upload logo. Please try again.");
          } finally {
            setUploadingLogo(false);
            event.target.value = "";
          }
        };

        reader.onerror = () => {
          setLogoError("Failed to read file. Please try again.");
          setUploadingLogo(false);
          event.target.value = "";
        };

        reader.readAsArrayBuffer(file);
      } catch {
        setLogoError("An error occurred. Please try again.");
        setUploadingLogo(false);
        event.target.value = "";
      }
    },
    [onSettingsChange, validateFile],
  );

  const handleRemoveLogo = useCallback(() => {
    onSettingsChange({
      custom_logo: null,
    });
  }, [onSettingsChange]);

  return (
    <div className="flex flex-col w-full space-y-4">
      <Alert className="bg-muted/50 border-border flex items-start gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
        {icons.settings && (
          <icons.settings className="h-4 w-4 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold">
            Custom Branding
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Replace TinyCommand branding with your own logo to create a fully
            branded form experience. Perfect for white-label solutions and
            professional presentations.
          </AlertDescription>
        </div>
      </Alert>

      <Card className="p-4 bg-muted/30 border-border">
        <div className="flex items-start gap-3">
          {icons.image && (
            <icons.image className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-foreground mb-1.5">
              Benefits
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span>Professional appearance with your brand identity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span>Increased trust and recognition from users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground font-bold">•</span>
                <span>White-label solution for client-facing forms</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
        <div className="flex items-center gap-3">
          <Switch
            checked={settings?.remove_branding}
            onCheckedChange={(checked) => {
              hideBrandingToogle();
              onSettingsChange({
                remove_branding: checked,
              });
            }}
            data-testid={"remove-branding-switch"}
            disabled={!isPremiumUser}
          />
          <Label
            className={cn(
              "text-sm font-semibold cursor-pointer",
              !isPremiumUser && "opacity-50",
            )}
            onClick={() => {
              if (isPremiumUser) {
                hideBrandingToogle();
                onSettingsChange({
                  remove_branding: !settings?.remove_branding,
                });
              }
            }}
          >
            Remove TinyCommand Branding
          </Label>
        </div>
        {!isPremiumUser && (
          <Button
            variant="default"
            size="sm"
            className="gap-2 w-full sm:w-auto justify-center"
            onClick={() => {
              const baseUrl = process.env.REACT_APP_WC_LANDING_URL || "";
              window.open(
                `${baseUrl}/${REDIRECT_PATHS.SETTINGS}/${REDIRECT_PATHS.PLANS_AND_BILLING}`,
                "_blank",
              );
            }}
          >
            {icons.diamond && <icons.diamond className="w-4 h-4" />}
            UPGRADE PLAN
          </Button>
        )}
      </div>

      {settings?.remove_branding && isPremiumUser && (
        <div className="flex flex-col gap-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-semibold text-foreground">
                Custom Logo
              </h4>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG, SVG, WebP, GIF • Max size: 2MB
              </p>
            </div>

            {!settings?.custom_logo ? (
              <div className="relative">
                <button
                  className={cn(
                    "flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg",
                    "border-2 border-dashed border-border bg-muted/30",
                    "text-sm font-medium text-foreground cursor-pointer",
                    "transition-all hover:bg-muted/50 hover:border-input",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  data-testid="upload-logo-button"
                >
                  {icons.cloudUpload && (
                    <icons.cloudUpload className="w-5 h-5 text-foreground" />
                  )}
                  <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={LOGO_ALLOWED_FORMATS.join(",")}
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="logo-file-input"
                />
              </div>
            ) : (
              <div
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                data-testid="logo-preview"
              >
                <div className="flex items-center gap-3 flex-1">
                  <img
                    src={settings.custom_logo.url}
                    alt="Custom Logo"
                    className="w-12 h-12 object-contain rounded bg-muted p-1"
                  />
                  <span className="text-sm font-medium text-foreground break-words">
                    {settings.custom_logo.fileName}
                  </span>
                </div>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                  onClick={handleRemoveLogo}
                  data-testid="remove-logo-button"
                  aria-label="Remove logo"
                >
                  {icons.trash2 && (
                    <icons.trash2 className="w-4 h-4 text-destructive" />
                  )}
                </button>
              </div>
            )}

            {logoError && (
              <Alert variant="destructive" data-testid="logo-error">
                {icons.alertCircle && <icons.alertCircle className="h-4 w-4" />}
                <AlertDescription className="text-xs">
                  {logoError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Card className="p-4 bg-muted/50 border-border">
            <div className="flex gap-3">
              {icons.info && (
                <icons.info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col gap-2 flex-1">
                <h5 className="text-sm font-semibold text-foreground">
                  Tips for best results
                </h5>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-bold">•</span>
                    Use SVG format for best quality and scalability across all
                    devices
                  </li>
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-bold">•</span>
                    Transparent backgrounds work best for seamless integration
                  </li>
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-bold">•</span>
                    Test your logo on different screen sizes before publishing
                  </li>
                  <li className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="text-foreground font-bold">•</span>
                    Keep file size under 2MB for optimal loading performance
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}

      {!isPremiumUser && (
        <InfoLabel message="Upgrade plan to remove TinyCommand Branding from the form" />
      )}
    </div>
  );
};

export default RemoveBranding;
