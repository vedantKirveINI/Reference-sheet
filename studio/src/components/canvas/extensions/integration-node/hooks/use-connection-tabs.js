import ConnectionInitializationMode from "../tabs/initialize";
import ConnectionConfigurationMode from "../tabs/configure";
import { removeFirstKeyValuePair } from "../utils/remove-first-key-value-pair";
import { FormTestModule } from "../tabs/test";

export const useConnectionTabs = ({
  canvasRef,
  canvasAnnotation,
  getGoData,
  node_configs,
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
  getInitialAnswers,
  initialPipeline,
  onInitializeDone,
  onConfigureDone,
  setValidTabIndices,
  assetName,
  onAnswerChange,
}) => {
  const connectionNode = Object.values(flow)[0];
  const flowWithOutConnection = removeFirstKeyValuePair(flow || {});

  return [
    {
      label: "CONNECT",
      panelComponent: ConnectionInitializationMode,
      panelComponentProps: {
        connectionSrc: nodeData?._src,
        connectionNodeData: connectionNode,
        resourceIds,
        selectedConnection,
        onConnectionChange,
        onInitializeDone,
        setValidTabIndices,
        nodeData,
        assetName: assetName,
      },
    },
    {
      label: "CONFIGURE",
      panelComponent: ConnectionConfigurationMode,
      panelComponentProps: {
        variables,
        flow: flowWithOutConnection,
        taskGraph,
        projectVariables,
        getInitialAnswers,
        initialPipeline,
        annotation,
        resourceIds,
        result: publishResult,
        onConfigureDone,
        nodeData,
        node_configs,
        onAnswerChange,
      },
    },
    {
      label: "TEST",
      panelComponent: FormTestModule,
      panelComponentProps: {
        canvasRef,
        annotation: canvasAnnotation,
        node: nodeData,
        getGoData,
        variables,
        workspaceId: resourceIds?.workspaceId,
        assetId: resourceIds?.assetId,
        projectId: resourceIds?.projectId,
        parentId: resourceIds?.parentId,
      },
    },
  ];
};
