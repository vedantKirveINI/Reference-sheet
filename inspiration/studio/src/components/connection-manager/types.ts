export type AuthType = 
  | "oauth2" 
  | "database" 
  | "api-key" 
  | "basic" 
  | "custom";

export type ConnectionStatus = 
  | "connected" 
  | "expired" 
  | "error" 
  | "pending";

export interface ConnectionUsage {
  workflows: number;
  forms: number;
}

export interface Connection {
  _id: string;
  id?: string;
  name: string;
  authType: AuthType;
  status: ConnectionStatus;
  configs?: Record<string, any>;
  usage?: ConnectionUsage;
  lastSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: {
    username?: string;
    password?: string;
    database?: string;
    databaseName?: string;
    host?: string;
    port?: string;
    schema?: string;
    version?: string;
    icon?: string;
    authorization_type?: string;
    [key: string]: any;
  };
}

export interface ConnectionManagerProps {
  authType: AuthType;
  authorizationConfig?: any;
  resourceIds?: {
    _id?: string;
    parentId?: string;
    projectId?: string;
    workspaceId?: string;
    assetId?: string;
    canvasId?: string;
  };
  integrationName?: string;
  integrationIcon?: string;
  integrationDescription?: string;
  selectedConnection?: Connection | null;
  onConnectionChange?: (connection: Connection | null) => void;
  onConnectionSelect?: (connection: Connection) => void;
  disabled?: boolean;
}

export interface DatabaseConnectionConfig {
  connectionName: string;
  host: string;
  port: string;
  databaseName: string;
  schema?: string;
  username: string;
  password: string;
  useSSHTunnel?: boolean;
  sshHost?: string;
  sshPort?: string;
  sshUsername?: string;
  sshPrivateKey?: string;
}

export type ConnectionManagerView = "empty" | "list" | "selected" | "add-new" | "edit";
