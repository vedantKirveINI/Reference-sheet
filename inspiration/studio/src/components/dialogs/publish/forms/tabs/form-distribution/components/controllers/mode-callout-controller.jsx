import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Input } from "@/components/ui/input";
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
      <Input
        value={embedSettings?.callout}
        onChange={(e) => handleSettingChange("callout", e.target.value)}
        className="rounded-md border-black/20 font-sans text-base leading-6 tracking-wide"
        data-testid="callout-input"
      />
    </div>
  );
};

export default ModeCalloutController;
