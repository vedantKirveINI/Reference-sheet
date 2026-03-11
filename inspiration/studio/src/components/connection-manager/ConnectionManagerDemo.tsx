import { useState } from "react";
import { ConnectionManager } from "./ConnectionManager";
import { Connection, AuthType, DatabaseConnectionConfig } from "./types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockConnections: Connection[] = [
  {
    _id: "conn-1",
    name: "Production PostgreSQL",
    authType: "database",
    status: "connected",
    usage: { workflows: 12, forms: 3 },
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    metadata: {
      username: "admin",
      database: "prod_db",
      host: "db.example.com",
      version: "15.2",
    },
  },
  {
    _id: "conn-2",
    name: "Staging Database",
    authType: "database",
    status: "connected",
    usage: { workflows: 4, forms: 0 },
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    metadata: {
      username: "staging_user",
      database: "staging_db",
      host: "staging.example.com",
    },
  },
  {
    _id: "conn-3",
    name: "My Slack Workspace",
    authType: "oauth2",
    status: "connected",
    usage: { workflows: 8, forms: 2 },
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    metadata: {
      username: "john@example.com",
    },
  },
  {
    _id: "conn-4",
    name: "OpenAI API",
    authType: "api-key",
    status: "connected",
    usage: { workflows: 25, forms: 5 },
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    _id: "conn-5",
    name: "Expired Connection",
    authType: "oauth2",
    status: "expired",
    usage: { workflows: 2, forms: 0 },
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export function ConnectionManagerDemo() {
  const [authType, setAuthType] = useState<AuthType>("database");
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [connections, setConnections] = useState<Connection[]>(
    mockConnections.filter((c) => c.authType === authType)
  );
  const [showEmpty, setShowEmpty] = useState(false);

  const handleAuthTypeChange = (newType: AuthType) => {
    setAuthType(newType);
    setSelectedConnection(null);
    if (showEmpty) {
      setConnections([]);
    } else {
      setConnections(mockConnections.filter((c) => c.authType === newType));
    }
  };

  const handleToggleEmpty = () => {
    const nextShowEmpty = !showEmpty;
    setShowEmpty(nextShowEmpty);
    if (nextShowEmpty) {
      setConnections([]);
      setSelectedConnection(null);
    } else {
      setConnections(mockConnections.filter((c) => c.authType === authType));
    }
  };

  const handleCreateDatabaseConnection = async (config: DatabaseConnectionConfig): Promise<Connection> => {
    const newConnection: Connection = {
      _id: `conn-${Date.now()}`,
      name: config.connectionName,
      authType: "database",
      status: "connected",
      usage: { workflows: 0, forms: 0 },
      lastSyncedAt: new Date().toISOString(),
      metadata: {
        username: config.username,
        database: config.databaseName,
        host: config.host,
      },
    };
    setConnections((prev) => [newConnection, ...prev]);
    return newConnection;
  };

  const handleCreateOAuthConnection = async (name: string): Promise<void> => {
    const newConnection: Connection = {
      _id: `conn-${Date.now()}`,
      name,
      authType: "oauth2",
      status: "connected",
      usage: { workflows: 0, forms: 0 },
      lastSyncedAt: new Date().toISOString(),
    };
    setConnections((prev) => [newConnection, ...prev]);
    setSelectedConnection(newConnection);
  };

  const handleCreateFormConnection = async (name: string, _credentials: Record<string, string>): Promise<Connection> => {
    const newConnection: Connection = {
      _id: `conn-${Date.now()}`,
      name,
      authType: authType,
      status: "connected",
      usage: { workflows: 0, forms: 0 },
      lastSyncedAt: new Date().toISOString(),
    };
    setConnections((prev) => [newConnection, ...prev]);
    return newConnection;
  };

  const handleDeleteConnection = async (connectionId: string): Promise<void> => {
    setConnections((prev) => prev.filter((c) => c._id !== connectionId));
    if (selectedConnection?._id === connectionId) {
      setSelectedConnection(null);
    }
  };

  const getIntegrationName = () => {
    switch (authType) {
      case "oauth2":
        return "Slack";
      case "database":
        return "PostgreSQL";
      case "api-key":
        return "OpenAI";
      case "basic":
        return "SFTP Server";
      default:
        return "Service";
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Connection Manager Demo
        </h1>
        <p className="text-slate-600">
          Test different auth types and states of the connection manager component.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-slate-200">
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-700 mb-1 block">
            Auth Type
          </label>
          <Select value={authType} onValueChange={(v) => handleAuthTypeChange(v as AuthType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oauth2">OAuth2 (e.g., Slack)</SelectItem>
              <SelectItem value="database">Database (e.g., PostgreSQL)</SelectItem>
              <SelectItem value="api-key">API Key (e.g., OpenAI)</SelectItem>
              <SelectItem value="basic">Basic Auth (e.g., SFTP)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button
            variant={showEmpty ? "default" : "outline"}
            onClick={handleToggleEmpty}
            size="sm"
          >
            {showEmpty ? "Show Data" : "Show Empty"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
        <ConnectionManager
          authType={authType}
          integrationName={getIntegrationName()}
          connections={connections}
          selectedConnection={selectedConnection}
          onConnectionChange={(conn) => {
            setSelectedConnection(conn);
          }}
          onCreateOAuthConnection={handleCreateOAuthConnection}
          onCreateDatabaseConnection={handleCreateDatabaseConnection}
          onCreateFormConnection={handleCreateFormConnection}
          onDeleteConnection={handleDeleteConnection}
        />
      </div>

      {selectedConnection && (
        <div className="mt-6 p-4 bg-slate-100 rounded-lg">
          <p className="text-sm font-medium text-slate-700 mb-2">Selected Connection:</p>
          <pre className="text-xs text-slate-600 overflow-auto">
            {JSON.stringify(selectedConnection, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
