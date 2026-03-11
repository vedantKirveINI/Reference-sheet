import { useCallback, useRef } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "@src/module/ods";
import classes from "../embed-settings.module.css";

const ModeButtonColorController = () => {
  const { embedSettings, setEmbedSettings } = useFormPublishContext();
  const colorInputRef = useRef(null);

  const handleSettingChange = useCallback(
    (field, value) => {
      setEmbedSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setEmbedSettings],
  );

  const handleContainerClick = useCallback((e) => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  }, []);

  const handleColorChange = useCallback(
    (e) => {
      handleSettingChange("buttonColor", e.target.value);
    },
    [handleSettingChange],
  );

  return (
    <div className={classes.settingGroup}>
      <label className={classes.label}>Button Color</label>
      <div
        className={classes.colorInputGroup}
        onClick={handleContainerClick}
        onMouseDown={handleContainerClick}
        style={{ cursor: "pointer" }}
      >
        <ODSTextField
          value={embedSettings.buttonColor}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.375rem",
              "& .MuiInputBase-input": {
                padding: "0 0 0 2rem !important",
              },
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
            "& .Mui-disabled": {
              backgroundColor: "transparent",
            },
          }}
          data-testid="button-color-input"
        />
        <div
          className={classes.colorSwatch}
          style={{ backgroundColor: embedSettings.buttonColor }}
        />
        <input
          ref={colorInputRef}
          type="color"
          value={embedSettings.buttonColor}
          onChange={handleColorChange}
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            width: "1px",
            height: "1px",
          }}
        />
      </div>
    </div>
  );
};

export default ModeButtonColorController;
