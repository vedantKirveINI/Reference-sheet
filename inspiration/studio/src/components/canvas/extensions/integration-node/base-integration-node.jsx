import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

// import { ODSCircularProgress } from '@src/module/ods';
import { ODSCircularProgress } from "@src/module/ods";
import TabContainer from "../common-components/TabContainer";
import { CONNECTION_NODE_THEME } from "./constant/theme";
import { useNodeData } from "./hooks/use-node-data";
import { useConnectionTabs } from "./hooks/use-connection-tabs";
import { addIndices, removeIndicesStartingFromIndex } from "../extension-utils";
import { MODES } from "./constant/constants";

export const BaseIntegrationNode = forwardRef(
  (
    {
      canvasRef,
      canvasAnnotation,
      nodeData,
      parentId,
      projectId,
      workspaceId,
      assetId,
      variables,
      autoSave = () => {},
      mode = MODES.FILLER,
      assetDetails = {},
    },
    ref
  ) => {
    const tabsRef = useRef();
    const [validTabIndices, setValidTabIndices] = useState([]);
    const [configureData, setConfigureData] = useState(
      nodeData?.go_data || { flow: {} }
    );
    const [selectedConnection, setSelectedConnection] = useState(
      nodeData?.go_data?.connection || null
    );

    const stagedIntegrationAnswers = useRef(configureData?.state || {});

    const onAnswerChange = useCallback((updatedAnswers = {}) => {
      stagedIntegrationAnswers.current = updatedAnswers;
    }, []);

    const {
      flow,
      taskGraph,
      annotation,
      loading,
      resourceIds,
      publishResult,
      projectVariables,
    } = useNodeData({
      nodeId: nodeData?.id,
      mode,
      nodeData,
      initialResourceIds: {
        parentId,
        projectId,
        workspaceId,
        assetId,
      },
    });

    const onConfigureDone = useCallback(
      async (configuredData) => {
        setConfigureData(configuredData);
        setValidTabIndices((prev) => addIndices(prev, [1]));
        mode === MODES.FILLER &&
          (await autoSave(
            {
              connection: {
                ...selectedConnection,
                id: selectedConnection?._id,
              },
              ...configuredData,
            },
            {},
            {},
            true
          ));

        if (tabsRef.current) tabsRef.current.goToTab(2);
      },
      [selectedConnection, autoSave, mode]
    );

    const onInitializeDone = useCallback(async () => {
      if (tabsRef.current) {
        tabsRef.current.goToTab(1);
      }
    }, [tabsRef]);

    const onConnectionChange = useCallback(
      async ({
        connection = {},
        refreshedConfigs = {},
        connectionNodeKey = "",
      }) => {
        setSelectedConnection({
          ...connection,
          id: connection?._id,
        });
        setConfigureData((prev) => {
          const updatedState = {
            ...prev,
            state: {
              ...prev.state,
              [connectionNodeKey]: {
                response: {
                  ...refreshedConfigs,
                },
              },
            },
          };
          stagedIntegrationAnswers.current = structuredClone(
            updatedState.state
          );
          return updatedState;
        });
      },
      []
    );

    const tabs = useConnectionTabs({
      canvasRef,
      canvasAnnotation,
      node_configs: configureData?.configs,
      getGoData: () => {
        return {
          ...configureData,
          state: {
            ...(configureData?.state || {}),
            ...(stagedIntegrationAnswers.current || {}),
          },
        };
      },
      assetName: assetDetails?.name,
      nodeData,
      flow,
      taskGraph,
      variables,
      projectVariables,
      publishResult,
      resourceIds,
      annotation,
      selectedConnection,
      onConnectionChange,
      getInitialAnswers: () => stagedIntegrationAnswers.current,
      initialPipeline: configureData?.state?.pipeline,
      onInitializeDone,
      onConfigureDone,
      setValidTabIndices,
      onAnswerChange,
    });

    useImperativeHandle(ref, () => {
      return {
        getIntegrationNodeData: () => {
          // Studio uses tf_data to get the asset_id and project_id to render icon and conflicts between nodes while canvas initializes
          // And project_id and asset_id are only getting store if form is configured by user
          // integration asset published id is used to track version
          // if integrator has published the integration but the user who has used the integration has the old integration
          // published id stored he will get warning of version when opening the canvas
          const modifiedConfigureData = {
            ...(configureData || {}),
            flow: {
              ...(configureData?.flow || {}),
              asset_id: nodeData?.id,
              project_id: publishResult?.project_id, // integration asset project id
              id: publishResult?._id || publishResult?.id, // integration asset published id
            },
            state: {
              ...(configureData?.state || {}),
              ...(stagedIntegrationAnswers.current || {}),
            },
          };
          return { configureData: modifiedConfigureData, selectedConnection };
        },
      };
    }, [
      configureData,
      selectedConnection,
      nodeData?.id,
      publishResult?.project_id,
      publishResult?._id,
      publishResult?.id,
    ]);

    useEffect(() => {
      const isConnectionSelected = Boolean(
        selectedConnection?.id || selectedConnection?._id
      );
      if (isConnectionSelected) {
        setValidTabIndices((prev) => addIndices(prev, [0]));
      } else {
        setValidTabIndices((prev) => removeIndicesStartingFromIndex(prev, 0));
      }
    }, [selectedConnection]);

    return (
      <>
        {loading ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ODSCircularProgress />
          </div>
        ) : (
          <TabContainer
            ref={tabsRef}
            tabs={tabs || []}
            defaultTabIndex={nodeData?.go_data?.connection?.id ? 1 : 0}
            validTabIndices={validTabIndices}
            validateTabs={true}
            colorPalette={{
              dark: CONNECTION_NODE_THEME.dark,
              light: CONNECTION_NODE_THEME.light,
              foreground: CONNECTION_NODE_THEME.foreground,
            }}
          />
        )}
      </>
    );
  }
);
