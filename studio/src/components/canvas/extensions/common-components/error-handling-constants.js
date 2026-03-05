export const ERROR_STRATEGIES = {
  STOP: "stop",
  SKIP: "skip",
  RETRY: "retry",
  CUSTOM_ERROR_FLOW: "custom_error_flow",
};

export const DEFAULT_ERROR_CONFIG = {
  strategy: ERROR_STRATEGIES.STOP,
  retryCount: 3,
  retryDelay: 5,
  retryFallback: ERROR_STRATEGIES.STOP,
};

export const STRATEGY_LABELS = {
  [ERROR_STRATEGIES.STOP]: "Stop Workflow",
  [ERROR_STRATEGIES.SKIP]: "Skip & Continue",
  [ERROR_STRATEGIES.RETRY]: "Retry",
  [ERROR_STRATEGIES.CUSTOM_ERROR_FLOW]: "Custom Error Flow",
};

export const STRATEGY_DESCRIPTIONS = {
  [ERROR_STRATEGIES.STOP]: "The workflow will stop immediately when this node fails",
  [ERROR_STRATEGIES.SKIP]: "Skip this node and continue to the next step in the workflow",
  [ERROR_STRATEGIES.RETRY]: "Retry this node a specified number of times before taking fallback action",
  [ERROR_STRATEGIES.CUSTOM_ERROR_FLOW]: "Route to a custom error handling flow when this node fails",
};
