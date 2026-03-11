import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionManagerProps, Connection, DatabaseConnectionConfig, ConnectionManagerView } from "./types";
import { useConnectionManager } from "./hooks/useConnectionManager";
import { EmptyState } from "./components/EmptyState";
import { ConnectionsList } from "./components/ConnectionsList";
import { SelectedConnection } from "./components/SelectedConnection";
import { OAuthConnectionForm } from "./components/OAuthConnectionForm";
import { DatabaseConnectionForm } from "./components/DatabaseConnectionForm";
import { FormBasedConnectionForm } from "./components/FormBasedConnectionForm";

interface ConnectionManagerComponentProps extends ConnectionManagerProps {
  connections?: Connection[];
  onFetchConnections?: () => Promise<Connection[]>;
  onCreateOAuthConnection?: (name: string) => Promise<void>;
  onCreateDatabaseConnection?: (config: DatabaseConnectionConfig) => Promise<Connection>;
  onUpdateDatabaseConnection?: (connectionId: string, config: DatabaseConnectionConfig) => Promise<Connection>;
  onTestDatabaseConnection?: (config: DatabaseConnectionConfig) => Promise<{ success: boolean; message?: string }>;
  onCreateFormConnection?: (name: string, credentials: Record<string, string>) => Promise<Connection>;
  onCreateCustomConnection?: (name: string, formData: { state: Record<string, any>; flow: any }) => Promise<Connection>;
  onDeleteConnection?: (connectionId: string) => Promise<void>;
  onEditConnection?: (connection: Connection) => void;
  onRenameConnection?: (connection: Connection, newName: string) => void | Promise<void>;
  onViewChange?: (view: ConnectionManagerView) => void;
  databaseType?: string;
  className?: string;
}

export function ConnectionManager({
  authType,
  authorizationConfig,
  resourceIds: _resourceIds,
  integrationName,
  integrationIcon,
  integrationDescription: _integrationDescription,
  selectedConnection,
  onConnectionChange,
  onConnectionSelect,
  disabled,
  connections: externalConnections = [],
  onFetchConnections,
  onCreateOAuthConnection,
  onCreateDatabaseConnection,
  onUpdateDatabaseConnection,
  onTestDatabaseConnection,
  onCreateFormConnection,
  onCreateCustomConnection,
  onDeleteConnection,
  onEditConnection,
  onRenameConnection,
  onViewChange,
  databaseType,
  className,
}: ConnectionManagerComponentProps) {
  const {
    view,
    connections,
    selectedConnectionId,
    editingConnection,
    isLoading,
    error,
    setView,
    selectConnection,
    handleAddNew,
    handleSwitch,
    handleEdit,
    handleDelete,
    handleOAuthSubmit,
    handleDatabaseSubmit,
    handleDatabaseUpdate,
    handleFormSubmit,
    handleCustomSubmit,
    refreshConnections,
  } = useConnectionManager({
    authType,
    connections: externalConnections,
    selectedConnection,
    onConnectionChange,
    onFetchConnections,
    onCreateOAuthConnection,
    onCreateDatabaseConnection,
    onUpdateDatabaseConnection,
    onCreateFormConnection,
    onCreateCustomConnection,
    onDeleteConnection,
  });

  useEffect(() => {
    if (onFetchConnections) {
      refreshConnections();
    }
  }, []);

  useEffect(() => {
    onViewChange?.(view);
  }, [view, onViewChange]);

  const handleSelect = useCallback((connection: Connection) => {
    selectConnection(connection);
    onConnectionSelect?.(connection);
  }, [selectConnection, onConnectionSelect]);

  const handleCancelForm = useCallback(() => {
    if (connections.length === 0) {
      setView("empty");
    } else if (selectedConnectionId) {
      setView("selected");
    } else {
      setView("list");
    }
  }, [connections.length, selectedConnectionId, setView]);

  const selectedConn = connections.find(
    (c) => (c._id || c.id) === selectedConnectionId
  );

  const renderAddNewForm = () => {
    switch (authType) {
      case "oauth2":
        return (
          <OAuthConnectionForm
            authType={authType}
            integrationName={integrationName}
            integrationIcon={integrationIcon}
            authorizationConfig={authorizationConfig}
            onSubmit={handleOAuthSubmit}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        );
      case "database":
        return (
          <DatabaseConnectionForm
            integrationName={integrationName}
            databaseType={databaseType}
            onSubmit={handleDatabaseSubmit}
            onTestConnection={onTestDatabaseConnection}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        );
      case "api-key":
      case "basic":
      case "custom":
        return (
          <FormBasedConnectionForm
            authType={authType}
            integrationName={integrationName}
            authorizationConfig={authorizationConfig}
            resourceIds={_resourceIds}
            onSubmit={handleFormSubmit}
            onSubmitCustom={handleCustomSubmit}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col h-full w-full min-w-0 overflow-x-hidden", className)}>
      {isLoading && view !== "add-new" && view !== "edit" && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {view === "empty" && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-5 min-w-0"
          >
            <EmptyState
              authType={authType}
              integrationName={integrationName}
              integrationIcon={integrationIcon}
              onAddConnection={handleAddNew}
              disabled={disabled}
            />
          </motion.div>
        )}

        {view === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden px-4 py-5 min-w-0"
          >
            <ConnectionsList
              connections={connections}
              selectedConnectionId={selectedConnectionId || undefined}
              authType={authType}
              integrationName={integrationName}
              onSelect={handleSelect}
              onEdit={onRenameConnection ? undefined : (conn) => handleEdit(conn)}
              onRename={onRenameConnection}
              onDelete={handleDelete}
              onAddNew={handleAddNew}
              onRefresh={onFetchConnections ? refreshConnections : undefined}
              isRefreshing={isLoading}
              disabled={disabled}
            />
          </motion.div>
        )}

        {view === "selected" && selectedConn && (
          <motion.div
            key="selected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-w-0 px-4 py-5"
          >
            <SelectedConnection
              connection={selectedConn}
              onSwitch={handleSwitch}
              onAddNew={handleAddNew}
              disabled={disabled}
            />
          </motion.div>
        )}

        {view === "add-new" && (
          <motion.div
            key="add-new"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-4 py-5 min-w-0"
          >
            {renderAddNewForm()}
          </motion.div>
        )}

        {view === "edit" && editingConnection && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 px-4 py-5 min-w-0"
          >
            {editingConnection.authType === "database" ? (
              <DatabaseConnectionForm
                integrationName={integrationName}
                databaseType={databaseType || editingConnection.metadata?.databaseType}
                onSubmit={async (config) => {
                  await handleDatabaseUpdate(config);
                }}
                onTestConnection={onTestDatabaseConnection}
                onCancel={handleCancelForm}
                isLoading={isLoading}
                initialConfig={{
                  connectionName: editingConnection.name,
                  host: editingConnection.metadata?.host || "",
                  port: editingConnection.metadata?.port || (databaseType === "mysql" ? "3306" : "5432"),
                  databaseName: editingConnection.metadata?.databaseName || editingConnection.metadata?.database || "",
                  schema: editingConnection.metadata?.schema,
                  username: editingConnection.metadata?.username || "",
                  password: editingConnection.metadata?.password || "",
                }}
                ctaText="Update Connection"
              />
            ) : editingConnection.authType === "oauth2" ? (
              <OAuthConnectionForm
                authType="oauth2"
                integrationName={integrationName}
                integrationIcon={integrationIcon}
                authorizationConfig={authorizationConfig}
                onSubmit={handleOAuthSubmit}
                onCancel={handleCancelForm}
                isLoading={isLoading}
              />
            ) : (
              <FormBasedConnectionForm
                authType={editingConnection.authType}
                integrationName={integrationName}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
                isLoading={isLoading}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
