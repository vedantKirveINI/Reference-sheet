import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ConnectionManager } from "@/components/connection-manager";
import { useLegacyAuthorizeAdapter } from "@/components/connection-manager/adapters";
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
  hideFooter = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  const adapter = useLegacyAuthorizeAdapter({
    connectionNodeData,
    resourceIds,
    nodeData,
    assetName,
    selectedConnection,
    onConnectionChange,
  });

  const isConnectionSelected = Boolean(
    adapter.selectedConnection?.id || adapter.selectedConnection?._id,
  );
  const hasError = !isConnectionSelected || Boolean(error);
  const canvasTheme = getCanvasTheme();
  const InfoIcon = icons.info;

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

  const handleConnectionSelect = useCallback(async (connection) => {
    if (isAutoAdvancing || isLoading) return;
    
    try {
      setIsAutoAdvancing(true);
      await adapter.onSelect(connection);
      await onInitializeDone();
    } catch (error) {
      setError(error?.message || "An unexpected error occurred.");
    } finally {
      setIsAutoAdvancing(false);
    }
  }, [adapter.onSelect, onInitializeDone, isAutoAdvancing, isLoading]);

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col gap-3 min-h-0 p-5",
        hideFooter ? "" : "",
      )}
      data-testid="connection-initialization-mode"
    >
      <div className="flex-1 min-h-0 overflow-hidden">
        <ConnectionManager
          authType={adapter.authType}
          integrationName={adapter.integrationName}
          integrationIcon={adapter.integrationIcon}
          authorizationConfig={adapter.connectionConfig}
          resourceIds={adapter.resourceIds}
          connections={adapter.connections}
          selectedConnection={adapter.selectedConnection}
          onConnectionSelect={handleConnectionSelect}
          onFetchConnections={adapter.refreshConnections}
          onCreateOAuthConnection={adapter.onCreateOAuthConnection}
          onCreateFormConnection={adapter.onCreateFormConnection}
          onCreateCustomConnection={adapter.onCreateCustomConnection}
          onDeleteConnection={adapter.onDelete}
          onRenameConnection={async (conn, newName) => {
            await adapter.onEdit(conn._id || conn.id, newName);
          }}
          disabled={adapter.isCreatingConnection}
          className="h-full min-h-0 overflow-y-auto"
        />
      </div>
      {!hideFooter && (
        <div
          className={cn(
            "flex p-4 bg-[#F5F7FA] rounded-lg",
            hasError ? "justify-between items-center" : "justify-end",
          )}
          data-testid="initialization-footer"
        >
          {hasError && (
            <div
              className="grid place-items-center grid-cols-[auto_auto] gap-3"
              data-testid="connection-error-message"
            >
              <InfoIcon className="h-4 w-4" data-testid="error-warning-icon" />
              <span
                className="text-black font-inter text-sm font-semibold leading-9 tracking-[0.07813rem] uppercase"
                data-testid="error-text"
              >
                {!isConnectionSelected
                  ? "Please add a connection to continue."
                  : error}
              </span>
            </div>
          )}
          <Button
            data-testid="initialize-continue-button"
            disabled={!isConnectionSelected || isLoading || isAutoAdvancing}
            size="large"
            variant="black"
            onClick={onInitialize}
            className="uppercase"
          >
            CONTINUE
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectionInitializationMode;
