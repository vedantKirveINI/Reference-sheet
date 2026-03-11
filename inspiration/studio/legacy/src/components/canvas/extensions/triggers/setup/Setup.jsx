import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";

// import ODSCircularProgress from "oute-ds-circular-progress";
import { ODSCircularProgress } from "@src/module/ods";

import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../../common-components/TabContainer";
import TRIGGER_SETUP_NODE from "../constant";
import {
  INPUT_SETUP_TYPE,
  INTEGRATION_TYPE,
  TRIGGER_SETUP_TYPE,
} from "../../constants/types";
import assetSDKServices from "../../../services/assetSDKServices";
import { useNodeData } from "../../form/hooks/use-node-data";
import { motion } from "framer-motion";
import { flushSync } from "react-dom";

const Setup = forwardRef(
  (
    {
      data,
      nodeData,
      parentId,
      workspaceId,
      assetId,
      projectId,
      variables,
      userData,
      onSave = () => {},
      onClose = () => {},
    },
    ref
  ) => {
    const [triggerType, setTriggerType] = useState(nodeData?.type);
    const [integrations, setIntegrations] = useState([]);
    const [integration, setIntegration] = useState();
    const [event, setEvent] = useState();
    const [connection, setConnection] = useState({});
    const [configureData, setConfigureData] = useState({ flow: {} });

    const [validTabIndices, setValidTabIndices] = useState([]);
    const [activeTabIndex, setActiveIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    const nonIntegrationDataRef = useRef({});

    const eventData = useNodeData({
      nodeId: event?._id,
      initialResourceIds: {
        parentId,
        projectId,
        workspaceId,
        assetId,
      },
    });

    const tabRef = useRef();
    const confRef = useRef();

    const triggerChangeHandler = useCallback(
      (node) => {
        nonIntegrationDataRef.current = null;
        flushSync(() => {
          setTriggerType(node.type);
          setIntegration(null);
          setEvent(null);
          if (node.type !== INTEGRATION_TYPE) {
            setValidTabIndices([0, 1]);
            if (node.type !== INPUT_SETUP_TYPE) {
              setTimeout(() => {
                tabRef?.current?.goToTab?.(1);
              }, 100);
            }
          } else {
            setValidTabIndices([]);
          }
        });
        onSave(true, true);
      },
      [onSave]
    );

    // 1) Build tabs via a function (memoized)

    const connectionChangedHandler = useCallback(
      ({ connection = {}, refreshedConfigs = {}, connectionNodeKey = "" }) => {
        const updatedConnection = {
          ...connection,
          id: connection?._id,
        };
        setConnection(updatedConnection);
        setConfigureData((prev) => ({
          ...prev,
          connection: updatedConnection,
          state: {
            ...prev?.state,
            [connectionNodeKey]: {
              response: {
                ...refreshedConfigs,
              },
            },
          },
        }));
        setValidTabIndices([0]);
      },
      []
    );

    const configureDoneHandler = useCallback(
      async (data) => {
        flushSync(() => {
          setConfigureData({
            ...data,
            connection: { ...connection, id: connection?._id },
          });
          if (triggerType !== INPUT_SETUP_TYPE) {
            setValidTabIndices([0, 1]);
          }
        });
        await onSave(false);
      },
      [connection, onSave, triggerType]
    );

    const beforeTabChangeHandler = useCallback(async () => {
      if (activeTabIndex === 1) {
        const nonIntegrationData = await confRef.current?.getData();
        nonIntegrationDataRef.current = nonIntegrationData;
      }
    }, [activeTabIndex]);

    const integrationChangeHandler = useCallback(
      (integration) => {
        flushSync(() => {
          setIntegration(integration);
          setEvent(null);
          setConnection(null);
          setConfigureData({ flow: {} });
          setValidTabIndices([]);
        });
        onSave(true, true);
      },
      [onSave]
    );

    const eventChangeHandler = useCallback(
      (event) => {
        flushSync(() => {
          setEvent(event);
          setConnection(null);
          setConfigureData({ flow: {} });
          setValidTabIndices([]);
        });
        onSave(true, true);
      },
      [onSave]
    );

    const buildTabs = useCallback(() => {
      const baseTabs = [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            triggerType,
            integrations,
            integration,
            event,
            connection,
            onTriggerChange: triggerChangeHandler,
            onIntegrationChange: integrationChangeHandler,
            onEventChange: eventChangeHandler,
            onConnectionChange: connectionChangedHandler,
            eventData,
            onClose,
            nodeData: nonIntegrationDataRef.current || data,
          },
        },
      ];

      if (triggerType !== INPUT_SETUP_TYPE) {
        baseTabs.push({
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            data: nonIntegrationDataRef.current || data,
            assetId,
            parentId,
            workspaceId,
            triggerType,
            connection,
            eventData,
            configureData,
            nodeData,
            variables,
            userData,
            onConfigureDone: configureDoneHandler,
            ref: confRef,
          },
        });
      }
      return baseTabs;
    }, [
      triggerType,
      integrations,
      integration,
      event,
      connection,
      triggerChangeHandler,
      integrationChangeHandler,
      eventChangeHandler,
      connectionChangedHandler,
      eventData,
      onClose,
      data,
      assetId,
      parentId,
      workspaceId,
      configureData,
      nodeData,
      variables,
      userData,
      configureDoneHandler,
    ]);

    // 2) Use it here:
    const tabs = useMemo(() => buildTabs(), [buildTabs]);

    // const tabs = useMemo(() => {
    //   return [
    //     {
    //       label: "INITIALIZE",
    //       panelComponent: Initialize,
    //       panelComponentProps: {
    //         triggerType,
    //         integrations,
    //         integration,
    //         event,
    //         connection,
    //         onTriggerChange: triggerChangeHandler,
    //         onIntegrationChange: integrationChangeHandler,
    //         onEventChange: eventChangeHandler,
    //         onConnectionChange: connectionChangedHandler,
    //         eventData,
    //       },
    //     },
    //     {
    //       label: "CONFIGURE",
    //       panelComponent: Configure,
    //       panelComponentProps: {
    //         data: nonIntegrationDataRef.current || data,
    //         assetId,
    //         parentId,
    //         workspaceId,
    //         triggerType,
    //         connection,
    //         eventData,
    //         configureData,
    //         nodeData,
    //         variables,
    //         userData,
    //         onConfigureDone: configureDoneHandler,
    //         ref: confRef,
    //       },
    //     },
    //   ];
    // }, [
    //   assetId,
    //   configureData,
    //   configureDoneHandler,
    //   connection,
    //   connectionChangedHandler,
    //   data,
    //   event,
    //   eventChangeHandler,
    //   eventData,
    //   integration,
    //   integrationChangeHandler,
    //   integrations,
    //   nodeData,
    //   parentId,
    //   triggerChangeHandler,
    //   triggerType,
    //   variables,
    //   workspaceId,
    //   userData,
    // ]);
    useImperativeHandle(
      ref,
      () => ({
        getData: async () => {
          let goData = {};
          let errors = [];
          if (triggerType !== INTEGRATION_TYPE) {
            errors = confRef.current?.validateData
              ? confRef.current?.validateData()
              : [];
            if (!errors?.length) {
              goData = nonIntegrationDataRef.current;
            }
          } else {
            if (integration?._id && event?._id) {
              // Studio uses tf_data to get the asset_id and project_id to render icon and conflicts between nodes while canvas initializes
              // And project_id and asset_id are only getting store if form is configured by user
              // integration asset published id is used to track version
              // if integrator has published the integration but the user who has used the integration has the old integration
              // published id stored he will get warning of version when opening the canvas
              const modifiedConfigureData = {
                ...(configureData || {}),
                flow: {
                  ...(configureData?.flow || {}),
                  asset_id: eventData?.publishResult?.asset_id,
                  project_id: eventData?.publishResult?.project_id, // integration asset project id
                  id:
                    eventData?.publishResult?._id ||
                    eventData?.publishResult?.id, // integration asset published id
                },
              };
              goData = {
                ...(modifiedConfigureData || {}),
                setupData: {
                  integration_id: integration?._id,
                  event_id: event?._id,
                },
              };
            } else {
              if (!integration?._id) {
                errors = ["Please select an app"];
              } else if (!event?._id) {
                goData = {
                  setupData: {
                    integration_id: integration?._id,
                  },
                };
                errors = ["Please select a trigger type"];
              }
            }
          }
          return {
            goData,
            triggerType,
            integration: integration,
            event,
            errors,
          };
        },
        beforeTabChange: beforeTabChangeHandler,
      }),
      [
        beforeTabChangeHandler,
        triggerType,
        integration,
        event,
        configureData,
        eventData?.publishResult?.asset_id,
        eventData?.publishResult?.project_id,
        eventData?.publishResult?._id,
        eventData?.publishResult?.id,
      ]
    );

    useEffect(() => {
      assetSDKServices.getEvents().then((response) => {
        if (response.result?.integrations?.length) {
          const triggerIntegrations = response.result.integrations.filter(
            (integration) =>
              integration.events?.some(
                (event) => event.annotation === "TRIGGER"
              )
          );
          setIntegrations(triggerIntegrations);
        }
      });
    }, []);

    useEffect(() => {
      const initSetup = (node) => {
        if (!node.type) return;
        if (node.type !== TRIGGER_SETUP_TYPE) {
          setTriggerType(node.type);
          if (node.type === INPUT_SETUP_TYPE) {
            setValidTabIndices([0]);
          } else if (node.type !== INTEGRATION_TYPE) {
            setValidTabIndices([0, 1]);
            nonIntegrationDataRef.current = node?.go_data;
            tabRef.current?.goToTab(1);
          } else {
            //handle for integrations
            if (!integrations?.length) return;
            if (node?.go_data?.setupData?.integration_id) {
              const selectedIntegration = integrations?.find(
                (integration) =>
                  integration._id === node?.go_data?.setupData?.integration_id
              );
              setIntegration(selectedIntegration);
              const selectedEvent = selectedIntegration?.events?.find(
                (event) => event._id === node?.go_data?.setupData?.event_id
              );
              setEvent(selectedEvent);
              const selectedConnection = node?.go_data?.connection;
              setConnection(selectedConnection);
              if (selectedIntegration && selectedEvent && selectedConnection) {
                setValidTabIndices([0, 1]);
              }
            }
            setConfigureData(
              node?.go_data?.flow ? node?.go_data : { flow: {} }
            );
          }
        }
      };
      initSetup(nodeData);
    }, [integrations, nodeData]);

    useEffect(() => {
      if (
        !isInitialized &&
        connection?.id &&
        !eventData?.loading &&
        Object.keys(eventData?.publishResult || {})?.length > 0
      ) {
        tabRef.current?.goToTab?.(1);
      }
    }, [connection, eventData, isInitialized]);
    useEffect(() => {
      setTimeout(() => {
        setIsInitialized(true);
      }, 2000); //intentional delay as the connection is not available immediately during initSetup
    }, []);

    return event?.loading ? (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ODSCircularProgress />
      </motion.div>
    ) : (
      <motion.div
        style={{
          height: "100%",
        }}
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <TabContainer
          tabs={tabs || []}
          colorPalette={{
            dark: TRIGGER_SETUP_NODE.dark,
            light: TRIGGER_SETUP_NODE.light,
            foreground: TRIGGER_SETUP_NODE.foreground,
            background: TRIGGER_SETUP_NODE.background,
          }}
          validTabIndices={validTabIndices}
          showCommonActionFooter={
            triggerType === INTEGRATION_TYPE && activeTabIndex > 0
              ? false
              : true
          }
          beforeTabChange={beforeTabChangeHandler}
          validateTabs={true}
          ref={tabRef}
          onTabSwitch={(index) => setActiveIndex(index)}
          hasTestTab={TRIGGER_SETUP_NODE.hasTestModule}
          beforePanelUnmount={async () => {
            if (confRef.current) {
              const nonIntegrationData = await confRef.current?.getData();
              nonIntegrationDataRef.current = nonIntegrationData;
            }
          }}
          onSave={onSave}
          showBottomBorder={
            nodeData?.type !== INTEGRATION_TYPE || activeTabIndex === 0 // For integration nodes, the bottom border is already applied by default .
            // Apply the border only for non-integration nodes or when the first tab is active.
          }
        />
      </motion.div>
    );
  }
);

export default Setup;
