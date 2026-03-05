import { useState, useCallback } from "react";
import ConnectionListLoader from "../ConnectionListLoader";
import ConnectionsList from "../ConnectionsList";
import AddConnection from "../AddConnection";
import classes from "./index.module.css";

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
}) => {
  const [showAddConnection, setShowAddConnection] = useState(false);

  const handleAddConnection = useCallback(() => {
    setShowAddConnection(true);
  }, []);

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
    <div className={classes["container"]} data-testid="renderer-container">
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
