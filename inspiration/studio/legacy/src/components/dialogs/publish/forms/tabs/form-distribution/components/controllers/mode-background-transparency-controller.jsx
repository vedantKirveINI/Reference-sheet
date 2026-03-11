import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "@src/module/ods";
import classes from "../embed-settings.module.css";

const ModeBackgroundTransparencyController = () => {
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
    <div className={classes.dimensionGroup}>
      <label className={classes.label}>Background Transparency</label>
      <div className={classes.inputGroup}>
        <ODSTextField
          value={embedSettings?.backgroundTransparency}
          onChange={(e) =>
            handleSettingChange("backgroundTransparency", e.target.value)
          }
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.375rem",
              "& fieldset": {
                borderColor: "#cfd8dc",
                borderWidth: "0.75px",
              },
              "&:hover fieldset": {
                borderColor: "#cfd8dc",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#cfd8dc",
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
          data-testid="background-transparency-input"
        />
      </div>
    </div>
  );
};

export default ModeBackgroundTransparencyController;
