import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Switch } from "@/components/ui/switch";
import classes from "../embed-settings.module.css";

const ModeFullscreenMobileController = () => {
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
          checked={embedSettings.fullscreenMobile || false}
          onCheckedChange={(checked) =>
            handleSettingChange("fullscreenMobile", checked)
          }
          data-testid="fullscreen-mobile-toggle"
        />
        <span className={classes.toggleLabel}>Full-screen on mobile</span>
      </div>
    </div>
  );
};

export default ModeFullscreenMobileController;
