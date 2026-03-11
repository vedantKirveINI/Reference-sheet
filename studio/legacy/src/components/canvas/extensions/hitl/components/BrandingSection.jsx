"use client";
// import Typography from "oute-ds-label";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
// import TextField from "oute-ds-text-field";
import { ODSLabel as Typography, ODSButton as Button, ODSIcon as Icon, ODSTextField as TextField } from "@src/module/ods";
import { FieldDescription } from "./FieldDescription";
import { LabelWithTooltip } from "./LabelWithTooltip";
import styles from "./BrandingSection.module.css";

export function BrandingSection({
  branding,
  onBrandingChange,
  onLogoUpload,
  errors,
}) {
  const hasLogoSizeError =
    errors !== null &&
    errors.some(
      (err) => err === "Logo size exceeds 2MB. Please upload a smaller file."
    );
  return (
    <div className={`${styles.formSection} ${styles.sectionDivider}`}>
      <FieldDescription>
        Customize the appearance of the review interface with your company
        branding. These settings are only available for premium accounts.
      </FieldDescription>

      <div className={styles.brandingSection}>
        {/* Logo Upload */}
        <div className={styles.logoUpload}>
          <LabelWithTooltip
            htmlFor="logo_upload"
            label="Brand Logo"
            tooltip="Your company logo that will appear in the header of the review interface."
          />
          {/* <div className={styles.logoUploadField}> */}
          {branding?.logo_details?.fileName && (
            <div
              className={styles.logoWrapper}
              data-testid="brand-logo-preview"
            >
              <Icon
                imageProps={{
                  src: branding?.logo_url,
                  style: {
                    ObjectFit: "cover",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                  },
                }}
              />

              <div
                className={styles.deleteIcon}
                onClick={() =>
                  onBrandingChange({ logo_details: null, logo_url: null })
                }
                data-testid="delete-logo"
              >
                <Icon
                  outeIconName="OUTETrashIcon"
                  outeIconProps={{
                    sx: {
                      color: "#FC5555",
                      width: "2.5rem",
                      height: "2.5rem",
                    },
                  }}
                />
              </div>
            </div>
          )}
          <Button
            variant="black-outlined"
            component="label"
            className={styles.uploadButton}
            data-testid="upload-logo-button"
          >
            {branding?.logo_details?.fileName ? "Change Logo" : "Upload Logo"}
            <input
              id="logo_upload"
              type="file"
              accept=".png,.jpg,.jpeg,.svg"
              onChange={onLogoUpload}
              hidden
            />
          </Button>

          {/* </div> */}
          <FieldDescription>
            Upload your company logo (PNG, JPG, or SVG). Recommended size:
            200x50px. Max file size: 2MB.
          </FieldDescription>
          {hasLogoSizeError && (
            <Typography className={styles.errorText}>
              Logo size exceeds 2MB. Please upload a smaller file.
            </Typography>
          )}
        </div>

        {/* Primary Color */}
        <div className={styles.colorPicker}>
          <LabelWithTooltip
            htmlFor="primary_color"
            label="Primary Theme Color"
            tooltip="The main color used for headers, borders, and UI elements in the review interface."
          />
          <div className={styles.colorPickerField}>
            <input
              id="primary_color"
              type="color"
              value={branding?.primary_color || "#1A73E8"}
              onChange={(e) =>
                onBrandingChange({
                  ...branding,
                  primary_color: e.target.value,
                })
              }
              className={styles.colorInput}
            />
            <TextField
              data-testid="primary-color-input"
              type="text"
              value={branding?.primary_color || "#1A73E8"}
              onChange={(e) =>
                onBrandingChange({
                  ...branding,
                  primary_color: e.target.value,
                })
              }
              className={`${styles.colorTextField} black`}
              size="small"
            />
          </div>
          <FieldDescription>
            This color will be used for headers, borders, and other UI elements.
            Choose a color that matches your brand.
          </FieldDescription>
        </div>

        {/* Accent Color */}
        <div className={styles.colorPicker}>
          <LabelWithTooltip
            htmlFor="accent_color"
            label="Accent Color"
            tooltip="A secondary color used for highlights, buttons, and interactive elements."
          />
          <div className={styles.colorPickerField}>
            <input
              id="accent_color"
              type="color"
              value={branding?.accent_color || "#F4B400"}
              onChange={(e) =>
                onBrandingChange({
                  ...branding,
                  accent_color: e.target.value,
                })
              }
              className={styles.colorInput}
            />
            <TextField
              data-testid="accent-color-input"
              type="text"
              value={branding?.accent_color || "#F4B400"}
              onChange={(e) =>
                onBrandingChange({
                  ...branding,
                  accent_color: e.target.value,
                })
              }
              className={`${styles.colorTextField} black`}
              size="small"
            />
          </div>
          <FieldDescription>
            This color will be used for highlights, buttons, and interactive
            elements. It should complement your primary color.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
