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

import TabContainer from "../../common-components/TabContainer";
import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import CommonTestModule from "../../common-components/CommonTestModule";
import { DELETE_TYPE } from "../../constants/types";
import DELETE_RECORD_NODE from "./constant";
import { DATABASE_TYPES } from "../utils/databaseConfig";

const DeleteRecord = forwardRef(
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
          getConnections(parentId);
        }
      },
      [getSchemas, getConnections, parentId]
    );

    const onSchemaChange = useCallback(
      async (_, schema) => {
        setSchemaFields([]);
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

    const getData = useCallback(() => {
      return {
        connection,
        table,
        label: data?.label || DELETE_TYPE,
        filter,
        whereClause,
      };
    }, [connection, filter, table, whereClause, data?.label]);

    const tabs = useMemo(
      () => [
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
            schemaFields,
            filter,
            variables,
            setFilter,
            setWhereClause,
            whereClause,
            filterButtonRef,
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
            node: nodeData || DELETE_RECORD_NODE,
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
      ],
      [
        connection,
        connections,
        table,
        schemas,
        workspaceId,
        databaseType,
        onConnectionChange,
        onSchemaChange,
        schemaFields,
        filter,
        variables,
        whereClause,
        canvasRef,
        annotation,
        getData,
        assetId,
        projectId,
        parentId,
        nodeData,
      ]
    );

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
        getSchemaFields(data?.connection, data?.table?.table_id);
      }
    }, [data?.connection, data?.table, getSchemaFields]);

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: DELETE_RECORD_NODE.dark,
          light: DELETE_RECORD_NODE.light,
          foreground: DELETE_RECORD_NODE.foreground,
        }}
        hasTestTab={DELETE_RECORD_NODE.hasTestModule}
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

export default DeleteRecord;
