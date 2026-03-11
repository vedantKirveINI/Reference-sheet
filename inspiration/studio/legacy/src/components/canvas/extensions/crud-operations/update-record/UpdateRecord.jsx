import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";

import { connectionSDKServices } from "./../../../services/dbConnectionSDKServices";
import DBRecord from "../common-components/DBRecord";
import DBFilter from "../common-components/DBFilter";
import { UPDATE_TYPE } from "../../constants/types";
import DBFilterPlaceholder from "../common-components/DBFilterPlaceholder";
import Initialize from "./tabs/initialize/Initialize";
import TabContainer from "../../common-components/TabContainer";
import CommonTestModule from "../../common-components/CommonTestModule";
import UPDATE_RECORD_NODE from "./constant";
import Configure from "./tabs/configure/Configure";
import { DATABASE_TYPES } from "../utils/databaseConfig";

const UpdateRecord = forwardRef(
  (
    {
      data,
      parentId = "",
      variables,
      onSave = () => {},
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
    const [filter, setFilter] = useState(data?.filter);
    const [whereClause, setWhereClause] = useState(data?.whereClause || "");

    const [validTabIndices, setValidTabIndices] = useState([]);

    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
      2: [],
    });

    const filterButtonRef = useRef();
    const testModuleRef = useRef();

    const getConnections = useCallback(async () => {
      const response = await connectionSDKServices.getByParent({
        workspace_id: workspaceId,
      });
      if (response?.status === "success") {
        setConnections(response?.result || []);
      }
    }, [workspaceId]);

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
      [getSchemas, getConnections]
    );

    const onSchemaChange = useCallback(
      async (_, schema) => {
        setSchemaFields([]);
        setRecord([]);
        setFilter(undefined);
        setWhereClause("");
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
        label: data?.label || UPDATE_TYPE,
        filter,
        whereClause,
      };
    }, [connection, filter, record, table, whereClause, data?.label]);

    const configureTabData = useMemo(() => {
      return [
        {
          label: "Data",
          panelComponent: DBRecord,
          panelComponentProps: {
            fields: schemaFields,
            record,
            table,
            onChange: onRecordFieldChanged,
            variables,
            columnsToShow: ["key", "type", "required", "value"],
          },
        },
        {
          label: "Filter",
          panelComponent:
            schemaFields?.length > 0 ? DBFilter : DBFilterPlaceholder,
          panelComponentProps: {
            schema: schemaFields,
            filter,
            onChange: (filterValue, whereClause) => {
              setFilter(filterValue);
              setWhereClause(whereClause);
            },

            variables,
          },
        },
      ];
    }, [filter, onRecordFieldChanged, record, schemaFields, table, variables]);

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            connection,
            connections,
            table,
            schemas,
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
            configureTabData,
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
            node: nodeData || UPDATE_RECORD_NODE,
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
      annotation,
      assetId,
      canvasRef,
      configureTabData,
      connection,
      connections,
      databaseType,
      getData,
      nodeData,
      onConnectionChange,
      onSchemaChange,
      parentId,
      projectId,
      schemas,
      table,
      variables,
      workspaceId,
    ]);

    useImperativeHandle(ref, () => {
      return {
        getData,
        showFilterDialog: () => {
          filterButtonRef.current?.click();
        },
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
        getSchemaFields(data?.connection, data?.table.table_id);
      }
    }, [data?.connection, data?.table, getSchemaFields]);

    // <div className={classes["update-record-container"]}>
    /* <TextField
        label="Label"
        placeholder="Enter Node Label"
        value={nodeLabel}
        onChange={(e) => setNodeLabel(e.target.value)}
      />
      <DBConnectionsAutocomplete
        connections={connections}
        onChange={onConnectionChange}
        connection={connection}
      />
      <DBSchemasAutocomplete
        schemas={schemas}
        onChange={onSchemaChange}
        schema={table}
        disabled={!connection}
      />
      <div
        style={{
          overflow: "hidden",
        }}
      >
        <ODSTab variant="standard" tabData={updateRecordTabData} />
      </div> */

    // {/* </div> */}
    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: UPDATE_RECORD_NODE.dark,
          light: UPDATE_RECORD_NODE.light,
          foreground: UPDATE_RECORD_NODE.foreground,
        }}
        hasTestTab={UPDATE_RECORD_NODE.hasTestModule}
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

export default UpdateRecord;
