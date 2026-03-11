import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
// import ODSSwitch from "oute-ds-switch";
// import Icon from "oute-ds-icon";
import { ODSSwitch, ODSIcon as Icon } from "@src/module/ods";
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
        <ODSSwitch
          variant="black"
          checked={embedSettings.changeToTextLink}
          onChange={(e) =>
            handleSettingChange("changeToTextLink", e.target.checked)
          }
          sx={{
            "& .MuiSwitch-switchBase": {
              color: "#ffffff",
            },
            "& .MuiSwitch-track": {
              backgroundColor: "#cfd8dc",
            },
            "& .MuiSwitch-thumb": {
              width: "1.5rem",
              height: "1.4rem",
            },
          }}
          data-testid="text-link-toggle"
        />
        <span className={classes.toggleLabel}>Change button to text link</span>
      </div>
    </div>
  );
};

export default ModeTextLinkToggleController;
