import React, { useCallback, useEffect, useState } from "react";
import DBSchemasAutocomplete from "../../../common-components/DBSchemasAutocomplete";
import DBConnectionForm from "../../../common-components/DBConnectionForm";
import DBConnectionList from "../../../common-components/DBConnectionList";
import DBAddConnectionButton from "../../../common-components/DBAddConnectionButton";
import { DB_CONNECTION_ERRORS } from "../../../../../utils/errorEnums";
import classes from "./Initialize.module.css";

const Initialize = ({
  connection,
  connections,
  table,
  schemas,
  onConnectionChange = () => {},
  onSchemaChange = () => {},
  setValidTabIndices,
  setErrorMessages,
  databaseType,
  workspaceId,
}) => {
  const [showAddConnectionForm, setShowAddConnectionForm] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState(
    connection?._id || connection?.connection_id || null
  );

  const handleSave = useCallback(
    async (connectionData) => {
      onConnectionChange(null, connectionData, true);
      setShowAddConnectionForm(false);
    },
    [onConnectionChange]
  );

  const handleAddConnectionClick = useCallback(() => {
    setShowAddConnectionForm(true);
    setSelectedConnectionId(null);
  }, []);

  const handleCancel = useCallback(() => {
    setShowAddConnectionForm(false);
    onConnectionChange(null, null);
  }, [onConnectionChange]);

  const handleConnectionSelect = useCallback(
    (selectedConnection) => {
      setSelectedConnectionId(
        selectedConnection._id || selectedConnection.connection_id
      );
      onConnectionChange(null, selectedConnection);
    },
    [onConnectionChange]
  );

  const validateData = useCallback(() => {
    const errors = [];

    if (!connection) {
      errors.push(DB_CONNECTION_ERRORS.CONNECTION_MISSING);
    } else if (!connection.connection_id && !connection._id) {
      errors.push(DB_CONNECTION_ERRORS.CONNECTION_MISSING);
    }

    if (!table) errors.push(DB_CONNECTION_ERRORS.TABLE_MISSING);

    setErrorMessages((prev) => ({ ...prev, 0: errors }));

    setValidTabIndices((prev) => {
      if (errors.length === 0) {
        if (prev.includes(0)) return prev; // if 0 is already in the array, return the array as is
        return [0]; // if 0 is not in the array, reset the array to [0], discarding rest of the indices
      }
      return []; // if there are errors, reset the array to []
    });
  }, [connection, table, setErrorMessages, setValidTabIndices]);

  useEffect(() => {
    if (connection) {
      const connectionId = connection._id || connection.connection_id;
      setSelectedConnectionId(connectionId);
    } else {
      setSelectedConnectionId(null);
    }
  }, [connection]);

  useEffect(() => {
    validateData();
  }, [validateData]);

  return (
    <div className={classes["create-container"]}>
      {/* Add Connection Button */}
      {!showAddConnectionForm && (
        <DBAddConnectionButton onClick={handleAddConnectionClick} />
      )}

      {/* Connection Form (when adding new) */}
      {showAddConnectionForm && (
        <DBConnectionForm
          databaseType={databaseType}
          onSave={handleSave}
          onCancel={handleCancel}
          workspaceId={workspaceId}
        />
      )}

      {/* Existing Connections List */}
      {!showAddConnectionForm && connections.length > 0 && (
        <DBConnectionList
          connections={connections}
          selectedConnectionId={selectedConnectionId}
          onChange={handleConnectionSelect}
        />
      )}

      {/* Schema/Table Selection (only when connection is selected) */}
      {connection && (
        <DBSchemasAutocomplete
          schemas={schemas}
          onChange={onSchemaChange}
          schema={table}
          disabled={!connection}
          searchable={true}
        />
      )}
    </div>
  );
};

export default Initialize;
