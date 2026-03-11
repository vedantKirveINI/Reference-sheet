import { useCallback, useState } from "react";
import classes from "./index.module.css";
import ConnectionInfo from "./components/connection-info";
// import ODSButton from "oute-ds-button";
// import ODSIcon from "oute-ds-icon";
import { ODSButton, ODSIcon } from "@src/module/ods";
import AuthConnectionManager from "../../../common-components/AuthConnectionManager";
import { getCanvasTheme } from "../../../../../../module/constants";

const ConnectionInitializationMode = ({
  connectionSrc = "",
  connectionNodeData = {},
  selectedConnection,
  onConnectionChange = () => {},
  resourceIds = {},
  onInitializeDone = async () => {},
  nodeData = {},
  assetName = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isConnectionSelected = Boolean(
    selectedConnection?.id || selectedConnection?._id
  );
  const hasError = !isConnectionSelected || Boolean(error);
  const canvasTheme = getCanvasTheme();

  const onInitialize = useCallback(async () => {
    try {
      setIsLoading(true);
      await onInitializeDone();
    } catch (error) {
      setError(error?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [onInitializeDone]);

  return (
    <div
      className={classes["connection-initialization-mode"]}
      data-testid="connection-initialization-mode"
    >
      <div className={classes["connection-initialization-content"]}>
        <ConnectionInfo
          connectionSrc={connectionSrc}
          integrationName={nodeData?.name || assetName}
        />
        <AuthConnectionManager
          connectionNodeData={connectionNodeData}
          resourceIds={resourceIds}
          selectedConnection={selectedConnection}
          onConnectionChange={onConnectionChange}
          nodeData={nodeData}
          assetName={assetName}
        />
      </div>
      <div
        className={`${classes["initialization-footer"]} ${
          hasError ? classes["has-error"] : ""
        }`}
        data-testid="initialization-footer"
        style={{
          borderTop: `0.75px solid ${canvasTheme.dark}`,
        }}
      >
        {hasError && (
          <div
            className={classes["error-message-container"]}
            data-testid="connection-error-message"
          >
            <ODSIcon
              outeIconName="OUTEInfoIcon"
              outeIconProps={{
                sx: {
                  fill: "#FB8C00",
                },
              }}
              data-testid="error-warning-icon"
            />
            <span className={classes["error-message"]} data-testid="error-text">
              {!isConnectionSelected
                ? "Please add a connection to continue."
                : error}
            </span>
          </div>
        )}
        <ODSButton
          data-testid="initialize-continue-button"
          disabled={!isConnectionSelected || isLoading}
          size="large"
          label="CONTINUE"
          variant="black"
          onClick={onInitialize}
        />
      </div>
    </div>
  );
};

export default ConnectionInitializationMode;
