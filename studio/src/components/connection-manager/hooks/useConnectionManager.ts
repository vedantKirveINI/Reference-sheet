import { useState, useCallback, useEffect, useRef } from "react";
import { Connection, ConnectionManagerView, AuthType, DatabaseConnectionConfig } from "../types";

interface UseConnectionManagerProps {
  authType: AuthType;
  connections?: Connection[];
  selectedConnection?: Connection | null;
  onConnectionChange?: (connection: Connection | null) => void;
  onFetchConnections?: () => Promise<Connection[]>;
  onCreateOAuthConnection?: (name: string) => Promise<void>;
  onCreateDatabaseConnection?: (config: DatabaseConnectionConfig) => Promise<Connection>;
  onUpdateDatabaseConnection?: (connectionId: string, config: DatabaseConnectionConfig) => Promise<Connection>;
  onCreateFormConnection?: (name: string, credentials: Record<string, string>) => Promise<Connection>;
  onCreateCustomConnection?: (name: string, formData: { state: Record<string, any>; flow: any }) => Promise<Connection>;
  onDeleteConnection?: (connectionId: string) => Promise<void>;
}

interface UseConnectionManagerReturn {
  view: ConnectionManagerView;
  connections: Connection[];
  selectedConnectionId: string | null;
  editingConnection: Connection | null;
  authType: AuthType;
  isLoading: boolean;
  error: string | null;
  setView: (view: ConnectionManagerView) => void;
  selectConnection: (connection: Connection) => void;
  handleAddNew: () => void;
  handleSwitch: () => void;
  handleEdit: (connection: Connection) => void;
  handleDelete: (connection: Connection) => Promise<void>;
  handleOAuthSubmit: (name: string) => Promise<void>;
  handleDatabaseSubmit: (config: DatabaseConnectionConfig) => Promise<void>;
  handleDatabaseUpdate: (config: DatabaseConnectionConfig) => Promise<void>;
  handleFormSubmit: (name: string, credentials: Record<string, string>) => Promise<void>;
  handleCustomSubmit: (name: string, formData: { state: Record<string, any>; flow: any }) => Promise<void>;
  refreshConnections: () => Promise<void>;
}

// Helper to create a fingerprint of connections for comparison
// Includes IDs, names, and updatedAt to detect all types of changes
function getConnectionsFingerprint(connections: Connection[]): string {
  return connections
    .map(c => `${c._id || c.id || ""}:${c.name || ""}:${c.updatedAt || c.createdAt || ""}`)
    .sort()
    .join("|");
}

export function useConnectionManager({
  authType,
  connections: externalConnections = [],
  selectedConnection: externalSelectedConnection,
  onConnectionChange,
  onFetchConnections,
  onCreateOAuthConnection,
  onCreateDatabaseConnection,
  onUpdateDatabaseConnection,
  onCreateFormConnection,
  onCreateCustomConnection,
  onDeleteConnection,
}: UseConnectionManagerProps): UseConnectionManagerReturn {
  // Internal state
  const [connections, setConnections] = useState<Connection[]>(externalConnections);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(
    externalSelectedConnection?._id || externalSelectedConnection?.id || null
  );
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ConnectionManagerView>("empty");

  // Track previous values for prop sync effects
  const prevConnectionIdsRef = useRef<string>("");
  const prevSelectedIdRef = useRef<string | null>(null);

  // Track previous values specifically for the view effect
  // Used to detect whether data actually changed vs just view changed (user navigation)
  const prevViewEffectConnectionsRef = useRef<string>("");
  const prevViewEffectSelectionRef = useRef<string | null>(null);

  // Sync connections from external props - this is CRITICAL for the adapter pattern
  useEffect(() => {
    const currentFingerprint = getConnectionsFingerprint(externalConnections);
    const prevFingerprint = prevConnectionIdsRef.current;

    // Always update if fingerprint has changed (catches ID, name, and timestamp changes)
    if (currentFingerprint !== prevFingerprint) {
      prevConnectionIdsRef.current = currentFingerprint;
      setConnections(externalConnections);
    }
  }, [externalConnections]);

  // Sync selectedConnection from external props
  useEffect(() => {
    const newSelectedId = externalSelectedConnection?._id || externalSelectedConnection?.id || null;
    const prevSelectedId = prevSelectedIdRef.current;

    if (newSelectedId !== prevSelectedId) {
      prevSelectedIdRef.current = newSelectedId;
      setSelectedConnectionId(newSelectedId);
    }
  }, [externalSelectedConnection]);

  // Determine view based on current state
  // KEY INSIGHT: Only auto-determine view when DATA changes (connections or selection).
  // When only VIEW changes (user clicked Switch/Add New), respect their choice.
  useEffect(() => {
    // Step 1: Detect what actually changed
    const currentConnectionsFingerprint = getConnectionsFingerprint(connections);
    const connectionsChanged = currentConnectionsFingerprint !== prevViewEffectConnectionsRef.current;
    const selectionChanged = selectedConnectionId !== prevViewEffectSelectionRef.current;

    // Step 2: Update refs immediately (before any returns) so next run can compare
    prevViewEffectConnectionsRef.current = currentConnectionsFingerprint;
    prevViewEffectSelectionRef.current = selectedConnectionId;

    // Step 3: If no data changed, this was a user-initiated view change - respect it
    // This fixes the Switch button issue: when user clicks Switch, only view changes,
    // so we early-return and don't override their choice
    if (!connectionsChanged && !selectionChanged) {
      return;
    }

    // From here, we know data changed - run auto-determination logic
    const hasConnections = connections.length > 0;
    const hasSelection = selectedConnectionId !== null;
    const selectedExists = hasSelection && hasConnections && connections.some(
      c => (c._id || c.id) === selectedConnectionId
    );

    // Protect edit view - user is filling out a form
    if (view === "edit") {
      return;
    }

    // Protect add-new view unless OAuth completed (selection changed to a valid connection)
    if (view === "add-new") {
      // Only transition if selection changed to a valid connection
      if (!selectionChanged || !selectedExists) {
        return;
      }
      // Selection changed to a valid connection - OAuth completed
    }

    // Determine appropriate view based on current data
    let newView: ConnectionManagerView;
    if (selectedExists) {
      newView = "selected";
    } else if (hasConnections) {
      newView = "list";
    } else {
      newView = "empty";
    }

    if (newView !== view) {
      setView(newView);
    }
  }, [connections, selectedConnectionId, view]);

  const refreshConnections = useCallback(async () => {
    if (!onFetchConnections) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedConnections = await onFetchConnections();

      // Update internal state
      setConnections(fetchedConnections);
      prevConnectionIdsRef.current = getConnectionsFingerprint(fetchedConnections);

      // The view will be updated by the useEffect above
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch connections");
    } finally {
      setIsLoading(false);
    }
  }, [onFetchConnections]);

  const selectConnection = useCallback((connection: Connection) => {
    const id = connection._id || connection.id;
    setSelectedConnectionId(id || null);
    prevSelectedIdRef.current = id || null;
    setView("selected");
    onConnectionChange?.(connection);
  }, [onConnectionChange]);

  const handleAddNew = useCallback(() => {
    setView("add-new");
  }, []);

  const handleSwitch = useCallback(() => {
    setView("list");
  }, []);

  const handleEdit = useCallback((connection: Connection) => {
    setEditingConnection(connection);
    setView("edit");
  }, []);

  const handleDelete = useCallback(async (connection: Connection) => {
    if (!onDeleteConnection) return;

    const id = connection._id || connection.id;
    if (!id) return;

    setIsLoading(true);
    try {
      await onDeleteConnection(id);

      const updatedConnections = connections.filter(
        (c) => (c._id || c.id) !== id
      );
      setConnections(updatedConnections);
      prevConnectionIdsRef.current = getConnectionsFingerprint(updatedConnections);

      if (selectedConnectionId === id) {
        setSelectedConnectionId(null);
        prevSelectedIdRef.current = null;
        onConnectionChange?.(null);
        // View will be updated by useEffect
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete connection");
    } finally {
      setIsLoading(false);
    }
  }, [connections, selectedConnectionId, onDeleteConnection, onConnectionChange]);

  const handleOAuthSubmit = useCallback(async (name: string) => {
    if (!onCreateOAuthConnection) {
      setError("OAuth connection handler not configured");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreateOAuthConnection(name);
      // Note: The OAuth flow will update connections via the adapter,
      // which will flow back through props and trigger the useEffect above
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create connection");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onCreateOAuthConnection]);

  const handleDatabaseUpdate = useCallback(async (config: DatabaseConnectionConfig) => {
    if (!onUpdateDatabaseConnection || !editingConnection || editingConnection.authType !== "database") {
      return;
    }

    setIsLoading(true);
    setError(null);

    const connectionId = editingConnection._id || editingConnection.id || "";

    try {
      const updatedConnection = await onUpdateDatabaseConnection(
        connectionId,
        config
      );

      const withoutOld = connections.filter(
        (c) => (c._id || c.id) !== connectionId
      );
      const updatedConnections = [updatedConnection, ...withoutOld];

      setConnections(updatedConnections);
      prevConnectionIdsRef.current =
        getConnectionsFingerprint(updatedConnections);

      setEditingConnection(null);
      setView("list");
      selectConnection(updatedConnection);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update connection"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
    [onUpdateDatabaseConnection, editingConnection, connections, selectConnection])

  const handleDatabaseSubmit = useCallback(async (config: DatabaseConnectionConfig) => {
    if (!onCreateDatabaseConnection) return;

    setIsLoading(true);
    setError(null);

    try {
      const newConnection = await onCreateDatabaseConnection(config);
      const updatedConnections = [newConnection, ...connections];
      setConnections(updatedConnections);
      prevConnectionIdsRef.current = getConnectionsFingerprint(updatedConnections);
      selectConnection(newConnection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create connection");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onCreateDatabaseConnection, onUpdateDatabaseConnection, editingConnection, connections, selectConnection]);

  const handleFormSubmit = useCallback(async (name: string, credentials: Record<string, string>) => {
    if (!onCreateFormConnection) return;

    setIsLoading(true);
    setError(null);

    try {
      const newConnection = await onCreateFormConnection(name, credentials);
      const updatedConnections = [newConnection, ...connections];
      setConnections(updatedConnections);
      prevConnectionIdsRef.current = getConnectionsFingerprint(updatedConnections);
      selectConnection(newConnection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create connection");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onCreateFormConnection, connections, selectConnection]);

  const handleCustomSubmit = useCallback(async (name: string, formData: { state: Record<string, any>; flow: any }) => {
    if (!onCreateCustomConnection) return;

    setIsLoading(true);
    setError(null);

    try {
      const newConnection = await onCreateCustomConnection(name, formData);
      const updatedConnections = [newConnection, ...connections];
      setConnections(updatedConnections);
      prevConnectionIdsRef.current = getConnectionsFingerprint(updatedConnections);
      selectConnection(newConnection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create connection");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onCreateCustomConnection, connections, selectConnection]);

  return {
    view,
    connections,
    selectedConnectionId,
    editingConnection,
    authType,
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
  };
}
