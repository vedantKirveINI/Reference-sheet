import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import AGENT_NODE from "./constant";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../common-components/TabContainer";
import { Initialize } from "./tabs/initialize/Initialize";
import CommonTestModule from "../common-components/CommonTestModule";

const AgentNode = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      nodeData,
      onSave = () => {},
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    const testModuleRef = useRef();
    const configRef = useRef();
    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [error, setError] = useState({
      0: [],
      1: [],
      2: [],
    });
    const [parentData, setParentData] = useState({});
    const [selectedAgent, setSelectedAgent] = useState(data?.agent);
    const [threadId, setThreadId] = useState(data?.threadId);
    const [messageId, setMessageId] = useState(data?.messageId);
    const [message, setMessage] = useState(data?.message);

    const buildGoData = useCallback(() => {
      return {
        // agent: { ...selectedAgent, id: selectedAgent?._id },
        asset_id: selectedAgent?._id || selectedAgent?.id,
        version_id: null,
        threadId,
        messageId,
        message,
      };
    }, [message, messageId, selectedAgent?._id, selectedAgent?.id, threadId]);

    const changeHandler = useCallback((key, value) => {
      setParentData((prev) => {
        if (key === "researchPoints" || key === "outputTitle") {
          return {
            ...prev,
            [key]: {
              ...prev[key],
              ...value,
            },
          };
        }
        return { ...prev, [key]: value };
      });
    }, []);

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            onChange: changeHandler,
            setValidTabIndices,
            error,
            setError,
            workspaceId: workspaceId,
            selectedAgent,
            setSelectedAgent,
            data,
          },
        },
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            data: parentData,
            variables,
            onChange: changeHandler,
            validTabIndices,
            setValidTabIndices,
            error,
            setError,
            ref: configRef,
            workspaceId,
            threadId,
            setThreadId,
            messageId,
            setMessageId,
            message,
            setMessage,
          },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModule,
          panelComponentProps: {
            canvasRef,
            annotation,
            ref: testModuleRef,
            go_data: buildGoData(),
            workspaceId: workspaceId,
            assetId: assetId,
            projectId: projectId,
            parentId: parentId,
            variables,
            node: nodeData || AGENT_NODE,
            onTestComplete: (output_schema) => {
              setParentData((prev) => {
                return {
                  ...prev,
                  output: { schema: output_schema },
                };
              });
              setValidTabIndices([0, 1, 2]);
            },
          },
        },
      ];
    }, [
      annotation,
      assetId,
      buildGoData,
      canvasRef,
      changeHandler,
      data,
      error,
      message,
      messageId,
      nodeData,
      parentData,
      parentId,
      projectId,
      selectedAgent,
      threadId,
      validTabIndices,
      variables,
      workspaceId,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          return buildGoData();
        },
        getError: () => error,
      }),
      [buildGoData, error]
    );

    return (
      <TabContainer
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        defaultTabIndex={parentData?.last_updated && parentData?.name ? 1 : 0}
        tabs={tabs || []}
        colorPalette={{
          dark: AGENT_NODE.dark,
          light: AGENT_NODE.light,
          foreground: AGENT_NODE.foreground,
        }}
        onSave={onSave}
        hasTestTab={AGENT_NODE.hasTestModule}
        errorMessages={error}
        validTabIndices={validTabIndices}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
      />
    );
  }
);

export default AgentNode;
