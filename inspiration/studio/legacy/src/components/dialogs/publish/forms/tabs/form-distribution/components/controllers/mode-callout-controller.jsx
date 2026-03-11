import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "@src/module/ods";
import classes from "../embed-settings.module.css";

const ModeCalloutController = () => {
  const { embedSettings, setEmbedSettings } = useFormPublishContext();

  const handleSettingChange = useCallback(
    (field, value) => {
      setEmbedSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setEmbedSettings],
  );

  return (
    <div className={classes.settingGroup}>
      <label className={classes.label}>Callout</label>
      <ODSTextField
        value={embedSettings?.callout}
        onChange={(e) => handleSettingChange("callout", e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "0.375rem",
            "& fieldset": {
              borderColor: "rgba(0,0,0,0.2)",
              borderWidth: "0.75px",
            },
            "&:hover fieldset": {
              borderColor: "rgba(0,0,0,0.2)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgba(0,0,0,0.2)",
            },
          },
          "& .MuiInputBase-input": {
            fontFamily: "Inter, sans-serif",
            fontSize: "1rem",
            lineHeight: "1.5rem",
            color: "#000000",
            letterSpacing: "0.5px",
            padding: "0.625rem",
          },
        }}
        data-testid="callout-input"
      />
    </div>
  );
};

export default ModeCalloutController;
