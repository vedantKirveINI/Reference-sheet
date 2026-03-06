import { useState, useCallback, useMemo, useEffect } from "react";
import { connectionSDKServices } from "../../../../services/dbConnectionSDKServices";

export const useUpdateRecordV2State = (initialData = {}, workspaceId, projectId) => {
  const [connections, setConnections] = useState([]);
  const [connection, setConnection] = useState(initialData.connection || null);
  const [schemas, setSchemas] = useState([]);
  const [table, setTable] = useState(initialData.table || null);
  const [schemaFields, setSchemaFields] = useState([]);
  const [record, setRecord] = useState(initialData.record || []);
  const [filter, setFilter] = useState(initialData.filter);
  const [whereClause, setWhereClause] = useState(initialData.whereClause || "");
  // const [orderBy, setOrderBy] = useState(initialData.orderBy || []);
  // const [orderByClause, setOrderByClause] = useState(initialData.orderByClause || "");
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isRefreshingConnection, setIsRefreshingConnection] = useState(false);

  const hasInitialised = Boolean(connection && table);

  const getConnections = useCallback(async () => {
    if (!workspaceId) return;
    setIsLoadingConnections(true);
    try {
      const response = await connectionSDKServices.getByParent({
        workspace_id: workspaceId,
        parent_id: projectId,
      });
      if (response?.status === "success") {
        setConnections(response?.result || []);
      }
    } finally {
      setIsLoadingConnections(false);
    }
  }, [workspaceId, projectId]);

  const getSchemas = useCallback(async (connectionObj) => {
    if (!connectionObj) return;
    const payload = {
      connection_id: connectionObj?._id || connectionObj?.connection_id,
    };
    const response = await connectionSDKServices.getTables(payload);
    if (response?.status === "success") {
      setSchemas(response?.result || []);
    }
  }, []);

  const getSchemaFields = useCallback(async (connectionObj, tableId) => {
    if (!connectionObj || !tableId) return;
    const response = await connectionSDKServices.getTableFieldsFromConnection(
      connectionObj,
      tableId
    );
    if (response?.status === "success") {
      setSchemaFields(response?.result || []);
    }
  }, []);

  const onConnectionChange = useCallback(
    async (_, connectionValue, isNewConnection = false) => {
      setSchemas([]);
      setTable(null);
      setSchemaFields([]);
      setRecord([]);
      setFilter(undefined);
      setWhereClause("");
      // setOrderBy([]);
      // setOrderByClause("");

      if (connectionValue) {
        setConnection({
          ...connectionValue,
          connection_id: connectionValue.connection_id || connectionValue._id,
        });
        getSchemas(connectionValue);
      } else {
        setConnection(null);
      }
      if (isNewConnection) {
        getConnections();
      }
    },
    [getConnections, getSchemas]
  );

  const onSchemaChange = useCallback(
    async (_, schema) => {
      setSchemaFields([]);
      setRecord([]);
      setFilter(undefined);
      setWhereClause("");
      // setOrderBy([]);
      // setOrderByClause("");
      if (schema && connection) {
        getSchemaFields(connection, schema?._id || schema?.table_id);
        setTable({ ...schema, table_id: schema?.table_id || schema?._id });
      } else {
        setTable(null);
      }
    },
    [connection, getSchemaFields]
  );

  const onRecordFieldChanged = useCallback((recordData) => {
    setRecord(recordData);
  }, []);

  const onFilterChange = useCallback((filterValue, whereClauseStr) => {
    setFilter(filterValue);
    setWhereClause(whereClauseStr);
  }, []);

  // const onOrderByChange = useCallback((orderByData, orderByClauseStr) => {
  //   setOrderBy(orderByData);
  //   setOrderByClause(orderByClauseStr);
  // }, []);

  const refreshConnection = useCallback(async (databaseType) => {
    if (!connection) {
      return { success: false, message: "No connection selected" };
    }

    setIsRefreshingConnection(true);

    try {
      const connectionId = connection._id || connection.connection_id || connection.id;
      const configs = connection.configs || [];

      const payload = {
        state: {},
        db_config: {
          db_type: databaseType,
          configs: configs,
        },
        options: {},
        connection_id: connectionId,
      };

      const response = await connectionSDKServices.testConnection(payload);

      if (response?.status === "success") {
        // Refresh the schema list after successful connection test
        await getSchemas(connection);
        await onSchemaChange(null, table);
        return { success: true, message: "Connection refreshed successfully!" };
      } else {
        return { success: false, message: response?.message || "Failed to refresh connection" };
      }
    } catch (error) {
      console.error("[useUpdateRecordV2State] Error refreshing connection:", error);
      const errorMessage = error?.message || error?.result?.message || "Failed to refresh connection";
      return { success: false, message: errorMessage };
    } finally {
      setIsRefreshingConnection(false);
    }
  }, [connection, getSchemas, onSchemaChange, table]);

  const validation = useMemo(() => {
    const errors = [];

    if (!connection) {
      errors.push("Please select a database connection");
    }

    if (!table) {
      errors.push("Please select a table");
    }

    if (!filter && !whereClause) {
      errors.push("Please specify filter criteria to identify records to update");
    }

    const hasAtLeastOneField = record?.some(
      (r) => r.checked && r.value?.blocks?.length > 0
    );

    if (!hasAtLeastOneField) {
      errors.push("Please select and configure at least one field to update");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [connection, table, whereClause, filter, record]);

  const getData = useCallback(() => {
    return {
      connection,
      table,
      record,
      filter,
      whereClause,
      // orderBy,
      // orderByClause,
      output_schema: outputSchema,
      label: "Update Record",
    };
  }, [connection, table, record, filter, whereClause, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  useEffect(() => {
    if (workspaceId) {
      getConnections();
    }
  }, [getConnections, workspaceId]);

  useEffect(() => {
    if (initialData?.connection) {
      getSchemas(initialData.connection);
    }
  }, [initialData?.connection, getSchemas]);

  useEffect(() => {
    if (initialData?.table && initialData?.connection) {
      getSchemaFields(initialData.connection, initialData.table?.table_id);
    }
  }, [initialData?.connection, initialData?.table, getSchemaFields]);

  return {
    connections,
    connection,
    schemas,
    table,
    schemaFields,
    record,
    filter,
    whereClause,
    // orderBy,
    // orderByClause,
    hasInitialised,
    isLoadingConnections,
    isRefreshingConnection,
    onConnectionChange,
    onSchemaChange,
    onRecordFieldChanged,
    onFilterChange,
    // onOrderByChange,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
    getConnections,
    refreshConnection,
  };
};
