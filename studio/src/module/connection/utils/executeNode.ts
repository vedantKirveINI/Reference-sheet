import { get } from "http";
import { componentSDKServices } from "../services/component-sdk-services";
import { getInputsData } from "./getInputsData";

type ExecuteNodeArgs = {
  node: any;
  value: any;
  _id?: string;
  canvasId?: string;
  parent_id?: string;
  project_id?: string;
  workspace_id?: string;
  asset_id?: string;
};

const createNodes = (node: ExecuteNodeArgs["node"]) => {
  const allNodes = {
    [node?.id]: {
      ...node,
    },
  };
  return allNodes;
};

export async function executeNode({
  node,
  value,
  parent_id,
  project_id,
  workspace_id,
  asset_id,
  _id,
  canvasId,
}: ExecuteNodeArgs): Promise<ExecuteNodeArgs["value"]> {
  const allNodes = createNodes(node);

  const payload = {
    flow: {
      flow: allNodes,
      taskGraph: [],
    },
    state: { [node?.id]: value },
    type: node?.type,
    task_id: node?.id,
    _id: _id,
    canvas_id: canvasId,
    project_id: project_id,
    workspace_id: workspace_id,
    asset_id: asset_id,
  };

  const res = await componentSDKServices.executeTransformedNode(payload);

  const inputs = getInputsData(
    node?.inputs,
    project_id,
    parent_id,
    workspace_id,
    asset_id
  );

  return {
    ...value,
    ...(res?.result?.response || {}),
    ...(inputs || {}),
  };
}
