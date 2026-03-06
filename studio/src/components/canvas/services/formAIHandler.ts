import {
  EventListner,
  IFormAIStartEvent,
  IFormAIStatusEvent,
  IFormAIRenderEvent,
  IFormAICompleteEvent,
  IFormAIErrorEvent,
  IHydratedFormNode,
  IHydratedFormLink,
} from "../../../module/constants";
import { toast } from "sonner";

export interface FormAIState {
  isLoading: boolean;
  status: string;
  step: "idle" | "planning" | "executing";
  retryCount: number;
  hasWarnings: boolean;
  warnings: string[];
  lastError: IFormAIErrorEvent | null;
}

export type StateChangeCallback = (state: FormAIState) => void;
export type ConfirmClearCallback = () => Promise<boolean>;
export type RenderCallback = (nodes: IHydratedFormNode[], links?: IHydratedFormLink[]) => void;
export type RetryCallback = (prompt: string, sessionId: string) => void;

const STATUS_MESSAGES = {
  planning: "Analyzing your form requirements...",
  executing: "Generating form fields...",
  repairing: (count: number) => `Fixing validation errors... (attempt ${count})`,
};

export class FormAIHandler {
  private state: FormAIState;
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
      { name: EventListner.FORM_AI_START, handler: this.handleStart },
      { name: EventListner.FORM_AI_STATUS, handler: this.handleStatus },
      { name: EventListner.FORM_AI_RENDER, handler: this.handleRender },
      { name: EventListner.FORM_AI_COMPLETE, handler: this.handleComplete },
      { name: EventListner.FORM_AI_ERROR, handler: this.handleError },
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

  private updateState(partial: Partial<FormAIState>): void {
    this.state = { ...this.state, ...partial };
    this.onStateChange?.(this.state);
  }

  private handleStart(event: CustomEvent<IFormAIStartEvent>): void {
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

  private handleStatus(event: CustomEvent<IFormAIStatusEvent>): void {
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
    event: CustomEvent<IFormAIRenderEvent>
  ): Promise<void> {
    const { form, partial, warnings } = event.detail;

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
      this.onRender(form.nodes, form.links || []);
    }

    this.updateState({
      hasWarnings: partial,
      warnings: warnings || [],
    });

    if (partial && warnings && warnings.length > 0) {
      toast.warning(`Form created with warnings: ${warnings.length} issue(s) detected`);
    }
  }

  private handleComplete(event: CustomEvent<IFormAICompleteEvent>): void {
    const { success } = event.detail;

    this.updateState({
      isLoading: false,
      status: "",
      step: "idle",
    });

    if (success && !this.state.hasWarnings) {
      toast.success("Form created successfully");
    }
  }

  private handleError(event: CustomEvent<IFormAIErrorEvent>): void {
    const error = event.detail;

    this.updateState({
      isLoading: false,
      status: "",
      step: "idle",
      lastError: error,
    });

    toast.error("Form Creation Error", {
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
        const retryEvent = new CustomEvent("FORM_AI_RETRY", {
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

  public getState(): FormAIState {
    return { ...this.state };
  }

  public static dispatchFixWithAI(nodeId: string): void {
    const customEvent = new CustomEvent("FORM_AI_FIX_NODE", {
      detail: { nodeId },
    });
    window.dispatchEvent(customEvent);
  }
}

export const formAIHandler = new FormAIHandler();
