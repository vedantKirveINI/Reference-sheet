import { useState, useCallback } from "react";
import ConnectionListLoader from "../ConnectionListLoader";
import ConnectionsList from "../ConnectionsList";
import AddConnection from "../AddConnection";

const Renderer = ({
  loading,
  connections,
  onChange,
  selectedConnectionId,
  authorization,
  parentId,
  projectId,
  workspaceId,
  onNewConnectionCreation,
  onConnectionDelete,
  onConnectionNameUpdate,
  integrationName,
  integrationIcon,
  showAddConnection: externalShowAddConnection,
  setShowAddConnection: externalSetShowAddConnection,
}) => {
  const [internalShowAddConnection, setInternalShowAddConnection] =
    useState(false);

  // Use external state if provided, otherwise use internal state
  const showAddConnection =
    externalShowAddConnection !== undefined
      ? externalShowAddConnection
      : internalShowAddConnection;
  const setShowAddConnection =
    externalSetShowAddConnection || setInternalShowAddConnection;

  const handleAddConnection = useCallback(() => {
    setShowAddConnection(true);
  }, [setShowAddConnection]);

  if (loading) {
    return <ConnectionListLoader />;
  }

  if (showAddConnection) {
    return (
      <AddConnection
        data-testid="add-connection-form"
        setShowAddConnection={setShowAddConnection}
        authorization={authorization}
        parentId={parentId}
        projectId={projectId}
        workspaceId={workspaceId}
        onNewConnectionCreation={onNewConnectionCreation}
        integrationName={integrationName}
      />
    );
  }

  const hasConnections = connections?.length > 0;

  return (
    <div
      className="flex flex-col w-full h-full p-0 gap-0"
      data-testid="renderer-container"
    >
      <ConnectionsList
        connections={connections}
        onChange={onChange}
        selectedConnectionId={selectedConnectionId}
        onConnectionDelete={onConnectionDelete}
        onConnectionNameUpdate={onConnectionNameUpdate}
        integrationName={integrationName}
        integrationIcon={integrationIcon}
        onAddConnection={handleAddConnection}
        hasConnections={hasConnections}
      />
    </div>
  );
};

export default Renderer;
