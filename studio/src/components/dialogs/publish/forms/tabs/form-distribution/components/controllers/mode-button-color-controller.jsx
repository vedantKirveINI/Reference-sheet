import { useCallback, useRef } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Input } from "@/components/ui/input";
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

        <div
          className={classes.colorSwatch}
          style={{ backgroundColor: embedSettings.buttonColor }}
        />

        <Input
          value={embedSettings.buttonColor}
          readOnly
          className="rounded-md pl-8 border-black/20 bg-transparent"
          data-testid="button-color-input"
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
