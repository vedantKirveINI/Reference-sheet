import { useState, useCallback, useEffect, useRef } from "react";
import { Connection, AuthType, DatabaseConnectionConfig } from "../types";
import { connectionSDKServices } from "../../canvas/services/dbConnectionSDKServices";
import { DATABASE_TYPES } from "../../canvas/extensions/crud-operations/utils/databaseConfig";
// @ts-ignore - SDK module without type declarations
import ConnectionSDK from "oute-services-db-connection-sdk";
import { serverConfig } from "@src/module/ods";

const getConnectionInstance = () => {
  return new ConnectionSDK({
    url: serverConfig.OUTE_SERVER,
    token: (window as any).accessToken || "",
  });
};

interface LegacyDBConnection {
  _id?: string;
  id?: string;
  connection_id?: string;
  name?: string;
  db_type?: string;
  configs?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

interface ResourceIds {
  projectId?: string;
  workspaceId?: string;
  parentId?: string;
}

interface UseDatabaseConnectionAdapterProps {
  resourceIds?: ResourceIds;
  databaseType?: string;
  selectedConnection?: LegacyDBConnection | null;
  onConnectionChange?: (connection: LegacyDBConnection | null, isNew?: boolean) => void;
}

interface UseDatabaseConnectionAdapterReturn {
  connections: Connection[];
  selectedConnection: Connection | null;
  authType: AuthType;
  integrationName: string;
  integrationIcon: string | undefined;
  loading: boolean;
  hasInitiallyLoaded: boolean;
  isCreatingConnection: boolean;
  onSelect: (connection: Connection) => Promise<void>;
  onCreateDatabaseConnection: (config: DatabaseConnectionConfig) => Promise<Connection>;
  onUpdateDatabaseConnection: (connectionId: string, config: DatabaseConnectionConfig) => Promise<Connection>;
  onTestConnection: (config: DatabaseConnectionConfig) => Promise<{ success: boolean; message?: string }>;
  onDelete: (connectionId: string) => Promise<void>;
  refreshConnections: () => Promise<Connection[]>;
}

function getIntegrationName(dbType?: string): string {
  switch (dbType) {
    case DATABASE_TYPES.POSTGRESQL:
      return "PostgreSQL";
    case DATABASE_TYPES.MYSQL:
      return "MySQL";
    default:
      return "Database";
  }
}

function getIntegrationIcon(dbType?: string): string {
  switch (dbType) {
    case DATABASE_TYPES.POSTGRESQL:
      return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg";
    case DATABASE_TYPES.MYSQL:
      return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg";
    default:
      return "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg";
  }
}

/** Fx-style config value: expression with blocks that hold primitive values */
interface FxConfigValue {
  type: "fx";
  blocks: Array<{ type: string; value?: string }>;
}

/**
 * Normalizes a config value to a string. Handles both plain strings and fx-style
 * objects (e.g. { type: "fx", blocks: [{ type: "PRIMITIVES", value: "pg.digihealth.in" }] }).
 */
function configValueToString(value: string | FxConfigValue | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.type === "fx" && Array.isArray(value.blocks)) {
    const parts = value.blocks
      .map((block) => (block && typeof block.value === "string" ? block.value : ""))
      .filter(Boolean);
    return parts.length > 0 ? parts.join("") : undefined;
  }
  return undefined;
}

function getConfigValue(configs: any, key: string): string | undefined {
  if (!configs) return undefined;
  let raw: string | FxConfigValue | undefined;
  if (Array.isArray(configs)) {
    const item = configs.find((c: any) => c.key === key);
    raw = item?.value;
  } else if (typeof configs === "object") {
    const v = configs[key];
    raw = v?.value ?? v;
  } else {
    raw = undefined;
  }

  return configValueToString(raw);
}

function mapLegacyConnectionToNew(legacyConn: LegacyDBConnection): Connection {
  const id = legacyConn._id || legacyConn.id || legacyConn.connection_id || "";
  const configs = legacyConn.configs;
  return {
    _id: id,
    id: id,
    name: legacyConn.name || "Unnamed Connection",
    authType: "database",
    status: "connected",
    configs,
    createdAt: legacyConn.created_at,
    updatedAt: legacyConn.updated_at,
    metadata: {
      database: legacyConn.db_type,
      host: getConfigValue(configs, "host"),
      port: getConfigValue(configs, "port"),
      databaseName: getConfigValue(configs, "db_name"),
      schema: getConfigValue(configs, "schema_name"),
      username: getConfigValue(configs, "username"),
      password: getConfigValue(configs, "password"),
    },
  };
}

function mapNewConnectionToLegacy(newConn: Connection): LegacyDBConnection {
  return {
    _id: newConn._id,
    id: newConn.id || newConn._id,
    connection_id: newConn._id,
    name: newConn.name,
    configs: newConn.configs,
    db_type: newConn.metadata?.database,
    created_at: newConn.createdAt,
    updated_at: newConn.updatedAt,
  };
}

export function useDatabaseConnectionAdapter({
  resourceIds = {},
  databaseType = DATABASE_TYPES.POSTGRESQL,
  selectedConnection: initialSelectedConnection,
  onConnectionChange,
}: UseDatabaseConnectionAdapterProps): UseDatabaseConnectionAdapterReturn {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnectionState, setSelectedConnectionState] = useState<Connection | null>(
    initialSelectedConnection ? mapLegacyConnectionToNew(initialSelectedConnection) : null
  );
  const [loading, setLoading] = useState(true);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isCreatingConnection, setIsCreatingConnection] = useState(false);
  const isInitialFetchDone = useRef(false);

  const fetchConnections = useCallback(async (): Promise<Connection[]> => {
    if (!resourceIds.workspaceId) {
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      const response = await connectionSDKServices.getByParent({
        workspace_id: resourceIds.workspaceId,
        parent_id: resourceIds.projectId,
        db_type: databaseType,
      });

      if (response?.status === "success") {
        const mappedConnections = (response.result || []).map(mapLegacyConnectionToNew);
        setConnections(mappedConnections);
        return mappedConnections;
      }
      return [];
    } catch (error) {
      console.error("[useDatabaseConnectionAdapter] Error fetching connections:", error);
      return [];
    } finally {
      setLoading(false);
      setHasInitiallyLoaded(true);
    }
  }, [resourceIds.workspaceId, resourceIds.projectId]);

  useEffect(() => {
    if (!isInitialFetchDone.current && resourceIds.workspaceId) {
      isInitialFetchDone.current = true;
      fetchConnections();
    }
  }, [fetchConnections, resourceIds.workspaceId]);

  useEffect(() => {
    if (initialSelectedConnection) {
      const mapped = mapLegacyConnectionToNew(initialSelectedConnection);
      setSelectedConnectionState(mapped);
    } else {
      setSelectedConnectionState(null);
    }
  }, [initialSelectedConnection?._id, initialSelectedConnection?.id, initialSelectedConnection?.connection_id]);

  const handleSelect = useCallback(async (connection: Connection) => {
    setSelectedConnectionState(connection);
    const legacyConnection = mapNewConnectionToLegacy(connection);
    onConnectionChange?.(legacyConnection, false);
  }, [onConnectionChange]);

  const handleCreateDatabaseConnection = useCallback(async (config: DatabaseConnectionConfig): Promise<Connection> => {
    setIsCreatingConnection(true);
    try {
      const defaultPort = databaseType === DATABASE_TYPES.MYSQL ? "3306" : "5432";
      const supportsSchema = databaseType !== DATABASE_TYPES.MYSQL;

      const configsArray: Array<{ key: string; value: string; required?: boolean; is_protected?: boolean }> = [
        { key: "name", value: config.connectionName },
        { key: "host", value: config.host, required: true },
        { key: "port", value: config.port || defaultPort },
        { key: "db_name", value: config.databaseName, required: true },
        ...(supportsSchema ? [{ key: "schema_name", value: config.schema || "public" }] : []),
        { key: "username", value: config.username, required: true },
        { key: "password", value: config.password, required: true, is_protected: true },
      ];

      if (config.useSSHTunnel) {
        configsArray.push(
          { key: "ssh_host", value: config.sshHost || "" },
          { key: "ssh_port", value: config.sshPort || "22" },
          { key: "ssh_username", value: config.sshUsername || "" },
          { key: "ssh_private_key", value: config.sshPrivateKey || "", is_protected: true }
        );
      }

      const sdkInstance = getConnectionInstance();

      const testPayload = {
        state: {},
        db_config: { db_type: databaseType, configs: configsArray },
        options: {},
      };
      const testResponse = await sdkInstance.testConnection(testPayload);
      if (testResponse?.status !== "success") {
        throw new Error(testResponse?.message || "Connection test failed");
      }

      const savePayload = {
        configs: configsArray,
        workspace_id: resourceIds.workspaceId,
        db_type: databaseType,
        name: config.connectionName,
      };
      const response = await sdkInstance.save(savePayload);

      if (response?.status === "success" && response?.result) {
        const newConnection = mapLegacyConnectionToNew(response.result);
        setSelectedConnectionState(newConnection);
        setConnections(prev => [...prev, newConnection]);
        onConnectionChange?.(response.result, true);
        return newConnection;
      }

      throw new Error(response?.message || "Failed to save connection");
    } finally {
      setIsCreatingConnection(false);
    }
  }, [databaseType, resourceIds.workspaceId, onConnectionChange]);

  const handleUpdateDatabaseConnection = useCallback(async (connectionId: string, config: DatabaseConnectionConfig): Promise<Connection> => {
    setIsCreatingConnection(true);
    try {
      const defaultPort = databaseType === DATABASE_TYPES.MYSQL ? "3306" : "5432";
      const supportsSchema = databaseType !== DATABASE_TYPES.MYSQL;

      const configsArray: Array<{ key: string; value: string; required?: boolean; is_protected?: boolean }> = [
        { key: "name", value: config.connectionName },
        { key: "host", value: config.host, required: true },
        { key: "port", value: config.port || defaultPort },
        { key: "db_name", value: config.databaseName, required: true },
        ...(supportsSchema ? [{ key: "schema_name", value: config.schema || "public" }] : []),
        { key: "username", value: config.username, required: true },
        { key: "password", value: config.password, required: true, is_protected: true },
      ];

      if (config.useSSHTunnel) {
        configsArray.push(
          { key: "ssh_host", value: config.sshHost || "" },
          { key: "ssh_port", value: config.sshPort || "22" },
          { key: "ssh_username", value: config.sshUsername || "" },
          { key: "ssh_private_key", value: config.sshPrivateKey || "", is_protected: true }
        );
      }

      const sdkInstance = getConnectionInstance();

      const testPayload = {
        state: {},
        db_config: { db_type: databaseType, configs: configsArray },
        options: {},
      };
      const testResponse = await sdkInstance.testConnection(testPayload);
      if (testResponse?.status !== "success") {
        throw new Error(testResponse?.message || "Connection test failed");
      }

      const savePayload = {
        _id: connectionId,
        connection_id: connectionId,
        configs: configsArray,
        workspace_id: resourceIds.workspaceId,
        parent_id: resourceIds.projectId,
        db_type: databaseType,
        name: config.connectionName,
      };
      const response = await sdkInstance.save(savePayload);

      if (response?.status === "success" && response?.result) {
        const updatedConnection = mapLegacyConnectionToNew(response.result);
        setConnections(prev => prev.map(c => (c._id === connectionId ? updatedConnection : c)));
        if (selectedConnectionState?._id === connectionId) {
          setSelectedConnectionState(updatedConnection);
          onConnectionChange?.(response.result, false);
        }
        return updatedConnection;
      }

      throw new Error(response?.message || "Failed to update connection");
    } finally {
      setIsCreatingConnection(false);
    }
  }, [databaseType, resourceIds.workspaceId, onConnectionChange, selectedConnectionState?._id]);

  const handleTestConnection = useCallback(async (config: DatabaseConnectionConfig): Promise<{ success: boolean; message?: string }> => {
    try {
      const defaultPort = databaseType === DATABASE_TYPES.MYSQL ? "3306" : "5432";
      const supportsSchema = databaseType !== DATABASE_TYPES.MYSQL;

      const configsArray: Array<{ key: string; value: string; required?: boolean; is_protected?: boolean }> = [
        { key: "name", value: config.connectionName },
        { key: "host", value: config.host, required: true },
        { key: "port", value: config.port || defaultPort },
        { key: "db_name", value: config.databaseName, required: true },
        ...(supportsSchema ? [{ key: "schema_name", value: config.schema || "public" }] : []),
        { key: "username", value: config.username, required: true },
        { key: "password", value: config.password, required: true, is_protected: true },
      ];

      if (config.useSSHTunnel) {
        configsArray.push(
          { key: "ssh_host", value: config.sshHost || "" },
          { key: "ssh_port", value: config.sshPort || "22" },
          { key: "ssh_username", value: config.sshUsername || "" },
          { key: "ssh_private_key", value: config.sshPrivateKey || "", is_protected: true }
        );
      }

      const sdkInstance = getConnectionInstance();

      const testPayload = {
        state: {},
        db_config: { db_type: databaseType, configs: configsArray },
        options: {},
      };

      const testResponse = await sdkInstance.testConnection(testPayload);

      if (testResponse?.status === "success") {
        return { success: true, message: "Connection successful!" };
      } else {
        return { success: false, message: testResponse?.message || "Connection test failed" };
      }
    } catch (error: any) {
      console.error("[useDatabaseConnectionAdapter] Error testing connection:", error);
      const message = error?.message || (error?.result as any)?.message || "Connection test failed";
      return { success: false, message };
    }
  }, [databaseType, resourceIds.workspaceId, resourceIds.projectId]);

  const handleDelete = useCallback(async (connectionId: string) => {
    try {
      const sdkInstance = getConnectionInstance();
      const response = await sdkInstance.deleteById(connectionId);
      if (response?.status !== "success") {
        throw new Error(response?.message || "Failed to delete connection");
      }
      setConnections(prev => prev.filter(c => c._id !== connectionId));
      if (selectedConnectionState?._id === connectionId) {
        setSelectedConnectionState(null);
        onConnectionChange?.(null, false);
      }
      await fetchConnections();
    } catch (error) {
      console.error("[useDatabaseConnectionAdapter] Error deleting connection:", error);
      throw error;
    }
  }, [selectedConnectionState, onConnectionChange, fetchConnections]);

  return {
    connections,
    selectedConnection: selectedConnectionState,
    authType: "database" as AuthType,
    integrationName: getIntegrationName(databaseType),
    integrationIcon: getIntegrationIcon(databaseType),
    loading,
    hasInitiallyLoaded,
    isCreatingConnection,
    onSelect: handleSelect,
    onCreateDatabaseConnection: handleCreateDatabaseConnection,
    onUpdateDatabaseConnection: handleUpdateDatabaseConnection,
    onTestConnection: handleTestConnection,
    onDelete: handleDelete,
    refreshConnections: fetchConnections,
  };
}
