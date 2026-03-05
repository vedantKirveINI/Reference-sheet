import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { toast } from "sonner";
import authorizeDataSDKServices from "../../../../../../services/authorizeDataSDKServices";
import { executeNode } from "./utils";
import Renderer from "./components/Renderer";

const AuthConnectionManager = ({
  connectionNodeData = {},
  resourceIds = {},
  selectedConnection,
  onConnectionChange,
  nodeData = {},
  assetName = "",
  hideTitle = false,
  variant = "default",
}) => {
  const connectionConfig = connectionNodeData?.config;
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState(
    selectedConnection?._id || selectedConnection?.id
  );

  const onChange = useCallback(
    async (connection) => {
      const connectionId = connection?._id || connection?.id;
      if (!connectionId) return;
      let prevSelectedCon = selectedConnectionId;
      setSelectedConnectionId(connectionId);

      const refreshedConfigs = await executeNode({
        _id: resourceIds?._id,
        node: connectionNodeData,
        nodeData,
        assetName,
        value: {
          ...connection?.configs,
          name: connection?.name,
          _id: connectionId,
        },
        parent_id: resourceIds?.parentId,
        project_id: resourceIds?.projectId,
        workspace_id: resourceIds?.workspaceId,
        asset_id: resourceIds?.assetId,
        canvasId: resourceIds?.canvasId,
      });
      if (!refreshedConfigs) {
        onConnectionChange({
          connection: selectedConnection,
          refreshedConfigs: {},
          connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
        });
        setSelectedConnectionId(prevSelectedCon);
        return;
      }
      onConnectionChange({
        connection: connection,
        refreshedConfigs: refreshedConfigs,
        connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
      });
    },
    [
      selectedConnectionId,
      resourceIds?._id,
      resourceIds?.parentId,
      resourceIds?.projectId,
      resourceIds?.workspaceId,
      resourceIds?.assetId,
      resourceIds?.canvasId,
      connectionNodeData,
      nodeData,
      assetName,
      onConnectionChange,
      selectedConnection,
    ]
  );

  const fetchUserConnection = useCallback(async () => {
    try {
      if (!connectionConfig?.authorization_id) return;
      setLoading(true);
      const auths = await authorizeDataSDKServices.getByParent({
        parent_id: resourceIds?.projectId,
        authorization_id: connectionConfig?.authorization_id || "",
        workspace_id: resourceIds?.workspaceId,
      });
      if (auths?.result?.length) {
        const latestToOldestAuths = auths?.result?.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setConnections(latestToOldestAuths);
        return latestToOldestAuths;
      }
    } catch (error) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [
    resourceIds?.projectId,
    resourceIds?.workspaceId,
    connectionConfig?.authorization_id,
  ]);

  const onNewConnectionCreation = useCallback(async () => {
    const auths = await fetchUserConnection();
    const latestAuth = auths[0];
    setConnections(auths);
    setSelectedConnectionId(latestAuth?._id || latestAuth?.id);
    await onChange(latestAuth);
    toast.success("Authorized Successfully!");
  }, [fetchUserConnection, onChange]);

  const onConnectionNameUpdateHandler = useCallback(
    async ({ updatedName, connectionId }) => {
      // Update local connection with new name and updated_at timestamp
      const updatedConnections = connections.map((conn) => {
        if ((conn?._id || conn?.id) === connectionId) {
          return {
            ...conn,
            name: updatedName,
            updated_at: new Date().toISOString(),
          };
        }
        return conn;
      });
      setConnections(updatedConnections);

      // Update selected connection if it's the one being renamed
      if (selectedConnectionId === connectionId) {
        const updatedConnection = updatedConnections.find(
          (conn) => (conn?._id || conn?.id) === connectionId
        );
        if (updatedConnection) {
          onConnectionChange({
            connection: updatedConnection,
            refreshedConfigs: {},
            connectionNodeKey:
              connectionNodeData?.id || connectionNodeData?._id,
          });
        }
      }
    },
    [
      connections,
      selectedConnectionId,
      connectionNodeData?.id,
      connectionNodeData?._id,
      onConnectionChange,
    ]
  );

  const onConnectionDeleteHandler = useCallback(
    async (deleteConnectionId) => {
      const response = await authorizeDataSDKServices.deleteById(
        deleteConnectionId
      );
      if (response?.status === "success") {
        toast.success("Connection deleted successfully!");

        if (deleteConnectionId === selectedConnectionId) {
          setSelectedConnectionId(null);
          onConnectionChange({
            connection: null,
            refreshedConfigs: {},
            connectionNodeKey:
              connectionNodeData?.id || connectionNodeData?._id,
          });
        }

        const updatedConnections = connections.filter(
          (connection) =>
            (connection?._id || connection?.id) !== deleteConnectionId
        );
        setConnections(updatedConnections);
      }
    },
    [
      connections,
      selectedConnectionId,
      connectionNodeData?.id,
      connectionNodeData?._id,
      onConnectionChange,
    ]
  );

  useEffect(() => {
    const fetchUserConnectionsData = async () => {
      const userConnections = await fetchUserConnection();

      if (!selectedConnection?.id && userConnections?.length) {
        const latestAuth = userConnections[0];
        setSelectedConnectionId(latestAuth?._id || latestAuth?.id);
        await onChange(latestAuth);
      }
    };

    fetchUserConnectionsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rootClassName = cn(
    "relative flex flex-col h-full overflow-hidden",
    variant === "inline" ? "gap-0 bg-transparent" : "bg-[#F9FAFB]"
  );

  const containerClassName = cn(
    "flex flex-1 flex-col gap-8 overflow-hidden rounded-xl border",
    variant === "inline"
      ? "border-none bg-transparent rounded-none"
      : "border-[#E5E7EB] bg-white shadow-sm"
  );

  const [showAddConnectionView, setShowAddConnectionView] = useState(false);

  const handleAddNewConnection = useCallback(() => {
    setShowAddConnectionView(true);
  }, []);

  return (
    <section className={rootClassName} data-testid="connection-manager-root">
      <div className={containerClassName}>
        {!hideTitle && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4">
            <div className="flex flex-col gap-1 flex-1">
              <h3
                className="m-0 text-[#263238] font-inter text-xl font-semibold leading-7"
                data-testid="connection-manager-title"
              >
                Connection
              </h3>
              <p className="m-0 text-[#78909c] font-inter text-sm font-normal leading-5">
                Select a PostgreSQL connection or create new one.
              </p>
            </div>
            <Button
              variant="black"
              size="default"
              onClick={handleAddNewConnection}
              className="gap-2 uppercase tracking-wide shrink-0"
            >
              <icons.add className="h-4 w-4" />
              NEW CONNECTION
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <Renderer
            loading={loading}
            connections={connections}
            onChange={onChange}
            selectedConnectionId={selectedConnectionId}
            authorization={connectionConfig}
            parentId={resourceIds?.parentId}
            projectId={resourceIds?.projectId}
            workspaceId={resourceIds?.workspaceId}
            onNewConnectionCreation={onNewConnectionCreation}
            onConnectionDelete={onConnectionDeleteHandler}
            onConnectionNameUpdate={onConnectionNameUpdateHandler}
            integrationName={nodeData?.name || assetName}
            integrationIcon={
              nodeData?.meta?.thumbnail || nodeData?.icon || nodeData?.logo
            }
            showAddConnection={showAddConnectionView}
            setShowAddConnection={setShowAddConnectionView}
          />
        </div>
      </div>
    </section>
  );
};

export default AuthConnectionManager;
