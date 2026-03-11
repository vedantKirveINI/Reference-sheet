import {
  EventListner,
  IWorkflowAIStartEvent,
  IWorkflowAIStatusEvent,
  IWorkflowAIRenderEvent,
  IWorkflowAICompleteEvent,
  IWorkflowAIErrorEvent,
  IHydratedNode,
  IHydratedEdge,
} from "../../../module/constants";
import { toast } from "sonner";

export interface WorkflowAIState {
  isLoading: boolean;
  status: string;
  step: "idle" | "planning" | "executing";
  retryCount: number;
  hasWarnings: boolean;
  warnings: string[];
  lastError: IWorkflowAIErrorEvent | null;
}

export type StateChangeCallback = (state: WorkflowAIState) => void;
export type ConfirmClearCallback = () => Promise<boolean>;
export type RenderCallback = (
  nodes: IHydratedNode[],
  edges: IHydratedEdge[]
) => void;
export type RetryCallback = (prompt: string, sessionId: string) => void;

const STATUS_MESSAGES = {
  planning: "Analyzing your workflow requirements...",
  executing: "Generating workflow structure...",
  repairing: (count: number) => `Fixing validation errors... (attempt ${count})`,
};

export class WorkflowAIHandler {
  private state: WorkflowAIState;
  private onStateChange: StateChangeCallback | null = null;
  private onConfirmClear: ConfirmClearCallback | null = null;
  private onRender: RenderCallback | null = null;
  private onRetry: RetryCallback | null = null;
  private boundHandlers: Map<string, EventListener> = new Map();
  private isInitialized = false;
  private pendingRetryPrompt: string | null = null;
  private pendingSessionId: string | null = null;

  constructor() {
    this.state = {
      isLoading: false,
      status: "",
      step: "idle",
      retryCount: 0,
      hasWarnings: false,
      warnings: [],
      lastError: null,
    };
  }

  public init(callbacks: {
    onStateChange: StateChangeCallback;
    onConfirmClear: ConfirmClearCallback;
    onRender: RenderCallback;
    onRetry?: RetryCallback;
  }): void {
    if (this.isInitialized) {
      this.destroy();
    }

    this.onStateChange = callbacks.onStateChange;
    this.onConfirmClear = callbacks.onConfirmClear;
    this.onRender = callbacks.onRender;
    this.onRetry = callbacks.onRetry || null;

    this.registerEventListeners();
    this.isInitialized = true;
  }

  public destroy(): void {
    this.removeEventListeners();
    this.onStateChange = null;
    this.onConfirmClear = null;
    this.onRender = null;
    this.onRetry = null;
    this.isInitialized = false;
  }

  private registerEventListeners(): void {
    const events = [
      { name: EventListner.WORKFLOW_AI_START, handler: this.handleStart },
      { name: EventListner.WORKFLOW_AI_STATUS, handler: this.handleStatus },
      { name: EventListner.WORKFLOW_AI_RENDER, handler: this.handleRender },
      { name: EventListner.WORKFLOW_AI_COMPLETE, handler: this.handleComplete },
      { name: EventListner.WORKFLOW_AI_ERROR, handler: this.handleError },
    ];

    events.forEach(({ name, handler }) => {
      const boundHandler = handler.bind(this) as EventListener;
      this.boundHandlers.set(name, boundHandler);
      window.addEventListener(name, boundHandler);
    });
  }

  private removeEventListeners(): void {
    this.boundHandlers.forEach((handler, name) => {
      window.removeEventListener(name, handler);
    });
    this.boundHandlers.clear();
  }

  private updateState(partial: Partial<WorkflowAIState>): void {
    this.state = { ...this.state, ...partial };
    this.onStateChange?.(this.state);
  }

  private handleStart(event: CustomEvent<IWorkflowAIStartEvent>): void {
    this.pendingRetryPrompt = event.detail.prompt;
    this.pendingSessionId = event.detail.sessionId;
    this.updateState({
      isLoading: true,
      status: STATUS_MESSAGES.planning,
      step: "planning",
      retryCount: 0,
      hasWarnings: false,
      warnings: [],
      lastError: null,
    });
  }

  private handleStatus(event: CustomEvent<IWorkflowAIStatusEvent>): void {
    const { step, message, retryCount } = event.detail;
    
    let status = message;
    if (!status) {
      if (step === "planning") {
        status = STATUS_MESSAGES.planning;
      } else if (step === "executing" && retryCount && retryCount > 0) {
        status = STATUS_MESSAGES.repairing(retryCount);
      } else {
        status = STATUS_MESSAGES.executing;
      }
    }

    this.updateState({
      isLoading: true,
      status,
      step,
      retryCount: retryCount || 0,
    });
  }

  private async handleRender(
    event: CustomEvent<IWorkflowAIRenderEvent>
  ): Promise<void> {
    const { workflow, partial, warnings } = event.detail;

    if (this.onConfirmClear) {
      const confirmed = await this.onConfirmClear();
      if (!confirmed) {
        this.updateState({
          isLoading: false,
          status: "",
          step: "idle",
        });
        return;
      }
    }

    if (this.onRender) {
      this.onRender(workflow.nodes, workflow.edges);
    }

    this.updateState({
      hasWarnings: partial,
      warnings: warnings || [],
    });

    if (partial && warnings && warnings.length > 0) {
      toast.warning(`Workflow created with warnings: ${warnings.length} issue(s) detected`);
    }
  }

  private handleComplete(event: CustomEvent<IWorkflowAICompleteEvent>): void {
    const { success } = event.detail;

    this.updateState({
      isLoading: false,
      status: "",
      step: "idle",
    });

    if (success && !this.state.hasWarnings) {
      toast.success("Workflow created successfully");
    }
  }

  private handleError(event: CustomEvent<IWorkflowAIErrorEvent>): void {
    const error = event.detail;

    this.updateState({
      isLoading: false,
      status: "",
      step: "idle",
      lastError: error,
    });

    toast.error("Workflow Creation Error", {
      description: error.message,
    });
  }

  public retry(): void {
    if (this.pendingRetryPrompt && this.pendingSessionId) {
      this.updateState({
        lastError: null,
        isLoading: true,
        status: STATUS_MESSAGES.planning,
        step: "planning",
      });

      if (this.onRetry) {
        this.onRetry(this.pendingRetryPrompt, this.pendingSessionId);
      } else {
        const retryEvent = new CustomEvent("WORKFLOW_AI_RETRY", {
          detail: {
            prompt: this.pendingRetryPrompt,
            sessionId: this.pendingSessionId,
          },
        });
        window.dispatchEvent(retryEvent);
      }
    }
  }

  public canRetry(): boolean {
    return !!(this.pendingRetryPrompt && this.pendingSessionId && this.state.lastError);
  }

  public getState(): WorkflowAIState {
    return { ...this.state };
  }

  public static dispatchFixWithAI(nodeId: string): void {
    const customEvent = new CustomEvent("WORKFLOW_AI_FIX_NODE", {
      detail: { nodeId },
    });
    window.dispatchEvent(customEvent);
  }
}

export const workflowAIHandler = new WorkflowAIHandler();
