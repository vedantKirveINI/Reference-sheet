export interface IPipelineItem {
  qId: string;
  index?: number | null;
}

export interface IConfigs {
  showAdvancedSettings?: boolean;
  scheduleAt?: { blocks: unknown[] } | undefined;
  [key: string]: unknown;
}

export interface INodeTheme {
  background?: string;
  foreground?: string;
  dark?: string;
  light?: string;
}

export interface IAnswerValue {
  response?: unknown;
  error?: string;
  isMapped?: boolean;
}

export interface IAnswers {
  [nodeId: string]: IAnswerValue;
}

export interface ITheme {
  styles?: {
    questions?: string;
    fontFamily?: string;
  };
  [key: string]: unknown;
}

export interface INode {
  id: string;
  type: string;
  name?: string;
  config?: INodeConfig;
  next_node_ids?: string[];
  _src?: string;
}

export interface INodeConfig {
  question?: string;
  description?: string;
  type?: string;
  options?: unknown[];
  placeholder?: string;
  settings?: {
    required?: boolean;
    isAdvancedField?: boolean;
    enableMap?: boolean;
    valueType?: string;
    optionsType?: string;
    [key: string]: unknown;
  };
  used_ref_src_ids?: string[];
  [key: string]: unknown;
}

export interface IAllNodes {
  [nodeId: string]: INode;
}

export interface IResourceIds {
  workspaceId: string;
  projectId: string;
  assetId: string;
  canvasId: string;
  _id: string;
  parentId?: string;
}

export interface IIntegrationState {
  answers: IAnswers;
  pipeline: IPipelineItem[];
  advancedFields: IPipelineItem[];
  loading: boolean;
  initialLoading: boolean;
  showAdvancedSettings: boolean;
  configs: IConfigs;
}

export interface IIntegrationActions {
  onContinue: () => void;
  onAnswerChange: (params: { node: INode; value: unknown; options?: unknown }) => Promise<void>;
  onMapToggle: (params: { node: INode; value: boolean }) => void;
  onNodeRefresh: (nodeId: string) => Promise<void>;
  setShowAdvancedSettings: (value: boolean) => void;
  setConfig: (key: string, value: unknown) => void;
  setQuestionRef: (nodeId: string, ref: unknown) => void;
}

export interface IIntegrationContentProps {
  theme: ITheme;
  initialAnswers: IAnswers;
  initialPipeline: IPipelineItem[];
  allNodes: IAllNodes;
  annotation: string;
  onSuccess: (stagedAnswers: IAnswers, stagedPipeline: IPipelineItem[], configs: IConfigs) => void;
  variables: Record<string, unknown>;
  workspaceId: string;
  projectId: string;
  assetId: string;
  canvasId: string;
  _id: string;
  configs?: IConfigs;
  nodeTheme?: INodeTheme;
  onAnswerUpdate?: (updatedAnswers: IAnswers) => void;
  onStateChange?: (state: {
    showAdvancedSettings: boolean;
    advancedFields: IPipelineItem[];
    annotation: string;
    onContinue: () => void;
    setShowAdvancedSettings: (value: boolean) => void;
    setConfig: (key: string, value: unknown) => void;
  }) => void;
}
