import { useState, useEffect } from "react";
import classes from "./index.module.css";
// import ODSLabel from "oute-ds-label";
// import Switch from "oute-ds-switch";
import canvasServices from "../../../../../../sdk-services/canvas-sdk-services";
import { SUCCESS } from "../../../../../../constants/keys";
// import { showAlert } from "oute-ds-alert";
import { ODSLabel, ODSSwitch as Switch, showAlert } from "@src/module/ods";

const SettingsTab = ({
  assetDetails = {},
  setAssetDetails,
  onAssetDetailsChange,
}) => {
  const [isWorkflowActive, setIsWorkflowActive] = useState(
    assetDetails?.asset?.settings?.execution_control?.enabled ?? true,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleWorkflowStatusToggle = async (enabled) => {
    setIsSaving(true);

    try {
      const payload = {
        asset_id: assetDetails?.asset?._id,
        settings: {
          execution_control: {
            enabled,
          },
        },
      };

      const response = await canvasServices.saveCanvas(payload);

      if (response?.status === SUCCESS) {
        setIsWorkflowActive(enabled);

        setAssetDetails((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            asset: {
              ...prev.asset,
              settings: {
                ...prev.asset?.settings,
                execution_control: {
                  enabled,
                },
              },
            },
          };
        });

        if (onAssetDetailsChange) {
          onAssetDetailsChange({ enabled, response });
        }
      }
    } catch (error) {
      console.error("Failed to toggle active state:", error);
      showAlert({
        type: "error",
        message: "Failed to toggle active state",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setIsWorkflowActive(
      assetDetails?.asset?.settings?.execution_control?.enabled ?? true,
    );
  }, [assetDetails?.asset?.settings?.execution_control?.enabled]);

  return (
    <div className={classes.tabContent} data-testid="workflow-settings-tab">
      <div className={classes.settingsContainer}>
        {/* Workflow Status Section */}
        <div className={classes.section}>
          <div className={classes.sectionHeader}>
            <ODSLabel
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#263238",
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
                marginBottom: 0,
              }}
              data-testid="workflow-status-section-title"
            >
              Workflow Status
            </ODSLabel>
            <ODSLabel
              variant="body2"
              sx={{
                fontWeight: 400,
                color: "#607D8B",
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
              }}
              data-testid="workflow-status-section-description"
            >
              Enable or disable workflow execution
            </ODSLabel>
          </div>
          <div className={classes.sectionContent}>
            <div className={classes.statusToggleContainer}>
              <div className={classes.statusLabelContainer}>
                <ODSLabel
                  variant="body1"
                  sx={{ color: "#263238", fontWeight: 500 }}
                  data-testid="workflow-status-label"
                >
                  {isWorkflowActive ? "Active" : "Inactive"}
                </ODSLabel>
                <ODSLabel
                  variant="body2"
                  sx={{ color: "#607D8B", fontWeight: 400 }}
                  data-testid="workflow-status-description"
                >
                  {isWorkflowActive
                    ? "Workflow is currently active and will execute when triggered"
                    : "Workflow is inactive and will not execute"}
                </ODSLabel>
              </div>
              <Switch
                checked={isWorkflowActive}
                onChange={(e) => handleWorkflowStatusToggle(e.target.checked)}
                disabled={isSaving}
                data-testid="workflow-status-switch"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings Section */}
        <div className={classes.section}>
          <div className={classes.sectionHeader}>
            <ODSLabel
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#263238",
                fontSize: "1.125rem",
                lineHeight: "1.5rem",
                marginBottom: 0,
              }}
              data-testid="notification-settings-section-title"
            >
              Notification Settings
            </ODSLabel>
            <ODSLabel
              variant="body2"
              sx={{
                fontWeight: 400,
                color: "#607D8B",
                fontSize: "0.875rem",
                lineHeight: "1.25rem",
              }}
              data-testid="notification-settings-section-description"
            >
              Configure when you want to receive notifications
            </ODSLabel>
          </div>
          <div className={classes.sectionContent}>
            <ODSLabel
              variant="body2"
              sx={{ color: "#607D8B", fontWeight: 400 }}
              data-testid="notification-settings-coming-soon"
            >
              Notification settings are coming soon. You&apos;ll be able to
              configure when to receive notifications (once a day, multiple
              times a day, etc.)
            </ODSLabel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
