export type LogType = "error" | "aborted" | "success" | "info";

export interface WorkflowLogEventData {
  event_name: string;
  created_at: string;
  node_id: string;
  node_name: string;
  node_type: string;
  result: Record<string, any>;
  error: any;
  data: any;
  duration_ms?: number;
}

export interface FormLogEventData {
  node: Record<string, any>;
  response: any;
  type: LogType;
}

export interface TerminalLogData {
  type: LogType;
  timestamp: string;
  message: string;
  logEventName: string;
  data: any;
  executionTime: string;
}
