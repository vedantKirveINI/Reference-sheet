import { ODSLabel, ODSRadioGroup, ODSButton, ODSIcon } from "@src/module/ods";
import ConnectionItem from "../ConnectionItem";
import { useCallback } from "react";
import authorizeDataSDKServices from "../../../../../../../../services/authorizeDataSDKServices";
import NoConnectionPreview from "../no-connection-preview";
import { cn } from "@/lib/utils";
const ConnectionsList = ({
  connections,
  onChange,
  selectedConnectionId,
  onConnectionDelete,
  onConnectionNameUpdate,
  integrationName,
  integrationIcon,
  onAddConnection,
  hasConnections,
}) => {
  const getIsSelectedStatus = useCallback(
    (connection) => {
      return selectedConnectionId === connection?._id;
    },
    [selectedConnectionId]
  );

  const onConnectionNameUpdateHandler = useCallback(
    async ({ updatedName, connectionId }) => {
      await authorizeDataSDKServices.save({
        name: updatedName,
        _id: connectionId,
      });
      await onConnectionNameUpdate({ updatedName, connectionId });
    },
    [onConnectionNameUpdate]
  );

  const onConnectionDeleteHandler = useCallback(
    async (connectionId) => {
      await onConnectionDelete(connectionId);
    },
    [onConnectionDelete]
  );

  return (
    <div
      className="flex flex-col h-full px-6 pb-6 gap-4 overflow-auto"
      data-testid="list-of-connections-container"
    >
      {hasConnections && (
        <div className="flex items-center justify-between">
          <ODSLabel
            data-testid="existing-connections-title"
            variant="sub-heading-1"
            className="text-[#263238] font-inter text-lg font-semibold"
          >
            Existing Connections
          </ODSLabel>
        </div>
      )}
      <div
        className={cn(
          "flex flex-col",
          hasConnections 
            ? "justify-start gap-3" 
            : "justify-center items-center flex-1"
        )}
        data-testid="connections-list"
      >
        {hasConnections ? (
          <ODSRadioGroup
            row={true}
            className="black"
            
            data-testid="connections-list-radio-group"
            onChange={async (e) => {
              const connection = connections.find(
                (connection) => connection._id === e.target.value
              );
              await onChange(connection);
            }}
          >
            {connections.map((connection, index) => {
              return (
                <ConnectionItem
                  key={connection._id}
                  index={index}
                  connection={connection}
                  isSelected={getIsSelectedStatus(connection)}
                  onConnectionNameChange={async (updatedName) => {
                    await onConnectionNameUpdateHandler({
                      updatedName,
                      connectionId: connection._id,
                    });
                  }}
                  onConnectionDelete={onConnectionDeleteHandler}
                />
              );
            })}
          </ODSRadioGroup>
        ) : (
          <NoConnectionPreview 
            integrationName={integrationName} 
            integrationIcon={integrationIcon}
            onAddConnection={onAddConnection}
          />
        )}
      </div>
    </div>
  );
};

export default ConnectionsList;
