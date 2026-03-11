import { useEffect, useState } from "react";
// import ODSSwitch from "oute-ds-switch";
import canvasServices from "../../sdk-services/canvas-sdk-services";
// import { showAlert } from "oute-ds-alert";
import { ODSSwitch, showAlert } from "@src/module/ods";
import { SUCCESS } from "../../constants/keys";

const WorkflowActiveSwtich = ({
  isPublished = false,
  settings,
  assetId,
  onSettingsChange,
}) => {
  const initialEnabled = Boolean(settings?.execution_control?.enabled);
  const [isActive, setIsActive] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const onActiveToogle = async () => {
    setLoading(true);
    const newEnabled = !isActive;
    try {
      const payload = {
        asset_id: assetId,
        settings: {
          execution_control: {
            enabled: newEnabled,
          },
        },
      };
      const response = await canvasServices.saveCanvas(payload);

      if (response?.status === SUCCESS) {
        setIsActive(newEnabled);

        if (onSettingsChange) {
          onSettingsChange({ enabled: newEnabled, response });
        }
      }
    } catch (error) {
      console.error("Failed to toggle active state:", error);
      showAlert({
        type: "error",
        message: "Failed to toggle active state",
      });
      // Revert on error
      setIsActive(!newEnabled);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsActive(Boolean(settings?.execution_control?.enabled));
  }, [settings?.execution_control?.enabled]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0.875rem",
        borderRadius: "0.875rem",
        background: "rgba(0, 0, 0, 0.02)",
        border: "1px solid rgba(0, 0, 0, 0.04)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <ODSSwitch
        labelText={"Active"}
        labelProps={{
          sx: {
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#263238",
            cursor: "pointer",
            letterSpacing: "0.01em",
            marginRight: "0.5rem",
          },
        }}
        sx={{
          "& .MuiSwitch-root": {
            width: "44px",
            height: "24px",
          },
          "& .MuiSwitch-switchBase": {
            padding: "4px",
            "&.Mui-checked": {
              transform: "translateX(20px)",
              "& + .MuiSwitch-track": {
                backgroundColor: "#4CAF50",
                opacity: 1,
              },
              "& .MuiSwitch-thumb": {
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              },
            },
            "&.Mui-disabled": {
              "& + .MuiSwitch-track": {
                opacity: 0.3,
              },
            },
          },
          "& .MuiSwitch-thumb": {
            width: "16px",
            height: "16px",
            backgroundColor: "#ffffff",
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)",
            transition: "all 0.2s ease",
          },
          "& .MuiSwitch-track": {
            backgroundColor: "#CFD8DC",
            opacity: 1,
            borderRadius: "12px",
            transition: "all 0.2s ease",
          },
        }}
        checked={isActive}
        onChange={onActiveToogle}
        data-testid="active-switch"
        disabled={!isPublished || loading}
      />
    </div>
  );
};

export default WorkflowActiveSwtich;
