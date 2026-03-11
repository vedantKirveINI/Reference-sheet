import { useState, useRef, useCallback } from "react";
// import Switch from "oute-ds-switch";
// import ODSLabel from "oute-ds-label";
// import Icon from "oute-ds-icon";
import { ODSSwitch as Switch, ODSLabel, ODSIcon as Icon } from "@src/module/ods";
import classes from "./index.module.css";
import InfoLabel from "./info-label";
import { REDIRECT_PATHS } from "../../../../../../../../pages/ic-canvas/constants/constants";
import storageSDKServices from "../../../../../../../../sdk-services/storage-sdk-services";

// File validation constants
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > LOGO_MAX_SIZE_MB) {
      return `File size exceeds ${LOGO_MAX_SIZE_MB}MB. Please upload a smaller file.`;
    }

    // Check file format
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

      // Reset error
      setLogoError("");

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setLogoError(validationError);
        event.target.value = ""; // Reset input
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
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error uploading logo:", error);
            setLogoError("Failed to upload logo. Please try again.");
          } finally {
            setUploadingLogo(false);
            event.target.value = ""; // Reset input
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
    <div className={classes["remove-branding-container"]}>
      <div className={classes["switch-container"]}>
        <Switch
          variant="black"
          checked={settings?.remove_branding}
          onChange={() => {
            hideBrandingToogle();
            onSettingsChange({
              remove_branding: !settings?.remove_branding,
            });
          }}
          data-testid={"remove-branding-switch"}
          labelText={"Remove TinyCommand Branding"}
          sx={{
            gap: "0.75rem",
          }}
          labelProps={{
            sx: {
              color: "#263238",
              fontSize: "1.25rem",
              fontWeight: 500,
              cursor: "pointer",
              fontStyle: "normal",
              lineHeight: "2rem",
              letterSpacing: "0.01563rem",
            },
          }}
          disabled={!isPremiumUser}
        />
        {!isPremiumUser && (
          <div
            className={classes["premium-button"]}
            onClick={() => {
              // eslint-disable-next-line no-undef
              const baseUrl = process.env.REACT_APP_WC_LANDING_URL || "";
              window.open(
                `${baseUrl}/${REDIRECT_PATHS.SETTINGS}/${REDIRECT_PATHS.PLANS_AND_BILLING}`,
                "_blank",
              );
            }}
          >
            <img
              src="https://cdn-v1.tinycommand.com/1234567890/1758549240735/Diamond.svg"
              alt="premium-icon"
              className={classes["premium-icon"]}
            />
            <div className={classes["premium-label"]}>UPGRADE PLAN</div>
          </div>
        )}
      </div>

      {/* Custom Branding Section */}
      {settings?.remove_branding && isPremiumUser && (
        <div className={classes["custom-branding-section"]}>
          <ODSLabel variant="body1" className={classes["section-description"]}>
            Upload your brand logo to customize your form and match your brand
            identity.
          </ODSLabel>

          {/* Custom Logo Upload */}
          <div className={classes["upload-section"]}>
            <div className={classes["upload-header"]}>
              <ODSLabel variant="subtitle1" className={classes["upload-title"]}>
                Custom Logo
              </ODSLabel>
              <ODSLabel
                variant="caption"
                className={classes["upload-subtitle"]}
              >
                Supported formats: JPEG, PNG, SVG, WebP, GIF • Max size: 2MB
              </ODSLabel>
            </div>

            {!settings?.custom_logo ? (
              <div className={classes["upload-button-container"]}>
                <button
                  className={classes["upload-button"]}
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  data-testid="upload-logo-button"
                >
                  <Icon
                    outeIconName="OUTECloudUploadIcon"
                    outeIconProps={{
                      sx: {
                        width: "1.5rem",
                        height: "1.5rem",
                        color: "#263238",
                      },
                    }}
                  />
                  <span>{uploadingLogo ? "Uploading..." : "Upload Logo"}</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={LOGO_ALLOWED_FORMATS.join(",")}
                  onChange={handleFileUpload}
                  className={classes["file-input"]}
                  data-testid="logo-file-input"
                />
              </div>
            ) : (
              <div
                className={classes["file-preview"]}
                data-testid="logo-preview"
              >
                <div className={classes["preview-content"]}>
                  <img
                    src={settings.custom_logo.url}
                    alt="Custom Logo"
                    className={classes["preview-image"]}
                  />
                  <div className={classes["preview-info"]}>
                    <ODSLabel variant="body2" className={classes["file-name"]}>
                      {settings.custom_logo.fileName}
                    </ODSLabel>
                  </div>
                </div>
                <button
                  className={classes["remove-button"]}
                  onClick={handleRemoveLogo}
                  data-testid="remove-logo-button"
                  aria-label="Remove logo"
                >
                  <Icon
                    outeIconName="OUTETrashIcon"
                    outeIconProps={{
                      sx: {
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "#F44336",
                      },
                    }}
                  />
                </button>
              </div>
            )}

            {logoError && (
              <div
                className={classes["error-message"]}
                data-testid="logo-error"
              >
                <Icon
                  outeIconName="OUTEErrorIcon"
                  outeIconProps={{
                    sx: { width: "1rem", height: "1rem", color: "#F44336" },
                  }}
                />
                <ODSLabel variant="caption">{logoError}</ODSLabel>
              </div>
            )}
          </div>

          {/* Best Practices Info */}
          <div className={classes["best-practices-info"]}>
            <div className={classes["best-practices-icon-wrapper"]}>
              <Icon
                outeIconName="OUTEInfoIcon"
                outeIconProps={{
                  sx: { width: "1.25rem", height: "1.25rem", color: "#1976D2" },
                }}
              />
            </div>
            <div className={classes["best-practices-content"]}>
              <ODSLabel
                variant="caption"
                className={classes["best-practices-title"]}
              >
                Tips for best results
              </ODSLabel>
              <ul className={classes["best-practices-list"]}>
                <li>
                  <span className={classes["best-practices-bullet"]}>•</span>
                  <span>
                    Use SVG format for best quality and scalability across all
                    devices
                  </span>
                </li>
                <li>
                  <span className={classes["best-practices-bullet"]}>•</span>
                  <span>
                    Transparent backgrounds work best for seamless integration
                  </span>
                </li>
                <li>
                  <span className={classes["best-practices-bullet"]}>•</span>
                  <span>
                    Test your logo on different screen sizes before publishing
                  </span>
                </li>
                <li>
                  <span className={classes["best-practices-bullet"]}>•</span>
                  <span>
                    Keep file size under 2MB for optimal loading performance
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {!isPremiumUser && (
        <InfoLabel message="Upgrade plan to remove TinyCommand Branding from the form" />
      )}
    </div>
  );
};
export default RemoveBranding;
