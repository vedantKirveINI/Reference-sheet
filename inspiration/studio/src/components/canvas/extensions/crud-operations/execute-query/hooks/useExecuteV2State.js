import { useState, useCallback, useMemo, useEffect } from "react";
import { connectionSDKServices } from "../../../../services/dbConnectionSDKServices";

/** Derive a single string from fx content (for validation or backward-compat query field). */
function getQueryStringFromContent(content) {
  if (!content?.blocks || !Array.isArray(content.blocks)) return "";
  return content.blocks.map((b) => b?.value).filter(Boolean).join("");
}

export const useExecuteV2State = (initialData = {}, workspaceId, projectId) => {
  const [connections, setConnections] = useState([]);
  const [connection, setConnection] = useState(initialData.connection || null);
  const [queryContent, setQueryContent] = useState(() => {
    if (initialData.content?.blocks) return { type: "fx", blocks: initialData.content.blocks };
    if (initialData.sqlQuery) {
      return { type: "fx", blocks: [{ type: "PRIMITIVES", value: initialData.sqlQuery }] };
    }
    return { type: "fx", blocks: [] };
  });

  const [parameters, setParameters] = useState(
    initialData.parameters || { type: "fx", blocks: [] }
  );
  const [outputSchema, setOutputSchema] = useState(initialData.output_schema || null);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);

  const hasInitialised = Boolean(connection);

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

  const onConnectionChange = useCallback(
    async (_, connectionValue, isNewConnection = false) => {
      if (connectionValue) {
        setConnection({
          ...connectionValue,
          connection_id: connectionValue.connection_id || connectionValue._id,
        });
      } else {
        setConnection(null);
      }
      if (isNewConnection) {
        getConnections();
      }
    },
    [getConnections]
  );

  const validation = useMemo(() => {
    const errors = [];
    const queryStr = getQueryStringFromContent(queryContent);

    if (!connection) {
      errors.push("Please select a database connection");
    }

    if (!queryStr || queryStr.trim() === "") {
      errors.push("Please enter a SQL query");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [connection, queryContent]);

  const getData = useCallback(() => {
    return {
      connection,
      query: getQueryStringFromContent(queryContent),
      content: queryContent,
      parameters,
      output_schema: outputSchema,
      label: "Execute Query",
    };
  }, [connection, queryContent, parameters, outputSchema]);

  const getError = useCallback(() => {
    return validation.errors;
  }, [validation]);

  useEffect(() => {
    if (workspaceId) {
      getConnections();
    }
  }, [getConnections, workspaceId]);

  return {
    connections,
    connection,
    queryContent,
    setQueryContent,
    parameters,
    setParameters,
    hasInitialised,
    isLoadingConnections,
    onConnectionChange,
    outputSchema,
    setOutputSchema,
    validation,
    getData,
    getError,
    getConnections,
  };
};
