import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { CREATE_TYPE } from "../../constants/types";

import { connectionSDKServices } from "./../../../services/dbConnectionSDKServices";

import Initialize from "./tabs/initialize/Initialize";
import TabContainer from "../../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";
import CommonTestModule from "../../common-components/CommonTestModule";
import CREATE_RECORD_NODE from "./constant";
import { DATABASE_TYPES } from "../utils/databaseConfig";

const CreateRecord = forwardRef(
  (
    {
      data,
      parentId = "",
      variables,
      onSave,
      canvasRef,
      annotation,
      workspaceId,
      projectId,
      assetId,
      nodeData,
      databaseType = DATABASE_TYPES.POSTGRESQL,
    },
    ref
  ) => {
    const [connections, setConnections] = useState([]);
    const [connection, setConnection] = useState(data?.connection || null);
    const [schemas, setSchemas] = useState([]);
    const [table, setTable] = useState(data?.table || null);
    const [schemaFields, setSchemaFields] = useState([]);
    const [record, setRecord] = useState(data?.record || []);

    const [validTabIndices, setValidTabIndices] = useState([]);

    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
      2: [],
    });

    const testModuleRef = useRef();

    const getConnections = useCallback(async () => {
      const response = await connectionSDKServices.getByParent({
        workspace_id: workspaceId,
        parent_id: projectId,
      });
      if (response?.status === "success") {
        setConnections(response?.result || []);
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

    const getData = useCallback(() => {
      return {
        connection,
        table,
        record,
        label: data?.label || CREATE_TYPE,
      };
    }, [connection, record, table, data?.label]);

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            connection,
            connections,
            schemas,
            table,
            workspaceId,
            databaseType,
            onConnectionChange,
            onSchemaChange,
            setValidTabIndices,
            setErrorMessages,
          },
        },
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            schemaFields,
            record,
            table,
            onRecordFieldChanged,
            variables,
            setValidTabIndices,
            setErrorMessages,
          },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModule,
          panelComponentProps: {
            canvasRef,
            annotation,
            ref: testModuleRef,
            go_data: getData(),
            variables,
            workspaceId,
            assetId,
            projectId,
            parentId,
            node: nodeData || CREATE_RECORD_NODE,
            onTestComplete: () => {
              setValidTabIndices((prev) => {
                const testTabIndex = 2;
                return prev.includes(testTabIndex)
                  ? prev
                  : [...prev, testTabIndex];
              });
            },
          },
        },
      ];
    }, [
      connection,
      connections,
      schemas,
      table,
      workspaceId,
      databaseType,
      onConnectionChange,
      onSchemaChange,
      schemaFields,
      record,
      onRecordFieldChanged,
      variables,
      canvasRef,
      annotation,
      getData,
      assetId,
      projectId,
      parentId,
      nodeData,
    ]);

    useImperativeHandle(ref, () => {
      return {
        getData,
      };
    }, [getData]);

    useEffect(() => {
      if (workspaceId) {
        getConnections();
      }
    }, [getConnections, workspaceId]);

    useEffect(() => {
      if (data?.connection) {
        getSchemas(data?.connection);
      }
    }, [data?.connection, getSchemas]);

    useEffect(() => {
      if (data?.table && data?.connection) {
        getSchemaFields(data?.connection, data?.table?.table_id);
      }
    }, [data?.connection, data?.table, getSchemaFields]);

    return (
      // <div className={classes["create-container"]}>
      //   <TextField
      //     label="Label"
      //     placeholder="Enter Node Label"
      //     value={nodeLabel}
      //     onChange={(e) => setNodeLabel(e.target.value)}
      //   />
      //   <DBConnectionsAutocomplete
      //     connections={connections}
      //     onChange={onConnectionChange}
      //     connection={connection}
      //   />
      //   <DBSchemasAutocomplete
      //     schemas={schemas}
      //     onChange={onSchemaChange}
      //     schema={table}
      //     disabled={!connection}
      //     searchable={true}
      //   />
      //   <DBRecord
      //     fields={schemaFields}
      //     record={record}
      //     table={table}
      //     onChange={onRecordFieldChanged}
      //     variables={variables}
      //     columnsToShow={["key", "type", "required", "value"]}
      //   />
      // </div>
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: CREATE_RECORD_NODE.dark,
          light: CREATE_RECORD_NODE.light,
          foreground: CREATE_RECORD_NODE.foreground,
        }}
        hasTestTab={CREATE_RECORD_NODE.hasTestModule}
        onTest={() => {
          testModuleRef?.current?.beginTest();
        }}
        errorMessages={errorMessages}
        validTabIndices={validTabIndices}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default CreateRecord;
