import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Input } from "@/components/ui/input";
import classes from "../embed-settings.module.css";

const ModeButtonTextController = () => {
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
      <label className={classes.label}>Button Text</label>
      <Input
        value={embedSettings.buttonText}
        onChange={(e) => handleSettingChange("buttonText", e.target.value)}
        className="rounded-md border-black/20 font-sans text-base leading-6 tracking-wide"
        data-testid="button-text-input"
      />
    </div>
  );
};

export default ModeButtonTextController;
