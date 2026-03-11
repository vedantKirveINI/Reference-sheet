import { useMemo } from "react";

/**
 * Custom hook for managing database connections
 * Detects connection type (existing vs inline) and provides helper functions
 *
 * @param {Object} connection - Connection object from data.connection
 * @returns {Object} Connection utilities and detection flags
 */
const useDatabaseConnection = (connection) => {
  const connectionUtils = useMemo(() => {
    // Check if connection has existing connection identifiers
    const hasConnectionId = !!(connection?._id || connection?.connection_id);

    // Check if connection has inline connection identifier
    const isInlineConnection = !!connection?.databaseType;

    // Determine connection type
    const connectionType = hasConnectionId
      ? "existing"
      : isInlineConnection
        ? "inline"
        : null;

    return {
      hasConnectionId,
      isInlineConnection,
      connectionType,
      // Get connection ID for existing connections
      getConnectionId: () =>
        connection?.connection_id || connection?._id || null,
      // Get database type for inline connections
      getDatabaseType: () => connection?.databaseType || null,
    };
  }, [connection]);

  return connectionUtils;
};

export default useDatabaseConnection;
