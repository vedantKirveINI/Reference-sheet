export enum EventListner {
  TINY_BOT_HANDSHAKE = "TINY_BOT_HANDSHAKE",
  WORKFLOW_AI_START = "WORKFLOW_AI_START",
  WORKFLOW_AI_STATUS = "WORKFLOW_AI_STATUS",
  WORKFLOW_AI_RENDER = "WORKFLOW_AI_RENDER",
  WORKFLOW_AI_COMPLETE = "WORKFLOW_AI_COMPLETE",
  WORKFLOW_AI_ERROR = "WORKFLOW_AI_ERROR",
  FORM_AI_START = "FORM_AI_START",
  FORM_AI_STATUS = "FORM_AI_STATUS",
  FORM_AI_RENDER = "FORM_AI_RENDER",
  FORM_AI_COMPLETE = "FORM_AI_COMPLETE",
  FORM_AI_ERROR = "FORM_AI_ERROR",
}

export interface ITinybotEventType {
  text: string;
  autoOpen?: boolean;
  showDelay?: number;
}

export interface IHydratedNode {
  id: string;
  type: string;
  name?: string;
  description?: string;
  category: string;
  template: string;
  _src: string;
  go_data: Record<string, unknown>;
  location: string;
}

export interface IHydratedEdge {
  id: string;
  from: string;
  to: string;
  fromPort: string;
  toPort: string;
  sourceHandle?: string;
  label?: string;
}

export interface IWorkflowAIStartEvent {
  sessionId: string;
  prompt: string;
}

export interface IWorkflowAIStatusEvent {
  step: 'planning' | 'executing';
  message: string;
  retryCount?: number;
}

export interface IWorkflowAIRenderEvent {
  workflow: {
    name: string;
    description: string;
    nodes: IHydratedNode[];
    edges: IHydratedEdge[];
  };
  partial: boolean;
  warnings: string[];
}

export interface IWorkflowAICompleteEvent {
  success: boolean;
  workflowId?: string;
}

export interface IWorkflowAIErrorEvent {
  code: string;
  message: string;
  recoverable: boolean;
}

export interface IHydratedFormNode {
  id: string;
  type: string;
  label?: string;
  description?: string;
  category: string;
  template: string;
  _src: string;
  go_data: Record<string, unknown>;
  location: string;
}

export interface IHydratedFormLink {
  id: string;
  from: string; // hydrated node ID
  to: string; // hydrated node ID
  condition?: string; // "true", "false", or condition description for IF_ELSE
  label?: string; // optional link label
}

export interface IFormAIStartEvent {
  sessionId: string;
  prompt: string;
}

export interface IFormAIStatusEvent {
  step: 'planning' | 'executing';
  message: string;
  retryCount?: number;
}

export interface IFormAIRenderEvent {
  form: {
    name: string;
    description?: string;
    nodes: IHydratedFormNode[];
    links?: IHydratedFormLink[]; // optional for backward compatibility
  };
  partial: boolean;
  warnings: string[];
}

export interface IFormAICompleteEvent {
  success: boolean;
  formId?: string;
}

export interface IFormAIErrorEvent {
  code: string;
  message: string;
  recoverable: boolean;
}
