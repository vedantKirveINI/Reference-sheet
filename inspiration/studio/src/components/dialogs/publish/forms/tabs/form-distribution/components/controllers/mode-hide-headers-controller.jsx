import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Switch } from "@/components/ui/switch";
import classes from "../embed-settings.module.css";

const ModeHideHeadersController = () => {
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
    <div className={classes.toggleRow}>
      <div className={classes.toggleGroup}>
        <Switch
          checked={embedSettings.hideHeaders || false}
          onCheckedChange={(checked) =>
            handleSettingChange("hideHeaders", checked)
          }
          data-testid="hide-headers-toggle"
        />
        <span className={classes.toggleLabel}>Hide Headers</span>
      </div>
    </div>
  );
};

export default ModeHideHeadersController;
