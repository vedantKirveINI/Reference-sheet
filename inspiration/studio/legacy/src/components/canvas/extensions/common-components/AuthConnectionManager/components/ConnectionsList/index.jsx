import classes from "./index.module.css";
import { ODSLabel, ODSRadioGroup, ODSButton, ODSIcon } from "@src/module/ods";
import ConnectionItem from "../ConnectionItem";
import { useCallback } from "react";
import authorizeDataSDKServices from "../../../../../services/authorizeDataSDKServices";
import NoConnectionPreview from "../no-connection-preview";

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
      className={classes["list-of-connections-container"]}
      data-testid="list-of-connections-container"
    >
      {hasConnections && (
        <div className={classes["connections-header"]}>
          <ODSLabel
            data-testid="existing-connections-title"
            variant="sub-heading-1"
          >
            Your connections
          </ODSLabel>
          <ODSButton
            data-testid="add-another-connection-button"
            label="Add new"
            variant="text"
            color="primary"
            size="small"
            onClick={onAddConnection}
            startIcon={
              <ODSIcon
                outeIconName={"OUTEAddIcon"}
                outeIconProps={{
                  sx: { width: "0.875rem", height: "0.875rem" },
                }}
              />
            }
            sx={{
              fontFamily: "Inter",
              fontSize: "0.8125rem",
              fontWeight: 500,
              padding: "0.375rem 0.75rem",
              textTransform: "none",
            }}
          />
        </div>
      )}
      <div
        className={classes["connections-list"]}
        data-testid="connections-list"
      >
        {hasConnections ? (
          <ODSRadioGroup
            row={true}
            className="black"
            sx={{
              width: "100%",
              display: "grid",
              gap: "0.5rem",
              "& .MuiFormControlLabel-root": {
                marginRight: 0,
              },
              "&.Mui-checked": {
                color: "black !important",
              },
            }}
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
