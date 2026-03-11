import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Switch } from "@/components/ui/switch";
import classes from "../embed-settings.module.css";

const ModeTextLinkToggleController = () => {
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
          checked={embedSettings.changeToTextLink}
          onCheckedChange={(checked) =>
            handleSettingChange("changeToTextLink", checked)
          }
          data-testid="text-link-toggle"
        />
        <span className={classes.toggleLabel}>Change button to text link</span>
      </div>
    </div>
  );
};

export default ModeTextLinkToggleController;
