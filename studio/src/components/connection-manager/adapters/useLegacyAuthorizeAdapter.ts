import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Connection, AuthType } from "../types";
import { mapLegacyAuthType } from "./mapAuthType";
import authorizeDataSDKServices from "../../canvas/services/authorizeDataSDKServices";
import { executeNode, getPostHookMeta } from "../../canvas/extensions/common-components/AuthConnectionManager/utils";
import { useLegacyOAuthPopup } from "../hooks/useLegacyOAuthPopup";
import { serverConfig } from "@src/module/ods";
import { removeTagsFromString } from "@src/module/constants";

interface LegacyConnection {
  _id?: string;
  id?: string;
  name?: string;
  configs?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface ResourceIds {
  projectId?: string;
  workspaceId?: string;
  parentId?: string;
  assetId?: string;
  canvasId?: string;
  _id?: string;
}

interface NodeData {
  name?: string;
  key?: string;
  icon?: string;
  logo?: string;
  meta?: {
    thumbnail?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ConnectionNodeData {
  id?: string;
  _id?: string;
  config?: {
    authorization_type?: string;
    authorization_id?: string;
    configs?: any[];
    [key: string]: any;
  };
  inputs?: any[];
  type?: string;
  [key: string]: any;
}

interface ConnectionChangePayload {
  connection: LegacyConnection | null;
  refreshedConfigs: Record<string, any>;
  connectionNodeKey: string | undefined;
}

interface UseLegacyAuthorizeAdapterProps {
  connectionNodeData?: ConnectionNodeData;
  resourceIds?: ResourceIds;
  nodeData?: NodeData;
  assetName?: string;
  selectedConnection?: LegacyConnection | null;
  onConnectionChange?: (payload: ConnectionChangePayload) => void;
}

interface UseLegacyAuthorizeAdapterReturn {
  connections: Connection[];
  selectedConnection: Connection | null;
  authType: AuthType;
  integrationName: string;
  integrationIcon: string | undefined;
  loading: boolean;
  hasInitiallyLoaded: boolean;
  isCreatingConnection: boolean;
  connectionConfig: any;
  resourceIds: any;
  onSelect: (connection: Connection) => Promise<void>;
  onCreateOAuthConnection: (name: string) => Promise<void>;
  onCreateFormConnection: (name: string, credentials: Record<string, string>) => Promise<Connection>;
  onCreateCustomConnection: (name: string, formData: { state: Record<string, any>; flow: any }) => Promise<Connection>;
  onEdit: (connectionId: string, newName: string) => Promise<void>;
  onDelete: (connectionId: string) => Promise<void>;
  refreshConnections: () => Promise<Connection[]>;
}

function mapLegacyConnectionToNew(legacyConn: LegacyConnection, authorizationType?: string): Connection {
  const id = legacyConn._id || legacyConn.id || "";
  return {
    _id: id,
    id: id,
    name: legacyConn.name || "Unnamed Connection",
    authType: mapLegacyAuthType(authorizationType),
    status: "connected",
    configs: legacyConn.configs,
    createdAt: legacyConn.created_at,
    updatedAt: legacyConn.updated_at,
    // Preserve the original legacy authorization type for reverse mapping
    metadata: {
      authorization_type: authorizationType,
    },
  };
}

function mapNewConnectionToLegacy(newConn: Connection): LegacyConnection {
  return {
    _id: newConn._id,
    id: newConn.id || newConn._id,
    name: newConn.name,
    configs: newConn.configs,
    created_at: newConn.createdAt,
    updated_at: newConn.updatedAt,
    // Preserve authorization_type for executeNode
    authorization_type: newConn.metadata?.authorization_type,
  };
}

export function useLegacyAuthorizeAdapter({
  connectionNodeData,
  resourceIds = {},
  nodeData = {},
  assetName = "",
  selectedConnection: initialSelectedConnection,
  onConnectionChange,
}: UseLegacyAuthorizeAdapterProps): UseLegacyAuthorizeAdapterReturn {
  const connectionConfig = connectionNodeData?.config;
  const authorizationType = connectionConfig?.authorization_type;
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionState, setSelectedConnectionState] = useState<Connection | null>(
    initialSelectedConnection ? mapLegacyConnectionToNew(initialSelectedConnection, authorizationType) : null
  );
  const [loading, setLoading] = useState(true);
  const isInitialFetchDone = useRef(false);
  const isOAuthSuccessHandling = useRef(false);
  const isFetchingConnections = useRef(false);
  const pendingConnectionNameRef = useRef<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const authType = mapLegacyAuthType(connectionConfig?.authorization_type);
  
  const stableResourceIds = useMemo(() => ({
    projectId: resourceIds?.projectId,
    workspaceId: resourceIds?.workspaceId,
    parentId: resourceIds?.parentId,
    assetId: resourceIds?.assetId,
    canvasId: resourceIds?.canvasId,
    _id: resourceIds?._id,
  }), [resourceIds?.projectId, resourceIds?.workspaceId, resourceIds?.parentId, resourceIds?.assetId, resourceIds?.canvasId, resourceIds?._id]);
  
  const stableAuthorizationId = connectionConfig?.authorization_id;

  const integrationName = nodeData?.name || assetName || "";
  const integrationIcon = nodeData?.meta?.thumbnail || nodeData?.icon || nodeData?.logo;

  const authorizationConfig = connectionConfig ? {
    authorization_id: connectionConfig.authorization_id,
    authorization_type: connectionConfig.authorization_type,
    configs: connectionConfig.configs,
    // Include the authorization object for auth_parent_id lookup in OAuth flow
    authorization: connectionConfig.authorization,
  } : undefined;

  const executeNodeAndNotify = useCallback(
    async (connection: LegacyConnection): Promise<Record<string, any> | null> => {
      if (!connectionNodeData) return null;

      const connectionId = connection._id || connection.id;
      
      const refreshedConfigs = await executeNode({
        _id: stableResourceIds._id,
        node: connectionNodeData,
        nodeData,
        assetName,
        value: {
          ...connection.configs,
          name: connection.name,
          _id: connectionId,
        },
        parent_id: stableResourceIds.parentId,
        project_id: stableResourceIds.projectId,
        workspace_id: stableResourceIds.workspaceId,
        asset_id: stableResourceIds.assetId,
        canvasId: stableResourceIds.canvasId,
      });

      return refreshedConfigs;
    },
    [connectionNodeData, stableResourceIds, nodeData, assetName]
  );

  const fetchConnections = useCallback(async (): Promise<Connection[]> => {
    if (!stableAuthorizationId) {
      setLoading(false);
      return [];
    }

    if (isFetchingConnections.current) {
      return [];
    }
    isFetchingConnections.current = true;

    try {
      setLoading(true);
      const response = await authorizeDataSDKServices.getByParent({
        parent_id: stableResourceIds.projectId,
        authorization_id: stableAuthorizationId,
        workspace_id: stableResourceIds.workspaceId,
      });

      if (response?.result?.length) {
        const sortedAuths = response.result.sort(
          (a: LegacyConnection, b: LegacyConnection) =>
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        const mappedConnections = sortedAuths.map((conn: LegacyConnection) => 
          mapLegacyConnectionToNew(conn, authorizationType)
        );
        setConnections(mappedConnections);
        return mappedConnections;
      }
      
      setConnections([]);
      return [];
    } catch (error) {
      setConnections([]);
      return [];
    } finally {
      setLoading(false);
      isFetchingConnections.current = false;
    }
  }, [stableResourceIds.projectId, stableResourceIds.workspaceId, stableAuthorizationId, authorizationType]);

  const handleOAuthSuccess = useCallback(async () => {
    if (isOAuthSuccessHandling.current) {
      return;
    }
    isOAuthSuccessHandling.current = true;
    
    try {
      const pendingName = pendingConnectionNameRef.current;
      const maxRetries = 5;
      const retryDelayMs = 2000;
      let latestConnection: Connection | null = null;
      let updatedConnections: Connection[] = [];
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        
        updatedConnections = await fetchConnections();
        
        if (pendingName && updatedConnections.length > 0) {
          const matchingConnection = updatedConnections.find(c => c.name === pendingName);
          if (matchingConnection) {
            latestConnection = matchingConnection;
            break;
          }
        } else if (updatedConnections.length > 0) {
          latestConnection = updatedConnections[0];
          break;
        }
        
        if (attempt === maxRetries && updatedConnections.length > 0) {
          latestConnection = updatedConnections[0];
        }
      }
      
      pendingConnectionNameRef.current = null;
      
      if (latestConnection) {
        setSelectedConnectionState(latestConnection);
        
        const legacyConnection = mapNewConnectionToLegacy(latestConnection);
        const refreshedConfigs = await executeNodeAndNotify(legacyConnection);
        
        onConnectionChange?.({
          connection: legacyConnection,
          refreshedConfigs: refreshedConfigs || {},
          connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
        });
      }
    } finally {
      isOAuthSuccessHandling.current = false;
    }
  }, [fetchConnections, executeNodeAndNotify, onConnectionChange, connectionNodeData]);

  const { launchOAuthFlow, isLaunching: isCreatingConnection } = useLegacyOAuthPopup({
    authorizationConfig,
    resourceIds: stableResourceIds,
    onSuccess: handleOAuthSuccess,
  });

  const onCreateOAuthConnection = useCallback(
    async (name: string): Promise<void> => {
      // Store the connection name so we can find it after OAuth success
      pendingConnectionNameRef.current = name;
      await launchOAuthFlow(name);
    },
    [launchOAuthFlow]
  );

  const onCreateFormConnection = useCallback(
    async (name: string, credentials: Record<string, string>): Promise<Connection> => {
      if (!stableAuthorizationId) {
        throw new Error("Authorization ID not configured");
      }

      // Build configs based on auth type
      // The legacy system expects configs as key-value pairs where the key is the field label
      const configData: Record<string, any> = {};
      
      if (authType === "api-key") {
        // For API key auth, the key is typically "API Key" or similar
        configData["API Key"] = credentials.apiKey || credentials["API Key"] || "";
      } else if (authType === "basic") {
        // For basic auth, we need username and password
        configData["Username"] = credentials.username || credentials["Username"] || "";
        configData["Password"] = credentials.password || credentials["Password"] || "";
      } else if (authType === "custom") {
        // For custom auth, pass through all credentials as-is
        Object.entries(credentials).forEach(([key, value]) => {
          configData[key] = value;
        });
      }

      // Call post_hook if configured (similar to legacy AddConnection)
      // Wrap in try-catch to handle post hook failures gracefully (match legacy behavior)
      try {
        const authorizationForPostHook = {
          authorization_type: connectionConfig?.authorization_type,
          configs: connectionConfig?.configs,
        };
        const postHookMeta = await getPostHookMeta(authorizationForPostHook, configData);
        if (postHookMeta && Object.keys(postHookMeta).length > 0) {
          configData["post_hook_meta"] = postHookMeta;
        }
      } catch (postHookError) {
        // Log but continue with connection creation (mirrors legacy behavior)
        console.warn("Post hook meta failed, continuing without it:", postHookError);
      }

      const body = {
        name: name,
        authorization_id: stableAuthorizationId,
        request_id: new Date().getTime(),
        parent_id: stableResourceIds.projectId,
        workspace_id: stableResourceIds.workspaceId,
        configs: configData,
        state: "ACTIVE",
      };

      const postOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: (window as any).accessToken,
        },
        body: JSON.stringify(body),
      };

      const res = await fetch(
        `${serverConfig.OUTE_SERVER}/service/v0/authorized/data/save`,
        postOptions
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to create connection");
      }

      // Refresh connections to get the newly created one
      const updatedConnections = await fetchConnections();
      
      // Find the newly created connection (should be the most recent one with matching name)
      const newConnection = updatedConnections.find(c => c.name === name) || updatedConnections[0];
      
      if (newConnection) {
        setSelectedConnectionState(newConnection);
        
        const legacyConnection = mapNewConnectionToLegacy(newConnection);
        const refreshedConfigs = await executeNodeAndNotify(legacyConnection);
        
        onConnectionChange?.({
          connection: legacyConnection,
          refreshedConfigs: refreshedConfigs || {},
          connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
        });
      }

      return newConnection;
    },
    [stableAuthorizationId, authType, stableResourceIds, connectionConfig, fetchConnections, executeNodeAndNotify, onConnectionChange, connectionNodeData]
  );

  const onCreateCustomConnection = useCallback(
    async (name: string, formData: { state: Record<string, any>; flow: any }): Promise<Connection> => {
      if (!stableAuthorizationId) {
        throw new Error("Authorization ID not configured");
      }

      const { state, flow } = formData;
      
      // Map form responses to config keys using legacy pattern
      // The legacy system maps question labels to config keys
      const questionIds = Object.keys(state);
      const nodes = flow?.flow;
      
      const configData: Record<string, any> = {};
      
      questionIds.forEach((id) => {
        const configDataKey = removeTagsFromString(nodes[id]?.config?.question || "");
        if (configDataKey) {
          configData[configDataKey] = state[id]?.response;
        }
      });

      // Call post_hook if configured (similar to legacy AddConnection)
      // Wrap in try-catch to handle post hook failures gracefully (match legacy behavior)
      try {
        const authorizationForPostHook = {
          authorization_type: connectionConfig?.authorization_type,
          configs: connectionConfig?.configs,
        };
        const postHookMeta = await getPostHookMeta(authorizationForPostHook, configData);
        if (postHookMeta && Object.keys(postHookMeta).length > 0) {
          configData["post_hook_meta"] = postHookMeta;
        }
      } catch (postHookError) {
        // Log but continue with connection creation (mirrors legacy behavior)
        console.warn("Post hook meta failed, continuing without it:", postHookError);
      }

      const body = {
        name: name,
        authorization_id: stableAuthorizationId,
        request_id: new Date().getTime(),
        parent_id: stableResourceIds.projectId,
        workspace_id: stableResourceIds.workspaceId,
        configs: configData,
        state: "ACTIVE",
      };

      const postOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: (window as any).accessToken,
        },
        body: JSON.stringify(body),
      };

      const response = await fetch(
        `${serverConfig.OUTE_SERVER}/service/v0/authorized/data/save`,
        postOptions
      );

      const responseData = await response.json();

      if (responseData.status !== "success") {
        throw new Error(responseData?.result?.message || "Failed to create connection");
      }

      // Refresh connections list after creation
      const updatedConnections = await fetchConnections();
      
      // Find the newly created connection (should be the most recent one with matching name)
      const newConnection = updatedConnections.find(c => c.name === name) || updatedConnections[0];
      
      if (newConnection) {
        setSelectedConnectionState(newConnection);
        
        const legacyConnection = mapNewConnectionToLegacy(newConnection);
        const refreshedConfigs = await executeNodeAndNotify(legacyConnection);
        
        onConnectionChange?.({
          connection: legacyConnection,
          refreshedConfigs: refreshedConfigs || {},
          connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
        });
      }

      return newConnection;
    },
    [stableAuthorizationId, authorizationType, stableResourceIds, connectionConfig, fetchConnections, executeNodeAndNotify, onConnectionChange, connectionNodeData]
  );

  const onSelect = useCallback(
    async (connection: Connection): Promise<void> => {
      const connectionId = connection._id || connection.id;
      if (!connectionId) return;

      const previousSelected = selectedConnectionState;
      setSelectedConnectionState(connection);

      const legacyConnection = mapNewConnectionToLegacy(connection);
      const refreshedConfigs = await executeNodeAndNotify(legacyConnection);

      if (!refreshedConfigs) {
        setSelectedConnectionState(previousSelected);
        onConnectionChange?.({
          connection: previousSelected ? mapNewConnectionToLegacy(previousSelected) : null,
          refreshedConfigs: {},
          connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
        });
        return;
      }

      onConnectionChange?.({
        connection: legacyConnection,
        refreshedConfigs,
        connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
      });
    },
    [selectedConnectionState, executeNodeAndNotify, onConnectionChange, connectionNodeData]
  );

  const onEdit = useCallback(
    async (connectionId: string, newName: string): Promise<void> => {
      const connectionToUpdate = connections.find(
        (conn) => (conn._id || conn.id) === connectionId
      );
      
      if (!connectionToUpdate) return;

      const legacyConnection = mapNewConnectionToLegacy(connectionToUpdate);
      
      await authorizeDataSDKServices.save({
        ...legacyConnection,
        name: newName,
      });

      const updatedConnections = connections.map((conn) => {
        if ((conn._id || conn.id) === connectionId) {
          return {
            ...conn,
            name: newName,
            updatedAt: new Date().toISOString(),
          };
        }
        return conn;
      });
      setConnections(updatedConnections);

      if ((selectedConnectionState?._id || selectedConnectionState?.id) === connectionId) {
        const updatedSelectedConnection = updatedConnections.find(
          (conn) => (conn._id || conn.id) === connectionId
        );
        if (updatedSelectedConnection) {
          setSelectedConnectionState(updatedSelectedConnection);
          onConnectionChange?.({
            connection: mapNewConnectionToLegacy(updatedSelectedConnection),
            refreshedConfigs: {},
            connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
          });
        }
      }
    },
    [connections, selectedConnectionState, onConnectionChange, connectionNodeData]
  );

  const onDelete = useCallback(
    async (connectionId: string): Promise<void> => {
      const response = await authorizeDataSDKServices.deleteById(connectionId);
      
      if (response?.status === "success") {
        const isSelectedConnection =
          (selectedConnectionState?._id || selectedConnectionState?.id) === connectionId;

        if (isSelectedConnection) {
          setSelectedConnectionState(null);
          onConnectionChange?.({
            connection: null,
            refreshedConfigs: {},
            connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
          });
        }

        const updatedConnections = connections.filter(
          (conn) => (conn._id || conn.id) !== connectionId
        );
        setConnections(updatedConnections);
      }
    },
    [connections, selectedConnectionState, onConnectionChange, connectionNodeData]
  );

  useEffect(() => {
    const initializeConnections = async () => {
      if (isInitialFetchDone.current) return;
      isInitialFetchDone.current = true;

      const fetchedConnections = await fetchConnections();
      setHasInitiallyLoaded(true);

      if (!initialSelectedConnection && fetchedConnections.length > 0) {
        const latestConnection = fetchedConnections[0];
        setSelectedConnectionState(latestConnection);
        
        const legacyConnection = mapNewConnectionToLegacy(latestConnection);
        const refreshedConfigs = await executeNodeAndNotify(legacyConnection);
        
        if (refreshedConfigs) {
          onConnectionChange?.({
            connection: legacyConnection,
            refreshedConfigs,
            connectionNodeKey: connectionNodeData?.id || connectionNodeData?._id,
          });
        }
      }
    };

    initializeConnections();
  }, []);

  return {
    connections,
    selectedConnection: selectedConnectionState,
    authType,
    integrationName,
    integrationIcon,
    loading,
    hasInitiallyLoaded,
    isCreatingConnection,
    connectionConfig,
    resourceIds: stableResourceIds,
    onSelect,
    onCreateOAuthConnection,
    onCreateFormConnection,
    onCreateCustomConnection,
    onEdit,
    onDelete,
    refreshConnections: fetchConnections,
  };
}
